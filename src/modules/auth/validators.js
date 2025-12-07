const Joi = require("joi");
const cusExc = require("../../customException");
const constant = require("./../../constant");

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
  avatar: Joi.string().uri().optional(),
  firebaseUid: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
});

const changePasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "New password must be at least 8 characters long",
    "any.required": "New password is required",
  }),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
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
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateForgotPassword: validate(forgotPasswordSchema),
  validateChangePassword: validate(changePasswordSchema),
};
