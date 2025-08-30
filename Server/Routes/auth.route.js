import express from 'express';
import { getProfile, login, register } from '../Controllers/auth.controller.js';
import { protect } from '../Middleware/authMiddleware.js';

const authRoutes = express.Router();

authRoutes.post('/login', login)
authRoutes.post('/register', register)
authRoutes.get('/profile', protect, getProfile);

export default authRoutes;