import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { mockRequest, mockResponse } from "../helpers/mockExpress.js";

const mockWorkSchedule = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
};

const mockStaff = {
  findById: jest.fn(),
};

jest.unstable_mockModule(
  "../../../src/models/Staff-Management/WorkScheduleModel.js",
  () => ({
    default: mockWorkSchedule,
  })
);

jest.unstable_mockModule(
  "../../../src/models/Staff-Management/StaffModel.js",
  () => ({
    default: mockStaff,
  })
);

const {
  assignSchedule,
  approveSchedule,
  rejectSchedule,
} = await import(
  "../../../src/controllers/Staff-Management/WorkScheduleManagerCtrl.js"
);

describe("WorkScheduleManagerCtrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("assignSchedule should create a schedule successfully", async () => {
    const validStaffId = "507f1f77bcf86cd799439011";
    const createdId = "507f1f77bcf86cd799439012";

    mockStaff.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: validStaffId,
        fullName: "Nimal Perera",
        email: "nimal@gmail.com",
        phone: "771234567",
        role: "Cleaner",
        status: "Active",
      }),
    });

    mockWorkSchedule.find.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      }),
    });

    mockWorkSchedule.countDocuments.mockResolvedValue(0);

    mockWorkSchedule.create.mockResolvedValue({ _id: createdId });

    mockWorkSchedule.findById.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: createdId,
        title: "Morning Cleaning",
        status: "Assigned",
      }),
    });

    const req = mockRequest({
      body: {
        staffId: validStaffId,
        taskType: "Cleaning",
        title: "Morning Cleaning",
        date: "2026-04-11",
        startTime: "08:00",
        endTime: "10:00",
        managerNote: "Clean carefully",
      },
    });

    const res = mockResponse();

    await assignSchedule(req, res);

    expect(mockWorkSchedule.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test("assignSchedule should fail when required fields are missing", async () => {
    const req = mockRequest({
      body: {
        staffId: "507f1f77bcf86cd799439011",
        taskType: "Cleaning",
      },
    });

    const res = mockResponse();

    await assignSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Missing required fields",
    });
  });

  test("approveSchedule should mark completed schedule as verified", async () => {
    const validId = "507f1f77bcf86cd799439099";
    const save = jest.fn();

    const schedule = {
      _id: validId,
      status: "Completed",
      verifiedAt: null,
      managerReviewNote: "",
      save,
    };

    mockWorkSchedule.findById
      .mockResolvedValueOnce(schedule)
      .mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue({
          _id: validId,
          status: "Verified",
          managerReviewNote: "Well done",
        }),
      });

    const req = mockRequest({
      params: { id: validId },
      body: { managerReviewNote: "Well done" },
    });

    const res = mockResponse();

    await approveSchedule(req, res);

    expect(schedule.status).toBe("Verified");
    expect(schedule.managerReviewNote).toBe("Well done");
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  test("rejectSchedule should require rejection reason", async () => {
    const validId = "507f1f77bcf86cd799439099";

    const req = mockRequest({
      params: { id: validId },
      body: { managerReviewNote: "" },
    });

    const res = mockResponse();

    await rejectSchedule(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rejection reason is required",
    });
  });

  test("rejectSchedule should mark completed schedule as rejected", async () => {
    const validId = "507f1f77bcf86cd799439099";
    const save = jest.fn();

    const schedule = {
      _id: validId,
      status: "Completed",
      managerReviewNote: "",
      save,
    };

    mockWorkSchedule.findById
      .mockResolvedValueOnce(schedule)
      .mockReturnValueOnce({
        populate: jest.fn().mockResolvedValue({
          _id: validId,
          status: "Rejected",
          managerReviewNote: "Please redo this work",
        }),
      });

    const req = mockRequest({
      params: { id: validId },
      body: { managerReviewNote: "Please redo this work" },
    });

    const res = mockResponse();

    await rejectSchedule(req, res);

    expect(schedule.status).toBe("Rejected");
    expect(schedule.managerReviewNote).toBe("Please redo this work");
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });
});