import { Router } from "express";
import FileDownload from "../services/fileDownload";
import { Multer } from "../middlewares/multer";
import { uploadFileDataSheet } from "../middlewares/uploadFile";

const router = Router();

const fileDownloadService = new FileDownload();

router.get("/:sku", fileDownloadService.findFileDownloadBySku);
router.patch(
  "/:sku",
  Multer.single("path"),
  uploadFileDataSheet,
  fileDownloadService.updateFileDownloadBySku,
);
router.delete("/:sku", fileDownloadService.deleteFileDownloadBySku);

router.post(
  "/",
  Multer.single("path"),
  uploadFileDataSheet,
  fileDownloadService.createFileDownloadSku,
);

export default router;
