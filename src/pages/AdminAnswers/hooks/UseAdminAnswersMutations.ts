import { useRef, useState } from "react";
import { importAnswersBulk } from "../AdminAnswers.service";
import type { BulkImportError } from "../AdminAnswers.types";

export function useAdminAnswersMutations() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<BulkImportError[]>([]);
  const [bulkErrorModalOpen, setBulkErrorModalOpen] = useState(false);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkLoading(true);
    setBulkErrors([]);

    try {
      const result = await importAnswersBulk(file);
      if (result.errors.length > 0) {
        setBulkErrors(result.errors);
        setBulkErrorModalOpen(true);
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setBulkLoading(false);
      e.target.value = "";
    }
  };

  const closeBulkErrorModal = () => setBulkErrorModalOpen(false);

  return {
    fileInputRef,
    bulkLoading,
    bulkErrors,
    bulkErrorModalOpen,
    openFilePicker,
    handleFileChange,
    closeBulkErrorModal,
  };
}
