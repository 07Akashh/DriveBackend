const request = require("supertest")
const app = require("../../src/server")
const TestHelpers = require("../helpers/testHelpers")

describe("System API Integration Tests", () => {
  let testHelpers
  let testData

  beforeAll(() => {
    testHelpers = new TestHelpers(app)
  })

  beforeEach(async () => {
    testData = await testHelpers.setupTestData()
  })

  afterEach(async () => {
    await testHelpers.cleanup()
  })

  describe("GET /api/system/health", () => {
    test("should return system health status", async () => {
      const response = await request(app).get("/api/system/health").expect(200)

      expect(response.body).toHaveProperty("status")
      expect(response.body).toHaveProperty("timestamp")
      expect(response.body).toHaveProperty("services")
      expect(response.body).toHaveProperty("metrics")
    })
  })

  describe("GET /api/system/metrics (Admin only)", () => {
    test("should return system metrics for admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get("/api/system/metrics")
        .set("Authorization", "Bearer valid-admin-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("database")
      expect(response.body.data).toHaveProperty("users")
      expect(response.body.data).toHaveProperty("sessions")
      expect(response.body.data).toHaveProperty("system")
    })

    test("should return error for non-admin user", async () => {
      // Mock Firebase auth for regular user
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
        customClaims: {},
      })

      const response = await request(app)
        .get("/api/system/metrics")
        .set("Authorization", "Bearer valid-user-token")
        .expect(403)

      testHelpers.assertErrorResponse(response, "Missing required claim: admin")
    })

    test("should return error for unauthenticated request", async () => {
      const response = await request(app).get("/api/system/metrics").expect(401)

      testHelpers.assertErrorResponse(response, "No token provided")
    })
  })

  describe("POST /api/system/maintenance (Admin only)", () => {
    test("should perform system maintenance for admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .post("/api/system/maintenance")
        .set("Authorization", "Bearer valid-admin-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("expiredSessions")
      expect(response.body.data).toHaveProperty("errors")
    })

    test("should return error for non-admin user", async () => {
      // Mock Firebase auth for regular user
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
        customClaims: {},
      })

      const response = await request(app)
        .post("/api/system/maintenance")
        .set("Authorization", "Bearer valid-user-token")
        .expect(403)

      testHelpers.assertErrorResponse(response, "Missing required claim: admin")
    })
  })

  describe("GET /api/system/config (Admin only)", () => {
    test("should return system configuration for admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get("/api/system/config")
        .set("Authorization", "Bearer valid-admin-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("environment")
      expect(response.body.data).toHaveProperty("database")
      expect(response.body.data).toHaveProperty("firebase")
      expect(response.body.data).toHaveProperty("jwt")
    })
  })

  describe("GET /api/system/facades (Admin only)", () => {
    test("should return facade health status for admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get("/api/system/facades")
        .set("Authorization", "Bearer valid-admin-token")
        .expect(200)

      expect(response.body).toHaveProperty("status")
      expect(response.body).toHaveProperty("facades")
    })
  })
})
