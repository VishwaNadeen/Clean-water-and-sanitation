export function createInitialIssueFormData() {
  return {
    categoryId: "",
    subCategoryId: "",
    provinceId: "",
    districtId: "",
    cityId: "",
    restroomId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
  };
}

export function validateIssueForm(formData, images = []) {
  if (!formData.categoryId) return "Please select a category.";
  if (!formData.subCategoryId) return "Please select a subcategory.";
  if (!formData.provinceId) return "Please select a province.";
  if (!formData.districtId) return "Please select a district.";
  if (!formData.cityId) return "Please select a city.";
  if (!formData.restroomId) return "Please select a restroom.";
  if (!formData.title.trim()) return "Issue title is required.";
  if (formData.description.trim().length < 5) {
    return "Description must be at least 5 characters.";
  }
  if (images.length > 5) return "You can upload up to 5 images only.";

  const fileTooLarge = images.some((file) => file.size > 5 * 1024 * 1024);
  if (fileTooLarge) return "Each image must be less than 5MB.";

  return "";
}

export function buildIssuePayload(formData, images = []) {
  const payload = new FormData();

  payload.append("categoryId", formData.categoryId);
  payload.append("subCategoryId", formData.subCategoryId);
  payload.append("provinceId", formData.provinceId);
  payload.append("districtId", formData.districtId);
  payload.append("cityId", formData.cityId);
  payload.append("restroomId", formData.restroomId);
  payload.append("title", formData.title.trim());
  payload.append("description", formData.description.trim());
  payload.append("priority", formData.priority);

  images.forEach((file) => {
    payload.append("images", file);
  });

  return payload;
}
