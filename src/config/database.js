const mongoose = require("mongoose")

class DatabaseConnection {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      if (this.connection) {
        return this.connection
      }

      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
      }

      this.connection = await mongoose.connect(process.env.MONGODB_URI, options)

      mongoose.connection.on("error", (error) => {
        console.error("MongoDB connection error:", error)
      })

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected")
      })

      return this.connection
    } catch (error) {
      console.error("Database connection failed:", error)
      throw error
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect()
      this.connection = null
    }
  }

  getConnection() {
    return this.connection
  }
}

const databaseConnection = new DatabaseConnection()

module.exports = {
  connectDatabase: () => databaseConnection.connect(),
  disconnectDatabase: () => databaseConnection.disconnect(),
  getDatabaseConnection: () => databaseConnection.getConnection(),
}
