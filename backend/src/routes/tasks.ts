import { Router } from 'express'
import { prisma } from '../prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const taskSchema = z.object({ title: z.string().min(1), description: z.string().optional(), completed: z.boolean().optional() })

router.use(authenticate)

/**
 * @openapi
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *     responses:
 *       200:
 *         description: Task created
 *       401:
 *         description: Unauthorized
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = taskSchema.parse(req.body)
    const task = await prisma.task.create({ data: { title: data.title, description: data.description, userId: req.user.id } })
    res.json(task)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * @openapi
 * /api/v1/tasks:
 *   get:
 *     summary: List all tasks (users see their own, admins see all)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req: AuthRequest, res) => {
  // users see their tasks; admins see all
  if (req.user.role === 'admin') {
    const all = await prisma.task.findMany({ include: { user: { select: { id: true, email: true } } } })
    return res.json(all)
  }
  const tasks = await prisma.task.findMany({ where: { userId: req.user.id } })
  res.json(tasks)
})

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task details
 *       404:
 *         description: Task not found
 */
router.get('/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  if (req.user.role !== 'admin' && task.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  res.json(task)
})

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               completed: { type: boolean }
 *     responses:
 *       200:
 *         description: Task updated
 *       404:
 *         description: Task not found
 */
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id)
    const data = taskSchema.partial().parse(req.body)
    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) return res.status(404).json({ error: 'Not found' })
    if (req.user.role !== 'admin' && task.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    const updated = await prisma.task.update({ where: { id }, data })
    res.json(updated)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  const task = await prisma.task.findUnique({ where: { id } })
  if (!task) return res.status(404).json({ error: 'Not found' })
  if (req.user.role !== 'admin' && task.userId !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
  await prisma.task.delete({ where: { id } })
  res.json({ ok: true })
})

export default router
