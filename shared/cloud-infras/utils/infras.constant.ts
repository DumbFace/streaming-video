export const infrasName = {
  applicationName: 'streaming-video',
  alternativeApplicationDNS:
    $app.stage === 'prod' ? 'streaming.dumbface.org' : `streaming-${$app.stage}.dumbface.org`,
  applicationOrigin:
    $app.stage === 'prod'
      ? 'https://streaming.dumbface.org'
      : `https://streaming-${$app.stage}.dumbface.org`,
  bucketFullName: `streaming-video-s3-${$app.stage}`,
  redisFullName: `streaming-video-redis-${$app.stage}`,
  CDN_SERVER:
    $app.stage === 'prod' ? 'https://cdn.dumbface.org' : `https://cdn-${$app.stage}.dumbface.org`,
  alternativeCdnDsn: $app.stage === 'prod' ? 'cdn.dumbface.org' : `cdn-${$app.stage}.dumbface.org`,
  cloudflareDNS: 'dumbface.org',

  FFMPEG: '/opt/bin/ffmpeg',
  FFPROBE: '/opt/bin/ffprobe',

  GOOGLE_CLIENT_ID: '325799429531-qeuafff58gj3ggrtrsaiumpf8ng5ioju.apps.googleusercontent.com',

  SMTP_SERVER: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_FROM: 'gv.runfast@gmail.com',
  SMTP_TO: 'gv.runfast@gmail.com',

  AUTH_TRUST_HOST: 'true',

  // CERT_NAME: `cdnCert-${$app.stage}`,
  // VALIDATION_RECORD_NAME: `cdnCertValidation-${$app.stage}`,
  // CERT_VALIDATION_NAME: `cdnCertValidationDone-${$app.stage}`,
  // SITE_NAME: `WebFrontend-${$app.stage}`,

  NEXTAUTH_URL: 'FROM applicationOrigin',
};
