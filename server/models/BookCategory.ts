import mongoose from "mongoose";

const bookCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret: any) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

const BookCategory = mongoose.model("BookCategory", bookCategorySchema);

export default BookCategory;
