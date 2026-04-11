import jwt from "jsonwebtoken";
import IssueCategory from "../../models/issue-reporting/issueCategoryModel.js";
import Province from "../../models/issue-reporting/provinceModel.js";
import District from "../../models/issue-reporting/districtModel.js";
import City from "../../models/issue-reporting/cityModel.js";
import Restroom from "../../models/restRoom-Management/Restroom.js";
import User from "../../models/user-management/userModel.js";
import Login from "../../models/user-management/logInModel.js";

export async function createIssueSeedData({
  email = "reporter@example.com",
  role = "USER",
} = {}) {
  const user = await User.create({
    firstName: "Test",
    lastName: "Reporter",
    email,
    countryCode: "+94",
    phone: "771234567",
    gender: "MALE",
    password: "Password123!",
    status: "ACTIVE",
  });

  const login = await Login.create({
    userId: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: "Password123!",
    role,
  });

  const category = await IssueCategory.create({
    name: `Water-${email}`,
    description: "Water-related issues",
    isActive: true,
    subCategories: [
      {
        name: "Leak",
        description: "Water leak",
        isActive: true,
      },
    ],
    createdBy: user._id,
  });

  const province = await Province.create({
    name: `Western-${email}`,
    code: `W${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  });

  const district = await District.create({
    name: `Colombo-${email}`,
    code: `C${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    provinceId: province._id,
  });

  const city = await City.create({
    name: `Pettah-${email}`,
    districtId: district._id,
    provinceId: province._id,
  });

  const restroom = await Restroom.create({
    name: `Pettah Bus Stand Toilet-${email}`,
    city: city.name,
    district: district.name,
    province: province.name,
    location: {
      type: "Point",
      coordinates: [79.8612, 6.936],
    },
    condition: "GOOD",
  });

  const token = jwt.sign(
    {
      id: login._id.toString(),
      role,
    },
    process.env.JWT_SECRET
  );

  return {
    user,
    login,
    token,
    category,
    subCategory: category.subCategories[0],
    province,
    district,
    city,
    restroom,
  };
}

export function buildIssueRequestBody(seedData, overrides = {}) {
  return {
    title: "Broken tap near entrance",
    description: "Water has been leaking for more than two days.",
    categoryId: seedData.category._id.toString(),
    subCategoryId: seedData.subCategory._id.toString(),
    provinceId: seedData.province._id.toString(),
    districtId: seedData.district._id.toString(),
    cityId: seedData.city._id.toString(),
    restroomId: seedData.restroom._id.toString(),
    priority: "HIGH",
    ...overrides,
  };
}
