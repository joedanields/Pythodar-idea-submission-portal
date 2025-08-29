import express from 'express';
import { login, register } from '../Controllers/auth.controller.js';

const authRoutes = express.Router();

authRoutes.post('/login', login)
authRoutes.post('/register', register)

export default authRoutes;