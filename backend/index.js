require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors
const path = require('path');
const multer = require('multer'); // For MulterError
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes and origins by default
app.use(cors()); 
// For more specific CORS options:
// const corsOptions = {
//   origin: 'http://localhost:3000', // Allow only your frontend origin
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
// app.use(cors(corsOptions));

// Middleware to parse JSON bodies
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('SIAP Backend is running!');
});

// Authentication routes
app.use('/api/auth', authRoutes);
// Document routes
app.use('/api/documents', documentRoutes);
// Admin routes
app.use('/api/admin', adminRoutes);
// Stats routes
app.use('/api/stats', statsRoutes);

// Serve uploaded files statically from the 'uploads' directory
// Moved this after API routes to avoid conflicts
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading.
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // An unknown error occurred when uploading.
    // Also handles errors from fileFilter in uploadMiddleware
    return res.status(400).json({ message: err.message || 'File upload error.' });
  }
  // Everything went fine.
  next();
});

// Serve uploaded files statically from the 'uploads' directory
// Moved this after API routes to avoid conflicts
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
