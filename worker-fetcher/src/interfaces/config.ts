export interface IConfig {
  queue: IQueueConfig;
  timeout: number;
}

export interface IQueueConfig {
  consume: string;
  produce: string;
}
