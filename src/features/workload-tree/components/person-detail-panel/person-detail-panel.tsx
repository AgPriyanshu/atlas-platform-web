import {
  Badge,
  Box,
  Button,
  Drawer,
  Flex,
  Heading,
  IconButton,
  Input,
  Portal,
  Spinner,
  Text,
} from "@chakra-ui/react";
import {
  useCreateWorkItem,
  useDeleteEmployee,
  useDeleteWorkItem,
  useEmployeeWorkItems,
  useUpdateWorkItem,
} from "api/workload/workload-api";
import type { Employee, WorkItem, WorkItemStatus } from "api/workload/types";
import { useState } from "react";
import { FaEdit, FaExternalLinkAlt, FaTrash } from "react-icons/fa";

const STATUS_COLORS: Record<WorkItemStatus, string> = {
  TODO: "gray",
  IN_PROGRESS: "blue",
  DONE: "green",
};

const LOAD_COLORS = {
  UNDER: "green",
  HEALTHY: "orange",
  OVER: "red",
} as const;

interface PersonDetailPanelProps {
  employee: Employee;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export const PersonDetailPanel = ({
  employee,
  onClose,
  onEdit,
}: PersonDetailPanelProps) => {
  const { data: workItems, isPending: loadingItems } = useEmployeeWorkItems(
    employee.id
  );

  const { mutate: createItem, isPending: creating } = useCreateWorkItem();
  const { mutate: deleteEmployee } = useDeleteEmployee(employee.id);

  const [newTitle, setNewTitle] = useState("");

  const handleAddItem = () => {
    const title = newTitle.trim();

    if (!title) return;

    createItem(
      { employee: employee.id, title },
      { onSuccess: () => setNewTitle("") }
    );
  };

  const handleDeleteEmployee = () => {
    deleteEmployee(undefined, { onSuccess: onClose });
  };

  return (
    <Drawer.Root open size="md" onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content className="person-detail-panel">
            <Drawer.Header borderBottomWidth="1px">
              <Flex justify="space-between" align="start" w="full">
                <Box>
                  <Drawer.Title fontSize="lg">{employee.name}</Drawer.Title>
                  <Text fontSize="sm" color="gray.500" mt={0.5}>
                    {employee.designation}
                  </Text>
                </Box>
                <Flex gap={2}>
                  <IconButton
                    aria-label="Edit person"
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(employee)}
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton
                    aria-label="Delete person"
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={handleDeleteEmployee}
                  >
                    <FaTrash />
                  </IconButton>
                </Flex>
              </Flex>
            </Drawer.Header>

            <Drawer.Body overflowY="auto">
              {/* Load summary */}
              <Box
                bg={`${LOAD_COLORS[employee.loadStatus]}.50`}
                borderWidth="1px"
                borderColor={`${LOAD_COLORS[employee.loadStatus]}.200`}
                borderRadius="lg"
                p={4}
                mb={5}
              >
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="semibold" fontSize="sm">
                    Workload
                  </Text>
                  <Badge
                    colorPalette={LOAD_COLORS[employee.loadStatus]}
                    fontSize="xs"
                  >
                    {employee.loadStatus}
                  </Badge>
                </Flex>
                <Text fontSize="2xl" fontWeight="bold">
                  {employee.activeTaskCount}
                  <Text as="span" fontSize="sm" color="gray.500" ml={1}>
                    / {employee.capacity} tasks
                  </Text>
                </Text>
                <Box mt={2} h="6px" borderRadius="full" bg="gray.100">
                  <Box
                    h="6px"
                    borderRadius="full"
                    bg={`${LOAD_COLORS[employee.loadStatus]}.400`}
                    w={`${Math.min(employee.loadRatio * 100, 100)}%`}
                    transition="width 0.3s"
                  />
                </Box>
              </Box>

              {/* Work items */}
              <Heading size="sm" mb={3}>
                Active Work Items
              </Heading>

              {loadingItems ? (
                <Flex justify="center" py={6}>
                  <Spinner />
                </Flex>
              ) : (
                <Flex direction="column" gap={2} mb={4}>
                  {workItems?.length === 0 && (
                    <Text fontSize="sm" color="gray.400">
                      No active work items.
                    </Text>
                  )}
                  {workItems?.map((item) => (
                    <WorkItemRow
                      key={item.id}
                      item={item}
                      employeeId={employee.id}
                    />
                  ))}
                </Flex>
              )}

              {/* Add item */}
              <Flex gap={2}>
                <Input
                  placeholder="Add a work item..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                  size="sm"
                />
                <Button
                  size="sm"
                  bg="intent.primary"
                  color="white"
                  _hover={{ bg: "intent.primaryHover" }}
                  onClick={handleAddItem}
                  loading={creating}
                  disabled={!newTitle.trim()}
                >
                  Add
                </Button>
              </Flex>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

interface WorkItemRowProps {
  item: WorkItem;
  employeeId: string;
}

const WorkItemRow = ({ item, employeeId }: WorkItemRowProps) => {
  const { mutate: updateItem } = useUpdateWorkItem(item.id, employeeId);
  const { mutate: deleteItem } = useDeleteWorkItem(item.id, employeeId);

  const nextStatus: Record<WorkItemStatus, WorkItemStatus> = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: "TODO",
  };

  return (
    <Flex
      className="work-item-row"
      align="center"
      gap={2}
      p={2}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
      _hover={{ bg: "surface.subtle" }}
    >
      <Badge
        colorPalette={STATUS_COLORS[item.status]}
        fontSize="10px"
        cursor="pointer"
        onClick={() => updateItem({ status: nextStatus[item.status] })}
        flexShrink={0}
      >
        {item.status.replace("_", " ")}
      </Badge>

      <Text fontSize="sm" flex={1} lineClamp={1}>
        {item.title}
      </Text>

      {item.url && (
        <a href={item.url} target="_blank" rel="noopener noreferrer">
          <IconButton aria-label="Open link" size="xs" variant="ghost">
            <FaExternalLinkAlt />
          </IconButton>
        </a>
      )}

      <IconButton
        aria-label="Delete item"
        size="xs"
        variant="ghost"
        colorPalette="red"
        onClick={() => deleteItem()}
      >
        <FaTrash />
      </IconButton>
    </Flex>
  );
};
