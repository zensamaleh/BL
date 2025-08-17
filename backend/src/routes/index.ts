import { Router } from 'express';
import authRoutes from './auth';
import blRoutes from './bl';
import reportRoutes from './reports';
import correctionLibelleRoutes from './correctionLibelle';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API BL Management - Service en ligne',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/bl', blRoutes);
router.use('/reports', reportRoutes);
router.use('/correction', correctionLibelleRoutes);

export default router;