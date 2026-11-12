import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { UploadCategory } from "@/api/utilities/types";
import { uploadPublicFile } from "@/api/utilities/utilities";
import { normalizeError } from "@/utils/normalizeError";

export function useUploadPublicFile() {
  return useMutation({
    mutationFn: (params: { file: File; category: UploadCategory; usageType?: string }) =>
      uploadPublicFile(params),
    onError: (error: unknown) => {
      toast.error(normalizeError(error));
    },
  });
}
