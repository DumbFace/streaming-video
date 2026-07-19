import { FnResponse } from '@/src/lib/fn-response';

export async function uploadFileDirectly(
  file: File,
  uploadUrl: string,
  onProgress?: (percent: number) => void,
) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) resolve(FnResponse.Succeed<object>('', {}));
      else reject(new Error(`Upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error('Upload failed'));

    xhr.send(file);
  });
}
