import { createSecret } from './utils/create-secret';
import * as pulumi from '@pulumi/pulumi';
import * as mongodbatlas from '@pulumi/mongodbatlas';
import { infrasName } from './utils/infras.constant';

export async function createDb() {
  const atlasProvider = new mongodbatlas.Provider('atlasProvider', {
    publicKey: process.env.ATLAS_PUBLIC_KEY,
    privateKey: process.env.ATLAS_PRIVATE_KEY,
  });

  if (!process.env.ATLAS_ORG_ID) {
    throw new Error('ATLAS_ORG_ID couldnt be empty');
  }

  const projectName = `${infrasName.applicationName}-mongo-${$app.stage}`;
  const project = new mongodbatlas.Project(
    projectName,
    {
      name: projectName,
      orgId: process.env.ATLAS_ORG_ID!,
    },
    { provider: atlasProvider },
  );

  const mongoClusterName = `${infrasName.applicationName}-cluster-${$app.stage}`;

  const mongoCluster = new mongodbatlas.Cluster(
    mongoClusterName,
    {
      projectId: project.id,
      name: mongoClusterName,
      providerName: 'TENANT',
      backingProviderName: 'AWS',
      providerInstanceSizeName: 'M0',
      providerRegionName: 'AP_SOUTHEAST_1',
    },
    { provider: atlasProvider },
  );

  const mongoUserName = `mongo-user-${$app.stage};`;
  const mongoUser = new mongodbatlas.DatabaseUser(
    mongoUserName,
    {
      projectId: project.id,
      username: 'mongo_user',
      password: 'mongo_password',
      authDatabaseName: 'admin',
      roles: [
        {
          roleName: 'readWriteAnyDatabase',
          databaseName: 'admin',
        },
      ],
    },
    { provider: atlasProvider },
  );

  const alloAllIpName = `allow-all-ip-${$app.stage}`;
  const ipAccessList = new mongodbatlas.ProjectIpAccessList(
    alloAllIpName,
    {
      projectId: project.id,
      cidrBlock: '0.0.0.0/0',
      comment: 'Allow access from anywhere for staging',
    },
    { provider: atlasProvider },
  );

  const dbUri = pulumi
    .all([
      mongoUser.username,
      mongoUser.password,
      mongoCluster.name,
      mongoCluster.connectionStrings,
    ])
    .apply(([userName, password, name, cs]) => {
      const url = new URL(cs[0].standardSrv);
      return $interpolate`mongodb+srv://${userName}:${password}@${url.host}/streaming_video?appName=${name}`;
    });

  const dbSecret = createSecret('DATABASE_URI', dbUri);

  return dbUri;
}
