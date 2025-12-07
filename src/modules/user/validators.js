const Joi = require("joi");
const cusExc = require("../../customException");
const constant = require("./../../constant");

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  avatar: Joi.string().uri().optional(),
  status: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1).messages({
  "object.min": "Nothing to update",
});


const listUsersSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional().default(20),
  skip: Joi.number().integer().min(0).optional().default(0),
  status: Joi.boolean().optional(),
  isDeleted: Joi.boolean().optional(),
  role: Joi.number().valid(1, 2).optional(),
  name: Joi.string().optional(),
  email: Joi.string().optional(),
  phone: Joi.string().optional(),
  status: Joi.boolean().optional(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is required",
  }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  role: Joi.number().valid(1, 2).allow(null).messages({
    "any.only": "Role must be 1 or 2",
  }),
  avatar: Joi.string().optional(),
  firebaseUid: Joi.string().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      { ...req.body, ...req.query },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      errObj({ msg: errorMessages.join(", ") });
    }
    req.body = value;
    next();
  };
}

const errObj = ({ key, msg = false }) => {
  let error = {
    fieldName: key,
    message: constant.MESSAGES.KEY_EMPTY_INVALID.replace("{{key}}", key),
  };
  if (msg) error.message = `${msg}`;
  throw cusExc.validationErrors(error);
};

module.exports = {
  updateUserProfile: validate(updateUserSchema),
  listUser: validate(listUsersSchema),
  validateRegister: validate(registerSchema),
};
