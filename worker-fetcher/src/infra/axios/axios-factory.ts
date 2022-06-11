import { IMessage } from "../../interfaces";
import request, { AxiosInstance, AxiosRequestConfig } from "axios";
import httpsProxyAgent from "https-proxy-agent";
import httpProxyAgent from "http-proxy-agent";

class AxiosFactory {
  private static axiosConfig: AxiosRequestConfig;

  public static init(config: IMessage): void {
    const c: AxiosRequestConfig = {
      responseType: "document",
      withCredentials: false
    };

    //Custom header
    if (config.driver.headers) {
      //console.debug("Axios using custom header %s", config.driver.headers);
      c.headers = config.driver.headers;
    }

    //Proxy
    if (config.driver.use_proxy && config.driver.proxy) {
      c.httpsAgent = new (httpsProxyAgent as any)(config.driver.proxy);
      c.httpAgent = new (httpProxyAgent as any)(config.driver.proxy);
    }

    AxiosFactory.axiosConfig = c;
  }

  public static createAxios(): AxiosInstance {
    return request.create(AxiosFactory.axiosConfig);
  }
}

export default AxiosFactory;
