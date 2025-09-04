import multer from "multer";

export const Multer = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, //50mb
});
