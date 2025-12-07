const Joi = require("joi")

// Common validation schemas
const commonSchemas = {
  objectId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  email: Joi.string().email().lowercase().trim(),
  password: Joi.string().min(8).max(128),
  phone: Joi.string().pattern(/^\+?[\d\s\-$$$$]+$/),
  url: Joi.string().uri(),
  date: Joi.date().iso(),
}

// User validation schemas
const userSchemas = {
  register: Joi.object({
    email: commonSchemas.email.required(),
    password: commonSchemas.password.required(),
    displayName: Joi.string().trim().min(2).max(50),
    profile: Joi.object({
      firstName: Joi.string().trim().min(1).max(50),
      lastName: Joi.string().trim().min(1).max(50),
      phoneNumber: commonSchemas.phone,
      dateOfBirth: commonSchemas.date,
    }),
  }),

  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    displayName: Joi.string().trim().min(2).max(50),
    photoURL: commonSchemas.url,
    profile: Joi.object({
      firstName: Joi.string().trim().min(1).max(50),
      lastName: Joi.string().trim().min(1).max(50),
      phoneNumber: commonSchemas.phone,
      dateOfBirth: commonSchemas.date,
      address: Joi.object({
        street: Joi.string().trim().max(100),
        city: Joi.string().trim().max(50),
        state: Joi.string().trim().max(50),
        zipCode: Joi.string().trim().max(20),
        country: Joi.string().trim().max(50),
      }),
    }),
    preferences: Joi.object({
      theme: Joi.string().valid("light", "dark", "auto"),
      language: Joi.string().length(2),
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
      }),
    }),
  }),
}

// Query validation schemas
const querySchemas = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default("createdAt"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  search: Joi.object({
    q: Joi.string().trim().min(1).max(100),
    fields: Joi.array().items(Joi.string()),
  }),
}

class ValidationUtils {
  /**
   * Validate request body against schema
   */
  static validateBody(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }))

        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        })
      }

      req.body = value
      next()
    }
  }

  /**
   * Validate query parameters against schema
   */
  static validateQuery(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }))

        return res.status(400).json({
          success: false,
          message: "Query validation error",
          errors,
        })
      }

      req.query = value
      next()
    }
  }

  /**
   * Validate route parameters against schema
   */
  static validateParams(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
      })

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }))

        return res.status(400).json({
          success: false,
          message: "Parameter validation error",
          errors,
        })
      }

      req.params = value
      next()
    }
  }

  /**
   * Custom validation for ObjectId parameters
   */
  static validateObjectId(paramName = "id") {
    return (req, res, next) => {
      const id = req.params[paramName]
      const { error } = commonSchemas.objectId.validate(id)

      if (error) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${paramName} format`,
        })
      }

      next()
    }
  }
}

module.exports = {
  ValidationUtils,
  userSchemas,
  querySchemas,
  commonSchemas,
}
