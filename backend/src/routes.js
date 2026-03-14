import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import artisanRoutes from './modules/artisans/artisans.routes.js';
import productRoutes from './modules/products/products.routes.js';
import ratingRoutes from './modules/ratings/ratings.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(artisanRoutes);
router.use(productRoutes);
router.use(ratingRoutes);
router.use(adminRoutes);

export default router;
