import type { Action } from "./action";
import type { RawUIAction } from "./types";
import { NavigateAction } from "./global-action-handler";
import {
  CreateTaskAction,
  CompleteTaskAction,
  DeleteTaskAction,
  ListTasksAction,
} from "features/todo/actions/todo-action-handler";
import {
  ShortenURLAction,
  ListURLsAction,
} from "features/url-shortner/actions/url-shortener-action-handler";
import {
  LoadDatasetAction,
  RemoveLayerAction,
  FitToLayerAction,
  ToggleVisibilityAction,
  MapZoomToAction,
  OpenProcessingToolAction,
} from "features/web-gis/actions/web-gis-action-handler";

type ActionFactory = (raw: RawUIAction) => Action;

export class ActionRegistry {
  private static factories = new Map<string, ActionFactory>();

  static register(
    app: string,
    actionType: string,
    factory: ActionFactory
  ): void {
    const key = `${app}/${actionType}`;

    if (this.factories.has(key)) {
      console.warn(
        `[ActionRegistry] Factory for "${key}" is already registered — skipping.`
      );
      return;
    }

    this.factories.set(key, factory);
  }

  static getFactory(
    app: string,
    actionType: string
  ): ActionFactory | undefined {
    return this.factories.get(`${app}/${actionType}`);
  }

  static clear(): void {
    this.factories.clear();
  }
}

export const registerAllActions = (): void => {
  ActionRegistry.register(
    "global",
    "navigate",
    (raw) => new NavigateAction(raw.payload)
  );

  ActionRegistry.register(
    "todo",
    "create_task",
    (raw) => new CreateTaskAction((raw.payload.description as string) ?? "")
  );
  ActionRegistry.register(
    "todo",
    "complete_task",
    (raw) =>
      new CompleteTaskAction(
        (raw.payload.description as string) ?? null,
        (raw.payload.task_id as string) ?? null
      )
  );
  ActionRegistry.register(
    "todo",
    "delete_task",
    (raw) =>
      new DeleteTaskAction(
        (raw.payload.description as string) ?? null,
        (raw.payload.task_id as string) ?? null
      )
  );
  ActionRegistry.register("todo", "list_tasks", () => new ListTasksAction());

  ActionRegistry.register(
    "url_shortener",
    "shorten_url",
    (raw) => new ShortenURLAction((raw.payload.url as string) ?? "")
  );
  ActionRegistry.register(
    "url_shortener",
    "list_urls",
    () => new ListURLsAction()
  );

  ActionRegistry.register(
    "web_gis",
    "load_dataset",
    (raw) => new LoadDatasetAction((raw.payload.dataset_name as string) ?? "")
  );
  ActionRegistry.register(
    "web_gis",
    "remove_layer",
    (raw) => new RemoveLayerAction((raw.payload.dataset_name as string) ?? "")
  );
  ActionRegistry.register(
    "web_gis",
    "fit_to_layer",
    (raw) => new FitToLayerAction((raw.payload.dataset_name as string) ?? "")
  );
  ActionRegistry.register(
    "web_gis",
    "toggle_visibility",
    (raw) =>
      new ToggleVisibilityAction((raw.payload.dataset_name as string) ?? "")
  );
  ActionRegistry.register(
    "web_gis",
    "map_zoom_to",
    (raw) =>
      new MapZoomToAction(
        raw.payload.latitude as number,
        raw.payload.longitude as number
      )
  );
  ActionRegistry.register(
    "web_gis",
    "open_processing_tool",
    (raw) =>
      new OpenProcessingToolAction(
        (raw.payload.tool_name as string) ?? "",
        (raw.payload.defaults as Record<string, unknown>) ?? {}
      )
  );
};
