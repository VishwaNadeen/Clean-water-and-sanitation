import { jest } from "@jest/globals";

// mocks before dynamic import
const mockLogin = {
  findOne: jest.fn(),
};
const mockUser = {
  findOne: jest.fn(),
  findById: jest.fn(),
};
const mockStaff = {
  findOne: jest.fn(),
  findById: jest.fn(),
};

jest.unstable_mockModule("../../src/models/user-management/logInModel.js", () => ({
  default: mockLogin,
}));
jest.unstable_mockModule("../../src/models/user-management/userModel.js", () => ({
  default: mockUser,
}));
jest.unstable_mockModule("../../src/models/Staff-Management/StaffModel.js", () => ({
  default: mockStaff,
}));
jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
    hash: jest.fn(),
  },
}));
jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: "test" }),
    }),
  },
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn().mockReturnValue("mocked-token"),
    verify: jest.fn(),
  },
}));

const { loginUser, verifyEmailOtp } = await import(
  "../../src/controllers/user-management/authController.js"
);

const bcrypt = (await import("bcryptjs")).default;

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// loginUser
describe("loginUser — validation", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when email is missing", async () => {
    const req  = { body: { password: "Test@123" } };
    const res  = mockRes();
    const next = jest.fn();
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email and password are required." })
    );
  });

  test("returns 400 when password is missing", async () => {
    const req  = { body: { email: "test@gmail.com" } };
    const res  = mockRes();
    const next = jest.fn();
    await loginUser(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email and password are required." })
    );
  });

  test("returns 401 when email not found in Login collection", async () => {
    mockLogin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req  = { body: { email: "notfound@gmail.com", password: "Test@123" } };
    const res  = mockRes();
    const next = jest.fn();
    await loginUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns 401 when password does not match", async () => {
    const fakeLogin = { _id: "lid", userId: "uid", role: "USER", password: "hashed" };
    mockLogin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeLogin) });
    bcrypt.compare.mockResolvedValue(false);
    const req  = { body: { email: "test@gmail.com", password: "WrongPass" } };
    const res  = mockRes();
    const next = jest.fn();
    await loginUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("returns token on valid credentials", async () => {
    const fakeLogin = { _id: "lid", userId: "uid", role: "USER", password: "hashed" };
    const fakeUser  = { _id: "uid", isEmailVerified: true, status: "ACTIVE", save: jest.fn() };
    mockLogin.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeLogin) });
    bcrypt.compare.mockResolvedValue(true);
    mockUser.findById.mockResolvedValue(fakeUser);
    mockUser.findOne.mockResolvedValue(fakeUser);
    mockStaff.findById.mockResolvedValue(null);
    mockStaff.findOne.mockResolvedValue(null);
    const req  = { body: { email: "test@gmail.com", password: "Test@123" } };
    const res  = mockRes();
    const next = jest.fn();
    await loginUser(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Login successful", token: "mocked-token" })
    );
  });
});

// verifyEmailOtp
describe("verifyEmailOtp — validation", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when email or otp missing", async () => {
    const req  = { body: { email: "test@gmail.com" } };
    const res  = mockRes();
    const next = jest.fn();
    await verifyEmailOtp(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Email and OTP are required." })
    );
  });

  test("returns 404 when user not found", async () => {
    mockUser.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const req  = { body: { email: "notfound@gmail.com", otp: "123456" } };
    const res  = mockRes();
    const next = jest.fn();
    await verifyEmailOtp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns 400 when OTP is expired", async () => {
    const fakeUser = {
      emailOtpHash: "hash",
      emailOtpExpires: new Date(Date.now() - 1000), // expired
    };
    mockUser.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    const req  = { body: { email: "test@gmail.com", otp: "123456" } };
    const res  = mockRes();
    const next = jest.fn();
    await verifyEmailOtp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "OTP expired." })
    );
  });

  test("returns 400 when OTP is invalid", async () => {
    const fakeUser = {
      emailOtpHash: "hash",
      emailOtpExpires: new Date(Date.now() + 60000),
    };
    mockUser.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(fakeUser) });
    bcrypt.compare.mockResolvedValue(false);
    const req  = { body: { email: "test@gmail.com", otp: "000000" } };
    const res  = mockRes();
    const next = jest.fn();
    await verifyEmailOtp(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid OTP." })
    );
  });
});
