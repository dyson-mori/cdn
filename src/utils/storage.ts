import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import crypto from "node:crypto";

const storageTypes = {
  local: multer.diskStorage({
    filename: (_, file, cb) => cb(null, `${file.originalname}`),
  }),
  s3: {}
};

export default multer({
  storage: storageTypes['local'],
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 mb * 1024 kb * 1024 bytes
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["video/mp4", "video/webm"];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  }
});