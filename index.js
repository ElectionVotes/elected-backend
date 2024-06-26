const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const client = require('prom-client');

dotenv.config();
const DB = process.env.MONGO_URL;

const auth = require('./controllers/auth');
const protectedRoutes = require('./routes/protected');
const categoryRoutes = require('./routes/categoryRoutes');
const electionRoutes = require('./routes/electionsRoutes');
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const votesRoutes = require('./routes/voteRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware

const corsOptions = {
  origin: 'https://elected.live',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Create a /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Routes
app.use('/api/auth', auth);
app.use('/api', protectedRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', votesRoutes);

// MongoDB connection
mongoose.connect(DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connection successful');
})
.catch((err) => {
  console.log('MongoDB connection failed', err);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
