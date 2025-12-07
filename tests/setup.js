const mongoose = require("mongoose")
const { MongoMemoryServer } = require("mongodb-memory-server")

let mongoServer

// Setup before all tests
global.beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// Cleanup after each test
global.afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections
  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }
})

// Cleanup after all tests
global.afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()

  // Stop the in-memory MongoDB instance
  await mongoServer.stop()
})

// Global test utilities
global.testUtils = {
  // Create test user data
  createTestUser: (overrides = {}) => ({
    email: "test@example.com",
    password: "testpassword123",
    displayName: "Test User",
    profile: {
      firstName: "Test",
      lastName: "User",
    },
    ...overrides,
  }),

  // Create test session data
  createTestSession: (userId, uid, overrides = {}) => ({
    userId,
    uid,
    token: "test-token-123",
    deviceInfo: {
      userAgent: "Test Agent",
      ip: "127.0.0.1",
      platform: "Test Platform",
      browser: "Test Browser",
    },
    isActive: true,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    ...overrides,
  }),

  // Wait for a specified time
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  // Generate random email
  randomEmail: () => `test${Math.random().toString(36).substring(7)}@example.com`,
}

// Mock Firebase Admin SDK
global.jest.mock("firebase-admin", () => ({
  initializeApp: global.jest.fn(),
  credential: {
    cert: global.jest.fn(),
  },
  auth: global.jest.fn(() => ({
    createUser: global.jest.fn(),
    getUser: global.jest.fn(),
    updateUser: global.jest.fn(),
    deleteUser: global.jest.fn(),
    verifyIdToken: global.jest.fn(),
    createCustomToken: global.jest.fn(),
    setCustomUserClaims: global.jest.fn(),
  })),
  firestore: global.jest.fn(),
}))

// Mock environment variables
process.env.NODE_ENV = "test"
process.env.MONGODB_URI = "mongodb://localhost:27017/test"
process.env.JWT_SECRET = "test-jwt-secret"
process.env.JWT_EXPIRES_IN = "7d"
process.env.FIREBASE_PROJECT_ID = "test-project"
process.env.FIREBASE_PRIVATE_KEY = "test-private-key"
process.env.FIREBASE_CLIENT_EMAIL = "test@test-project.iam.gserviceaccount.com"
