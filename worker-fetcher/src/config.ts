import { IConfig, IQueueConfig } from "./interfaces";

class Config implements IConfig {
  queue: IQueueConfig;
  timeout: number;

  constructor() {
    this.queue = {
      consume: "fetcher",
      produce: "extractor"
    };
    this.timeout = 120;
  }
}

export default Config;
