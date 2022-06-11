import { Document } from "mongoose";

export interface IProduct {
  code: number;
  hash_url: string;
  url: string;
  content: string;
  driver: string;
}

export interface IProductDocument extends IProduct, Document {}
