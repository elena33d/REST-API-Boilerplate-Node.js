import prisma from '../../prisma/client.js'
import createHttpError from 'http-errors'

const PER_PAGE = 10

// GET /announcements (PUBLIC)
export const getAnnouncements = async (req, res) => {
  const { search, sort, page = 1 } = req.query

  const currentPage = Number(page)

  const where = {}

  if (search && search.trim()) {
    where.title = {
      contains: search,
      mode: 'insensitive'
    }
  }

  const orderBy = {
    createdAt: sort === 'oldest' ? 'asc' : 'desc'
  }

  const skip = (currentPage - 1) * PER_PAGE

  const [data, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      orderBy,
      skip,
      take: PER_PAGE
    }),

    prisma.announcement.count({
      where
    })
  ])

  res.json({
    data,
    pagination: {
      total,
      page: currentPage,
      totalPages: Math.ceil(total / PER_PAGE),
      perPage: PER_PAGE
    }
  })
}

// GET /announcements/:id (PUBLIC)
export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id)

  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id }
  })

  res.json(announcement)
}

// POST /announcements (PRIVATE)
export const createAnnouncement = async (req, res) => {
  const userId = req.user?.id

  if (!userId) {
    throw createHttpError(401, 'Unauthorized')
  }

  const announcement = await prisma.announcement.create({
    data: {
      ...req.body,
      userId
    }
  })

  res.status(201).json(announcement)
}

// PATCH /announcements/:id (PRIVATE + OWNER)
export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id)
  const userId = req.user?.id

  if (!userId) {
    throw createHttpError(401, 'Unauthorized')
  }

  const existing = await prisma.announcement.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createHttpError(404, 'Not found')
  }

  if (existing.userId !== userId) {
    throw createHttpError(403, 'Access denied')
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: req.body
  })

  res.json(updated)
}

// DELETE /announcements/:id (PRIVATE + OWNER)
export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id)
  const userId = req.user?.id

  if (!userId) {
    throw createHttpError(401, 'Unauthorized')
  }

  const existing = await prisma.announcement.findUnique({
    where: { id }
  })

  if (!existing) {
    throw createHttpError(404, 'Not found')
  }

  if (existing.userId !== userId) {
    throw createHttpError(403, 'Access denied')
  }

  await prisma.announcement.delete({
    where: { id }
  })

  res.status(204).end()
}