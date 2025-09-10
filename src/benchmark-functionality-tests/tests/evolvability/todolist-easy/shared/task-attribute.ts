import { TodoListAppInfo } from "./app-info-schema.js";
import * as z from "zod";

export type AttributeId = "priority" | "dueDate" | "status";

type AppInfo = z.infer<typeof TodoListAppInfo>;
type AttributeViews = AppInfo["taskInfo"]["views"][AttributeId];

export interface TaskAttribute {
  attributeId: AttributeId;
  getPrettyName(): string;
  getAttributeValues(appInfo: AppInfo): string[];
  getAttributeViews(appInfo: AppInfo): AttributeViews;
  getInfoForStateSynchTests(appInfo: AppInfo): string;
}

export const PriorityTaskAttribute: TaskAttribute = {
  attributeId: "priority",
  getPrettyName: () => "priority",
  getAttributeValues: (app) => app.taskInfo.priorityLevels,
  getAttributeViews: (app) => app.taskInfo.views.priority,
  getInfoForStateSynchTests: (app) =>
    JSON.stringify(app.taskInfo.views.priority),
};

export const DueDateTaskAttribute: TaskAttribute = {
  attributeId: "dueDate",
  getPrettyName: () => "due date",
  getAttributeValues: (app) => {
    return ["tomorrow", "next week", "yesterday (or past date)"];
  },
  getAttributeViews: (app) => app.taskInfo.views.dueDate,
  getInfoForStateSynchTests: (app) =>
    JSON.stringify(app.taskInfo.views.dueDate),
};

export const StatusTaskAttribute: TaskAttribute = {
  attributeId: "status",
  getPrettyName: () => "status",
  getAttributeValues: (app) => app.taskInfo.statuses,
  getAttributeViews: (app) => app.taskInfo.views.status,
  getInfoForStateSynchTests: (app) =>
    JSON.stringify({
      views: app.taskInfo.views.status,
      todoListInfo: app.todoListInfo,
    }),
};

export const TaskAttributes = {
  priority: PriorityTaskAttribute,
  dueDate: DueDateTaskAttribute,
  status: StatusTaskAttribute,
};
