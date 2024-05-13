const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Enable CORS for development

const Sequelize = require('sequelize');

const College = require('./models/college');
const User = require('./models/user');
const Student = require('./models/student');

const app = express();
app.use(cors()); // Enable CORS for development
app.use(bodyParser.json());

(async () => {
  try {
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
    });
    await sequelize.sync({ force: true }); // Recreate tables on every restart (for development)
    console.log('Database connection established');

    // Make sequelize available for models (Solution 1)
    College(sequelize);
    User(sequelize);
    Student(sequelize);
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
})();

// Routes (defined in separate file)
const studentRoutes = require('./routes/student');
app.use('/students', studentRoutes);

app.listen(4000, () => {
  console.log('Server listening on port 4000');
});