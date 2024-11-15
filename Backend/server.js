const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const cors = require('cors'); // Only one import of cors is needed

dotenv.config();

const app = express();
app.use(express.json());

// Enable CORS for specific frontend URL on Vercel
app.use(cors({
  origin: 'https://vercel.com/etech23s-projects/task-master/DWMSGMif4A1XE8u8HY8BHh3h6d3i'
}));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
