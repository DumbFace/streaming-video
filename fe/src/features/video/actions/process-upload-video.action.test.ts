import { APP_ENV } from '@streaming-video/shared';
/**
 * @jest-environment node
 */

describe('processUploadedVideoAction', () => {
  it('ffmpeg and ffprobe would be available', async () => {
    const ffmpegPath = process.env.FFMPEG;
    const ffprobePath = process.env.FFPROBE;
    console.log('APP_ENV: ', APP_ENV);
    if (APP_ENV == 'dev') {
      expect(ffmpegPath).toBe('/usr/bin/ffmpeg');
      expect(ffprobePath).toBe('/usr/bin/ffprobe');
    }

    if (APP_ENV == 'prod' || APP_ENV == 'stage') {
      expect(ffmpegPath).toBe('/opt/bin/ffmpeg');
      expect(ffprobePath).toBe('/opt/bin/ffprobe');
    }
  });

  // it('BUCKET_NAME would be availabe', async () => {
  //   const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

  //   if (APP_ENV == 'dev') {
  //     expect(BUCKET_NAME).toBe('/usr/bin/ffprobe');
  //   }

  //   if (APP_ENV == 'prod' || APP_ENV == 'stage') {
  //     expect(BUCKET_NAME).toBe('');
  //   }
  // });
});
