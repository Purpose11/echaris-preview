import { type ApiResponse, coreApi } from "@/api/api";
import type { UploadCategory, UploadFileData } from "@/api/utilities/types";

export async function uploadPublicFile(params: {
  file: File;
  category: UploadCategory;
  usageType?: string;
}): Promise<ApiResponse<UploadFileData>> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("category", params.category);
  if (params.usageType) {
    formData.append("usageType", params.usageType);
  }

  const { data } = await coreApi.post<ApiResponse<UploadFileData>>(
    "/utilities/public/file/upload",
    formData,
  );
  return data;
}
