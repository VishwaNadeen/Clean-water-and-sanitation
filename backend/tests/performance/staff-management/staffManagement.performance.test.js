import {
  jest,
  describe,
  beforeAll,
  afterAll,
  beforeEach,
  test,
  expect,
} from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import { mockRequest, mockResponse } from "../../unit/helpers/mockExpress.js";

import Staff from "../../../src/models/Staff-Management/StaffModel.js";
import WorkSchedule from "../../../src/models/Staff-Management/workScheduleModel.js";
import Restroom from "../../../src/models/restRoom-Management/Restroom.js";

jest.unstable_mockModule("../../../src/services/sendEmail.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const { createStaff } = await import(
  "../../../src/controllers/Staff-Management/StaffCtrl.js"
);

const { assignSchedule } = await import(
  "../../../src/controllers/Staff-Management/workScheduleManagerCtrl.js"
);

let mongoServer;

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
};

const measureExecutionTime = async (fn) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

describe("Staff Management Performance Test", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      dbName: "staff-management-performance-db",
    });
  });

  beforeEach(async () => {
    await clearDatabase();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test("createStaff performance test", async () => {
    const executionTimes = [];
    const iterations = 20;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const suffix = String(i).padStart(2, "0");

      const req = mockRequest({
        body: {
          fullName: `Test Cleaner ${i}`,
          nic: `2000123456${suffix}`,
          password: `2000123456${suffix}`,
          countryCode: "+94",
          phone: `7712345${suffix}`,
          email: `cleaner${i}@test.com`,
          role: "Cleaner",
          gender: "MALE",
          status: "Active",
          dob: "2000-01-15",
          address: "123 Main Street, Colombo",
          baseProvince: "Western",
          baseDistrict: "Colombo",
          joinDate: "2026-04-01",
        },
      });

      const res = mockResponse();

      const time = await measureExecutionTime(async () => {
        await createStaff(req, res);
      });

      executionTimes.push(time);

      if (res.status.mock.calls.length > 0) {
        const statusCode = res.status.mock.calls[0][0];
        if ([200, 201].includes(statusCode)) {
          successCount++;
        }
      }
    }

    const avg =
      executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length;
    const min = Math.min(...executionTimes);
    const max = Math.max(...executionTimes);

    console.log("\n===== createStaff Performance =====");
    console.log(`Iterations: ${iterations}`);
    console.log(`Successful Responses: ${successCount}`);
    console.log(`Average Time: ${avg.toFixed(2)} ms`);
    console.log(`Minimum Time: ${min.toFixed(2)} ms`);
    console.log(`Maximum Time: ${max.toFixed(2)} ms`);

    expect(avg).toBeLessThan(1000);
  });

  test("assignSchedule performance test", async () => {
    const executionTimes = [];
    const iterations = 20;
    let successCount = 0;

    for (let i = 0; i < iterations; i++) {
      const suffix = String(i).padStart(2, "0");

      const staff = await Staff.create({
        fullName: `Schedule Staff ${i}`,
        nic: `2002123456${suffix}`,
        password: `2002123456${suffix}`,
        countryCode: "+94",
        phone: `7711122${suffix}`,
        email: `schedule.staff${i}@test.com`,
        role: "Cleaner",
        gender: "MALE",
        status: "Active",
        dob: "2002-03-10",
        address: "No 10, Colombo",
        baseProvince: "Western",
        baseDistrict: "Colombo",
        joinDate: "2026-04-01",
      });

      const restroom = await Restroom.create({
        name: `Restroom ${i}`,
        province: "Western",
        district: "Colombo",
        city: "Colombo",
        location: {
          type: "Point",
          coordinates: [79.8612 + i * 0.0001, 6.9271 + i * 0.0001],
        },
      });

      const req = mockRequest({
        body: {
          title: `Morning cleaning shift ${i}`,
          managerNote: "Complete before 10 AM",
          taskType: "Cleaning",
          staffId: staff._id.toString(),
          restroomId: restroom._id.toString(),
          date: "2026-04-12",
          scheduleDate: "2026-04-12",
          startTime: "08:00",
          endTime: "10:00",
          shift: "Morning",
          priority: "Medium",
        },
        user: {
          role: "Supervisor",
        },
      });

      const res = mockResponse();

      const time = await measureExecutionTime(async () => {
        await assignSchedule(req, res);
      });

      executionTimes.push(time);

      if (res.status.mock.calls.length > 0) {
        const statusCode = res.status.mock.calls[0][0];
        if ([200, 201].includes(statusCode)) {
          successCount++;
        }
      }
    }

    const avg =
      executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length;
    const min = Math.min(...executionTimes);
    const max = Math.max(...executionTimes);

    console.log("\n===== assignSchedule Performance =====");
    console.log(`Iterations: ${iterations}`);
    console.log(`Successful Responses: ${successCount}`);
    console.log(`Average Time: ${avg.toFixed(2)} ms`);
    console.log(`Minimum Time: ${min.toFixed(2)} ms`);
    console.log(`Maximum Time: ${max.toFixed(2)} ms`);

    expect(avg).toBeLessThan(1000);
  });
});