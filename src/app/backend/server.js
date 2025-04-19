const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const bcrypt = require('bcrypt');
const { data } = require('autoprefixer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*', 
  credentials: true,
}));
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shaheem2:Er9RHzQvT2Lhedzi@smart-er.s39qc.mongodb.net/smart-er?retryWrites=true&w=majority&appName=smart-er';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
  hospitalName: { type: String, required: true },
  hospitalID: { type: String, required: true, unique: true },
  supervisorId: { type: String }, 
  supervisorPassword: { type: String }, 
});

const User = mongoose.model('User', userSchema);


app.post('/api/login', async (req, res) => {
  const { userID, password } = req.body;

  try {
    const user = await User.findOne({ userID });

    if (!user) {
      return res.status(400).json({ redirect: '/registration' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      user: {
        userName: `${user.firstName} ${user.lastName}`, 
        hospitalName: user.hospitalName,
        hospitalID: user.hospitalID,
        role:user.role,
        userID:user.userID,
      }, 
    });
    

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


app.post('/api/verify-supervisor', async (req, res) => {
  const { id, password } = req.body;

  try {
    const supervisor = await User.findOne({ userID: id, role: 'supervisor' });

    if (!supervisor) {
      return res.status(400).json({ isValid: false, message: 'Invalid Supervisor ID.' });
    }

    const isPasswordValid = await bcrypt.compare(password, supervisor.password);

    if (!isPasswordValid) {
      return res.status(400).json({ isValid: false, message: 'Invalid Supervisor Password.' });
    }

    res.status(200).json({ isValid: true });
  } catch (err) {
    console.error('Error verifying supervisor credentials:', err);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


app.post('/api/verify-admin', async (req, res) => {
  const { id, password } = req.body;

  try {
    const admin = await User.findOne({ userID: id, role: 'admin' });

    if (!admin) {
      return res.status(400).json({ isValid: false, message: 'Invalid Admin ID.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(400).json({ isValid: false, message: 'Invalid Admin Password.' });
    }

    res.status(200).json({ isValid: true });
  } catch (err) {
    console.error('Error verifying admin credentials:', err);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});


app.post('/api/register', async (req, res) => {
  const { userID, firstName, lastName, email, role, password, hospitalName, hospitalID, supervisorId, supervisorPassword } = req.body;

  try {
    
    const allowedRoles = ['admin', 'doctor', 'nurse'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid role. Allowed roles are Admin, Doctor, and Nurse.' });
    }

    
    const existingUserID = await User.findOne({ userID });
    if (existingUserID) {
      return res.status(400).json({ message: 'User ID already exists.' });
    }

    
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    
    const newUser = new User({
      userID,
      firstName,
      lastName,
      email,
      role,
      password: hashedPassword,
      hospitalName,
      hospitalID,
      supervisorId: role.toLowerCase() === 'admin' ? supervisorId : null,
      supervisorPassword: role.toLowerCase() === 'admin' ? await bcrypt.hash(supervisorPassword, saltRounds) : null,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});

app.get('/graph-data', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:5001/graph-data');
      res.json(response.data);
  } catch (error) {
      console.error('Error fetching graph data:', error);
      res.status(500).json({ message: 'Failed to fetch graph data' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});



