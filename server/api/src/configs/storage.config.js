import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import { envVariables } from './env.config.js';
import { logger } from './logger.config.js';

// const storageClient = new S3Client({
//   endpoint: envVariables.B2_ENDPOINT, // e.g. https://s3.us-west-004.backblazeb2.com
//   region: envVariables.B2_REGION, // e.g. us-west-004
//   credentials: {
//     accessKeyId: envVariables.B2_KEY_ID,
//     secretAccessKey: envVariables.B2_APP_KEY,
//   },
// });
const storageClient = new S3Client({
  endpoint: envVariables.B2_ENDPOINT,
  region: envVariables.B2_REGION,
  forcePathStyle: true, // 🔥 THIS IS CRITICAL FOR BACKBLAZE
  credentials: {
    accessKeyId: envVariables.B2_KEY_ID,
    secretAccessKey: envVariables.B2_APP_KEY,
  },
});
const testStorageConnection = async () => {
  try {
    const res = await storageClient.send(new ListBucketsCommand({}));

    logger.info('Backblaze B2 connected successfully');
  } catch (err) {
    logger.debug(err)
    logger.error('Backblaze B2 connection failed:', err.message);
  }
};

export { storageClient, testStorageConnection };
