import mongoose, { Schema, Document } from "mongoose";

export interface IRoute extends Document {
  routeId: string;
  routeCode: string;
  routeName: string;
  stops: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RouteSchema = new Schema<IRoute>(
  {
    routeId: { type: String, unique: true },
    routeCode: { type: String, required: true },
    routeName: { type: String, required: true },
    stops: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IRoute>("Route", RouteSchema);
