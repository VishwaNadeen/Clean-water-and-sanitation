import { jest } from "@jest/globals";

const mockSave = jest.fn().mockResolvedValue(true);

const mockUser = {
  findOne:   jest.fn(),
  findById:  jest.fn(),
  find:      jest.fn(),
  create:    jest.fn(),
  deleteOne: jest.fn(),
};

const mockLogin = {
  find:       jest.fn(),
  findOne:    jest.fn(),
  create:     jest.fn(),
  updateOne:  jest.fn(),
  deleteOne:  jest.fn(),
};

jest.unstable_mockModule("../../src/models/user-management/userModel.js", () => ({
  default: mockUser,
}));
jest.unstable_mockModule("../../src/models/user-management/logInModel.js", () => ({
  default: mockLogin,
}));
jest.unstable_mockModule("bcryptjs", () => ({
  default: { hash: jest.fn().mockResolvedValue("hashed"), compare: jest.fn() },
}));
jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({}),
    }),
  },
}));
jest.unstable_mockModule("../../src/config/cloudinary.js", () => ({
  default: {
    uploader: { upload_stream: jest.fn(), destroy: jest.fn().mockResolvedValue({}) },
  },
}));

const { createUserProfile, viewMyProfile, getAllUsers } = await import(
  "../../src/controllers/user-management/userController.js"
);

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// createUserProfile — validation
describe("createUserProfile — validation", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when required fields are missing", async () => {
    const req  = { body: {}, file: null };
    const res  = mockRes();
    const next = jest.fn();
    await createUserProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when email format is invalid", async () => {
    const req = {
      body: {
        firstName: "John", lastName: "Doe", email: "INVALID_EMAIL",
        countryCode: "+94", phone: "0771234567", gender: "MALE", password: "Test@123",
      },
      file: null,
    };
    const res  = mockRes();
    const next = jest.fn();
    await createUserProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when password is too weak", async () => {
    const req = {
      body: {
        firstName: "John", lastName: "Doe", email: "john@gmail.com",
        countryCode: "+94", phone: "0771234567", gender: "MALE", password: "weak",
      },
      file: null,
    };
    const res  = mockRes();
    const next = jest.fn();
    await createUserProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 409 when email already exists", async () => {
    mockUser.findOne.mockResolvedValue({ _id: "existingUser" });
    const req = {
      body: {
        firstName: "John", lastName: "Doe", email: "existing@gmail.com",
        countryCode: "+94", phone: "0771234567", gender: "MALE", password: "Test@123",
      },
      file: null,
    };
    const res  = mockRes();
    const next = jest.fn();
    await createUserProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

// viewMyProfile
describe("viewMyProfile", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 404 when user not found", async () => {
    mockUser.findById.mockResolvedValue(null);
    const req  = { user: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await viewMyProfile(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns user profile when found", async () => {
    const fakeUser = {
      _id: "uid", firstName: "John", lastName: "Doe",
      email: "john@gmail.com", countryCode: "+94", phone: "0771234567",
      gender: "MALE", status: "ACTIVE", isEmailVerified: true,
      profilePhotoUrl: "", profilePhotoPublicId: "",
      address: {}, createdAt: new Date(), updatedAt: new Date(),
    };
    mockUser.findById.mockResolvedValue(fakeUser);
    const req  = { user: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await viewMyProfile(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ user: expect.objectContaining({ id: "uid" }) })
    );
  });
});

// getAllUsers
describe("getAllUsers", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 403 when user is not ADMIN", async () => {
    const req  = { user: { role: "USER" } };
    const res  = mockRes();
    const next = jest.fn();
    await getAllUsers(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("returns users list for ADMIN", async () => {
    mockLogin.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ userId: "uid1" }]) });
    mockUser.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ _id: "uid1", firstName: "John" }]) });
    const req  = { user: { role: "ADMIN" } };
    const res  = mockRes();
    const next = jest.fn();
    await getAllUsers(req, res, next);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1 })
    );
  });
});
