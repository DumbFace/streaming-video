"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { extname } from "path";
import ffmpeg from "fluent-ffmpeg";
import amqp from "amqplib";
import connectDB from "@/src/lib/db";
import { VideoFormValues } from "@/src/features/video/components/dialog";

const ALLOWED_TYPES = [
  "video/mp4",
  // "video/mkv",
  // "video/quicktime",
  // "video/x-matroska",
];
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export async function uploadVideoAction(formData: VideoFormValues) {
  try {
    if (!formData.videoFile?.[0]) {
      return;
    }

    const file = formData.videoFile[0];

    if (file.size === 0) {
      return { success: false, error: "No video file provided" };
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Only video files are allowed!" };
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = extname(file.name);
    const fileKey = `videos/${uniqueSuffix}/raw${ext}`;

    const s3 = new S3Client({
      region: process.env.AWS_REGION || "",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const parallelUploads3 = new Upload({
      client: s3,
      params: {
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: fileBuffer,
        ContentType: file.type,
      },
    });

    await parallelUploads3.done();

    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: fileKey });
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    const duration: number = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(presignedUrl, (err, metadata) => {
        if (err) {
          return err;
        }

        const duration = metadata.format.duration;
        if (duration && duration > 0) {
          resolve(duration);
        }
        reject(err);
      });
    });

    if (!(duration && duration > 0 && presignedUrl)) {
      return {
        success: false,
        message: "There is something wrong with duration video or presignedUrl",
      };
    }

    const segmentTime = 30;
    const index = Math.ceil(duration / segmentTime);

    console.log("index: ", index);
    console.log("uniqueSuffix", uniqueSuffix);

    return {
      success: true,
      message: "Upload video Successfully",
      data: {
        url: presignedUrl,
        totalChunks: index,
        directory: `videos/${uniqueSuffix}/`,
      },
    };
  } catch (error: any) {
    console.error("Server Action Error:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}
