const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the storage directory
const storageDir = path.join(__dirname, '..', 'uploads'); // Stores in backend/uploads

// Ensure storage directory exists
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only specified image and PDF types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File type not supported. Only JPEG, PNG, and PDF are allowed.'), false);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 512 // 512KB file size limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
