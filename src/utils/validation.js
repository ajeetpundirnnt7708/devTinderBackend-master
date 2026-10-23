const validator = require("validator");

const validateSignup = (req) => {
  const { firstName, lastName, emailId, password, age } = req.body || {};

  if (!firstName || !lastName) throw new Error("First name and last name are required");
  if (!validator.isEmail(String(emailId))) throw new Error("Email is not valid");
  if (!validator.isStrongPassword(password)) {
    throw new Error(
      "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a symbol"
    );
  }
  if (age !== undefined && (Number.isNaN(Number(age)) || Number(age) < 18)) {
    throw new Error("Age must be a number greater than or equal to 18");
  }
};

module.exports = { validateSignup };
