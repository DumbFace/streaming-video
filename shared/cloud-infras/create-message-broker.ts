import { createSecret } from './utils/create-secret';
import * as pulumi from '@pulumi/pulumi';
import * as cloudamqp from '@pulumi/cloudamqp';
import { infrasName } from './utils/infras.constant';

export async function createMessageBroker() {
  const cloudamqpProvider = new cloudamqp.Provider('cloudamqp-provider', {
    apikey: process.env.CLOUDAMQP_API_KEY,
  });

  const messageBrokerName = `${infrasName.applicationName}-rabbitmq-${$app.stage}`;
  const rabbitmq = new cloudamqp.Instance(
    messageBrokerName,
    {
      name: messageBrokerName,
      plan: 'lemur',
      region: 'amazon-web-services::ap-southeast-1',
    },
    { provider: cloudamqpProvider },
  );

  const rabbitmqUri = pulumi.all([rabbitmq.url]).apply(([url]) => {
    return url;
  });

  const rabbitmqSecret = createSecret('MESSAGE_BROKER_URI', rabbitmqUri);

  return rabbitmqUri;
}
