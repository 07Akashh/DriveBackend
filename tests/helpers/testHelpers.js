const request = require("supertest")
const jwt = require("jsonwebtoken")
const { User, Session } = require("../../src/models")
const jest = require("jest")
const expect = require("expect")

class TestHelpers {
  constructor(app) {
    this.app = app
  }

  /**
   * Create a test user in the database
   */
  async createTestUser(userData = {}) {
    const defaultUser = global.testUtils.createTestUser()
    const user = await User.create({ ...defaultUser, ...userData })
    return user
  }

  /**
   * Create a test session for a user
   */
  async createTestSession(user, sessionData = {}) {
    const defaultSession = global.testUtils.createTestSession(user._id, user.uid)
    const session = await Session.create({ ...defaultSession, ...sessionData })
    return session
  }

  /**
   * Generate a JWT token for testing
   */
  generateTestToken(user) {
    return jwt.sign({ userId: user._id, uid: user.uid, role: user.role, email:user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
  }

  /**
   * Create authenticated request
   */
  authenticatedRequest(token) {
    return request(this.app).set("Authorization", `Bearer ${token}`)
  }

  /**
   * Create admin user with admin claims
   */
  async createAdminUser(userData = {}) {
    const adminData = {
      ...global.testUtils.createTestUser(),
      customClaims: new Map([["admin", true]]),
      ...userData,
    }
    return await this.createTestUser(adminData)
  }

  /**
   * Mock Firebase auth methods
   */
  mockFirebaseAuth() {
    const admin = require("firebase-admin")
    const mockAuth = {
      createUser: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      verifyIdToken: jest.fn(),
      createCustomToken: jest.fn(),
      setCustomUserClaims: jest.fn(),
    }

    admin.auth.mockReturnValue(mockAuth)
    return mockAuth
  }

  /**
   * Setup common test data
   */
  async setupTestData() {
    // Create test users
    const regularUser = await this.createTestUser({
      email: "user@example.com",
      uid: "test-user-uid",
    })

    const adminUser = await this.createAdminUser({
      email: "admin@example.com",
      uid: "test-admin-uid",
    })

    // Create sessions
    const userSession = await this.createTestSession(regularUser)
    const adminSession = await this.createTestSession(adminUser)

    // Generate tokens
    const userToken = this.generateTestToken(regularUser)
    const adminToken = this.generateTestToken(adminUser)

    return {
      users: { regular: regularUser, admin: adminUser },
      sessions: { user: userSession, admin: adminSession },
      tokens: { user: userToken, admin: adminToken },
    }
  }

  /**
   * Assert response structure
   */
  assertSuccessResponse(response, expectedData = null) {
    expect(response.body).toHaveProperty("success", true)
    expect(response.body).toHaveProperty("message")
    expect(response.body).toHaveProperty("timestamp")

    if (expectedData) {
      expect(response.body).toHaveProperty("data")
      if (typeof expectedData === "object") {
        expect(response.body.data).toMatchObject(expectedData)
      }
    }
  }

  /**
   * Assert error response structure
   */
  assertErrorResponse(response, expectedMessage = null) {
    expect(response.body).toHaveProperty("success", false)
    expect(response.body).toHaveProperty("message")
    expect(response.body).toHaveProperty("timestamp")

    if (expectedMessage) {
      expect(response.body.message).toContain(expectedMessage)
    }
  }

  /**
   * Assert paginated response structure
   */
  assertPaginatedResponse(response) {
    this.assertSuccessResponse(response)
    expect(response.body).toHaveProperty("data")
    expect(response.body).toHaveProperty("pagination")
    expect(response.body.pagination).toHaveProperty("currentPage")
    expect(response.body.pagination).toHaveProperty("totalPages")
    expect(response.body.pagination).toHaveProperty("totalItems")
    expect(response.body.pagination).toHaveProperty("itemsPerPage")
  }

  /**
   * Clean up test data
   */
  async cleanup() {
    await User.deleteMany({})
    await Session.deleteMany({})
  }
}

module.exports = TestHelpers
