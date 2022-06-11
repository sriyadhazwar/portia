import { IVariable } from "./interface-var";
import "../../extensions/string.extension";

class RegexVar extends IVariable {

  public resolve(baseValue: Map<string, any>): any {
    try {
      const input = this.config.input?.formatVariables(baseValue);
      const matches = input?.match(this.config.value);

      if (matches == undefined || matches.length < 2) return null;

      let value = matches[1];

      if (this.config.func != undefined) {
        const f = this.config.func.replace("{{VALUE}}", value);
        value = eval(f);
      }

      return value;
    } catch (e) {
      return null;
    }
  }

  async resolveAsync(baseConfig: Map<string, any>): Promise<any> {
    return Promise.resolve(undefined);
  }

}

export default RegexVar;
