import { Schema, Document } from 'mongoose';
import * as mongoose from 'mongoose';


export interface IDriverEntity extends Document {
  name: string,
  url: string,
  type: string,
  use_proxy: boolean,
  proxy_credential: string,
  user_agent: string,
  headers: string,
  use_lazy: boolean,
  definition: string,
  created_at: Date,
  updated_at: Date
}

export const DriverEntitySchema: Schema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: false },
  type: { type: String, required: true },
  use_proxy: { type: Boolean, required: false, default: false },
  proxy_credential: { type: String, required: false, default: false },
  user_agent: { type: String, required: false, default: false },
  headers: { type: String, required: true },
  use_lazy: { type: Boolean, required: false, default: false },
  definition: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: false }
});

// Export the model and return your IDriverEntity interface
export default mongoose.model<IDriverEntity>('Driver', DriverEntitySchema);
