import express from 'express';
import { body, validationResult } from 'express-validator';
import { checkSteamAccount } from '../services/steamService.js';

const router = express.Router();

router.post('/check', 
  body('steamAccount').trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { steamAccount } = req.body;
      const result = await checkSteamAccount(steamAccount);
      res.json(result);
    } catch (error) {
      console.error('Steam check error:', error);
      res.status(500).json({ error: 'Failed to check Steam account' });
    }
  }
);

export default router;