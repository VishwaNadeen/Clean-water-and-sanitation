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
    title: "Broken tap",
    description: "Water has been leaking for two days.",
    priority: "HIGH",
  };
}

describe("issue reporting performance", () => {
  it("validates 5000 issue submissions within a reasonable local threshold", () => {
    const formData = createValidFormData();
    const images = [new File(["img"], "proof.png", { type: "image/png" })];
    const start = performance.now();

    for (let index = 0; index < 5000; index += 1) {
      validateIssueForm(formData, images);
    }

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(200);
  });

  it("builds 1000 multipart payloads without a noticeable slowdown", () => {
    const formData = createValidFormData();
    const images = [
      new File(["img"], "proof-1.png", { type: "image/png" }),
      new File(["img"], "proof-2.png", { type: "image/png" }),
    ];
    const start = performance.now();

    for (let index = 0; index < 1000; index += 1) {
      buildIssuePayload(formData, images);
    }

    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
  });
});
