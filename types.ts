export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum Status {
  TODO = 'To Do',
  IN_PROGRESS = 'In Progress',
  BLOCKED = 'Blocked',
  DONE = 'Done'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags: string[];
  dependencies: string[];
  blockers: string[];
  createdAt: string;
  isArchived?: boolean;
}

export interface AIParseResult {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  tags: string[];
  dependencies: string[];
  blockers: string[];
}

export type ColumnType = {
  id: Status;
  title: string;
};