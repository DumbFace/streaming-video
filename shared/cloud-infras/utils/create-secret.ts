export function createSecret(key: string, value: $util.Input<string>): aws.secretsmanager.Secret {
  const secret = new aws.secretsmanager.Secret(`${key}Secret`, {
    name: `/streaming-video/${$app.stage}/${key}`,
    recoveryWindowInDays: $app.stage === 'production' ? 7 : 0,
  });
  new aws.secretsmanager.SecretVersion(`${key}SecretValue`, {
    secretId: secret.id,
    secretString: value,
  });
  return secret;
}
