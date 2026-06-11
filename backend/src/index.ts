import app from './app'
import { prisma } from './prisma'

const PORT = process.env.PORT || 4000

async function main() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
})
