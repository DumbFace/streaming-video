// import { Injectable, Logger } from '@nestjs/common';
// import { Model } from 'mongoose';
// import { InjectModel } from '@nestjs/mongoose';
// import { Video } from '@app/domain';

// @Injectable()
// export class VideoService {
//   constructor(
//     @InjectModel(Video.name) private readonly videoModel: Model<Video>,
//   ) {}

//   async createVideo(title: string, description: string): Promise<Video> {
//     const newVideo = new this.videoModel({ title, description });
//     return Object.assign(new Video(), await newVideo.save());
//   }

//   async findAllVideos(): Promise<Video[]> {
//     return this.videoModel.find().exec();
//   }
// }

// @Injectable()
// export class VideoSegmentService {
//   constructor(
//     @InjectModel(VideoSegment.name)
//   ){}
// }

// @Injectable()
// export class VideoProcessingService {
//   private readonly logger = new Logger(VideoProcessingService.name);

//   async splitVideoToHls(
//     name: string,
//     inputPath: string,
//     outputDir: string,
//     signal?: AbortSignal,
//   ): Promise<void> {
//     const outputDirectory = path.join(outputDir, `${name}`);

//     if (!fs.existsSync(outputDirectory)) {
//       fs.mkdirSync(outputDirectory, { recursive: true });
//     }

//     return new Promise(async (resolve, reject) => {
//       if (signal) {
//         signal.addEventListener('abort', () => {
//           this.logger.warn(
//             '⚡ AbortSignal received! Actively killing FFmpeg process...',
//           );
//           ffmpegCommand.kill('SIGTERM');
//         });
//       }

//       // const hdDir = path.join(outputDirectory, '720p');
//       // const fhdDir = path.join(outputDirectory, '1080p');

//       // fs.mkdirSync(hdDir, { recursive: true });
//       // fs.mkdirSync(fhdDir, { recursive: true });

//       // ~ > ffmpeg -ss 00:00:30 -i video.mp4 -t 30 \
//       // -c:v libx264 -c:a aac \
//       // -f hls \
//       // -hls_time 30 \
//       // -hls_flags append_list \
//       // -hls_segment_filename "chunk_%03d.ts" \
//       // master.m3u8

//       const ffmpegCommand = ffmpeg(inputPath)
//         .outputOptions([
//           '-ss 0',
//           '-t 30',
//           'c:v libx264 -c:a aac',
//           '-f hls',
//           // '-b:v 2500k', // Target bitrate for 720p
//           '-hls_time 30',
//           '-hls_list_size 0',
//           `-hls_segment_filename ${name}_%03d.ts`,
//         ])
//         .output(outputDirectory)

//         // .output(path.join(hdDir, `${name}.m3u8`))
//         // .outputOptions([
//         //   // '-vf scale=-2:720', // Scale height to 720, maintain aspect ratio
//         //   '-c:v libx264',
//         //   '-f hls',
//         //   // '-b:v 2500k', // Target bitrate for 720p
//         //   '-hls_time 30',
//         //   '-hls_list_size 0',
//         //   `-hls_segment_filename "${name}_%03d.ts"`,
//         // ])

//         // .output(path.join(fhdDir, `${name}.m3u8`))
//         // .outputOptions([
//         //   '-vf scale=-2:1080', // Scale height to 1080, maintain aspect ratio
//         //   '-c:v libx264',
//         //   '-b:v 5000k', // Target bitrate for 1080p
//         //   '-hls_time 5',
//         //   '-hls_list_size 0',
//         //   '-hls_flags temp_file',
//         //   '-f hls',
//         // ])

//         .on('end', () => {
//           this.logger.log('Video successfully split into HLS chunks!');
//           // const masterContent = `#EXTM3U
//           //     #EXT-X-VERSION:3

//           //     #EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
//           //     720p/${name}.m3u8

//           //     #EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
//           //     1080p/${name}.m3u8`;

//           // fs.writeFileSync(path.join(outputDir, 'master.m3u8'), masterContent);
//           resolve();
//         })
//         .on('error', (err) => {
//           // if (fs.existsSync(outputDirectory)) {
//           //   fs.rmSync(outputDirectory, {
//           //     recursive: true,
//           //     force: true,
//           //   });
//           // }

//           this.logger.error(`Error chunking video: ${err.message}`);
//           reject(err);
//         });
//       ffmpegCommand.run();
//     });
//   }

//   async getVideoDuration(videoPath: string): Promise<number | undefined> {
//     return new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(videoPath, (err, metadata) => {
//         if (err) {
//           return reject(err);
//         }

//         const duration = metadata.format.duration;

//         resolve(duration);
//       });
//     });
//   }

// }
