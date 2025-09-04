import { NextFunction, Request, Response } from "express";
import { googleCloud } from "../config/googleCloud";
import dotenv from "dotenv";
import Jimp from "jimp";
import { cleanFileName } from "../utils/cleanFileName";
import { randomUUID } from "crypto";
dotenv.config();
interface IFile extends Express.Multer.File {
  storageUrl: string;
}
const { BUCKET_NAME_PRODUCT, BUCKET_NAME_CAMPAIGN, BUCKET_NAME_DATASHEET } = process.env;

export const uploadImageProduct = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_PRODUCT!);

  if (!req.file) return next();

  const cleanedFilename = cleanFileName(req.file.originalname);

  const blob = bucket.file(cleanedFilename);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export const _uploadImageCampaign = async (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_CAMPAIGN!);
  if (!req.file) return next();

  try {
    const image = await Jimp.read(req.file.buffer);

    const convertedBuffer = await image.getBufferAsync(
      Jimp.MIME_JPEG || Jimp.MIME_PNG || Jimp.MIME_BMP,
    );

    const blob = bucket.file("imagens/" + req.file.originalname.replace(/\.[^.]+$/, "") + ".webp");
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: "image/webp",
      },
    });

    blobStream.on("error", (err) => {
      next(err);
    });

    blobStream.on("finish", async () => {
      await blob.makePublic();
      (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      next();
    });

    blobStream.end(convertedBuffer);
  } catch (err) {
    next(err);
  }
};

export const uploadImageCampaign = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_CAMPAIGN!);
  if (!req.file) return next();

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export async function uploadImageToStorage(file: Express.Multer.File) {
  try {
    if (!file) {
      throw new Error("Arquivo não encontrado");
    }

    const bucket = googleCloud.bucket(BUCKET_NAME_CAMPAIGN!);
    const blob = bucket.file(file.originalname);

    let url = `https://cdn.acheipneus.com.br/${blob.name}`;

    await bucket.file(file.originalname).save(file.buffer);
    await blob.makePublic();

    return url;
  } catch (error) {
    throw error;
  }
}

export const uploadImageCdm = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_PRODUCT!);
  if (!req.file) return next();

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  // const uuid = randomUUID();

  blobStream.on("finish", async () => {
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export const uploadFileDataSheet = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_DATASHEET!);
  if (!req.file) return next();

  const filename = req.file.originalname.replace(/\s/g, "");

  const blob = bucket.file("datasheet/" + filename);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    await blob.makePublic();
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export const uploadImageTicket = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_DATASHEET!);
  if (!req.file) return next();

  const filename = req.file.originalname.replace(/\s/g, "");

  const blob = bucket.file("datasheet/" + filename);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    await blob.makePublic();
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export const uploadImageBrand = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_DATASHEET!);
  if (!req.file) return next();

  const filename = req.file.originalname.replace(/\s/g, "");

  const blob = bucket.file("brand/" + filename);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    await blob.makePublic();
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};

export const uploadImageKit = (req: Request, res: Response, next: NextFunction) => {
  const bucket = googleCloud.bucket(BUCKET_NAME_PRODUCT!);

  if (!req.file) return next();

  const cleanedFilename = cleanFileName(req.file.originalname);

  const blob = bucket.file(cleanedFilename);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    next(err);
  });

  blobStream.on("finish", async () => {
    (req.file as IFile).storageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    next();
  });

  blobStream.end(req.file.buffer);
};
