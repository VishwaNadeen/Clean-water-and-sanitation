import Restroom from "../../models/restRoom-Management/Restroom.js";
const ALLOWED_CONDITION = ["GOOD", "OK", "BAD", "OUT_OF_ORDER"];

// post api/restroom Admin - dev

export const createRestroom = async (req, res, next) => {

    try{
        const{ name, city, district, province, lat, lng, condition } = req.body;

        //required feilds
        if(!name || !city || !district || !province || lat === undefined || lng === undefined ) {
            return res.status(400).json({ message: "name, city, district, province, lat, lng are required"});

        }

        //validate condition
        if(condition && !ALLOWED_CONDITION.includes(condition)) {
            return res.status(400).json({
                message: "condition must be GOOD, OK, BAD, OR OUT_OF_ORDER",
            });
        }

        //VALIDATION LAT/LNG NUMBERS + RANGE
        const latNum = Number(lat);
        const lngNum = Number(lng);

        
        // check duplicate manually (nice message)
        const existing = await Restroom.findOne({
        name: name.trim(),
        "location.coordinates": [lngNum, latNum],
        });

        if (existing) {
        return res.status(409).json({
            message: "Restroom already created",
        });
        }


        if(Number.isNaN(latNum) || Number.isNaN(lngNum)){
            return res.status(400).json({
                message: "lat and lng must be numbers"
            });
        }
        if (latNum < -90 || latNum > 90){
            return res.status(400).json({
                message: "lat must be between -90 and 90"
            });
        }
        if (lngNum < -180 || lngNum > 180){
            return res.status(400).json({
                message: "lng must be between 180 and -180"
            });
        }

        const restroom = await Restroom.create({
            name,
            city,
            district,
            province,
            condition: condition || "GOOD",
            location: {
                type: "Point",
                coordinates: [lngNum, latNum],
            },
        });

        return res.status(201).json(restroom);
    }catch(err) {
        next(err);
    }

};


// GET /api/restrooms?city=&district=&province=

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

        //validate condition if provided
        if(condition && !ALLOWED_CONDITION.includes(condition)) {
            return res.status(400).json({
                message:"condition must be GOOD, OK , BAD OR OUT_OF_ORDER"
            });
        }

        const update = {};
        if (name !== undefined) update.name = name;
        if (city !== undefined) update.city = city;
        if (district !== undefined) update.district = district;
        if (province !== undefined) update.province = province;

        if (condition !== undefined) update.condition = condition;

        //VALIDATE LAT/LNG IF EITHER PROVIDED (REQUIRE BOTH)

        const latProvided = lat !== undefined;
        const lngProvided = lng !== undefined;
        
        if(latProvided || lngProvided){
            if (!latProvided || !lngProvided){
                return res.status(400).json({
                    message: "both lat and lng must be provided"
                });
            }

            const latNum = Number(lat);
            const lngNum = Number(lng);

            if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
                return res.status(400).json({
                    message: "lat and lng must be numbers"
                });
            }
            if (latNum < -90 || latNum > 90){
                return res.status(400).json ({
                    message: "Invalid latitude range"
                });
            }
            if (lngNum < -180 || lngNum > 180) {
                return res.status(400).json ({
                    mesasge: "Invalid Longitude range"
                });
            }
            
            update.location = {
                type: "Point" , 
                coordinates: [lngNum, latNum],
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

// GET /api/restrooms/nearby?lat=&lng=&radius=2000
export const getNearbyRestrooms = async (req, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return res.status(400).json({ message: "lat and lng must be numbers" });
    }
    if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      return res.status(400).json({ message: "Invalid latitude or longitude range" });
    }

    let maxDistance = 2000; // default meters
    if (radius !== undefined) {
      maxDistance = Number(radius);
      if (Number.isNaN(maxDistance) || maxDistance <= 0 || maxDistance > 50000) {
        return res.status(400).json({
          message: "radius must be a number between 1 and 50000 meters",
        });
      }
    }

    const restrooms = await Restroom.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lngNum, latNum],
          },
          $maxDistance: maxDistance,
        },
      },
    });

    res.json(restrooms);
  } catch (err) {
    next(err);
  }
};