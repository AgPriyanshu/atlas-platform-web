import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { Action } from "../../chat/agent/action";
import type { ActionResult } from "../../chat/agent/types";

export class CreateTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "create_task";
  readonly payload: { description: string };

  constructor(description: string) {
    super();
    this.payload = { description };
  }

  validate(): boolean {
    return Boolean(this.payload.description?.trim());
  }

  async execute(): Promise<ActionResult> {
    await api.post("/tasks/", { description: this.payload.description });
    queryClient.invalidateQueries({ queryKey: QueryKeys.todoList });
    return {
      app: this.app,
      actionType: this.actionType,
      success: true,
      data: { description: this.payload.description },
    };
  }
}

export class CompleteTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "complete_task";
  readonly payload: { description: string | null; task_id: string | null };

  constructor(description: string | null, taskId: string | null) {
    super();
    this.payload = { description, task_id: taskId };
  }

  validate(): boolean {
    return Boolean(this.payload.description || this.payload.task_id);
  }

  async execute(): Promise<ActionResult> {
    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class DeleteTaskAction extends Action {
  readonly app = "todo";
  readonly actionType = "delete_task";
  readonly payload: { description: string | null; task_id: string | null };

  constructor(description: string | null, taskId: string | null) {
    super();
    this.payload = { description, task_id: taskId };
  }

  validate(): boolean {
    return Boolean(this.payload.description || this.payload.task_id);
  }

  async execute(): Promise<ActionResult> {
    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class ListTasksAction extends Action {
  readonly app = "todo";
  readonly actionType = "list_tasks";
  readonly payload = {};

  async execute(): Promise<ActionResult> {
    const response = await api.get<ApiResponse<unknown[]>>("/tasks/");
    return {
      app: this.app,
      actionType: this.actionType,
      success: true,
      data: response.data?.data ?? [],
    };
  }
}
