import request from "supertest";
import { type Express } from "express";
import { createApp } from "../../createApp";
import { setupTestDB } from "../jest.setup";

describe("/api/v1/users", () => {
  let app: Express = createApp();

  setupTestDB();

  it("should return an empty array when getting /api/v1/users", async (): Promise<void> => {
    const response = await request(app).get("/api/v1/users");
    console.log("Response Body:", response.body); // Log the response body for debugging
    console.log("Response Status:", response.status); // Log the response status for debugging

    // Check if the response status is 200 OK
    expect(response.status).toBe(200);

    // Check if the response body is an empty array
    expect(response.body).toStrictEqual([]);
  });

  it("should create the user", async (): Promise<void> => {
    const response = await request(app).post("/api/v1/users").send({
      name: "Adam",
      email: "adam123@example.com",
      password: "pasdddassword", // Correct case
    });

    console.log("Response Body:", response.body); // Log the response body for debugging
    console.log("Response Status:", response.status); // Log the response status for debugging

    // Check if the response status is 201 Created
    expect(response.status).toBe(201);

    // Validate the structure of the response body if needed
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("name", "Adam");
    expect(response.body).toHaveProperty("email", "adam123@example.com");
    expect(response.body).toHaveProperty("role", "user");
  });
});
