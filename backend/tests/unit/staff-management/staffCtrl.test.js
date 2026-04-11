import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { mockRequest, mockResponse } from "../helpers/mockExpress.js";

const mockStaff = {
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  create: jest.fn(),
};

const mockLogin = {
  findOne: jest.fn(),
  findById: jest.fn(),
  deleteOne: jest.fn(),
  create: jest.fn(),
  updateOne: jest.fn(),
};

const mockUser = {
  findById: jest.fn(),
};

const mockSendEmail = jest.fn();

jest.unstable_mockModule(
  "../../../src/models/Staff-Management/StaffModel.js",
  () => ({
    default: mockStaff,
  })
);

jest.unstable_mockModule(
  "../../../src/models/user-management/logInModel.js",
  () => ({
    default: mockLogin,
  })
);

jest.unstable_mockModule(
  "../../../src/models/user-management/userModel.js",
  () => ({
    default: mockUser,
  })
);

jest.unstable_mockModule("../../../src/services/sendEmail.js", () => ({
  sendEmail: mockSendEmail,
}));

const { createStaff } = await import(
  "../../../src/controllers/Staff-Management/StaffCtrl.js"
);

function queryWithLean(value) {
  return {
    select: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue(value),
    }),
  };
}

function queryWithSelect(value) {
  return {
    select: jest.fn().mockResolvedValue(value),
  };
}

describe("StaffCtrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createStaff should reject invalid phone number", async () => {
    const req = mockRequest({
      body: {
        fullName: "Nimal Perera",
        nic: "200012345678",
        countryCode: "+94",
        phone: "123",
        email: "nimal@gmail.com",
        role: "Cleaner",
        gender: "MALE",
        baseProvince: "Western",
        baseDistrict: "Colombo",
        address: "No 10 Main Street",
        dob: "2000-01-01",
        joinDate: "2025-01-01",
      },
    });

    const res = mockResponse();

    await createStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalled();
  });

  test("createStaff should reject duplicate email", async () => {
    mockStaff.findOne
      .mockImplementationOnce(() => queryWithLean({ _id: "staff1" }))
      .mockImplementationOnce(() => queryWithLean(null));

    mockLogin.findOne.mockImplementation(() => queryWithLean(null));

    const req = mockRequest({
      body: {
        fullName: "Nimal Perera",
        nic: "200012345678",
        countryCode: "+94",
        phone: "771234567",
        email: "nimal@gmail.com",
        role: "Cleaner",
        gender: "MALE",
        baseProvince: "Western",
        baseDistrict: "Colombo",
        address: "No 10 Main Street",
        dob: "2000-01-01",
        joinDate: "2025-01-01",
      },
    });

    const res = mockResponse();

    await createStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email already exists",
    });
  });

  test("createStaff should reject duplicate NIC", async () => {
    mockStaff.findOne
      .mockImplementationOnce(() => queryWithLean(null))
      .mockImplementationOnce(() => queryWithLean({ _id: "staff2" }));

    mockLogin.findOne.mockImplementation(() => queryWithLean(null));

    const req = mockRequest({
      body: {
        fullName: "Nimal Perera",
        nic: "200012345678",
        countryCode: "+94",
        phone: "771234567",
        email: "nimal@gmail.com",
        role: "Cleaner",
        gender: "MALE",
        baseProvince: "Western",
        baseDistrict: "Colombo",
        address: "No 10 Main Street",
        dob: "2000-01-01",
        joinDate: "2025-01-01",
      },
    });

    const res = mockResponse();

    await createStaff(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "NIC already exists",
    });
  });

  test("createStaff should create staff successfully", async () => {
    mockStaff.findOne
      .mockImplementationOnce(() => queryWithLean(null))
      .mockImplementationOnce(() => queryWithLean(null));

    mockLogin.findOne.mockImplementation(() => queryWithLean(null));
    mockUser.findById.mockImplementation(() => queryWithLean(null));

    mockStaff.create.mockResolvedValue({
      _id: "staff123",
      fullName: "Nimal Perera",
      email: "nimal@gmail.com",
      role: "Cleaner",
    });

    mockStaff.findById.mockImplementation(() =>
      queryWithSelect({
        _id: "staff123",
        password: "hashed-password",
      })
    );

    mockLogin.create.mockResolvedValue({
      _id: "login123",
    });

    mockSendEmail.mockResolvedValue(true);

    const req = mockRequest({
      body: {
        fullName: "Nimal Perera",
        nic: "200012345678",
        countryCode: "+94",
        phone: "771234567",
        email: "nimal@gmail.com",
        role: "Cleaner",
        gender: "MALE",
        baseProvince: "Western",
        baseDistrict: "Colombo",
        address: "No 10 Main Street",
        dob: "2000-01-01",
        joinDate: "2025-01-01",
      },
    });

    const res = mockResponse();

    await createStaff(req, res);

    expect(mockStaff.create).toHaveBeenCalled();
    expect(mockLogin.create).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });
});