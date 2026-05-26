import prisma from '../../prisma/client.js'

const PER_PAGE = 10

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

  const [announcements, total] = await Promise.all([
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
    data: announcements,
    pagination: {
      total,
      page: currentPage,
      totalPages: Math.ceil(total / PER_PAGE),
      perPage: PER_PAGE
    }
  })
}

export const getAnnouncementById = async (req, res) => {
  const id = Number(req.params.id)

  const announcement = await prisma.announcement.findUniqueOrThrow({
    where: { id }
  })

  res.json(announcement)
}

export const createAnnouncement = async (req, res) => {
  const announcement = await prisma.announcement.create({
    data: req.body
  })

  res.status(201).json(announcement)
}

export const updateAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  const announcement = await prisma.announcement.update({
    where: { id },
    data: req.body
  })

  res.json(announcement)
}

export const deleteAnnouncement = async (req, res) => {
  const id = Number(req.params.id)

  await prisma.announcement.delete({
    where: { id }
  })

  res.status(204).end()
}