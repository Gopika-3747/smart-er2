const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

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

    res.status(200).json({ message: 'Login successful', user: {
      hospitalName: user.hospitalName,
    }, });
    

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'An error occurred. Please try again.' });
  }
});
app.post('/api/register', async (req, res) => {
  const { userID, firstName, lastName, email, role, password, hospitalName, supervisorId, supervisorPassword } = req.body;

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

    
    if (role.toLowerCase() === 'admin') {
      if (!supervisorId || !supervisorPassword) {
        return res.status(400).json({ message: 'Supervisor ID and Password are required for Admin role.' });
      }

      
      const supervisor = await User.findOne({ userID: supervisorId, role: 'supervisor' });

      if (!supervisor) {
        return res.status(400).json({ message: 'Invalid Supervisor ID.' });
      }

      const isSupervisorPasswordValid = await bcrypt.compare(supervisorPassword, supervisor.password);

      if (!isSupervisorPasswordValid) {
        return res.status(400).json({ message: 'Invalid Supervisor Password.' });
      }
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});