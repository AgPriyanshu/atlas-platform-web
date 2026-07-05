import { Box, Tabs } from "@chakra-ui/react";
import { DatasetTree } from "./dataset-tree";
import { DocumentPanel } from "./document-panel";

export const DataSourcesPanel = () => (
  <Tabs.Root
    className="data-sources-panel"
    defaultValue="datasets"
    display="flex"
    flexDirection="column"
    h="full"
    w="full"
    bg="surface.page"
    borderColor="border.default"
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
  >
    <Tabs.List borderBottomWidth="1px" borderColor="border.default" px={2}>
      <Tabs.Trigger value="datasets" fontSize="xs" py={2}>
        Datasets
      </Tabs.Trigger>
      <Tabs.Trigger value="documents" fontSize="xs" py={2}>
        Documents
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="datasets" flex={1} overflow="hidden" p={0}>
      <Box h="full" overflow="hidden">
        <DatasetTree />
      </Box>
    </Tabs.Content>

    <Tabs.Content value="documents" flex={1} overflow="hidden" p={0}>
      <DocumentPanel />
    </Tabs.Content>
  </Tabs.Root>
);
