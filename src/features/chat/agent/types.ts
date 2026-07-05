export interface RawUIAction {
  app: string;
  action_type: string;
  payload: Record<string, unknown>;
}

export interface ActionResult {
  app: string;
  actionType: string;
  success: boolean;
  error?: string;
  data?: unknown;
}
