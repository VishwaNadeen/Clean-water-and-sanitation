import axios from 'axios';
import Province from '../models/provinceModel.js';
import District from '../models/districtModel.js';
import City from '../models/cityModel.js';

export const seedLocationData = async () => {
    try {
        console.log('Starting location data seeding...');
        
        // Fetch data from CDN
        const response = await axios.get('https://cdn.jsdelivr.net/npm/get-srilanka-districts-cities@1.0.3/Data/cities.min.js', {
            transformResponse: [(data) => {
                // The response is a JavaScript module, we need to evaluate it
                const moduleCode = data.replace('module.exports=', 'return ');
                const func = new Function(moduleCode);
                return func()[0]; // Get the first element which is the cities object
            }]
        });
        
        const data = response.data;

        console.log('Data fetched successfully');

        // Process and upsert data (maintains consistent ObjectIds)
        let provinceCount = 0;
        let districtCount = 0;
        let cityCount = 0;

        // Iterate through provinces
        for (const [provinceName, districts] of Object.entries(data)) {
            // Upsert province (create if doesn't exist, update if exists)
            const provinceDoc = await Province.findOneAndUpdate(
                { name: provinceName }, // Find by name
                { 
                    name: provinceName,
                    code: provinceName.toUpperCase().replace(/\s+/g, '_')
                },
                { 
                    upsert: true,      // Create if doesn't exist
                    returnDocument: 'after',         // Return updated document
                    setDefaultsOnInsert: true
                }
            );
            provinceCount++;
            console.log(`✅ Province: ${provinceDoc.name}`);

            // Iterate through districts in this province
            for (const [districtName, cities] of Object.entries(districts)) {
                // Upsert district
                const districtDoc = await District.findOneAndUpdate(
                    { 
                        name: districtName.charAt(0).toUpperCase() + districtName.slice(1),
                        provinceId: provinceDoc._id 
                    },
                    {
                        name: districtName.charAt(0).toUpperCase() + districtName.slice(1),
                        code: districtName.toUpperCase().replace(/\s+/g, '_'),
                        provinceId: provinceDoc._id
                    },
                    { 
                        upsert: true, 
                        returnDocument: 'after',
                        setDefaultsOnInsert: true
                    }
                );
                districtCount++;
                console.log(`  ✅ District: ${districtDoc.name}`);

                // Upsert cities for this district
                for (const cityName of cities) {
                    await City.findOneAndUpdate(
                        {
                            name: cityName,
                            districtId: districtDoc._id
                        },
                        {
                            name: cityName,
                            districtId: districtDoc._id,
                            provinceId: provinceDoc._id
                        },
                        { 
                            upsert: true,
                            returnDocument: 'after',
                            setDefaultsOnInsert: true
                        }
                    );
                    cityCount++;
                }
                console.log(`    ✅ ${cities.length} cities for ${districtDoc.name}`);
            }
        }

        console.log(`✅ Seeding completed successfully!`);
        console.log(`📊 Summary (created/updated):`);
        console.log(`   - Provinces: ${provinceCount}`);
        console.log(`   - Districts: ${districtCount}`);
        console.log(`   - Cities: ${cityCount}`);
        console.log(`🔒 ObjectIds preserved - existing data updated, new data created!`);
        
        return {
            provinces: provinceCount,
            districts: districtCount,
            cities: cityCount
        };
    } catch (error) {
        console.error('❌ Error seeding location data:', error);
        throw error;
    }
};

// Function to get all provinces
export const getAllProvinces = async () => {
    try {
        return await Province.find({}).sort({ name: 1 });
    } catch (error) {
        console.error('Error fetching provinces:', error);
        throw error;
    }
};

// Function to get districts by province
export const getDistrictsByProvince = async (provinceId) => {
    try {
        return await District.find({ provinceId }).sort({ name: 1 });
    } catch (error) {
        console.error('Error fetching districts:', error);
        throw error;
    }
};

// Function to get cities by district
export const getCitiesByDistrict = async (districtId) => {
    try {
        return await City.find({ districtId }).sort({ name: 1 });
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};

// Function to get cities by province
export const getCitiesByProvince = async (provinceId) => {
    try {
        return await City.find({ provinceId }).sort({ name: 1 });
    } catch (error) {
        console.error('Error fetching cities:', error);
        throw error;
    }
};