const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { adminAuthCheck } = require('../middleware/adminAuth');

const router = express.Router();

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ACCEPTED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
    }
  }
});

const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9.\-]/g, '');
}

router.post('/', adminAuthCheck, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ error: 'Invalid file type. Accepted types: JPEG, PNG, GIF, WebP.' });
        }
      }
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Include a file in the "image" field.' });
    }

    // Double-check mime type (in case fileFilter was bypassed)
    if (!ACCEPTED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Accepted types: JPEG, PNG, GIF, WebP.' });
    }

    const sanitizedName = sanitizeFilename(req.file.originalname);
    const key = `images/${Date.now()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.MEDIA_BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    s3.send(command)
      .then(() => {
        const url = `https://${process.env.MEDIA_CDN_DOMAIN}/${key}`;
        res.json({ url });
      })
      .catch((uploadErr) => {
        console.error('S3 upload error:', uploadErr);
        res.status(500).json({ error: 'Failed to upload image.' });
      });
  });
});

module.exports = router;
