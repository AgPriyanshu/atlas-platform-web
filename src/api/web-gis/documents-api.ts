import { useMutation, useQuery } from "@tanstack/react-query";
import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type { DocumentResponse, DocumentSearchResult } from "./types";

const DOCUMENTS_URL = "/web-gis/documents/";

export const useDocuments = () =>
  useQuery({
    queryKey: QueryKeys.documents,
    queryFn: () => api.get<ApiResponse<DocumentResponse[]>>(DOCUMENTS_URL),
    select: (res) => res.data.data ?? [],
    refetchInterval: (query) => {
      const docs =
        (
          query.state.data as
            | { data: { data?: DocumentResponse[] } }
            | undefined
        )?.data?.data ?? [];
      const hasActive = docs.some(
        (d) => d.status === "processing" || d.status === "pending"
      );
      return hasActive ? 3000 : false;
    },
  });

export const useUploadDocument = () =>
  useMutation({
    mutationFn: ({ file, title }: { file: File; title: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      return api.post<ApiResponse<DocumentResponse>>(DOCUMENTS_URL, formData, {
        timeout: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.documents });
    },
  });

export const useDeleteDocument = () =>
  useMutation({
    mutationFn: (id: string) => api.delete(`${DOCUMENTS_URL}${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.documents });
    },
  });

export const useSearchDocuments = () =>
  useMutation({
    mutationFn: async ({
      query,
      topK = 5,
    }: {
      query: string;
      topK?: number;
    }): Promise<DocumentSearchResult[]> => {
      const res = await api.post<ApiResponse<DocumentSearchResult[]>>(
        `${DOCUMENTS_URL}search/`,
        { query, top_k: topK }
      );
      return res.data.data ?? [];
    },
  });
