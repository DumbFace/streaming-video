import { createSign } from 'crypto';

interface CloudFrontCookies {
  'CloudFront-Policy': string;
  'CloudFront-Signature': string;
  'CloudFront-Key-Pair-Id': string;
}

interface SignParams {
  resourcePattern: string; // vd: https://cdn.example.com/videos/abc123/*
  expiresInSeconds: number;
  privateKey: string; // nội dung PEM, không phải file path
  keyPairId: string;
}

function cloudFrontSafeBase64(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/=/g, '_').replace(/\//g, '~');
}

export function generateCloudFrontSignedCookies({
  resourcePattern,
  expiresInSeconds,
  privateKey,
  keyPairId,
}: SignParams): CloudFrontCookies {
  const expireTime = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const policy = {
    Statement: [
      {
        Resource: resourcePattern,
        Condition: {
          DateLessThan: { 'AWS:EpochTime': expireTime },
        },
      },
    ],
  };

  const policyJson = JSON.stringify(policy);

  const signer = createSign('RSA-SHA1');
  signer.update(policyJson);
  signer.end();
  const signature = signer.sign(privateKey);

  return {
    'CloudFront-Policy': cloudFrontSafeBase64(Buffer.from(policyJson)),
    'CloudFront-Signature': cloudFrontSafeBase64(signature),
    'CloudFront-Key-Pair-Id': keyPairId,
  };
}
