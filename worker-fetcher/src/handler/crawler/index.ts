import { ICrawlerHandler, IMessage, IResultData } from "../../interfaces";
import ApiCrawler from "../../services/api-crawler";

class CrawlerHandler implements ICrawlerHandler {
  /**
   * Handle job coming from queue.
   * @param config {IMessage} Feeder job configs
   */
  async handle(config: IMessage): Promise<IResultData> {
    if (config.driver.definition.product.type === "api") {
      const apiHandler = new ApiCrawler(config);
      return await apiHandler.handle();
    }

    return { code: 0, url: "", product: { url: "" } };
  }
}

export default CrawlerHandler;
