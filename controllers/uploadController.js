const cloudinary = require('cloudinary').v2;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Upload d'une image
// @route   POST /api/upload/image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    // Vérifier la taille du fichier (5MB max)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'Fichier trop volumineux (5MB maximum)'
      });
    }

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'kolia',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' },
            { format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('UploadImage error:', error);
    
    // En mode développement, retourner une URL mock
    if (process.env.NODE_ENV === 'development') {
      return res.json({
        success: true,
        message: 'Image uploadée (mode développement)',
        data: {
          url: `https://via.placeholder.com/800x600/f8d7da/2d3748?text=${encodeURIComponent(req.file.originalname)}`,
          public_id: `mock_${Date.now()}`,
          width: 800,
          height: 600,
          format: 'jpg',
          size: req.file.size,
          is_mock: true
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image'
    });
  }
};

// @desc    Supprimer une image
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    // Si c'est une image mock, simuler la suppression
    if (publicId.startsWith('mock_')) {
      return res.json({
        success: true,
        message: 'Image supprimée (mode développement)',
        is_mock: true
      });
    }

    // Supprimer de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image supprimée avec succès'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image non trouvée'
      });
    }
  } catch (error) {
    console.error('DeleteImage error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'image'
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage
};