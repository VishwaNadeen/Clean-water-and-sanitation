import request from "supertest";
import app from "../../app.js";
import Issue from "../../models/issue-reporting/issueModel.js";
import {
  buildIssueRequestBody,
  createIssueSeedData,
} from "../helpers/issueTestData.js";
import {
  clearTestDb,
  connectTestDb,
  disconnectTestDb,
} from "../helpers/testDb.js";

describe("Issue reporting API integration", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("creates an issue through POST /api/issues and persists it in MongoDB", async () => {
    const seed = await createIssueSeedData();
    const payload = buildIssueRequestBody(seed);

    const response = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${seed.token}`)
      .field(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(payload.title);
    expect(response.body.data.priority).toBe(payload.priority);
    expect(response.body.data.issueNumber).toMatch(/^\d{8}$/);

    const savedIssue = await Issue.findById(response.body.data._id);
    expect(savedIssue).not.toBeNull();
    expect(savedIssue.title).toBe(payload.title);
    expect(savedIssue.reportedBy.toString()).toBe(seed.user._id.toString());
  });

  it("returns a validation error for short descriptions", async () => {
    const seed = await createIssueSeedData();
    const payload = buildIssueRequestBody(seed, {
      description: "bad",
    });

    const response = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${seed.token}`)
      .field(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message:
          "Description is required and must be at least 5 characters",
      })
    );
  });

  it("returns only the authenticated user's issues from GET /api/issues", async () => {
    const firstUser = await createIssueSeedData({
      email: "user-one@example.com",
    });
    const secondUser = await createIssueSeedData({
      email: "user-two@example.com",
    });

    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${firstUser.token}`)
      .field(buildIssueRequestBody(firstUser, { title: "First user issue" }));

    await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${secondUser.token}`)
      .field(buildIssueRequestBody(secondUser, { title: "Second user issue" }));

    const response = await request(app)
      .get("/api/issues")
      .set("Authorization", `Bearer ${firstUser.token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].title).toBe("First user issue");
    expect(response.body.message).toBe("Your issues retrieved successfully");
  });

  it("blocks one user from viewing another user's issue by id", async () => {
    const owner = await createIssueSeedData({
      email: "owner@example.com",
    });
    const otherUser = await createIssueSeedData({
      email: "other@example.com",
    });

    const createResponse = await request(app)
      .post("/api/issues")
      .set("Authorization", `Bearer ${owner.token}`)
      .field(buildIssueRequestBody(owner, { title: "Private issue" }));

    const response = await request(app)
      .get(`/api/issues/${createResponse.body.data._id}`)
      .set("Authorization", `Bearer ${otherUser.token}`);

    expect(response.status).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: "Access denied. You can only view your own issues.",
      })
    );
  });
});
