import express from 'express';
const router = express.Router();

import { router as eventRotues } from './routes/v1/event.controller';
import { router as fileRotues } from './routes/v1/file.controller';
import { router as wakeUpRoutes } from './routes/v1/wake-up.controller';

// *** App Endpoints ***

// Event
router.use('/v1/event', eventRotues);

// File
router.use('/v1/file', fileRotues);

// Wake Up
router.use('/v1/wake-up', wakeUpRoutes);

export { router }