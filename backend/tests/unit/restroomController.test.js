import { jest } from "@jest/globals";

//mocks must come before the dynamic import

const mockSave = jest.fn();
const mockRestroom = {
  findOne:          jest.fn(),
  create:           jest.fn(),
  find:             jest.fn(),
  findById:         jest.fn(),
  findByIdAndDelete: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

jest.unstable_mockModule(
  "../../src/models/restRoom-Management/Restroom.js",
  () => ({ default: mockRestroom })
);

jest.unstable_mockModule(
  "../../src/utils/restRoom-Management/restroomCloudinary.js",
  () => ({
    uploadRestroomImage: jest.fn().mockResolvedValue({ url: "http://img.test/img.jpg", publicId: "test/img" }),
    deleteRestroomImage: jest.fn().mockResolvedValue({}),
  })
);

// dynamic import AFTER mocks
const {
  createRestroom,
  getRestrooms,
  getRestroomById,
  deleteRestroom,
  getNearbyRestrooms,
} = await import("../../src/controllers/restRoom-Management/restroomController.js");

// helper to create mock req/res/next
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

// createRestroom — validation
describe("createRestroom — input validation", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when required fields are missing", async () => {
    const req  = { body: { name: "Test" }, files: [] };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("required") })
    );
  });

  test("returns 400 for invalid condition value", async () => {
    const req = {
      body: { name: "Test", city: "Colombo", district: "Colombo", province: "Western", lat: "6.9", lng: "79.8", condition: "INVALID" },
      files: [],
    };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when lat is not a number", async () => {
    mockRestroom.findOne.mockResolvedValue(null);
    const req = {
      body: { name: "Test", city: "Colombo", district: "Colombo", province: "Western", lat: "abc", lng: "79.8" },
      files: [],
    };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when lat is out of range", async () => {
    mockRestroom.findOne.mockResolvedValue(null);
    const req = {
      body: { name: "Test", city: "Colombo", district: "Colombo", province: "Western", lat: "200", lng: "79.8" },
      files: [],
    };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 409 when duplicate restroom exists", async () => {
    mockRestroom.findOne.mockResolvedValue({ _id: "existingId" });
    const req = {
      body: { name: "Existing", city: "Colombo", district: "Colombo", province: "Western", lat: "6.9", lng: "79.8" },
      files: [],
    };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("creates restroom and returns 201 on valid input", async () => {
    mockRestroom.findOne.mockResolvedValue(null);
    const fakeRestroom = { _id: "newId", name: "New Restroom" };
    mockRestroom.create.mockResolvedValue(fakeRestroom);
    const req = {
      body: { name: "New Restroom", city: "Colombo", district: "Colombo", province: "Western", lat: "6.9", lng: "79.8" },
      files: [],
    };
    const res  = mockRes();
    const next = jest.fn();
    await createRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeRestroom);
  });
});

// getRestroomById
describe("getRestroomById", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 404 when restroom not found", async () => {
    mockRestroom.findById.mockResolvedValue(null);
    const req  = { params: { id: "nonexistentId" } };
    const res  = mockRes();
    const next = jest.fn();
    await getRestroomById(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("returns restroom when found", async () => {
    const fake = { _id: "abc", name: "Test Restroom" };
    mockRestroom.findById.mockResolvedValue(fake);
    const req  = { params: { id: "abc" } };
    const res  = mockRes();
    const next = jest.fn();
    await getRestroomById(req, res, next);
    expect(res.json).toHaveBeenCalledWith(fake);
  });
});

// getRestrooms — filter
describe("getRestrooms", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns list of restrooms", async () => {
    const fakeList = [{ name: "A" }, { name: "B" }];
    mockRestroom.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeList) });
    const req  = { query: {} };
    const res  = mockRes();
    const next = jest.fn();
    await getRestrooms(req, res, next);
    expect(res.json).toHaveBeenCalledWith(fakeList);
  });
});

// getNearbyRestrooms — validation
describe("getNearbyRestrooms — validation", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 when lat/lng missing", async () => {
    const req  = { query: {} };
    const res  = mockRes();
    const next = jest.fn();
    await getNearbyRestrooms(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 when lat/lng out of range", async () => {
    const req  = { query: { lat: "200", lng: "500" } };
    const res  = mockRes();
    const next = jest.fn();
    await getNearbyRestrooms(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// deleteRestroom
describe("deleteRestroom", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 404 when restroom not found", async () => {
    mockRestroom.findById.mockResolvedValue(null);
    const req  = { params: { id: "badId" } };
    const res  = mockRes();
    const next = jest.fn();
    await deleteRestroom(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("deletes and returns success message", async () => {
    mockRestroom.findById.mockResolvedValue({ _id: "someId", images: [] });
    mockRestroom.findByIdAndDelete.mockResolvedValue({});
    const req  = { params: { id: "someId" } };
    const res  = mockRes();
    const next = jest.fn();
    await deleteRestroom(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ message: "Deleted successfully" });
  });
});
