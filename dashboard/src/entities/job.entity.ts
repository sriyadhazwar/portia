import { Schema, Document } from 'mongoose';
import * as mongoose from 'mongoose';


export interface IJobEntity extends Document {
  name: string,
  driver_id: string,
  url: string,
  total_product: boolean,
  total_processed: boolean,
  status: string,
  created_at: Date,
  updated_at: Date
}

export const JobSchema: Schema = new Schema({
  name: { type: String, required: true },
  driver_id: { type: String, required: true },
  url: { type: String, required: false },
  total_product: { type: Number, required: false, default: 0 },
  total_processed: { type: Number, required: false, default: 0 },
  status: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: false },
});

// Export the model and return your IJobEntity interface
export default mongoose.model<IJobEntity>('Job', JobSchema);