import { ActionRegistry } from "./action-registry";
import type { ActionResult, RawUIAction } from "./types";

export class AgentExecutor {
  static async executeBatch(
    rawActions: RawUIAction[]
  ): Promise<ActionResult[]> {
    const results: ActionResult[] = [];

    for (const raw of rawActions) {
      results.push(await this.executeAction(raw));
    }

    return results;
  }

  private static async executeAction(raw: RawUIAction): Promise<ActionResult> {
    const { app, action_type } = raw;

    const factory = ActionRegistry.getFactory(app, action_type);

    if (!factory) {
      console.warn(
        `[AgentExecutor] No factory registered for "${app}/${action_type}" — skipping.`
      );
      return {
        app,
        actionType: action_type,
        success: false,
        error: `No factory registered for "${app}/${action_type}"`,
      };
    }

    const action = factory(raw);

    if (!action.validate()) {
      console.warn(
        `[AgentExecutor] Validation failed for ${app}/${action_type} — skipping.`
      );
      return {
        app,
        actionType: action_type,
        success: false,
        error: "Action validation failed",
      };
    }

    try {
      return await action.execute();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[AgentExecutor] Error executing ${app}/${action_type}:`,
        error
      );

      return {
        app,
        actionType: action_type,
        success: false,
        error: errorMessage,
      };
    }
  }
}
