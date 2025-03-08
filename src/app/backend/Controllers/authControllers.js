const Joi = require('joi');
const User = require('../models/users');
const bcrypt = require('bcrypt');

const loginSchema = Joi.object({
  userID: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

exports.login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userID, password } = req.body;
  const trimmedUserID = userID.trim();
  const trimmedPassword = password.trim();

  try {
    const user = await User.findOne({ userID: trimmedUserID });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    if (isMatch) {
      res.status(200).json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.register = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { userID, password } = req.body;
  try {
    const existingUser = await User.findOne({ userID });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ userID, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};