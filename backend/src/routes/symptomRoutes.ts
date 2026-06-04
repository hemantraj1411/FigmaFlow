import express from 'express';
import { addSymptom, getSymptoms } from '../controllers/symptomController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getSymptoms).post(addSymptom);

export default router;