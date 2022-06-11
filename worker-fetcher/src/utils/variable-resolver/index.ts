import { IDriverVariable } from "../../interfaces";
import { IVariable } from "./interface-var";
import RegexVar from "./regex-var";
import ApiVar from "./api-var";

class VariableResolver {

  private config: Array<IDriverVariable>;
  private vars: Map<string, any>;

  constructor(...configs: Array<Array<IDriverVariable>>) {
    let allConfig: Array<IDriverVariable> = [];
    allConfig = allConfig.concat(configs[0]);
    allConfig = allConfig.concat(configs[1]);
    this.config = allConfig;

    //INITIALIZE DEFAULT VARS AND VALUE
    this.vars = new Map();
    this.vars.set("PAGE_NUMBER", 1);
    this.vars.set("PAGE_SIZE", 50);
    this.vars.set("PAGE_OFFSET", 0);
    this.vars.set("URL", null);

    //PUT CUSTOM VARS
    this.config.forEach((value) => {
      if (value.type == "constant") {
        this.vars.set(value.name, value.value);
      } else {
        this.vars.set(value.name, null);
      }
    });

    //Calculate offset
    this.vars.set("PAGE_OFFSET", (this.vars.get("PAGE_NUMBER") - 1) * this.vars.get("PAGE_SIZE"));
  }

  public getValue(varName: string, defaultValue?: any): any {
    if (this.vars.has(varName)) {
      this.resolveValue(varName);
      return this.vars.get(varName);
    } else {
      return (defaultValue != undefined ? defaultValue : null);
    }
  }

  public setValue(varName: string, value: any): void {
    this.vars.set(varName.toUpperCase(), value);
  }

  private resolveValue(varName: string): void {
    const ivar: IVariable | undefined = this.getVariableResolver(varName);
    if (ivar == undefined) return;

    const value = ivar.resolve(this.vars);

    this.vars.set(varName, value);
  }

  public resolve(str: string): string {
    const vars = str.getVariables();
    vars?.forEach((value) => {
      this.resolveValue(value);
    });

    return str.formatVariables(this.vars);
  }

  public getVars(): Map<string, any> {
    return this.vars;
  }

  private getVariableResolver(varName: string): IVariable | undefined {
    if (!this.vars.has(varName)) return undefined;

    const cVar = this.config.find((obj) => {
      return obj.name === varName;
    });

    if (cVar == undefined) return undefined;

    let ivar: IVariable | undefined;
    switch (cVar.type) {
      case "regex":
        ivar = new RegexVar(cVar);
        break;
      case "api":
        ivar = new ApiVar(cVar);
        break;
      //TODO: function type
    }

    return ivar;
  }

  public resolveAll(): void {
    for (let i = 0; i < this.config.length; i++) {
      const value = this.config[i];
      if (value.async == false || value.async == undefined) this.resolveValue(value.name);
    }
  }


  //ALL async method; that can't be converted to synchronous method
  public async resolveAllAsync(): Promise<void> {
    for (let i = 0; i < this.config.length; i++) {
      const value = this.config[i];
      if (value.async == true) await this.resolveValueAsync(value.name);
    }
  }

  private async resolveValueAsync(varName: string): Promise<void> {
    const ivar: IVariable | undefined = this.getVariableResolver(varName);

    if (ivar == undefined) return;

    const value = await ivar.resolveAsync(this.vars);

    this.vars.set(varName, value);
  }

}

export default VariableResolver;
