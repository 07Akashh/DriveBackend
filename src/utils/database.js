const mongoose = require("mongoose")

class DatabaseUtils {
  /**
   * Create a transaction wrapper for database operations
   */
  static async withTransaction(operations) {
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
      const result = await operations(session)
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Paginate query results
   */
  static async paginate(model, query = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, populate = "", select = "" } = options

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.find(query).select(select).populate(populate).sort(sort).skip(skip).limit(limit).lean(),
      model.countDocuments(query),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    }
  }

  /**
   * Build aggregation pipeline for complex queries
   */
  static buildAggregationPipeline(options = {}) {
    const pipeline = []

    // Match stage
    if (options.match) {
      pipeline.push({ $match: options.match })
    }

    // Lookup/Join stages
    if (options.lookup) {
      if (Array.isArray(options.lookup)) {
        options.lookup.forEach((lookup) => pipeline.push({ $lookup: lookup }))
      } else {
        pipeline.push({ $lookup: options.lookup })
      }
    }

    // Unwind stages
    if (options.unwind) {
      if (Array.isArray(options.unwind)) {
        options.unwind.forEach((unwind) => pipeline.push({ $unwind: unwind }))
      } else {
        pipeline.push({ $unwind: options.unwind })
      }
    }

    // Group stage
    if (options.group) {
      pipeline.push({ $group: options.group })
    }

    // Sort stage
    if (options.sort) {
      pipeline.push({ $sort: options.sort })
    }

    // Project stage
    if (options.project) {
      pipeline.push({ $project: options.project })
    }

    // Pagination
    if (options.skip) {
      pipeline.push({ $skip: options.skip })
    }

    if (options.limit) {
      pipeline.push({ $limit: options.limit })
    }

    return pipeline
  }

  /**
   * Validate ObjectId
   */
  static isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id)
  }

  /**
   * Convert string to ObjectId
   */
  static toObjectId(id) {
    return new mongoose.Types.ObjectId(id)
  }

  /**
   * Health check for database connection
   */
  static async healthCheck() {
    try {
      const state = mongoose.connection.readyState
      const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting",
      }

      return {
        status: states[state],
        connected: state === 1,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      }
    } catch (error) {
      return {
        status: "error",
        connected: false,
        error: error.message,
      }
    }
  }

  /**
   * Get database statistics
   */
  static async getStats() {
    try {
      const db = mongoose.connection.db
      const stats = await db.stats()

      return {
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        objects: stats.objects,
      }
    } catch (error) {
      throw new Error(`Failed to get database stats: ${error.message}`)
    }
  }
}

module.exports = DatabaseUtils
