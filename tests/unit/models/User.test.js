const { User } = require("../../../src/models")

describe("User Model", () => {
  describe("Schema Validation", () => {
    test("should create user with valid data", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      const user = new User(userData)
      await user.validate()

      expect(user.email).toBe(userData.email)
      expect(user.uid).toBe(userData.uid)
      expect(user.displayName).toBe(userData.displayName)
    })

    test("should require uid field", async () => {
      const userData = global.testUtils.createTestUser()
      delete userData.uid

      const user = new User(userData)

      await expect(user.validate()).rejects.toThrow("Path `uid` is required")
    })

    test("should require email field", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })
      delete userData.email

      const user = new User(userData)

      await expect(user.validate()).rejects.toThrow("Path `email` is required")
    })

    test("should enforce unique email", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      await User.create(userData)

      const duplicateUser = new User({
        ...userData,
        uid: "different-uid",
      })

      await expect(duplicateUser.save()).rejects.toThrow()
    })

    test("should enforce unique uid", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      await User.create(userData)

      const duplicateUser = new User({
        ...userData,
        email: "different@example.com",
      })

      await expect(duplicateUser.save()).rejects.toThrow()
    })
  })

  describe("Instance Methods", () => {
    test("should update login info", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          loginCount: 0,
        }),
      )

      const originalLoginCount = user.loginCount
      await user.updateLoginInfo()

      expect(user.loginCount).toBe(originalLoginCount + 1)
      expect(user.lastLoginAt).toBeInstanceOf(Date)
    })

    test("should return public JSON without sensitive data", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          customClaims: new Map([["admin", true]]),
        }),
      )

      const publicData = user.toPublicJSON()

      expect(publicData).not.toHaveProperty("customClaims")
      expect(publicData).toHaveProperty("email")
      expect(publicData).toHaveProperty("uid")
    })
  })

  describe("Static Methods", () => {
    test("should find user by email", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
        email: "test@example.com",
      })

      await User.create(userData)

      const foundUser = await User.findByEmail("test@example.com")
      expect(foundUser).toBeTruthy()
      expect(foundUser.email).toBe("test@example.com")
    })

    test("should find user by uid", async () => {
      const userData = global.testUtils.createTestUser({
        uid: "test-uid-123",
      })

      await User.create(userData)

      const foundUser = await User.findByUid("test-uid-123")
      expect(foundUser).toBeTruthy()
      expect(foundUser.uid).toBe("test-uid-123")
    })

    test("should create user from Firebase user data", async () => {
      const firebaseUser = {
        uid: "firebase-uid-123",
        email: "firebase@example.com",
        displayName: "Firebase User",
        photoURL: "https://example.com/photo.jpg",
        emailVerified: true,
        disabled: false,
        customClaims: { role: "user" },
      }

      const user = await User.createFromFirebaseUser(firebaseUser)

      expect(user.uid).toBe(firebaseUser.uid)
      expect(user.email).toBe(firebaseUser.email)
      expect(user.displayName).toBe(firebaseUser.displayName)
      expect(user.emailVerified).toBe(firebaseUser.emailVerified)
    })
  })

  describe("Virtual Properties", () => {
    test("should return full name when first and last name are provided", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          profile: {
            firstName: "John",
            lastName: "Doe",
          },
        }),
      )

      expect(user.fullName).toBe("John Doe")
    })

    test("should return display name when no first/last name", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          displayName: "John Doe",
          profile: {},
        }),
      )

      expect(user.fullName).toBe("John Doe")
    })

    test("should return email when no display name or first/last name", async () => {
      const user = await User.create(
        global.testUtils.createTestUser({
          uid: "test-uid-123",
          displayName: null,
          profile: {},
        }),
      )

      expect(user.fullName).toBe(user.email)
    })
  })
})
