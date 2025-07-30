import type { SchedulerTask } from './types.js';
export declare let schedulerInstance: {
    started: string;
} | undefined;
export declare const schedulerTasks: SchedulerTask[];
export declare function setSchedulerInstance(instance: {
    started: string;
} | undefined): void;
