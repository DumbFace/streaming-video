/**
 * @jest-environment node
 */

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getUploadUrlAction } from './get-upload-url.action';
import { PutObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');

describe('getUploadUrlAction', () => {
  it('Happly Path', async () => {
    const mockedGetSignedUrl = jest.mocked(getSignedUrl);
    const mockedPutObjectCommand = jest.mocked(PutObjectCommand);

    mockedGetSignedUrl.mockResolvedValue('https://s3.fake/presigned-url');

    const result = await getUploadUrlAction('video.mp4', 'video/mp4');

    expect(mockedPutObjectCommand).toHaveBeenCalledTimes(1);

    if (!result.success) {
      throw new Error(result.message);
    }

    expect(mockedPutObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: expect.stringMatching(/^videos\/\d+-\d+\/raw\.mp4$/),
      ContentType: 'video/mp4',
    });

    expect(mockedGetSignedUrl).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(PutObjectCommand),
      { expiresIn: 300 },
    );

    expect(result.data.uploadUrl).toBe('https://s3.fake/presigned-url');
  });

  it('BUCKET is not exist', async () => {
    delete process.env.AWS_S3_BUCKET_NAME;

    const result = await getUploadUrlAction('video.mp4', 'video/mp4');
    expect(result.success).toBe(false);

    expect(result.message).toBe('BUCKET_NAME couldnt be null');
  });
});
