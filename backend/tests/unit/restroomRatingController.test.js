import { jest } from "@jest/globals";

const mockRestroomRating = {
  findOne:   jest.fn(),
  create:    jest.fn(),
  aggregate: jest.fn(),
};
const mockRestroom = {
  findByIdAndUpdate: jest.fn(),
};

jest.unstable_mockModule(
  "../../src/models/restRoom-Management/RestroomRating.js",
  () => ({ default: mockRestroomRating })
);
jest.unstable_mockModule(
  "../../src/models/restRoom-Management/Restroom.js",
  () => ({ default: mockRestroom })
);

const { submitRating, getMyRating } =
  await import("../../src/controllers/restRoom-Management/restroomRatingController.js");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json   = jest.fn().mockReturnValue(res);
  return res;
};

describe("submitRating", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 400 for rating below 1", async () => {
    const req  = { body: { rating: 0 }, params: { id: "rid" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await submitRating(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 400 for rating above 5", async () => {
    const req  = { body: { rating: 6 }, params: { id: "rid" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await submitRating(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("returns 409 when user already rated", async () => {
    mockRestroomRating.findOne.mockResolvedValue({ rating: 3 });
    const req  = { body: { rating: 4 }, params: { id: "rid" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await submitRating(req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
  });

  test("creates rating and returns 201 on valid input", async () => {
    mockRestroomRating.findOne.mockResolvedValue(null);
    mockRestroomRating.create.mockResolvedValue({});
    mockRestroomRating.aggregate.mockResolvedValue([{ avg: 4.0, count: 5 }]);
    mockRestroom.findByIdAndUpdate.mockResolvedValue({});
    const req  = { body: { rating: 4 }, params: { id: "507f1f77bcf86cd799439011" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await submitRating(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ rating: 4 }));
  });
});

describe("getMyRating", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns null when user has not rated", async () => {
    mockRestroomRating.findOne.mockResolvedValue(null);
    const req  = { params: { id: "rid" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await getMyRating(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ rating: null });
  });

  test("returns user rating when it exists", async () => {
    mockRestroomRating.findOne.mockResolvedValue({ rating: 5 });
    const req  = { params: { id: "rid" }, auth: { _id: "uid" } };
    const res  = mockRes();
    const next = jest.fn();
    await getMyRating(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ rating: 5 });
  });
});
