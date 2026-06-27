import prisma from '../../prisma/client.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import createHttpError from 'http-errors'

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name
  }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m'
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d'
  })

  return { accessToken, refreshToken }
}

const sendTokens = async (res, user, refreshToken) => {
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id
    }
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: false
  })
}

export const register = async (req, res) => {
  const { username, password, name } = req.body

  const existingUser = await prisma.user.findUnique({
    where: { username }
  })

  if (existingUser) {
    throw createHttpError(409, 'User with this username already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name
    }
  })

  const { accessToken, refreshToken } = generateTokens(user)

  await sendTokens(res, user, refreshToken)

  res.status(201).json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    },
    accessToken,
    refreshToken
  })
}

export const login = async (req, res) => {
  const { username, password } = req.body

  const user = await prisma.user.findUnique({
    where: { username }
  })

  if (!user) {
    throw createHttpError(401, 'Invalid credentials')
  }

  const isValid = await bcrypt.compare(password, user.password)

  if (!isValid) {
    throw createHttpError(401, 'Invalid credentials')
  }

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id }
  })

  const { accessToken, refreshToken } = generateTokens(user)

  await sendTokens(res, user, refreshToken)

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    },
    accessToken,
    refreshToken
  })
}

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken

  if (!token) {
    throw createHttpError(401, 'Invalid or expired token')
  }

  let payload

  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  } catch (err) {
    throw createHttpError(401, 'Invalid or expired token')
  }

  const savedToken = await prisma.refreshToken.findUnique({
    where: { token }
  })

  if (!savedToken) {
    throw createHttpError(401, 'Invalid or expired token')
  }

  await prisma.refreshToken.delete({
    where: { token }
  })

  const user = await prisma.user.findUnique({
    where: { id: payload.id }
  })

  const { accessToken, refreshToken } = generateTokens(user)

  await sendTokens(res, user, refreshToken)

  res.json({
    accessToken,
    refreshToken
  })
}

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token }
    })
  }

  res.clearCookie('refreshToken')

  res.json({ message: 'Logged out successfully' })
}

export const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      name: true,
      createdAt: true
    }
  })

  res.json(user)
}