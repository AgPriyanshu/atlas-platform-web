import {
  Badge,
  Box,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useDeleteDocument, useDocuments } from "api/web-gis";
import type { DocumentResponse, DocumentStatus } from "api/web-gis/types";
import { toaster } from "design-system/toaster";
import { useState } from "react";
import { FiFile, FiTrash2, FiUpload } from "react-icons/fi";
import { DocumentUploadModal } from "./document-upload-modal";

const STATUS_COLOR: Record<DocumentStatus, string> = {
  pending: "gray",
  processing: "blue",
  ready: "green",
  failed: "red",
};

const StatusBadge = ({ status }: { status: DocumentStatus }) => (
  <Badge colorPalette={STATUS_COLOR[status]} size="sm" variant="subtle">
    {status}
  </Badge>
);

const DocumentRow = ({ doc }: { doc: DocumentResponse }) => {
  const { mutate: deleteDoc, isPending: isDeleting } = useDeleteDocument();

  const handleDelete = () => {
    deleteDoc(doc.id, {
      onError: () => toaster.error({ title: "Failed to delete document." }),
    });
  };

  return (
    <Flex
      className="document-row"
      align="center"
      justify="space-between"
      px={3}
      py={2}
      borderRadius="md"
      _hover={{ bg: "surface.subtle" }}
      gap={2}
    >
      <HStack gap={2} flex={1} minW={0}>
        {doc.status === "processing" || doc.status === "pending" ? (
          <Spinner size="xs" color="text.muted" flexShrink={0} />
        ) : (
          <Box color="text.muted" flexShrink={0}>
            <FiFile size={14} />
          </Box>
        )}
        <VStack gap={0} align="start" minW={0}>
          <Text fontSize="sm" truncate maxW="full">
            {doc.title}
          </Text>
          <HStack gap={2}>
            <StatusBadge status={doc.status} />
            {doc.pageCount != null && (
              <Text fontSize="xs" color="text.muted">
                {doc.pageCount}p
              </Text>
            )}
          </HStack>
        </VStack>
      </HStack>

      <IconButton
        aria-label="Delete document"
        variant="ghost"
        size="xs"
        color="text.muted"
        loading={isDeleting}
        onClick={handleDelete}
      >
        <FiTrash2 />
      </IconButton>
    </Flex>
  );
};

export const DocumentPanel = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: documents = [], isLoading } = useDocuments();

  return (
    <Flex
      className="document-panel"
      direction="column"
      h="full"
      w="full"
      overflow="hidden"
    >
      <HStack
        justify="space-between"
        px={3}
        py={2}
        borderBottomWidth="1px"
        borderColor="border.default"
      >
        <Text fontSize="sm" fontWeight="medium">
          Documents
        </Text>
        <IconButton
          aria-label="Upload PDF"
          variant="ghost"
          size="xs"
          onClick={() => setIsUploadOpen(true)}
        >
          <FiUpload />
        </IconButton>
      </HStack>

      <Box flex={1} overflowY="auto" py={1}>
        {isLoading ? (
          <Flex justify="center" pt={6}>
            <Spinner size="sm" />
          </Flex>
        ) : documents.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="full"
            gap={2}
            opacity={0.5}
            px={4}
            py={8}
          >
            <FiFile size={24} />
            <Text fontSize="sm" textAlign="center">
              No documents uploaded yet.
            </Text>
            <Text fontSize="xs" color="text.muted" textAlign="center">
              Upload a PDF to enable document search in the chat agent.
            </Text>
          </Flex>
        ) : (
          documents.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
        )}
      </Box>

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </Flex>
  );
};
