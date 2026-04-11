import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app.js";

let mongo;

// start in-memory DB before all tests
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

// clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// disconnect and stop server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// GET /api/restrooms — public endpoint
describe("GET /api/restrooms", () => {
  test("returns 200 and an array when no restrooms exist", async () => {
    const res = await request(app).get("/api/restrooms");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
// GET /api/restrooms/nearby — validation
describe("GET /api/restrooms/nearby", () => {
  test("returns 400 when lat and lng are missing", async () => {
    const res = await request(app).get("/api/restrooms/nearby");
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("returns 400 for non-numeric lat", async () => {
    const res = await request(app).get("/api/restrooms/nearby?lat=abc&lng=79.8");
    expect(res.status).toBe(400);
  });

  test("returns 400 for out-of-range coordinates", async () => {
    const res = await request(app).get("/api/restrooms/nearby?lat=200&lng=79.8");
    expect(res.status).toBe(400);
  });

  test("returns 200 and empty array for valid coords with no restrooms nearby", async () => {
    const res = await request(app).get("/api/restrooms/nearby?lat=6.9271&lng=79.8612");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// GET /api/restrooms/:id — not found
describe("GET /api/restrooms/:id", () => {
  test("returns 404 for a valid ObjectId that does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/restrooms/${fakeId}`);
    expect(res.status).toBe(404);
  });
});

// Protected routes — reject unauthenticated requests
describe("Protected routes — no token", () => {
  test("POST /api/restrooms returns 401 without token", async () => {
    const res = await request(app).post("/api/restrooms").send({
      name: "Test", city: "Colombo", district: "Colombo", province: "Western", lat: 6.9, lng: 79.8,
    });
    expect(res.status).toBe(401);
  });

  test("PUT /api/restrooms/:id returns 401 without token", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).put(`/api/restrooms/${fakeId}`).send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  test("DELETE /api/restrooms/:id returns 401 without token", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).delete(`/api/restrooms/${fakeId}`);
    expect(res.status).toBe(401);
  });

  test("POST /api/restrooms/:id/rate returns 401 without token", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).post(`/api/restrooms/${fakeId}/rate`).send({ rating: 4 });
    expect(res.status).toBe(401);
  });
});
