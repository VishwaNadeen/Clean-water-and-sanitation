import mongoose from "mongoose";

const issueConstructorMock = vi.fn();
const issueCategoryFindByIdMock = vi.fn();
const provinceFindByIdMock = vi.fn();
const districtFindByIdMock = vi.fn();
const cityFindByIdMock = vi.fn();
const uploadToCloudinaryMock = vi.fn();

vi.mock("../../models/issue-reporting/issueModel.js", () => ({
  default: issueConstructorMock,
}));

vi.mock("../../models/issue-reporting/issueCategoryModel.js", () => ({
  default: {
    findById: issueCategoryFindByIdMock,
  },
}));

vi.mock("../../models/issue-reporting/provinceModel.js", () => ({
  default: {
    findById: provinceFindByIdMock,
  },
}));

vi.mock("../../models/issue-reporting/districtModel.js", () => ({
  default: {
    findById: districtFindByIdMock,
  },
}));

vi.mock("../../models/issue-reporting/cityModel.js", () => ({
  default: {
    findById: cityFindByIdMock,
  },
}));

vi.mock("../../models/Staff-Management/WorkScheduleModel.js", () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock("../../utils/issue-reporting/cloudinary.js", () => ({
  uploadToCloudinary: uploadToCloudinaryMock,
}));

const { createIssue } = await import(
  "../../controllers/issue-reporting/issueController.js"
);

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

function createValidRequest() {
  const categoryId = new mongoose.Types.ObjectId();
  const subCategoryId = new mongoose.Types.ObjectId();
  const provinceId = new mongoose.Types.ObjectId();
  const districtId = new mongoose.Types.ObjectId();
  const cityId = new mongoose.Types.ObjectId();
  const restroomId = new mongoose.Types.ObjectId();

  return {
    body: {
      title: "Broken tap",
      description: "Water has been leaking for two days.",
      categoryId: categoryId.toString(),
      subCategoryId: subCategoryId.toString(),
      provinceId: provinceId.toString(),
      districtId: districtId.toString(),
      cityId: cityId.toString(),
      restroomId: restroomId.toString(),
      priority: "HIGH",
    },
    files: [],
    user: {
      _id: new mongoose.Types.ObjectId(),
      role: "USER",
      status: "ACTIVE",
    },
  };
}

describe("createIssue unit", () => {
  let consoleErrorSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns 400 when the title is missing", async () => {
    const req = createValidRequest();
    const res = createRes();

    req.body.title = " ";

    await createIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Title is required and cannot be empty",
      })
    );
  });

  it("returns 400 when the category id format is invalid", async () => {
    const req = createValidRequest();
    const res = createRes();

    req.body.categoryId = "invalid-id";

    await createIssue(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message:
          "Invalid category ID format. Please provide a valid category ID.",
      })
    );
  });

  it("returns 500 when image upload fails after passing validation", async () => {
    const req = createValidRequest();
    const res = createRes();
    const nextSubCategoryId = new mongoose.Types.ObjectId();

    req.body.subCategoryId = nextSubCategoryId.toString();
    req.files = [
      {
        mimetype: "image/png",
        size: 1024,
        buffer: Buffer.from("image"),
        originalname: "proof.png",
      },
    ];

    issueCategoryFindByIdMock.mockResolvedValue({
      isActive: true,
      subCategories: {
        id: vi.fn().mockImplementation((id) =>
          id === nextSubCategoryId.toString()
            ? { _id: nextSubCategoryId, name: "Leak", isActive: true }
            : null
        ),
      },
    });
    provinceFindByIdMock.mockResolvedValue({ _id: req.body.provinceId });
    districtFindByIdMock.mockResolvedValue({ _id: req.body.districtId });
    cityFindByIdMock.mockResolvedValue({ _id: req.body.cityId });
    uploadToCloudinaryMock.mockRejectedValue(new Error("Cloudinary unavailable"));

    await createIssue(req, res);

    expect(uploadToCloudinaryMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("Error uploading images"),
      })
    );
  });
});
