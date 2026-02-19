import Restroom from "../models/Restroom.js";

// post api/restroom Admin - dev

export const createRestroom = async (req, res, next) => {

    try{
        const{ name, city, district, province, lat, lng, condition } = req.body;

        if(!name || !city || !district || !province || lat === undefined || lng === undefined ) {
            return res.status(400).json({ message: "name, city, district, province, lat, lng are required"});

        }

        const restroom = await Restroom.create({
            name,
            city,
            district,
            province,
            condition: condition || "GOOD",
            location: {
                type: "Point",
                coordinates: [Number(lng), Number(lat)],
            },
        });

        return res.status(201).json(restroom);
    }catch(err) {
        next(err);
    }

};


//GET / API / restroom

export const getRestrooms = async (req, res, next) => {
  try {
    const { city, district, province } = req.query;

    const filter = {};
    if (city) filter.city = city;
    if (district) filter.district = district;
    if (province) filter.province = province;

    const restrooms = await Restroom.find(filter).sort({ createdAt: -1 });
    res.json(restrooms);
  } catch (err) {
    next(err);
  }
};

//GET / API/ RESTROOMS/:id

export const getRestroomById = async (req, res, next) => {

    try{
        const restroom = await Restroom.findById(req.params.id);
        if (!restroom) {
            return res.status(404).json({ message: "Restroom not found " });  
        }
         res.json(restroom);
    } catch (err) {
        next(err);
    }
};

//PUT / API / restrooms/:id admin - dev

export const updateRestroom = async (req, res, next) => {
    try{
        const { name, city, district, province, lat, lng, condition } = req.body;

        const update = {};
        if (name !== undefined) update.name = name;
        if (city !== undefined) update.city = city;
        if (district !== undefined) update.district = district;
        if (province !== undefined) update.province = province;

        if (condition !== undefined) update.condition = condition;

        if(lat !== undefined && lng !== undefined) {
            update.location = {
                type: "Point" , 
                coordinates: [Number(lng), Number(lat)],
            };
        }

        const restroom = await Restroom.findByIdAndUpdate(req.params.id, update, {
            new: true,
            runValidators: true,
        });
        
        if(!restroom) return res.status(404).json({ message: "Restroom not found "});
        res.json(restroom);
    }catch (err) {
        next(err);
    }
};

//DELETE /api/restrooms/:id admin - dev

export const deleteRestroom = async (req, res, next) => {
    try {
        const restroom = await Restroom.findByIdAndDelete(req.params.id);
        if(!restroom) return res.status(404).json ({ message: "Restroom not found "});
        res.json({ message: "Deleted successfully"});

    }catch (err) {
        next(err);
    }
};

// GET /API/restrooms/nearby?lat= &lng=  &radius = 2000
export const getNearbyRestrooms = async (req, res, next) => {
    try {
        const {lat, lng, radius } = req.query;

        if(lat === undefined || lng === undefined) {
            return res.status(400).json({ message: "lat and lng are required" });

        }

        const maxDistance = radius ? Number(radius) : 2000; //meter default

        const restrooms = await Restroom.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(lng), Number(lat)],
                    },
                    $maxDistance: maxDistance,
                },
            },
        });

        res.json(restrooms);
    }catch (err) {
        next(err);
    }
};

