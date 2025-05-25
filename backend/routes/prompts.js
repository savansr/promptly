const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createPrompt,
  getPrompts,
  deletePrompt,
  enhancePrompt
} = require('../controllers/promptController');

// Create a new prompt
router.post('/', auth, createPrompt);

// Get all prompts for a user
router.get('/', auth, getPrompts);

// Delete a prompt
router.delete('/:id', auth, deletePrompt);

// Enhance prompt using Groq API
router.post('/enhance', auth, enhancePrompt);

module.exports = router; 