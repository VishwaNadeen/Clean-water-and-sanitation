import mongoose from "mongoose";

const citySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        districtId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'District',
            required: true
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

citySchema.index({ districtId: 1 });
citySchema.index({ provinceId: 1 });

const City = mongoose.model("City", citySchema);
export default City;