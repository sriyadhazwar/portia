// export interface IFetcher {
//   config: IFetcherConfig;
//   product: IFetcherProduct;
//   meta: IFetcherMeta;
// }
//
// export interface IFetcherMeta {
//   // number of msg attempt
//   attempt: number;
// }
//
// export interface IFetcherConfig {
//   job: IFetcherConfigJob;
//   driver: IFetcherConfigDriver;
// }
//
// export interface IFetcherProduct {
//   // product url to crawl
//   url: string;
// }
//
// export interface IFetcherConfigJob {
//   // job id
//   _id: string;
//   url: string;
// }
//
// export interface IFetcherConfigDriver {
//   _id: string;
//
//   // e-commerce type
//   name: string;
//
//   // xpath or css selector for product
//   definition: IDriverDefinition;
//
//   // option to use proxy
//   use_proxy: string;
//
//   proxy_credential: string;
//   user_agent: string;
//   headers: any;
// }
//
// export interface IDriverDefinition {
//   product: IDriverProduct;
// }
//
// export interface IDriverProduct {
//   // server or js rendering
//   rendering: string;
//
//   // limit request in minutes
//   throttle: number;
// }
//
// export interface IFetcherConfigDriverPagination {
//   // xpath or css selector relative to a pagination element
//   path: string;
//
//   // pagination navigation type whether a button (> char) or a Next button
//   navigationType: "next" | "navigation";
//
//   type: "click";
// }
