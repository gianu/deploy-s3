import * as github from '@actions/github';
import S3 from '../s3Client';
import { DeleteBucketCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteObjectsCommandInput } from '@aws-sdk/client-s3';
import validateEnvVars from '../utils/validateEnvVars';
import deactivateDeployments from '../utils/deactivateDeployments';
import deleteDeployments from '../utils/deleteDeployments';

export const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'];

export default async (bucketName: string, environmentPrefix: string) => {
  const { repo } = github.context;

  validateEnvVars(requiredEnvVars);

  console.log('Emptying S3 bucket...');

  console.log('Fetching objects...');
  const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
  const objects = await S3.send(listCommand);

  if (objects.Contents && objects.Contents.length >= 1) {
    const deleteParams: DeleteObjectsCommandInput = {
      Bucket: bucketName,
      Delete: {
        Objects: []
      }
    };

    for (const object of objects.Contents) {
      deleteParams.Delete.Objects.push({ Key: object.Key });
    }

    console.log('Deleting objects...');
    const deleteCommand = new DeleteObjectsCommand(deleteParams);
    await S3.send(deleteCommand);
  } else {
    console.log('S3 bucket already empty.');
  }

  const deleteBucketCommand = new DeleteBucketCommand({ Bucket: bucketName });
  await S3.send(deleteBucketCommand);
  await deactivateDeployments(repo, environmentPrefix);
  await deleteDeployments(repo, environmentPrefix)

  console.log('S3 bucket removed');
};
