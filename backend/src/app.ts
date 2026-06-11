import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import authRoutes from './routes/auth'
import taskRoutes from './routes/tasks'
import { errorHandler } from './middleware/error'

const app = express()
app.use(cors())
app.use(express.json())

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'Assignment API', version: '1.0.0', description: 'REST API with JWT auth, role-based access, and CRUD for tasks' },
    servers: [{ url: 'http://localhost:4000', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/routes/*.ts']
})

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/tasks', taskRoutes)

app.get('/', (req, res) => res.json({ ok: true }))
app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)
export default app
