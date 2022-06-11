import { AxiosResponse } from "axios";
import UserAgent from "user-agents";
import Axios from "../../infra/axios";
import jp from "jsonpath";
import { ICrawler, IMessage, IProduct, IResultData } from "../../interfaces";
import Strings from "../../utils/strings";

class APICrawler extends Axios implements ICrawler {
  private userAgent: UserAgent;

  constructor(config: IMessage) {
    super(config);
    this.userAgent = new UserAgent();
  }

  async handleWithURL(url: string): Promise<string> {
    return url;
  }

  async handle(): Promise<IResultData> {
    const url = this.message.job.url;
    const product: IProduct = this.message.product;
    try {
      if (this.message.driver.definition.product.api == undefined)
        return { code: 0, url, product };

      //Initiate contents if not set from before
      if (product.contents == undefined) product.contents = [];

      //resolve all variable
      this.resolver.resolveAll();
      await this.resolver.resolveAllAsync();

      for (const api of this.message.driver.definition.product.api) {
        //dynamic parameter/variables
        let urlApi = api.url;
        const productPath = api.value.path;

        if (urlApi == undefined || productPath == undefined)
          return { code: 0, url, product };

        urlApi = this.resolver.resolve(urlApi);

        // Headers
        let headers = api.headers;
        if (headers) {
          //resolve variables
          let strHeaders = JSON.stringify(headers);
          strHeaders = this.resolver.resolve(strHeaders);
          headers = JSON.parse(strHeaders);
        }

        //Body
        let body = api.body;
        if (body != undefined) {
          body = typeof body !== "string" ? JSON.stringify(body) : body;
          body = this.resolver.resolve(body);
        }

        //Send Request
        const response = await this.fetch(urlApi, headers, api.method, body);

        //JSON response
        //TODO: handle error
        if (response.status != 200)
          return { code: response.status, url, product };

        const result = jp.query(response.data, productPath);
        if (result.length == 0) return { code: response.status, url, product };

        if (process.argv.includes("--debug")) {
          console.debug(JSON.stringify(result[0]));
        }

        product.contents.push({
          name: api.name == undefined ? "DEFAULT" : api.name,
          content: JSON.stringify(result[0]),
          type: "json"
        });
      }

      return { code: 200, url, product };
    } catch (e) {
      console.error(e.toString() + " | " + url);
      return { code: 500, url, product };
    }
  }

  private async fetch(
    url: string,
    headers: any,
    method: string | undefined,
    body: string | undefined = undefined
  ): Promise<AxiosResponse> {
    switch (method?.toLocaleLowerCase()) {
      case "get":
        return await this.axios.get(url, {
          headers: Object.assign(this.axios.defaults.headers, headers)
        });
      case "post":
        return await this.axios.post(url, body || "", {
          headers: Object.assign(this.axios.defaults.headers, headers)
        });
      default:
        return await this.axios.get(url, {
          headers: Object.assign(this.axios.defaults.headers, headers)
        });
    }
  }

  private resolveJPathVars(
    value: any,
    format: string,
    dictionary?: Map<string, string>
  ): string {
    if (dictionary == undefined) return format;
    const fVars = format.getVariables();
    const map: Map<string, any> = new Map();

    fVars?.forEach((varName) => {
      if (!dictionary.has(varName)) return;
      const result = jp.query(value, dictionary.get(varName) || "undefined");

      let val: string;
      if (result.length > 0) val = result[0];
      else return;

      //TODO: function templating; how to call function from definition. eg: {{VAR_NAME:SLUGIFY,true}}
      if (varName.endsWith("_SLUGIFY")) val = Strings.slugify(val);
      map.set(varName, val);
    });

    return format.formatVariables(map);
  }
}

export default APICrawler;
