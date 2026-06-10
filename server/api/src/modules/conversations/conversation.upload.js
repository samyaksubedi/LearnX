// Handles medias to be uploaded to Cloudinary for frontend preview :)

import { cloudinary } from '../../configs/cloudinary.config.js';
import { logger } from '../../configs/logger.config.js';
import { ApiError } from '../../utils/api-output.util.js';

const CLOUDINARY_FOLDERS = {
  pdf: 'LearnX/pdf',
  audio: 'LearnX/audio',
  video: 'LearnX/video',
};

const CHUNKED_UPLOAD_THRESHOLD = 90 * 1024 * 1024; // 90 MB

const uploadSourceFile = async (filePath, type, fileSize) => {
  try {
    const folder = CLOUDINARY_FOLDERS[type];

    if (!folder) {
      throw new ApiError(400, `Unsupported source type: ${type}`);
    }

    const resourceType =
      type === 'pdf'
        ? 'raw'
        : type === 'audio' || type === 'video'
          ? 'video'
          : 'auto';

    let uploadResult;

    // Files > 90 MB -> chunked upload
    if (fileSize > CHUNKED_UPLOAD_THRESHOLD) {
      uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_chunked(
          filePath,
          {
            folder,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
      });
    } else {
      uploadResult = await cloudinary.uploader.upload(filePath, {
        folder,
        resource_type: resourceType,
      });
    }

    if (!uploadResult?.public_id || !uploadResult?.secure_url) {
      throw new ApiError(500, 'Cloudinary upload failed');
    }

    return {
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
    };
  } catch (error) {
    throw new ApiError(
      error.http_code || 500,
      error.message || 'Cloudinary upload failed',
    );
  }
};

// Delete asset from Cloudinary using publicId
const deleteSourceFile = async (publicId, type) => {
  if (!publicId) {
    throw new ApiError(400, 'publicId is required to delete asset');
  }

  let resourceType = 'image';

  if (type === 'pdf') resourceType = 'raw';
  if (type === 'audio' || type === 'video') resourceType = 'video';

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  if (result.result !== 'ok') {
    throw new ApiError(
      400,
      `Failed to delete asset from Cloudinary: ${result.result}`,
    );
  }

  return {
    success: true,
    result: result.result,
  };
};
export { uploadSourceFile, deleteSourceFile };
