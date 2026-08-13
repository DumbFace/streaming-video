import { describe, it, expect, jest } from '@jest/globals';
import { VideoFormValues } from '@/src/features/video/components/dialog';
import { FnResponse } from '@/src/lib/fn-response';
import type { getUploadUrlAction } from '@/src/features/video/actions/get-upload-url.action';
import { addVideoLogic } from '@/src/features/video/hooks/add-video.logic';
import { AddVideoDeps } from '@/src/features/video/types/add-video.deps';
import { publishAddVideoMessage } from '@/src/features/video/actions/slicing-video-message.action';
import { addVideoAction } from '@/src/features/video/actions/add-video.action';
import { processUploadedVideoAction } from '@/src/features/video/actions/process-upload-video.action';
import { uploadFileDirectly } from '@/src/features/video/actions/upload-file-directly';

describe('addVideoLogic', () => {
  it('Stop ', async () => {
    const mockFile = new File(['fake-video'], 'test.mp4', {
      type: 'video/mp4',
    });

    const mockFormData: VideoFormValues = {
      title: 'Test',
      description: 'Test',
      videoFile: [mockFile],
    };

    const deps: AddVideoDeps = {
      getUploadUrlAction: jest.fn<typeof getUploadUrlAction>().mockResolvedValue(
        FnResponse.Fail('Get upload URL unsuccessful!', {
          name: 'Error',
          message: 'mock error',
          code: 500,
        }),
      ),
      uploadFileDirectly: jest.fn<typeof uploadFileDirectly>(),
      processUploadedVideoAction: jest.fn<typeof processUploadedVideoAction>(),
      addVideoAction: jest.fn<typeof addVideoAction>(),
      publishAddVideoMessage: jest.fn<typeof publishAddVideoMessage>(),
    };

    const result = await addVideoLogic(mockFormData, 'ID_XXX', deps);

    expect(deps.getUploadUrlAction).toHaveBeenCalledWith('test.mp4', 'video/mp4');

    expect(deps.uploadFileDirectly).not.toHaveBeenCalled();
    expect(deps.processUploadedVideoAction).not.toHaveBeenCalled();
    expect(deps.addVideoAction).not.toHaveBeenCalled();
    expect(deps.publishAddVideoMessage).not.toHaveBeenCalled();
  });
});
