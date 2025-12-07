const DatabaseService = require("../../../src/services/DatabaseService")
const { User } = require("../../../src/models")

describe("DatabaseService", () => {
  describe("CRUD Operations", () => {
    test("should create a document", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      const user = await DatabaseService.create("User", userData)

      expect(user).toBeTruthy()
      expect(user.email).toBe(userData.email)
      expect(user.uid).toBe(userData.uid)
    })

    test("should find document by ID", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
        }),
      )

      const foundUser = await DatabaseService.findById("User", user._id)

      expect(foundUser).toBeTruthy()
      expect(foundUser._id.toString()).toBe(user._id.toString())
    })

    test("should find one document by filter", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
        email: "unique@example.com",
      })

      await User.create(userData)

      const foundUser = await DatabaseService.findOne("User", {
        email: "unique@example.com",
      })

      expect(foundUser).toBeTruthy()
      expect(foundUser.email).toBe("unique@example.com")
    })

    test("should find many documents with pagination", async () => {
      // Create multiple users
      for (let i = 0; i < 5; i++) {
        await User.create(
          global.testUtils.createTestUser({
            uid: `test-uid-${i}`,
            email: `user${i}@example.com`,
          }),
        )
      }

      const result = await DatabaseService.findMany(
        "User",
        {},
        {
          paginate: true,
          page: 1,
          limit: 3,
        },
      )

      expect(result.data).toHaveLength(3)
      expect(result.pagination.totalItems).toBe(5)
      expect(result.pagination.totalPages).toBe(2)
    })

    test("should update document by ID", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
        }),
      )

      const updatedUser = await DatabaseService.updateById("User", user._id, {
        displayName: "Updated Name",
      })

      expect(updatedUser.displayName).toBe("Updated Name")
    })

    test("should delete document by ID", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
        }),
      )

      const deletedUser = await DatabaseService.deleteById("User", user._id)

      expect(deletedUser).toBeTruthy()

      const foundUser = await User.findById(user._id)
      expect(foundUser).toBeNull()
    })
  })

  describe("Error Handling", () => {
    test("should throw error for invalid model name", async () => {
      await expect(DatabaseService.create("InvalidModel", {})).rejects.toThrow("Model InvalidModel not found")
    })

    test("should throw error for invalid document ID", async () => {
      await expect(DatabaseService.findById("User", "invalid-id")).rejects.toThrow()
    })
  })

  describe("Health Check", () => {
    test("should return database health status", async () => {
      const health = await DatabaseService.healthCheck()

      expect(health).toHaveProperty("status")
      expect(health).toHaveProperty("connected")
    })
  })
})
