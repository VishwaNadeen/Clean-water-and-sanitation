import {
  jest,
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
import Login from "../../../src/models/user-management/logInModel.js";

jest.unstable_mockModule("../../../src/services/sendEmail.js", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
}));

const { createStaff } = await import(
  "../../../src/controllers/Staff-Management/StaffCtrl.js"
);

describe("StaffCtrl Integration Test", () => {
  beforeAll(async () => {
    await connectTestDB();
  });

  afterEach(async () => {
    await clearTestDB();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await closeTestDB();
  });

  test("should create staff member successfully", async () => {
    const req = mockRequest({
      body: {
        fullName: "Test Cleaner",
        nic: "200012345678",
        password: "200012345678",
        countryCode: "+94",
        phone: "771234567",
        email: "cleaner1@test.com",
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

    await createStaff(req, res);

    const createdStaff = await Staff.findOne({ email: "cleaner1@test.com" });
    const createdLogin = await Login.findOne({ email: "cleaner1@test.com" });

    if (!createdStaff || !createdLogin) {
      console.log("STATUS CALLS:", res.status.mock.calls);
      console.dir(res.json.mock.calls, { depth: null });
    }

    expect(createdStaff).not.toBeNull();
    expect(createdStaff.fullName).toBe("Test Cleaner");

    expect(createdLogin).not.toBeNull();

    expect(res.status).toHaveBeenCalled();
    const statusCode = res.status.mock.calls[0][0];
    expect([200, 201]).toContain(statusCode);
  });

  test("should reject duplicate email staff creation", async () => {
    await Staff.create({
      fullName: "Existing Staff",
      nic: "199912345678",
      password: "199912345678",
      countryCode: "+94",
      phone: "712345678",
      email: "duplicate@test.com",
      role: "Cleaner",
      gender: "FEMALE",
      status: "Active",
      dob: "1999-05-20",
      address: "45 Lake Road, Galle",
      baseProvince: "Western",
      baseDistrict: "Colombo",
      joinDate: "2026-04-01",
    });

    const req = mockRequest({
      body: {
        fullName: "New Staff",
        nic: "200112345678",
        password: "200112345678",
        countryCode: "+94",
        phone: "701234567",
        email: "duplicate@test.com",
        role: "Technician",
        gender: "MALE",
        status: "Active",
        dob: "2001-08-10",
        address: "78 Beach Road, Matara",
        baseProvince: "Southern",
        baseDistrict: "Matara",
        joinDate: "2026-04-02",
      },
    });

    const res = mockResponse();

    await createStaff(req, res);

    expect(res.status).toHaveBeenCalled();
    const statusCode = res.status.mock.calls[0][0];
    expect([400, 409, 422]).toContain(statusCode);
  });
});