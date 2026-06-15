import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(30).required(),
  confirmPassword: Joi.string().required(),
  role: Joi.string().valid("student", "instructor", "admin").default("student"),
}).custom((value, helpers) => {
  if (value.password !== value.confirmPassword) {
    return helpers.error("any.custom", {
      message: "Passwords do not match",
    });
  }

  return value;
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
