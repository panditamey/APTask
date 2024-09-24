const request = require("supertest");
const app = require("./server");

describe("User Management API", () => {
  let token;

  test("Register User", async () => {
    const response = await request(app).post("/register").send({
      username: "testuser",
      password: "testpassword",
    });
    expect(response.statusCode).toBe(200);
  });

  test("Login User", async () => {
    const response = await request(app).post("/login").send({
      username: "testuser",
      password: "testpassword",
    });
    expect(response.statusCode).toBe(200);
    token = response.body.token;
  });

  test("Get Users List", async () => {
    const response = await request(app)
      .get("/users")
      .set("Authorization", token);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("Delete User", async () => {
    const response = await request(app)
      .delete("/users/1")
      .set("Authorization", token);
    expect(response.statusCode).toBe(200);
  });
});
