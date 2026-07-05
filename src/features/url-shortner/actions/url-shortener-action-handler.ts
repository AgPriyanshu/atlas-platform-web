import api from "api/api";
import { QueryKeys } from "api/query-keys";
import type { ApiResponse } from "api/types";
import { Action } from "../../chat/agent/action";
import type { ActionResult } from "../../chat/agent/types";

export class ShortenURLAction extends Action {
  readonly app = "url_shortener";
  readonly actionType = "shorten_url";
  readonly payload: { url: string };

  constructor(url: string) {
    super();
    this.payload = { url };
  }

  validate(): boolean {
    if (!this.payload.url) return false;
    try {
      new URL(this.payload.url);
      return true;
    } catch {
      return false;
    }
  }

  async execute(): Promise<ActionResult> {
    const response = await api.post<
      ApiResponse<{ url: string; shortUrl: string }>
    >(QueryKeys.urls[0], { url: this.payload.url });
    return {
      app: this.app,
      actionType: this.actionType,
      success: true,
      data: response.data?.data,
    };
  }
}

export class ListURLsAction extends Action {
  readonly app = "url_shortener";
  readonly actionType = "list_urls";
  readonly payload = {};

  async execute(): Promise<ActionResult> {
    const response = await api.get<ApiResponse<unknown[]>>(QueryKeys.urls[0]);
    return {
      app: this.app,
      actionType: this.actionType,
      success: true,
      data: response.data?.data ?? [],
    };
  }
}
