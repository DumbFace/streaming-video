export function getSecret(key: string) {
  const secret = aws.secretsmanager.getSecretOutput({
    name: `/streaming-video/${$app.stage}/${key}`,
  });
  const version = aws.secretsmanager.getSecretVersionOutput({
    secretId: secret.id,
  });
  return { secret, version };
}
