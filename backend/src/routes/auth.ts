import { Router } from 'express'
import { prisma } from '../prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret'

const registerSchema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional(), role: z.string().optional() })
const loginSchema = z.object({ email: z.string().email(), password: z.string() })

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: User created
 *       400:
 *         description: Validation error
 */
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const hashed = await bcrypt.hash(data.password, 10)
    const user = await prisma.user.create({ data: { email: data.email, password: hashed, name: data.name, role: data.role || 'user' } })
    res.json({ id: user.id, email: user.email })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: data.email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(data.password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
