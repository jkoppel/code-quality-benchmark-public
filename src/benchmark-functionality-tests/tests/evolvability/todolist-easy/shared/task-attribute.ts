import dedent from "dedent";
import { TodoListAppInfo } from "./app-info-schema.js";
import * as z from "zod";

export type TaskAttribute =
  | PriorityTaskAttribute
  | DueDateTaskAttribute
  | StatusTaskAttribute;

abstract class BaseTaskAttribute {
  protected abstract attribute: string;

  toString() {
    return this.attribute;
  }

  getAttributeViews(appInfo: z.infer<typeof TodoListAppInfo>) {
    return appInfo.taskInfo.views[
      this.attribute as keyof typeof appInfo.taskInfo.views
    ];
  }

  abstract getInfoForStateSynchTests(
    appInfo: z.infer<typeof TodoListAppInfo>,
  ): string;
}

export class PriorityTaskAttribute extends BaseTaskAttribute {
  protected attribute = "priority";

  getInfoForStateSynchTests(appInfo: z.infer<typeof TodoListAppInfo>): string {
    return JSON.stringify(this.getAttributeViews(appInfo));
  }
}

export class DueDateTaskAttribute extends BaseTaskAttribute {
  protected attribute = "due date";

  getInfoForStateSynchTests(appInfo: z.infer<typeof TodoListAppInfo>): string {
    return JSON.stringify(this.getAttributeViews(appInfo));
  }
}

export class StatusTaskAttribute extends BaseTaskAttribute {
  protected attribute = "status";

  getInfoForStateSynchTests(appInfo: z.infer<typeof TodoListAppInfo>): string {
    return dedent`
    ${JSON.stringify(this.getAttributeViews(appInfo))}
    ${JSON.stringify(appInfo.todoListInfo)}
    `;
  }
}
