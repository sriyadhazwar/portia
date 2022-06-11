import { AxiosInstance } from "axios";
import { IMessage } from "../../interfaces";
import VariableResolver from "../../utils/variable-resolver";
import AxiosFactory from "./axios-factory";

class Axios {
  public axios: AxiosInstance;

  public message: IMessage;
  public resolver: VariableResolver;

  constructor(config: IMessage) {
    AxiosFactory.init(config);

    this.message = config;

    this.resolver = new VariableResolver(config.driver.definition.vars || [], config.driver.definition.product.vars || []);
    this.resolver.setValue("URL", config.job.url);
    this.resolver.setValue("URL_PRODUCT", config.product.url);


    // make axios instance
    this.axios = AxiosFactory.createAxios();

  }
}

export default Axios;
