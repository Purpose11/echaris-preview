export type UploadCategory = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";

export interface UploadFileData {
  fileUrl: string;
  publicId: string;
  originalFileName: string;
  format: string;
  resourceType: string;
  fileSizeBytes: number;
  category: UploadCategory;
  usageType: string | null;
}
