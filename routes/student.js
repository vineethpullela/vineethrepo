const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Enable CORS for development
const Sequelize = require('sequelize');
const jwt = require('jsonwebtoken');
const fs = require('fs'); // For loading environment variables
const bcrypt = require('bcrypt'); // For secure password hashing

// Load environment variables
const config = JSON.parse(fs.readFileSync('config/config.json', 'utf8'));

const app = express();
app.use(cors()); // Enable CORS for development
app.use(bodyParser.json());

// Sequelize instance
const sequelize = new Sequelize(config.database);

// Model definitions (replace with your actual models)
const User = require('./models/user');
const Student = require('./models/student');

// Associations (if applicable)
// Example: Student.belongsTo(College);

(async () => {
  try {
    await sequelize.sync({ force: true }); // Recreate tables on every restart (for development)
    console.log('Database connection established');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

// Middleware for JWT verification
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded.user; // Attach decoded user information to the request
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden' });
  }
};

// API Endpoints

// User registration (POST /users/register)
app.post('/users/register', async (req, res) => {
  const { username, password } = req.body;

  // Hash password before storing (using bcrypt)
  const saltRounds = 10; // Adjust salt rounds for desired security
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Registration failed' });
  }
});

// User login (POST /users/login)
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token on successful login
    const token = jwt.sign({ user: user.id }, config.jwtSecret, { expiresIn: '1h' }); // Set appropriate expiration time
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all students (GET /students) with authorization (replace with role-based access control)
app.get('/students', verifyJWT, async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a student (POST /students) with authorization (replace with role-based access control)
app.post('/students', verifyJWT, async (req, res) => {
    const { name } = req.body;
  
    try {
      const student = await Student.create({ name });
      res.status(201).json({ message: 'Student created successfully', student });
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: 'Failed to create student' });
    }
  });
