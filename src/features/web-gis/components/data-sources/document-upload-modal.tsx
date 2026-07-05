import {
  Button,
  CloseButton,
  Dialog,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useUploadDocument } from "api/web-gis";
import { toaster } from "design-system/toaster";
import { useRef, useState } from "react";
import { FileUploadInput } from "shared/components";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentUploadModal = ({
  isOpen,
  onClose,
}: DocumentUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadDocument, isPending } = useUploadDocument();

  const handleFileSelect = (fileList: FileList) => {
    const selected = fileList[0];

    if (!selected) {
      return;
    }

    setFile(selected);

    if (!title) {
      setTitle(selected.name.replace(/\.pdf$/i, ""));
    }
  };

  const handleClose = () => {
    setFile(null);
    setTitle("");
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      await uploadDocument({ file, title: title || file.name });
      toaster.success({
        title: "PDF uploaded",
        description: "Processing started — status will update automatically.",
      });
      handleClose();
    } catch {
      toaster.error({
        title: "Upload failed",
        description: "Could not upload the file. Please try again.",
      });
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(d) => !d.open && handleClose()}
      placement="center"
    >
      <Dialog.Trigger />
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content className="document-upload-modal-content">
          <Dialog.CloseTrigger>
            <CloseButton mt="11px" mr="7px" size="sm" />
          </Dialog.CloseTrigger>
          <Dialog.Header>
            <Dialog.Title>Upload PDF Document</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <VStack align="stretch" gap={4}>
              <Input
                placeholder="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                borderStyle="dashed"
                h="80px"
                fontSize="sm"
                color={file ? "text.primary" : "text.muted"}
              >
                <FileUploadInput
                  onFileSelect={handleFileSelect}
                  accept="application/pdf"
                  multiple={false}
                  inputRef={fileInputRef}
                />
                {file ? file.name : "Click to select a PDF file"}
              </Button>

              {file && (
                <Text fontSize="xs" color="text.muted">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              )}
            </VStack>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Button
              bgColor="intent.primary"
              color="white"
              onClick={handleUpload}
              loading={isPending}
              disabled={!file || isPending}
            >
              Upload
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
