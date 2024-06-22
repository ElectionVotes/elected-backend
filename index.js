const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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

// Routes
app.use('/api/auth', auth);
app.use('/api', protectedRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/votes', votesRoutes);

// Verify key files
try {
  const publicKey = fs.readFileSync(path.resolve(__dirname, '../keys/public.pem'), 'utf8');
  console.log('Public key loaded successfully');
} catch (err) {
  console.error('Error loading public key:', err);
  process.exit(1);
}

try {
  const privateKey = fs.readFileSync(path.resolve(__dirname, '../keys/private.pem'), 'utf8');
  console.log('Private key loaded successfully');
} catch (err) {
  console.error('Error loading private key:', err);
  process.exit(1);
}

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
  process.exit(1); // Exit if MongoDB connection fails
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
