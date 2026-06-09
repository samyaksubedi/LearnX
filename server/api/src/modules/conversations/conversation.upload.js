// Handles medias to be uploaded to Cloudinary for frontend preview :)

import { cloudinary } from '../../configs/cloudinary.config.js';
import { ApiError } from '../../utils/api-output.util.js';

const CLOUDINARY_FOLDERS = {
  pdf: 'LearnX/pdf',
  audio: 'LearnX/audio',
  video: 'LearnX/video',
};

const uploadSourceFile = async (filePath, type) => {
  const folder = CLOUDINARY_FOLDERS[type];

  if (!folder) {
    throw new ApiError(400, `Unsupported source type: ${type}`);
  }

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });

  return {
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url,
  };
};

// Delete asset from Cloudinary using publicId
const deleteSourceFile = async (publicId) => {
  if (!publicId) {
    throw new ApiError(400, 'publicId is required to delete asset');
  }

  const result = await cloudinary.uploader.destroy(publicId);

  // Cloudinary returns: { result: 'ok' } or { result: 'not found' }
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
