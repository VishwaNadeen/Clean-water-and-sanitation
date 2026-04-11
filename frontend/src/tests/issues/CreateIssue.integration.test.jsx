import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateIssue from "../../pages/issues/CreateIssue";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

function createJsonResponse(data, ok = true) {
  return {
    ok,
    json: async () => data,
  };
}

describe("CreateIssue integration", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    localStorage.clear();
    localStorage.setItem("token", "test-token");
    global.fetch = vi.fn((url, options = {}) => {
      if (url.includes("/categories/dropdown")) {
        return Promise.resolve(
          createJsonResponse({
            data: [
              {
                _id: "category-1",
                name: "Water",
                subCategories: [{ _id: "subcategory-1", name: "Leak" }],
              },
            ],
          })
        );
      }

      if (url.includes("/locations/provinces")) {
        return Promise.resolve(
          createJsonResponse([{ _id: "province-1", name: "Western" }])
        );
      }

      if (url.includes("/locations/districts")) {
        return Promise.resolve(
          createJsonResponse([{ _id: "district-1", name: "Colombo" }])
        );
      }

      if (url.includes("/locations/cities")) {
        return Promise.resolve(
          createJsonResponse([{ _id: "city-1", name: "Colombo 11 - Pettah" }])
        );
      }

      if (url.includes("/restrooms?")) {
        return Promise.resolve(
          createJsonResponse([
            { _id: "restroom-1", name: "pettah bus stand public Toilet" },
          ])
        );
      }

      if (url.includes("/issues") && options.method === "POST") {
        return Promise.resolve(
          createJsonResponse({
            message: "Complaint submitted successfully.",
            data: { _id: "issue-123" },
          })
        );
      }

      return Promise.reject(new Error(`Unhandled fetch: ${url}`));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows validation feedback when submitted empty", async () => {
    render(
      <MemoryRouter>
        <CreateIssue />
      </MemoryRouter>
    );

    await screen.findByText("Report Complaint");
    fireEvent.submit(screen.getByRole("button", { name: /submit complaint/i }).closest("form"));

    expect(
      await screen.findByText("Please select a category.")
    ).toBeInTheDocument();
  });

  it("submits the complaint and navigates to the complaint details page", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CreateIssue />
      </MemoryRouter>
    );

    await screen.findByRole("option", { name: "Water" });

    await user.selectOptions(screen.getByLabelText("Category"), "category-1");
    await user.selectOptions(
      screen.getByLabelText("Subcategory"),
      "subcategory-1"
    );
    await user.selectOptions(screen.getByLabelText("Province"), "province-1");
    await screen.findByRole("option", { name: "Colombo" });
    await user.selectOptions(screen.getByLabelText("District"), "district-1");
    await screen.findByRole("option", { name: "Colombo 11 - Pettah" });
    await user.selectOptions(screen.getByLabelText("City"), "city-1");
    await screen.findByRole("option", {
      name: "pettah bus stand public Toilet",
    });
    await user.selectOptions(screen.getByLabelText("Restroom"), "restroom-1");
    await user.selectOptions(screen.getByLabelText("Priority"), "HIGH");
    await user.type(screen.getByLabelText("Complaint Title"), "Broken tap");
    await user.type(
      screen.getByLabelText("Description"),
      "Water has been leaking for two days."
    );

    await user.click(screen.getByRole("button", { name: /submit complaint/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/issues"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
          body: expect.any(FormData),
        })
      );
    });

    expect(navigateMock).toHaveBeenCalledWith("/my-complaints/issue-123", {
      state: {
        successMessage: "Complaint submitted successfully.",
      },
    });
  });
});
