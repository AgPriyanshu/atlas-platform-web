import type { ActionResult } from "./types";

export abstract class Action {
  abstract readonly app: string;
  abstract readonly actionType: string;
  abstract readonly payload: Record<string, unknown>;

  validate(): boolean {
    return true;
  }

  abstract execute(): Promise<ActionResult>;
}
