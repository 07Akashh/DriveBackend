const request = require("supertest")
const app = require("../../src/server")
const TestHelpers = require("../helpers/testHelpers")
const admin = require("firebase-admin")

describe("Auth API Integration Tests", () => {
  let testHelpers

  beforeAll(() => {
    testHelpers = new TestHelpers(app)
  })

  afterEach(async () => {
    await testHelpers.cleanup()
  })

  describe("POST /api/auth/register", () => {
    test("should register new user successfully", async () => {
      const userData = global.testUtils.createTestUser()

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.createUser.mockResolvedValue({
        uid: "firebase-uid-123",
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: false,
      })
      mockAuth.createCustomToken.mockResolvedValue("custom-token-123")

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("user")
      expect(response.body.data).toHaveProperty("customToken")
      expect(response.body.data.user.email).toBe(userData.email)
    })

    test("should return validation error for missing email", async () => {
      const userData = global.testUtils.createTestUser()
      delete userData.email

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      testHelpers.assertErrorResponse(response, "Validation error")
    })

    test("should return validation error for weak password", async () => {
      const userData = global.testUtils.createTestUser({
        password: "123", // Too short
      })

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      testHelpers.assertErrorResponse(response, "Validation error")
    })

    test("should return error for duplicate email", async () => {
      const userData = global.testUtils.createTestUser()

      // Create user first
      await testHelpers.createTestUser({
        email: userData.email,
        uid: "existing-uid",
      })

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.createUser.mockRejectedValue(new Error("Email already exists"))

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      testHelpers.assertErrorResponse(response, "Registration failed")
    })
  })

  describe("POST /api/auth/login", () => {
    test("should login user successfully", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      // Create user in database
      await testHelpers.createTestUser(userData)

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.getUser.mockResolvedValue({
        uid: userData.uid,
        disabled: false,
      })
      mockAuth.createCustomToken.mockResolvedValue("custom-token-123")

      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("user")
      expect(response.body.data).toHaveProperty("customToken")
      expect(response.body.data).toHaveProperty("session")
    })

    test("should return error for invalid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "wrongpassword",
        })
        .expect(401)

      testHelpers.assertErrorResponse(response, "Login failed")
    })

    test("should return validation error for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "test@example.com",
          // Missing password
        })
        .expect(400)

      testHelpers.assertErrorResponse(response, "Validation error")
    })
  })

  describe("POST /api/auth/verify-token", () => {
    test("should verify valid Firebase ID token", async () => {
      const user = await testHelpers.createTestUser({
        uid: "test-uid-123",
      })

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: user.uid,
        email: user.email,
      })

      const response = await request(app)
        .post("/api/auth/verify-token")
        .send({
          idToken: "valid-id-token",
        })
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("user")
      expect(response.body.data).toHaveProperty("decodedToken")
    })

    test("should return error for invalid token", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockRejectedValue(new Error("Invalid token"))

      const response = await request(app)
        .post("/api/auth/verify-token")
        .send({
          idToken: "invalid-token",
        })
        .expect(400)

      testHelpers.assertErrorResponse(response, "Token verification failed")
    })

    test("should return error for missing token", async () => {
      const response = await request(app).post("/api/auth/verify-token").send({}).expect(400)

      testHelpers.assertErrorResponse(response, "ID token is required")
    })
  })

  describe("GET /api/auth/me", () => {
    test("should return current user profile", async () => {
      const user = await testHelpers.createTestUser({
        uid: "test-uid-123",
      })

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: user.uid,
        email: user.email,
      })

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer valid-firebase-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data.uid).toBe(user.uid)
      expect(response.body.data.email).toBe(user.email)
    })

    test("should return error for missing token", async () => {
      const response = await request(app).get("/api/auth/me").expect(401)

      testHelpers.assertErrorResponse(response, "No token provided")
    })

    test("should return error for invalid token", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockRejectedValue(new Error("Invalid token"))

      const response = await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid-token").expect(401)

      testHelpers.assertErrorResponse(response, "Invalid token")
    })
  })
})
