import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true
        }
    },
    {
        timestamps: true
    }
);

const Province = mongoose.model("Province", provinceSchema);
export default Province;