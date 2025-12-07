const request = require("supertest")
const app = require("../../src/server")
const TestHelpers = require("../helpers/testHelpers")

describe("User Journey E2E Tests", () => {
  let testHelpers

  beforeAll(() => {
    testHelpers = new TestHelpers(app)
  })

  afterEach(async () => {
    await testHelpers.cleanup()
  })

  describe("Complete User Registration and Login Flow", () => {
    test("should complete full user journey", async () => {
      const userData = global.testUtils.createTestUser({
        email: "journey@example.com",
        password: "securepassword123",
        displayName: "Journey User",
      })

      // Mock Firebase auth
      const mockAuth = testHelpers.mockFirebaseAuth()

      // Step 1: Register user
      mockAuth.createUser.mockResolvedValue({
        uid: "journey-uid-123",
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: false,
      })
      mockAuth.createCustomToken.mockResolvedValue("custom-token-123")

      const registerResponse = await request(app).post("/api/auth/register").send(userData).expect(201)

      testHelpers.assertSuccessResponse(registerResponse)
      expect(registerResponse.body.data.user.email).toBe(userData.email)

      // Step 2: Login user
      mockAuth.getUser.mockResolvedValue({
        uid: "journey-uid-123",
        disabled: false,
      })

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200)

      testHelpers.assertSuccessResponse(loginResponse)
      expect(loginResponse.body.data).toHaveProperty("customToken")
      expect(loginResponse.body.data).toHaveProperty("session")

      // Step 3: Get user profile
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: "journey-uid-123",
        email: userData.email,
      })

      const profileResponse = await request(app)
        .get("/api/users/profile")
        .set("Authorization", "Bearer firebase-id-token")
        .expect(200)

      testHelpers.assertSuccessResponse(profileResponse)
      expect(profileResponse.body.data.email).toBe(userData.email)

      // Step 4: Update profile
      mockAuth.updateUser.mockResolvedValue({})

      const updateData = {
        displayName: "Updated Journey User",
        profile: {
          firstName: "Updated",
          lastName: "User",
        },
      }

      const updateResponse = await request(app)
        .put("/api/users/profile")
        .set("Authorization", "Bearer firebase-id-token")
        .send(updateData)
        .expect(200)

      testHelpers.assertSuccessResponse(updateResponse)
      expect(updateResponse.body.data.displayName).toBe("Updated Journey User")

      // Step 5: Get dashboard
      const dashboardResponse = await request(app)
        .get("/api/users/dashboard")
        .set("Authorization", "Bearer firebase-id-token")
        .expect(200)

      testHelpers.assertSuccessResponse(dashboardResponse)
      expect(dashboardResponse.body.data).toHaveProperty("user")
      expect(dashboardResponse.body.data).toHaveProperty("stats")
    })
  })

  describe("Admin User Journey", () => {
    test("should complete admin user journey", async () => {
      // Create admin user
      const adminUser = await testHelpers.createAdminUser({
        uid: "admin-journey-uid",
        email: "admin@example.com",
      })

      // Create regular user for admin to manage
      const regularUser = await testHelpers.createTestUser({
        uid: "regular-journey-uid",
        email: "regular@example.com",
      })

      // Mock Firebase auth for admin
      const mockAuth = testHelpers.mockFirebaseAuth()
      mockAuth.verifyIdToken.mockResolvedValue({
        uid: adminUser.uid,
        email: adminUser.email,
        customClaims: { admin: true },
      })

      // Step 1: Get system health
      const healthResponse = await request(app).get("/api/system/health").expect(200)

      expect(healthResponse.body).toHaveProperty("status")

      // Step 2: Get system metrics
      const metricsResponse = await request(app)
        .get("/api/system/metrics")
        .set("Authorization", "Bearer admin-firebase-token")
        .expect(200)

      testHelpers.assertSuccessResponse(metricsResponse)
      expect(metricsResponse.body.data).toHaveProperty("users")

      // Step 3: Search users
      const searchResponse = await request(app)
        .get("/api/users/search")
        .set("Authorization", "Bearer admin-firebase-token")
        .query({ page: 1, limit: 10 })
        .expect(200)

      testHelpers.assertPaginatedResponse(searchResponse)

      // Step 4: Get specific user
      const userResponse = await request(app)
        .get(`/api/users/${regularUser.uid}`)
        .set("Authorization", "Bearer admin-firebase-token")
        .expect(200)

      testHelpers.assertSuccessResponse(userResponse)
      expect(userResponse.body.data.uid).toBe(regularUser.uid)

      // Step 5: Get user analytics
      const analyticsResponse = await request(app)
        .get(`/api/users/${regularUser.uid}/analytics`)
        .set("Authorization", "Bearer admin-firebase-token")
        .query({ timeRange: "30d" })
        .expect(200)

      testHelpers.assertSuccessResponse(analyticsResponse)
      expect(analyticsResponse.body.data).toHaveProperty("metrics")
    })
  })
})
