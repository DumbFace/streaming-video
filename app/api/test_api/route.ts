import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Video from "@/lib/models/Videos";

export async function GET() {
  try {
    // 1. Fire up the connection cached helper
    await connectDB();

    // 2. Insert a sample metadata document
    const sampleVideo = await Video.create({
      title: "My First NoSQL Video Processing Stream",
      status: "pending",
    });

    return NextResponse.json({
      message: "Database and collection created successfully!",
      data: sampleVideo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
