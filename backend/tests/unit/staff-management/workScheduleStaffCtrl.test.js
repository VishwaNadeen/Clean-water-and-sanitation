import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { mockRequest, mockResponse } from "../helpers/mockExpress.js";

const mockWorkSchedule = {
  findById: jest.fn(),
};

jest.unstable_mockModule(
  "../../../src/models/Staff-Management/WorkScheduleModel.js",
  () => ({
    default: mockWorkSchedule,
  })
);

const {
  startWork,
  revertStartWork,
  completeWork,
} = await import(
  "../../../src/controllers/Staff-Management/WorkScheduleStaffCtrl.js"
);

describe("WorkScheduleStaffCtrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("startWork should start assigned schedule", async () => {
    const save = jest.fn();

    const schedule = {
      staffId: { toString: () => "staff123" },
      status: "Assigned",
      startedAt: null,
      save,
    };

    mockWorkSchedule.findById.mockResolvedValue(schedule);

    const req = mockRequest({
      params: { id: "schedule123" },
      user: { id: "staff123" },
    });
    const res = mockResponse();

    await startWork(req, res);

    expect(mockWorkSchedule.findById).toHaveBeenCalledWith("schedule123");
    expect(schedule.status).toBe("InProgress");
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(schedule);
  });

  test("startWork should reject another staff member", async () => {
    const schedule = {
      staffId: { toString: () => "otherStaff" },
      status: "Assigned",
      save: jest.fn(),
    };

    mockWorkSchedule.findById.mockResolvedValue(schedule);

    const req = mockRequest({
      params: { id: "schedule123" },
      user: { id: "staff123" },
    });
    const res = mockResponse();

    await startWork(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Not your schedule" });
  });

  test("revertStartWork should change InProgress back to Assigned", async () => {
    const save = jest.fn();

    const schedule = {
      staffId: { toString: () => "staff123" },
      status: "InProgress",
      startedAt: new Date(),
      save,
    };

    mockWorkSchedule.findById.mockResolvedValue(schedule);

    const req = mockRequest({
      params: { id: "schedule123" },
      user: { id: "staff123" },
    });
    const res = mockResponse();

    await revertStartWork(req, res);

    expect(schedule.status).toBe("Assigned");
    expect(schedule.startedAt).toBeUndefined();
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(schedule);
  });

  test("completeWork should fail when no proof images exist", async () => {
    const schedule = {
      staffId: { toString: () => "staff123" },
      status: "InProgress",
      proofImages: [],
      save: jest.fn(),
    };

    mockWorkSchedule.findById.mockResolvedValue(schedule);

    const req = mockRequest({
      params: { id: "schedule123" },
      user: { id: "staff123" },
      body: {
        staffNote: "done",
        materialsUsed: "soap",
        issuesFound: "none",
      },
    });
    const res = mockResponse();

    await completeWork(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Upload proof image before completing",
    });
  });

  test("completeWork should complete schedule when proof exists", async () => {
    const save = jest.fn();

    const schedule = {
      staffId: { toString: () => "staff123" },
      status: "InProgress",
      proofImages: [{ url: "img-url", publicId: "img-1" }],
      save,
    };

    mockWorkSchedule.findById.mockResolvedValue(schedule);

    const req = mockRequest({
      params: { id: "schedule123" },
      user: { id: "staff123" },
      body: {
        staffNote: "Completed cleaning",
        materialsUsed: "detergent",
        issuesFound: "none",
      },
    });
    const res = mockResponse();

    await completeWork(req, res);

    expect(schedule.status).toBe("Completed");
    expect(schedule.staffNote).toBe("Completed cleaning");
    expect(schedule.materialsUsed).toBe("detergent");
    expect(schedule.issuesFound).toBe("none");
    expect(save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(schedule);
  });
});