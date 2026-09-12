/**
 * @jest-environment node
 */

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import ffmpeg from 'fluent-ffmpeg';
import { processUploadedVideoAction } from './process-upload-video.action';
import { FfprobeData } from 'fluent-ffmpeg';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('fluent-ffmpeg', () => ({
  __esModule: true,
  default: {
    setFfmpegPath: jest.fn(),
    setFfprobePath: jest.fn(),
    ffprobe: jest.fn(),
  },
}));

const mockedGetSignedUrl = jest.mocked(getSignedUrl);
const mockedFfprobe = jest.mocked(ffmpeg.ffprobe);

describe('processUploadedVideoAction', () => {
  const originalEnvironment = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET_NAME = 'test-video-bucket';
    process.env.FFMPEG = '/test/bin/ffmpeg';
    process.env.FFPROBE = '/test/bin/ffprobe';
    mockedGetSignedUrl.mockResolvedValue('https://s3.fake/video.mp4');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('returns the signed URL and number of 30-second chunks', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);

    (mockedFfprobe as unknown as jest.Mock).mockImplementation(
      (_url, callback: (error: any, metadata: FfprobeData) => void) => {
        callback(undefined, {
          format: {
            duration: 120,
          },
          streams: [],
          chapters: [],
        });
      },
    );

    const result = await processUploadedVideoAction('videos/upload/raw.mp4', 'videos/upload/');

    expect(S3Client).toHaveBeenCalledWith({ region: 'ap-southeast-1' });
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: 'test-video-bucket',
      Key: 'videos/upload/raw.mp4',
    });
    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.any(S3Client),
      expect.any(GetObjectCommand),
      { expiresIn: 3600 },
    );
    expect(ffmpeg.setFfmpegPath).toHaveBeenCalledWith('/test/bin/ffmpeg');
    expect(ffmpeg.setFfprobePath).toHaveBeenCalledWith('/test/bin/ffprobe');
    expect(mockedFfprobe).toHaveBeenCalledWith('https://s3.fake/video.mp4', expect.any(Function));
    expect(result).toEqual({
      success: true,
      message: 'Upload video Successfully',
      data: {
        url: 'https://s3.fake/video.mp4',
        totalChunks: 4,
        directory: 'videos/1700000000000-123456789/',
      },
    });
  });

  it('returns a failure when the bucket name is missing', async () => {
    delete process.env.AWS_S3_BUCKET_NAME;

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'BUCKET_NAME couldnt be null',
      exception: undefined,
    });

    expect(S3Client).not.toHaveBeenCalled();
  });

  it.each(['FFMPEG', 'FFPROBE'] as const)('returns a failure when %s is missing', async (name) => {
    delete process.env[name];

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'Upload video unsuccessful!',
      exception: {
        name: 'Error',
        message: 'FFMPEG or FFPROBE coudnt be null or undefined ',
        code: 500,
      },
    });
    expect(mockedGetSignedUrl).not.toHaveBeenCalled();
  });

  it('returns a failure when signing the S3 URL fails', async () => {
    mockedGetSignedUrl.mockRejectedValue(new Error('Unable to sign URL'));

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'Upload video unsuccessful!',
      exception: { name: 'Error', message: 'Unable to sign URL', code: 500 },
    });
    expect(mockedFfprobe).not.toHaveBeenCalled();
  });

  it('returns a failure when the presigner returns an empty URL', async () => {
    mockedGetSignedUrl.mockResolvedValue('');

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'There is something wrong with presignedUrl!',
      exception: undefined,
    });
    expect(mockedFfprobe).not.toHaveBeenCalled();
  });

  it('returns a failure when ffprobe cannot inspect the video', async () => {
    (mockedFfprobe as unknown as jest.Mock).mockImplementation(
      (_url, callback: (err: any, data: FfprobeData) => void) => {
        callback(new Error('Invalid video'), {} as any);
      },
    );

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'Upload video unsuccessful!',
      exception: { name: 'Error', message: 'Invalid video', code: 500 },
    });
  });

  //TODO Reconsider reviewing this test
  it.each([undefined, 0, -1])('returns a failure for invalid duration %s', async (duration) => {
    (mockedFfprobe as unknown as jest.Mock).mockImplementation(
      (_url, callback: (error: any, metadata: FfprobeData) => void) => {
        callback(undefined, {
          format: {
            duration: duration,
          },
          streams: [],
          chapters: [],
        });
      },
    );

    const result = await processUploadedVideoAction('video.mp4', 'videos/upload/');

    expect(result).toEqual({
      success: false,
      message: 'Upload video unsuccessful!',
      exception: { name: undefined, message: 'Video duration is invalid', code: 500 },
    });
  });
});
