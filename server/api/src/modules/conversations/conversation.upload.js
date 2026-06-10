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
// const uploadSourceFile = async (filePath, type) => {
//   const folder = CLOUDINARY_FOLDERS[type];

//   if (!folder) {
//     throw new ApiError(400, `Unsupported source type: ${type}`);
//   }

//   let resourceType = 'auto';

//   if (type === 'pdf') {
//     resourceType = 'raw';
//   }

//   const uploadResult = await cloudinary.uploader.upload(filePath, {
//     folder,
//     resource_type: resourceType,
//   });

//   return {
//     publicId: uploadResult.public_id,
//     secureUrl: uploadResult.secure_url,
//   };
// };

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
