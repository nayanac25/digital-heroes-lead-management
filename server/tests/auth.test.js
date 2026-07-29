require("dotenv").config();

const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const connectDB = require("../config/db");

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Authentication API", () => {
  test("POST /api/auth/login should reject invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "wrong@example.com",
        password: "WrongPassword123",
      });

    expect(response.statusCode).toBe(401);
  });

  test("GET /api/leads should reject request without token", async () => {
    const response = await request(app).get("/api/leads");

    expect(response.statusCode).toBe(401);
  });

  test("Member should not be allowed to create a lead", async () => {
  // Login as member
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "member@digitalheroes.com",
      password: "Member@123",
    });

  expect(loginResponse.statusCode).toBe(200);

  const memberToken = loginResponse.body.token;

  // Try admin-only Create Lead route
  const response = await request(app)
    .post("/api/leads")
    .set("Authorization", `Bearer ${memberToken}`)
    .send({
      name: "Automated Test Lead",
      email: "automatedtest@example.com",
      phone: "9999999999",
      company: "Test Company",
    });

  expect(response.statusCode).toBe(403);
});

test("POST /api/public/leads should reject incomplete lead data", async () => {
  const response = await request(app)
    .post("/api/public/leads")
    .send({
      name: "Test Visitor"
    });

  expect(response.statusCode).toBe(400);

  expect(response.body.message).toBe(
    "Name, email and phone are required"
  );
});

test("GET /api/leads should reject an invalid token", async () => {
  const response = await request(app)
    .get("/api/leads")
    .set("Authorization", "Bearer invalid-token");

  expect(response.statusCode).toBe(401);
});


});
