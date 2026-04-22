const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Routes
const tripRoutes = require('./routes/tripRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Menggunakan Routes
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is sailing on port: ${PORT}`);
});