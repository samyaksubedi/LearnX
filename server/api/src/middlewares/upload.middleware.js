import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/api-output.util.js';

const baseUploadPath = path.resolve('../shared/uploads'); // absolute path

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder;

    if (file.mimetype.startsWith('video/')) {
      folder = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      folder = 'audio';
    } else if (file.mimetype === 'application/pdf') {
      folder = 'pdf';
    } else {
      return cb(new ApiError(400, 'Unsupported file type'));
    }

    const destination = path.join(baseUploadPath, folder); // It will be absolute path : ) so python can access it smothly : ) 

    fs.mkdirSync(destination, { recursive: true });

    cb(null, destination);
  },

  filename: (req, file, cb) => {
    const sanitizedFileName = file.originalname.replace(/\s+/g, '-');
    const uniqueName = `${Date.now()}-${sanitizedFileName}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['video/', 'audio/', 'application/pdf'];

  const isValid = allowedMimeTypes.some((type) =>
    file.mimetype.startsWith(type),
  );

  if (!isValid) {
    return cb(
      new ApiError(400, 'Only video, audio, or PDF files are allowed'),
      false,
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 650 * 1024 * 1024, // 650mb -> Cloudinary free plan limits to max 100mb so shifter to B2 bucket it has free 10gbs  : ) : )
  },
});

export { upload };
