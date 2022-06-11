import { IConfig } from "./config";

export interface IMessageBroker {
  start(config: IConfig): Promise<void>;
  stop(): Promise<void>;
  check(): boolean;
}
