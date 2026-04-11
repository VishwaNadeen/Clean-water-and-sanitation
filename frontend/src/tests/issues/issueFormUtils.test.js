import {
  buildIssuePayload,
  createInitialIssueFormData,
  validateIssueForm,
} from "../../utils/issueFormUtils";

function createValidFormData() {
  return {
    ...createInitialIssueFormData(),
    categoryId: "category-1",
    subCategoryId: "subcategory-1",
    provinceId: "province-1",
    districtId: "district-1",
    cityId: "city-1",
    restroomId: "restroom-1",
    title: " Broken tap ",
    description: " Water leaking near entrance ",
    priority: "HIGH",
  };
}

describe("issueFormUtils", () => {
  it("rejects a missing restroom selection", () => {
    const formData = createValidFormData();
    formData.restroomId = "";

    expect(validateIssueForm(formData, [])).toBe(
      "Please select a restroom."
    );
  });

  it("rejects oversized image uploads", () => {
    const formData = createValidFormData();
    const oversizedFile = new File(["image"], "large.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(oversizedFile, "size", {
      value: 6 * 1024 * 1024,
    });

    expect(validateIssueForm(formData, [oversizedFile])).toBe(
      "Each image must be less than 5MB."
    );
  });

  it("builds a trimmed FormData payload with images", () => {
    const formData = createValidFormData();
    const imageOne = new File(["a"], "one.png", { type: "image/png" });
    const imageTwo = new File(["b"], "two.png", { type: "image/png" });

    const payload = buildIssuePayload(formData, [imageOne, imageTwo]);

    expect(payload.get("title")).toBe("Broken tap");
    expect(payload.get("description")).toBe("Water leaking near entrance");
    expect(payload.get("priority")).toBe("HIGH");
    expect(payload.getAll("images")).toHaveLength(2);
  });
});
