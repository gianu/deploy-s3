import { S3Client } from '@aws-sdk/client-s3';

const { AWS_REGION } = process.env;

export default new S3Client({ region: AWS_REGION });
