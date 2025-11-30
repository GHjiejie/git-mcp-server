// 类型定义

export interface GitCommit {
  hash: string;
  authorName: string;
  email: string;
  date: string;
  message: string;
}

export interface GitStats {
  additions: number;
  deletions: number;
}

export interface WeeklyReportArgs {
  directory: string;
  author?: string;
  branch?: string;
  days?: number;
  model?: string;
  useAI?: boolean;
}

export interface GitCommandArgs {
  directory: string;
  [key: string]: any;
}
