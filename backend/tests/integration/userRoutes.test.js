import { jest } from "@jest/globals";

// mock nodemailer BEFORE app import — registration sends OTP email
jest.unstable_mockModule("nodemailer", () => ({
  default: {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: "test-id" }),
    }),
  },
}));

// mock cloudinary — avoid real uploads
jest.unstable_mockModule("../../src/config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn().mockResolvedValue({}),
    },
  },
}));

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

const { default: app } = await import("../../src/app.js");

let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const validUser = {
  firstName: "John",
  lastName:  "Doe",
  email:     "john@gmail.com",
  countryCode: "+94",
  phone:     "0771234567",
  gender:    "MALE",
  password:  "Test@123",
};

// POST /api/users — register
describe("POST /api/users — register", () => {
  test("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/users").send({ firstName: "John" });
    expect(res.status).toBe(400);
  });

  test("returns 400 for invalid email format", async () => {
    const res = await request(app).post("/api/users").send({
      ...validUser, email: "INVALID_EMAIL",
    });
    expect(res.status).toBe(400);
  });

  test("returns 400 for weak password", async () => {
    const res = await request(app).post("/api/users").send({
      ...validUser, password: "weak",
    });
    expect(res.status).toBe(400);
  });

  test("returns 201 and creates user on valid input", async () => {
    const res = await request(app).post("/api/users").send(validUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("user");
    expect(res.body.user.email).toBe("john@gmail.com");
  });

  test("returns 409 when email already registered", async () => {
    await request(app).post("/api/users").send(validUser);
    const res = await request(app).post("/api/users").send(validUser);
    expect(res.status).toBe(409);
  });
});

// POST /api/auth/login
describe("POST /api/auth/login", () => {
  test("returns 400 when email or password missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "john@gmail.com" });
    expect(res.status).toBe(400);
  });

  test("returns 401 for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@gmail.com", password: "Test@123" });
    expect(res.status).toBe(401);
  });
});

// Protected routes — no token
describe("Protected routes — no token", () => {
  test("GET /api/users/me returns 401 without token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  test("GET /api/users returns 401 without token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  test("PUT /api/users/me returns 401 without token", async () => {
    const res = await request(app).put("/api/users/me").send({ firstName: "Jane" });
    expect(res.status).toBe(401);
  });

  test("DELETE /api/users/me returns 401 without token", async () => {
    const res = await request(app)
      .delete("/api/users/me")
      .send({ password: "Test@123" });
    expect(res.status).toBe(401);
  });
});
