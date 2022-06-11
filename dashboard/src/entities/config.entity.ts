import { Schema, Document } from 'mongoose';
import * as mongoose from 'mongoose';


export interface IConfigEntity extends Document {
  feeder: number,
  fetcher: number,
  extractor: number,
  created_at: Date,
  updated_at: Date
}

export const ConfigSchema: Schema = new Schema({
  feeder: { type: Number, required: true },
  fetcher: { type: Number, required: true },
  extractor: { type: Number, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: false }
}, { collection: "config" });

// Export the model and return your IConfigEntity interface
export default mongoose.model<IConfigEntity>('Config', ConfigSchema);