export interface IFile extends Express.Multer.File {
  storageUrl?: string | undefined;
}
