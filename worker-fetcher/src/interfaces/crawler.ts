import { IMessage, IProduct } from "./message";

export interface ICrawlerHandler {
  handle(msg: IMessage): Promise<IResultData>;
}

export interface ICrawler {
  handle(): Promise<IResultData>;

  handleWithURL(url: string): Promise<string>;
}

export interface IResultData {
  url: string;
  code: number;
  product: IProduct;
}

export interface IResultSplitJob {
  priceMin: number;
  priceMax: number;
}

export interface IProductContent {
  name: string;
  type: "json" | "html" | "xml";
  content: string;
}
