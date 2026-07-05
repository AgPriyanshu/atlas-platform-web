import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "api/types";
import type { AxiosResponse } from "axios";
import api from "../api";
import { QueryKeys } from "../query-keys";
import type {
  CreateEmployeePayload,
  CreateWorkItemPayload,
  EmployeeListResponse,
  UpdateEmployeePayload,
  UpdateWorkItemPayload,
  WorkItemListResponse,
} from "./types";

export const useEmployeeTree = () => {
  return useQuery({
    queryKey: QueryKeys.workload.employeeTree,
    queryFn: async () =>
      api.get<ApiResponse<EmployeeListResponse>>("/workload/employees/tree/"),
    select: (response: AxiosResponse<ApiResponse<EmployeeListResponse>>) =>
      response.data.data,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateEmployeePayload) =>
      api.post<ApiResponse<EmployeeListResponse>>(
        "/workload/employees/",
        payload
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};

export const useUpdateEmployee = (employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmployeePayload) =>
      api.patch<ApiResponse<EmployeeListResponse>>(
        `/workload/employees/${employeeId}/`,
        payload
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};

export const useDeleteEmployee = (employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      api.delete<ApiResponse>(`/workload/employees/${employeeId}/`),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};

export const useEmployeeWorkItems = (employeeId: string) => {
  return useQuery({
    queryKey: QueryKeys.workload.workItems(employeeId),
    queryFn: async () =>
      api.get<ApiResponse<WorkItemListResponse>>(
        `/workload/employees/${employeeId}/work-items/`
      ),
    select: (response: AxiosResponse<ApiResponse<WorkItemListResponse>>) =>
      response.data.data,
    enabled: !!employeeId,
  });
};

export const useCreateWorkItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateWorkItemPayload) =>
      api.post<ApiResponse<WorkItemListResponse>>(
        "/workload/work-items/",
        payload
      ),
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.workItems(variables.employee),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};

export const useUpdateWorkItem = (workItemId: string, employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateWorkItemPayload) =>
      api.patch<ApiResponse<WorkItemListResponse>>(
        `/workload/work-items/${workItemId}/`,
        payload
      ),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.workItems(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};

export const useDeleteWorkItem = (workItemId: string, employeeId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      api.delete<ApiResponse>(`/workload/work-items/${workItemId}/`),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.workItems(employeeId),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.workload.employeeTree,
      });
    },
  });
};
