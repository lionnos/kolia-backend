const express = require('express');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configuration Multer pour l'upload d'images
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  }
});

// Routes protégées
router.use(protect);

router.post('/image', upload.single('image'), uploadImage);
router.delete('/image/:publicId', deleteImage);

module.exports = router;