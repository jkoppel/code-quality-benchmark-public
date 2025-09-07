import * as z from "zod";
import dedent from "dedent";

/*********************************
      UI Info
**********************************/

const UIInfo = z.object({
  shortDescription: z
    .string()
    .describe(
      `Description of the view or UI, e.g. "An 'Add' button that adds a new task to the list"`,
    ),
  howToAccess: z.optional(
    z
      .string()
      .describe(
        `How to get to the UI, if it's not obvious; e.g.: "It's the leftmost dropdown menu that appears after clicking on 'Edit' on a task"`,
      ),
  ),
});

/*********************************
      Views
**********************************/

const createViewsField = (viewsDescription: string) =>
  z.object({
    views: z.array(UIInfo).describe(viewsDescription),
    pathsToCode: z
      .array(z.string())
      .describe("Paths to relevant parts of the codebase"),
    notes: z
      .string()
      .min(1)
      .optional()
      .describe(
        "Notes about potential bugs in how the app handles this feature. Focus on functional bugs (e.g. to do with synchronization of state), as opposed to UI/UX issues. No need to add notes if you didn't spot obvious bugs. The notes should include enough detail to be usable also by black-box testers who have access to the UI but not the code.",
      ),
  });

/*********************************
      Task
**********************************/

const BaseTaskInfo = z.object({
  statuses: z
    .array(z.string())
    .describe(
      "All the statuses for a task implemented by this todo app -- make sure to capture all of them",
    ),
  viewsForStatus: createViewsField(
    dedent`
      All the views of or UIs that the app exposes for the status of the task.
      Use a UIInfo for each distinct view/UI.
      Example:
      [ { shortDescription: "Checkbox to mark task as done" },
        { shortDescription: "Status dropdown menu", howToAccess: "Click 'Edit' button on task" } ]`,
  ),
});

/** Info about the schema / model of a todo item in the final todo list app */
const TaskInfo = BaseTaskInfo.extend({
  priorityLevels: z
    .array(z.string())
    .describe(
      "All the priority levels implemented by this todo app -- make sure to capture all of them",
    ),
  viewsForPriority: createViewsField(
    "All the views of or UIs that the app exposes for the priority levels of a task (also include info about how to get to the UI, if it doesn't appear immediately)",
  ),
  viewsForDueDate: createViewsField(
    "All the views of or UIs that the app exposes for the due date of a task (also include info about how to get to the UI, if it doesn't appear immediately)",
  ),
});

/*********************************
      Todo List
**********************************/

const TodoListInfo = z.object({
  viewsForAddingTask: createViewsField(
    "All the views of or UIs that the app exposes for adding a task (also include info about how to get to the UI, if it doesn't appear immediately). This is an empty array iff the app does not allow the user to add tasks.",
  ),
  viewsForRemovingTask: createViewsField(
    "All the views of or UIs that the app exposes for removing a task (also include info about how to get to the UI, if it doesn't appear immediately). This is an empty array iff the app does not allow the user to remove tasks.",
  ),
  notes: z
    .string()
    .optional()
    .describe(
      "Notes about things that seem very clearly buggy. Focus on functional bugs (e.g. to do with synchronization of state), as opposed to UI/UX issues. No need to add notes if you didn't spot obvious bugs. The notes should include enough detail to be usable also by black-box testers who have access to the UI but not the code.",
    ),
});

export const TodoListAppInfo = z.object({
  todoListInfo: TodoListInfo,
  taskInfo: TaskInfo,
});
