const UserFacade = require("../../../src/facades/UserFacade")
const { User } = require("../../../src/models")
const jest = require("jest") // Import jest to fix the undeclared variable error

describe("UserFacade", () => {
  beforeEach(async () => {
    await UserFacade.initialize()
  })

  describe("createUser", () => {
    test("should create user successfully", async () => {
      const userData = global.testUtils.createTestUser()

      // Mock Firebase auth
      const mockAuth = {
        createUser: jest.fn().mockResolvedValue({
          uid: "firebase-uid-123",
          email: userData.email,
          displayName: userData.displayName,
          emailVerified: false,
        }),
        createCustomToken: jest.fn().mockResolvedValue("custom-token-123"),
      }

      UserFacade.getService("auth").firebaseAuth = mockAuth

      const result = await UserFacade.createUser(userData)

      expect(result).toHaveProperty("user")
      expect(result).toHaveProperty("customToken")
      expect(result).toHaveProperty("firebaseUid")
      expect(mockAuth.createUser).toHaveBeenCalledWith({
        email: userData.email,
        password: userData.password,
        displayName: userData.displayName,
        emailVerified: false,
      })
    })

    test("should throw error for missing required fields", async () => {
      const userData = { email: "test@example.com" } // Missing password

      await expect(UserFacade.createUser(userData)).rejects.toThrow("Missing required fields: password")
    })
  })

  describe("getUserProfile", () => {
    test("should get user profile with computed fields", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          profile: {
            firstName: "John",
            lastName: "Doe",
          },
        }),
      )

      const profile = await UserFacade.getUserProfile(user.uid)

      expect(profile).toHaveProperty("fullName", "John Doe")
      expect(profile).toHaveProperty("accountAge")
      expect(typeof profile.accountAge).toBe("number")
    })

    test("should throw error for non-existent user", async () => {
      await expect(UserFacade.getUserProfile("non-existent-uid")).rejects.toThrow("User not found")
    })
  })

  describe("searchUsers", () => {
    beforeEach(async () => {
      // Create test users
      await User.create(
        global.testUtils.createTestUser({
          uid: "user1",
          email: "john@example.com",
          displayName: "John Doe",
        }),
      )

      await User.create(
        global.testUtils.createTestUser({
          uid: "user2",
          email: "jane@example.com",
          displayName: "Jane Smith",
        }),
      )
    })

    test("should search users by email", async () => {
      const result = await UserFacade.searchUsers({ email: "john" })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].email).toBe("john@example.com")
    })

    test("should search users by display name", async () => {
      const result = await UserFacade.searchUsers({ displayName: "Jane" })

      expect(result.data).toHaveLength(1)
      expect(result.data[0].displayName).toBe("Jane Smith")
    })

    test("should return paginated results", async () => {
      const result = await UserFacade.searchUsers({}, { page: 1, limit: 1 })

      expect(result.data).toHaveLength(1)
      expect(result.pagination.totalItems).toBe(2)
      expect(result.pagination.totalPages).toBe(2)
    })
  })

  describe("getUserDashboard", () => {
    test("should get user dashboard with stats", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          loginCount: 5,
          lastLoginAt: new Date(),
        }),
      )

      const dashboard = await UserFacade.getUserDashboard(user.uid)

      expect(dashboard).toHaveProperty("user")
      expect(dashboard).toHaveProperty("stats")
      expect(dashboard.stats).toHaveProperty("loginCount", 5)
      expect(dashboard.stats).toHaveProperty("accountAge")
      expect(dashboard.stats).toHaveProperty("activeSessions")
    })
  })
})
