const express = require('express');

const authController = require('../Controllers/authControllers');

const router = express.Router();

router.post('/login', authController.login);
// Backend test route
router.get('/login', (req, res) => {
  res.json({ message: 'Server is working!' });
});
router.post('/register', authController.register);

module.exports = router;