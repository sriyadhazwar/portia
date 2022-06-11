import { IProductContent } from "./crawler";

export interface IMessage {
  job: IJob;
  driver: IDriver;
  meta?: IMessageMeta;
  product: IProduct;
}

export interface IProduct {
  url: string;
  contents?: Array<IProductContent>;
}

export interface IMessageMeta {
  attempt: number;
  url: string;
}

export interface IJob {
  // job id
  _id: string;

  // url to crawl
  url: string;

  root?: boolean;
}

export interface IDriver {
  // driver id
  _id: string;

  site_id: number;

  // e-commerce type
  name: string;

  // web url info
  url: string;

  // driver type to use
  type: "js" | "server" | "sitemap" | "api";

  // whether use proxy or not
  use_proxy: boolean;
  proxy?: IProxy;

  headers: any;

  // lazy load page
  use_lazy: boolean;

  //Deep crawling (more than 100 page)
  deep_crawl?: boolean;

  definition: IDriverDefinition;
}

export interface IProxy {
  host: string;
  port: number;
  auth?: string;
}

export interface IDriverDefinition {
  entry_point: {
    type: "api" | "server" | "js";
    api?: IDriverRequest;
    page_max?: number;
    throttle: number;
    deep_crawl?: IDriverDeepCrawl;
    vars?: Array<IDriverVariable>;
  };

  product: {
    type: "api" | "server" | "js";
    api?: IDriverRequest[];
    throttle: number;
    vars?: Array<IDriverVariable>;
  };

  vars?: Array<IDriverVariable>;

  product_map?: IProductMapField[];
}

export interface IProductMapField {
  name: string;
  type: "const" | "string" | "number" | "decimal" | "array" | "boolean";
  source?: string;
  value?: string;
  path?: string;
  default?: any;
  args?: Record<string, unknown>;
}

export interface IDriverRequest {
  name?: string;
  url: string;
  method: string;
  headers?: any;
  body?: string | any;
  value: {
    path: string;
    format?: string;
    save_content?: boolean;
    content_path?: string;
    vars?: any;
  };
}

export interface IDriverVariable {
  name: string;
  type: "regex" | "function" | "constant" | "ext" | "api";
  input?: string;
  value: string;
  func?: string;
  args?: Record<string, unknown>;
  api?: IDriverRequest;
  async?: boolean;
}

export interface IDriverDeepCrawl {
  price_min?: number;
  price_max?: number;
  price_increment?: number;
  batch_threshold: number;
  product_count_path: string;
  minimum_price_range?: number;
}
