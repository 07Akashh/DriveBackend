const request = require("supertest")
const app = require("../../src/server")
const TestHelpers = require("../helpers/testHelpers")

describe("Users API Integration Tests", () => {
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

  describe("GET /api/users/profile", () => {
    test("should get current user profile", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
      })

      const response = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer valid-firebase-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data.uid).toBe(testData.users.regular.uid)
      expect(response.body.data.email).toBe(testData.users.regular.email)
    })

    test("should return error for unauthenticated request", async () => {
      const response = await request(app).get("/api/users/profile").expect(401)

      testHelpers.assertErrorResponse(response, "No token provided")
    })
  })

  describe("PUT /api/users/profile", () => {
    test("should update user profile", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
      })
      mockAuth.updateUser.mockResolvedValue({})

      const updateData = {
        displayName: "Updated Name",
        profile: {
          firstName: "Updated",
          lastName: "Name",
        },
      }

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", "Bearer valid-firebase-token")
        .send(updateData)
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data.displayName).toBe("Updated Name")
    })

    test("should return validation error for invalid data", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
      })

      const invalidData = {
        displayName: "A", // Too short
      }

      const response = await request(app)
        .put("/api/users/profile")
        .set("Authorization", "Bearer valid-firebase-token")
        .send(invalidData)
        .expect(400)

      testHelpers.assertErrorResponse(response, "Validation error")
    })
  })

  describe("GET /api/users/dashboard", () => {
    test("should get user dashboard data", async () => {
      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.regular.uid,
        email: testData.users.regular.email,
      })

      const response = await request(app)
        .get("/api/users/dashboard")
        .set("Authorization", "Bearer valid-firebase-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("user")
      expect(response.body.data).toHaveProperty("stats")
      expect(response.body.data).toHaveProperty("recentSessions")
      expect(response.body.data.stats).toHaveProperty("loginCount")
      expect(response.body.data.stats).toHaveProperty("accountAge")
    })
  })

  describe("GET /api/users/search (Admin only)", () => {
    test("should search users as admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get("/api/users/search")
        .set("Authorization", "Bearer valid-admin-token")
        .query({ page: 1, limit: 10 })
        .expect(200)

      testHelpers.assertPaginatedResponse(response)
      expect(Array.isArray(response.body.data)).toBe(true)
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
        .get("/api/users/search")
        .set("Authorization", "Bearer valid-user-token")
        .expect(403)

      testHelpers.assertErrorResponse(response, "Missing required claim: admin")
    })

    test("should search users with filters", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get("/api/users/search")
        .set("Authorization", "Bearer valid-admin-token")
        .query({
          email: "user@example.com",
          page: 1,
          limit: 10,
        })
        .expect(200)

      testHelpers.assertPaginatedResponse(response)
    })
  })

  describe("GET /api/users/:uid (Admin only)", () => {
    test("should get user by UID as admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get(`/api/users/${testData.users.regular.uid}`)
        .set("Authorization", "Bearer valid-admin-token")
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data.uid).toBe(testData.users.regular.uid)
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
        .get(`/api/users/${testData.users.regular.uid}`)
        .set("Authorization", "Bearer valid-user-token")
        .expect(403)

      testHelpers.assertErrorResponse(response, "Missing required claim: admin")
    })
  })

  describe("POST /api/users/:uid/deactivate (Admin only)", () => {
    test("should deactivate user as admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .post(`/api/users/${testData.users.regular.uid}/deactivate`)
        .set("Authorization", "Bearer valid-admin-token")
        .send({ reason: "Policy violation" })
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data.success).toBe(true)
    })
  })

  describe("GET /api/users/:uid/analytics (Admin only)", () => {
    test("should get user analytics as admin", async () => {
      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: testData.users.admin.uid,
        email: testData.users.admin.email,
        customClaims: { admin: true },
      })

      const response = await request(app)
        .get(`/api/users/${testData.users.regular.uid}/analytics`)
        .set("Authorization", "Bearer valid-admin-token")
        .query({ timeRange: "30d" })
        .expect(200)

      testHelpers.assertSuccessResponse(response)
      expect(response.body.data).toHaveProperty("metrics")
    })
  })
})
