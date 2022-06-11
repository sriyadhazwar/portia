import { IVariable } from "./interface-var";
import "../../extensions/string.extension";
import { AxiosInstance, AxiosResponse } from "axios";
import AxiosFactory from "../../infra/axios/axios-factory";
import { IDriverVariable } from "../../interfaces";
import jp from "jsonpath";

class ApiVar extends IVariable {
  public axios: AxiosInstance;

  constructor(config: IDriverVariable) {
    super(config);
    this.axios = AxiosFactory.createAxios();
  }

  public async resolveAsync(baseValue: Map<string, any>): Promise<any> {
    const api = this.config.api || null;
    if (api == null) return null;

    const url = api.url.formatVariables(baseValue);
    let body = api.body;
    if (body != undefined) {
      body = typeof body === "object" ? JSON.stringify(body) : body;
      body = body.formatVariables(baseValue);
    }

    //Send Request
    return this.fetch(url, api.headers, api.method, body)
      .then(response => {
        const resultArr = jp.query(response.data, api.value.path);
        return resultArr.length > 0 ? resultArr[0] : null;
      }).catch(error => {
        console.error(error.message);
        return null;
      });
  }

  private async fetch(url: string, headers: any, method: string | undefined, body: string | undefined = undefined): Promise<AxiosResponse> {
    switch (method?.toLocaleLowerCase()) {
      case "get":
        return await this.axios.get(url, { headers: Object.assign(this.axios.defaults.headers, headers) });
      case "post":
        return await this.axios.post(url, (body || ""), { headers: Object.assign(this.axios.defaults.headers, headers) });
      default:
        return await this.axios.get(url, { headers: Object.assign(this.axios.defaults.headers, headers) });
    }
  }

  resolve(baseValue: Map<string, any>): any {
    return baseValue.get(this.config.name);
  }

}

export default ApiVar;
