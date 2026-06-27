import { Router } from 'express'
import {
  register,
  login,
  refresh,
  logout,
  me
} from '../controllers/auth.controller.js'

import {
  registerValidator,
  loginValidator,
  refreshValidator
} from '../validators/auth.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/register', registerValidator, register)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/login', loginValidator, login)

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh token
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/refresh', refreshValidator, refresh)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     responses:
 *       200:
 *         description: OK
 */
router.post('/logout', authenticate, logout)

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/me', authenticate, me)

export default router