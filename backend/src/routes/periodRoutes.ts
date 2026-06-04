import express from 'express';
import { addPeriod, getPeriods, updatePeriod, deletePeriod } from '../controllers/periodController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getPeriods).post(addPeriod);
router.route('/:id').put(updatePeriod).delete(deletePeriod);

export default router;