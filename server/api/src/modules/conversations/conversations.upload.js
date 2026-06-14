// Handles medias to be uploaded to Backblaze B2 for frontend preview :)

import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, statSync } from 'fs';
import { storageClient } from '../../configs/storage.config.js';
import { envVariables } from '../../configs/env.config.js';
import { ApiError } from '../../utils/api-output.util.js';
import { randomUUID } from 'crypto';

const B2_FOLDERS = {
  pdf: 'LearnX/pdf',
  audio: 'LearnX/audio',
  video: 'LearnX/video',
};

const CONTENT_TYPES = {
  pdf: 'application/pdf',
  audio: 'audio/mpeg',
  video: 'video/mp4',
};

// No chunked threshold needed — B2 has no 100MB limit :)
const uploadSourceFile = async (filePath, type, fileSize) => {
  try {
    const folder = B2_FOLDERS[type];

    if (!folder) {
      throw new ApiError(400, `Unsupported source type: ${type}`);
    }

    const fileId = randomUUID();
    const key = `${folder}/${fileId}`;
    const fileStream = createReadStream(filePath);
    const contentType = CONTENT_TYPES[type] || 'application/octet-stream';

    await storageClient.send(
      new PutObjectCommand({
        Bucket: envVariables.B2_BUCKET_NAME,
        Key: key,
        Body: fileStream,
        ContentType: contentType,
        ContentLength: fileSize,
      }),
    );

    // Public URL format for B2 public buckets
    const secureUrl = `${envVariables.B2_PUBLIC_URL}/file/${envVariables.B2_BUCKET_NAME}/${key}`;

    return {
      publicId: key, // key acts as publicId for deletion
      secureUrl,
    };
  } catch (error) {
    throw new ApiError(
      error.$metadata?.httpStatusCode || 500,
      error.message || 'B2 upload failed',
    );
  }
};

// Delete asset from B2 using publicId (which is the key)
const deleteSourceFile = async (publicId, type) => {
  if (!publicId) {
    throw new ApiError(400, 'publicId is required to delete asset');
  }

  try {
    await storageClient.send(
      new DeleteObjectCommand({
        Bucket: envVariables.B2_BUCKET_NAME,
        Key: publicId,
      }),
    );

    return {
      success: true,
      result: 'ok',
    };
  } catch (error) {
    throw new ApiError(
      error.$metadata?.httpStatusCode || 500,
      `Failed to delete asset from B2: ${error.message}`,
    );
  }
};

export { uploadSourceFile, deleteSourceFile };
