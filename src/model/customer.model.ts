import * as mongoose from "mongoose";
import * as mongoosePaginate from "mongoose-paginate";

export interface ICustomer extends mongoose.Document {
    createdAt: Date;
    id: string;
    name: string;
    email: string;
    type: "Customer";
    updatedAt: Date;
}

export const CustomerSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, index: { unique: true } },
        name: { type: String, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc: any, ret: any): ICustomer {
                ret.id = ret._id;
                ret.type = "Customer";
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },

    });

// Apply pagination plugin to model
CustomerSchema.plugin(mongoosePaginate);

// Define indexes
CustomerSchema.index({ name: 1 });
CustomerSchema.index({ email: 1 });

export const Customer = mongoose.model("Customer", CustomerSchema);
