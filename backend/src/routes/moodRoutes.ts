import express from 'express';
import { addMood, getMoods } from '../controllers/moodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getMoods).post(addMood);

export default router;