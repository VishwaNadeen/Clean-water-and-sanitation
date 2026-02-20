import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        code: {
            type: String,
            required: true,
            uppercase: true
        },
        provinceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
            required: true
        }
    },
    {
        timestamps: true
    }
);

districtSchema.index({ provinceId: 1 });

const District = mongoose.model("District", districtSchema);
export default District;