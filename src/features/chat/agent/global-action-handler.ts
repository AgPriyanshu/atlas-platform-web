import { navigationService } from "shared/navigation/navigation-service";
import { RoutePath } from "app/router/constants";
import { Action, ActionHandler } from "./action";
import type { ActionResult, RawUIAction } from "./types";

const ROUTE_MAP: Record<string, string> = {
  todo: RoutePath.Todo,
  map: RoutePath.Map,
  home: RoutePath.Home,
  "url-shortner": RoutePath.URLShortner,
  "level-up": RoutePath.LevelUp,
  whiteboard: RoutePath.WhiteBoard,
  inventory: RoutePath.Inventory,
  store: RoutePath.Store,
};

class NavigateAction extends Action {
  readonly app = "global";
  readonly actionType = "navigate";
  readonly payload: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    super();
    this.payload = payload;
  }

  validate(): boolean {
    return typeof this.payload.to === "string" && this.payload.to in ROUTE_MAP;
  }
}

export class GlobalActionHandler extends ActionHandler {
  readonly app = "global";

  supportedActions(): string[] {
    return ["navigate"];
  }

  parse(raw: RawUIAction): Action | null {
    if (raw.action_type === "navigate") {
      return new NavigateAction(raw.payload);
    }

    return null;
  }

  async execute(action: Action): Promise<ActionResult> {
    if (action instanceof NavigateAction) {
      const path = ROUTE_MAP[action.payload.to as string];
      navigationService.navigate(path);
      return { app: "global", actionType: "navigate", success: true };
    }

    return {
      app: "global",
      actionType: action.actionType,
      success: false,
      error: "Unknown action.",
    };
  }
}
