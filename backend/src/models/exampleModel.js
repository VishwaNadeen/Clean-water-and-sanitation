import mongoose from "mongoose";

const exampleSchema = new mongoose.Schema(
    {
    title:{
        type: String,
        required: true
    },

    content:{
        type: String,
        required: true
    },
    },
    {timestamps: true}
);

const example = mongoose.model("Note", exampleSchema)

export default example