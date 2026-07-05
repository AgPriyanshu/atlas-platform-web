import api from "api/api";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import type {
  DatasetNodeResponse,
  ProcessingToolDefinition,
  ProcessingToolsResponse,
} from "api/web-gis/types";
import { Action } from "../../chat/agent/action";
import type { ActionResult } from "../../chat/agent/types";
import { workspaceManager } from "shared/map/stores/workspace-manager";

const findDatasetByName = (
  nodes: DatasetNodeResponse[],
  name: string
): DatasetNodeResponse | null => {
  const lowerName = name.toLowerCase();

  for (const node of nodes) {
    if (node.dataset && node.name.toLowerCase().includes(lowerName)) {
      return node;
    }

    if (node.children.length > 0) {
      const found = findDatasetByName(node.children, name);
      if (found) return found;
    }
  }

  return null;
};

export class LoadDatasetAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "load_dataset";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }

  async execute(): Promise<ActionResult> {
    const response = await api.get<ApiResponse<DatasetNodeResponse[]>>(
      QueryKeys.datasets[0]
    );

    const datasets = response.data?.data ?? [];
    const node = findDatasetByName(datasets, this.payload.dataset_name);

    if (!node?.dataset) {
      return {
        app: this.app,
        actionType: this.actionType,
        success: false,
        error: `Dataset "${this.payload.dataset_name}" not found.`,
      };
    }

    await api.post(QueryKeys.layers[0], {
      name: node.name,
      source: node.dataset.id,
    });

    queryClient.invalidateQueries({ queryKey: QueryKeys.layers });

    return {
      app: this.app,
      actionType: this.actionType,
      success: true,
      data: { datasetName: node.name },
    };
  }
}

export class RemoveLayerAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "remove_layer";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }

  async execute(): Promise<ActionResult> {
    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class FitToLayerAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "fit_to_layer";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }

  async execute(): Promise<ActionResult> {
    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class ToggleVisibilityAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "toggle_visibility";
  readonly payload: { dataset_name: string };

  constructor(datasetName: string) {
    super();
    this.payload = { dataset_name: datasetName };
  }

  validate(): boolean {
    return Boolean(this.payload.dataset_name);
  }

  async execute(): Promise<ActionResult> {
    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class MapZoomToAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "map_zoom_to";
  readonly payload: { latitude: number; longitude: number };

  constructor(latitude: number, longitude: number) {
    super();
    this.payload = { latitude, longitude };
  }

  validate(): boolean {
    return (
      typeof this.payload.latitude === "number" &&
      typeof this.payload.longitude === "number"
    );
  }

  async execute(): Promise<ActionResult> {
    const workspace = workspaceManager.activeWorkspace;

    if (!workspace) {
      return {
        app: this.app,
        actionType: this.actionType,
        success: false,
        error: "No active workspace.",
      };
    }

    workspace.mapStore.flyTo(
      [this.payload.longitude, this.payload.latitude],
      12
    );

    return { app: this.app, actionType: this.actionType, success: true };
  }
}

export class OpenProcessingToolAction extends Action {
  readonly app = "web_gis";
  readonly actionType = "open_processing_tool";
  readonly payload: { toolName: string; defaults: Record<string, unknown> };

  constructor(toolName: string, defaults: Record<string, unknown>) {
    super();
    this.payload = { toolName, defaults };
  }

  validate(): boolean {
    return Boolean(this.payload.toolName);
  }

  async execute(): Promise<ActionResult> {
    const workspace = workspaceManager.activeWorkspace;

    if (!workspace) {
      return {
        app: this.app,
        actionType: this.actionType,
        success: false,
        error: "No active workspace.",
      };
    }

    const { toolName, defaults } = this.payload;
    const inputDatasetId = defaults?.inputDatasetId as string | undefined;

    if (inputDatasetId) {
      const layer = workspace.layerStore.layersArray.find(
        (l) => l.datasetId === inputDatasetId
      );
      if (layer) {
        workspace.layerStore.fitToLayer(layer.id);
      }
    }

    const cached = queryClient.getQueryData<{
      data: ApiResponse<ProcessingToolsResponse>;
    }>(QueryKeys.processingTools);
    const lowerName = toolName.toLowerCase();
    const toolDef = cached?.data?.data?.tools?.find(
      (t) =>
        t.toolName.toLowerCase() === lowerName ||
        t.label.toLowerCase() === lowerName
    );

    if (toolDef) {
      workspace.processingUIStore.openTool(toolDef, defaults, true);
      return { app: this.app, actionType: this.actionType, success: true };
    }

    const stub: ProcessingToolDefinition = {
      toolName,
      label: toolName,
      description: "",
      category: "vector",
      inputTypes: ["vector"],
      parameters: [],
    };
    workspace.processingUIStore.openTool(stub, defaults, true);
    return { app: this.app, actionType: this.actionType, success: true };
  }
}
