import { Box, Center, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEmployeeTree } from "api/workload/workload-api";
import type { Employee, LoadStatus } from "api/workload/types";
import { useMemo, useState } from "react";
import { EmployeeForm } from "./components/employee-form/employee-form";
import { OrgGraph } from "./components/org-graph/org-graph";
import { PersonDetailPanel } from "./components/person-detail-panel/person-detail-panel";
import { WorkloadToolbar } from "./components/workload-toolbar";

type FilterStatus = LoadStatus | "ALL";

export const WorkloadTreePage = () => {
  const { data: employees, isPending, isError } = useEmployeeTree();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const allEmployees = useMemo(() => employees ?? [], [employees]);

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.designation.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filterStatus === "ALL" || emp.loadStatus === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [allEmployees, search, filterStatus]);

  const selectedEmployee =
    allEmployees.find((e) => e.id === selectedId) ?? null;

  const openAddForm = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEditForm = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  if (isPending) {
    return (
      <Center w="full" h="full">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center w="full" h="full">
        <Text color="red.500">Failed to load the org chart.</Text>
      </Center>
    );
  }

  return (
    <Flex className="workload-tree-page" direction="column" w="full" h="full">
      <WorkloadToolbar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onAddPerson={openAddForm}
      />

      <Box flex={1} position="relative" overflow="hidden">
        {filteredEmployees.length === 0 ? (
          <Center h="full">
            <Text color="gray.400">
              {allEmployees.length === 0
                ? "No people yet. Add someone to get started."
                : "No people match the current filter."}
            </Text>
          </Center>
        ) : (
          <OrgGraph
            employees={filteredEmployees}
            selectedId={selectedId}
            onSelectEmployee={setSelectedId}
          />
        )}
      </Box>

      {selectedEmployee && (
        <PersonDetailPanel
          employee={selectedEmployee}
          onClose={() => setSelectedId(null)}
          onEdit={openEditForm}
        />
      )}

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employees={allEmployees}
        editing={editingEmployee}
      />
    </Flex>
  );
};
