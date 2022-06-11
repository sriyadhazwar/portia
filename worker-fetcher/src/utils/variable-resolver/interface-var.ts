import { IDriverVariable } from "../../interfaces";

export abstract class IVariable {
  protected config: IDriverVariable;

  constructor(config: IDriverVariable) {
    this.config = config;
  }

  public abstract resolve(baseConfig: Map<string, any>): any;

  public abstract async resolveAsync(baseConfig: Map<string, any>): Promise<any>;
}
