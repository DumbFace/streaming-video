import { Upload } from '@aws-sdk/lib-storage';
import { BadRequestException, Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { S3Client } from '@aws-sdk/client-s3';
import { WorkerService } from 'apps/worker/src/worker.service';
import * as fs from 'fs';
import path, { join } from 'path';
@Controller()
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  @EventPattern('')
  async VideoProcessor(@Payload() data: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      var response = await this.workerService.sliceVideoAsync(data);
      if (response.success) {
        const bucketName = process.env.AWS_S3_BUCKET_NAME;

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const key = path.join(data.directory, `chunk_00${data.index}.ts`);
        console.log(`Key: ${key}`);
        const s3 = new S3Client({
          region: process.env.AWS_REGION || '',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
          },
        });

        //TODO Consider using pattern to input index
        const videoFilePath = path.join(
          'public/chunks',
          `chunk_00${data.index}.ts`,
        );
        console.log(`videoFilePath: ${videoFilePath}`);

        const fileStream = fs.createReadStream(videoFilePath);

        const parallelUploadToS3 = new Upload({
          client: s3,
          params: {
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType: 'video/mp4',
          },
          queueSize: 4,
          partSize: 1024 * 1024 * 5,
        });

        parallelUploadToS3.on('httpUploadProgress', (progress) => {
          console.log(
            `Uploaded ${progress.loaded} out of ${progress.total} bytes`,
          );
        });

        await parallelUploadToS3.done();
        resolve();
      }
    });
  }
}
