import {
  describe,
  beforeAll,
  afterAll,
  afterEach,
  test,
  expect,
} from "@jest/globals";
import { connectTestDB, clearTestDB, closeTestDB } from "../setupTestDB.js";
import { mockRequest, mockResponse } from "../../unit/helpers/mockExpress.js";

import Staff from "../../../src/models/Staff-Management/StaffModel.js";
import WorkSchedule from "../../../src/models/Staff-Management/workScheduleModel.js";
import Restroom from "../../../src/models/restRoom-Management/Restroom.js";

import { assignSchedule } from "../../../src/controllers/Staff-Management/workScheduleManagerCtrl.js";

describe("WorkScheduleManagerCtrl Integration Test", () => {
  let staff;
  let restroom;

  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("should create a work schedule successfully", async () => {
    staff = await Staff.create({
      fullName: "Schedule Staff",
      nic: "200212345678",
      password: "200212345678",
      countryCode: "+94",
      phone: "771112223",
      email: "schedule.staff@test.com",
      role: "Cleaner",
      gender: "MALE",
      status: "Active",
      dob: "2002-03-10",
      address: "No 10, Colombo",
      baseProvince: "Western",
      baseDistrict: "Colombo",
      joinDate: "2026-04-01",
    });

    restroom = await Restroom.create({
      name: "Restroom A",
      province: "Western",
      district: "Colombo",
      city: "Colombo",
      location: {
        type: "Point",
        coordinates: [79.8612, 6.9271],
      },
    });

    const req = mockRequest({
      body: {
        title: "Morning cleaning shift",
        managerNote: "Complete before 10 AM",
        taskType: "Cleaning",
        staffId: staff._id.toString(),
        restroomId: restroom._id.toString(),

        // extra fields often required by controller checks
        staffName: staff.fullName,
        restroomLabel: restroom.name,
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

    await assignSchedule(req, res);

    const createdSchedule = await WorkSchedule.findOne({
      title: "Morning cleaning shift",
    });

    if (!createdSchedule) {
      console.log("STATUS CALLS:", res.status.mock.calls);
      console.dir(res.json.mock.calls, { depth: null });
    }

    expect(createdSchedule).not.toBeNull();
    expect(createdSchedule.staffId.toString()).toBe(staff._id.toString());
    expect(createdSchedule.restroomId.toString()).toBe(restroom._id.toString());

    expect(res.status).toHaveBeenCalled();
    const statusCode = res.status.mock.calls[0][0];
    expect([200, 201]).toContain(statusCode);
  });
});