// export type TaskAttribute = "priority" | "due date" | "status";

import { TodoListAppInfo } from "./app-info-schema.js";
import * as z from "zod";

export type TaskAttribute = PriorityTaskAttribute | DueDateTaskAttribute | StatusTaskAttribute;

abstract class BaseTaskAttribute {
  protected abstract attribute: string;

  toString() {
    return this.attribute;
  }

  getViews(appInfo: z.infer<typeof TodoListAppInfo>) {
    return appInfo.taskInfo.views[this.attribute as keyof typeof appInfo.taskInfo.views];
  }
}

export class PriorityTaskAttribute extends BaseTaskAttribute {
  protected attribute = "priority";
}

export class DueDateTaskAttribute extends BaseTaskAttribute {
  protected attribute = "due date";
}

export class StatusTaskAttribute extends BaseTaskAttribute {
  protected attribute = "status";
}
