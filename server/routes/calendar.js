const { google } = require('googleapis');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// @route   GET api/calendar/auth
// @desc    Get Google Auth URL
router.get('/auth', auth, (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/gmail.send'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force refresh token
    scope: scopes,
    state: req.user.id
  });

  res.json({ url });
});

// @route   GET api/calendar/callback
// @desc    Google OAuth Callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const userId = state;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Store tokens in the database for the user
    await User.findByIdAndUpdate(userId, { googleTokens: tokens });
    
    console.log(`\n✅ TOKENS SAVED FOR USER: ${userId}\n`);
    
    // Redirect back to frontend
    res.redirect('http://localhost:5173/?calendar=success');
  } catch (error) {
    console.error('Error getting tokens:', error);
    res.status(500).send('Authentication failed');
  }
});

module.exports = router;
