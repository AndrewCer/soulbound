import express from 'express';
const router = express.Router();

import { router as fileRotues } from './routes/v1/file.controller';
import { router as wakeUpRoutes } from './routes/v1/wake-up.controller';

// *** App Endpoints ***

// File
router.use('/v1/file', fileRotues);

// Wake Up
router.use('/v1/wake-up', wakeUpRoutes);

export { router }