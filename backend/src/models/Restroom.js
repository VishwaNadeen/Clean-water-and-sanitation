import mongoose from "mongoose";
 const restroomSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: true, 
            trim: true,
        },
        
        city: {
            type: String,
            required: true,
            trim: true,
        },

        district: {
            type: String,
            required: true,
            trim: true,
        },

        province: {
            type: String,
            required: true,
            trim: true,
        },
        //GeoJson point: lng, lat
        location: {
            type: {
                type: String, 
                enum: ["Point"], 
                default: "Point",
            },
            coordinates: {
                type: [Number], 
                required: true,
            },//lng , lat

        },

        condition: {
            type: String,
            enum: ["GOOD", "OK", "BAD", "OUT_OF_ORDER"],
        default: "GOOD",
     },

     avgRating: { 
        type: Number, 
        default: 0,
    },

     ratingCount: {
        type: Number, 
        default: 0,
    },

    },

    {timestamps: true}
 );

 //needed for $near / $geoNear queries

 restroomSchema.index({ location: "2dsphere"});

 export default mongoose.model("Restroom", restroomSchema);