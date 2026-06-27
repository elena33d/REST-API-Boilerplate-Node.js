import { Router } from 'express'

import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcements.controller.js'

import {
  getAnnouncementsValidator,
  idValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator
} from '../validators/announcements.validator.js'

import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

/**
 * GET /announcements (PUBLIC)
 */
router.get('/', getAnnouncementsValidator, getAnnouncements)

/**
 * GET /announcements/:id (PUBLIC)
 */
router.get('/:id', idValidator, getAnnouncementById)

/**
 * POST /announcements (PRIVATE)
 */
router.post(
  '/',
  authenticate,
  createAnnouncementValidator,
  createAnnouncement
)

/**
 * PATCH /announcements/:id (PRIVATE + OWNER)
 */
router.patch(
  '/:id',
  authenticate,
  idValidator,
  updateAnnouncementValidator,
  updateAnnouncement
)

/**
 * DELETE /announcements/:id (PRIVATE + OWNER)
 */
router.delete(
  '/:id',
  authenticate,
  idValidator,
  deleteAnnouncement
)

export default router