import { HeadBucketCommand } from '@aws-sdk/client-s3';
import S3 from '../s3Client';

export default async (bucketName: string) => {
  try {
    const command = new HeadBucketCommand({ Bucket: bucketName });
    await S3.send(command);
    return true;
  } catch (e) {
    return false;
  }
};
