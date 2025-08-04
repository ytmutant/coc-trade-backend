const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// POST /api/contact
router.post('/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('A valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // In real use: store the contact message or send email here
    res.json({
      success: true,
      message: 'Contact form submitted successfully! We will get back to you soon.'
    });
  }
);

module.exports = router;
