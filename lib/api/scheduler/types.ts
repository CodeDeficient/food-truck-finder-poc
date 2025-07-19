export interface SchedulerTask {
  id: string;
  name: string;
  enabled: boolean;
  intervalMinutes: number;
  lastRun: string;
  lastSuccess: string;
  successCount: number;
  errorCount: number;
  nextRun: string | undefined;
  lastError?: string;
}

export interface PostRequestBody {
  action: 'start' | 'stop' | 'execute';
  taskId?: string;
}

export interface PutRequestBody {
  taskId: string;
  config: Partial<SchedulerTask>;
}
