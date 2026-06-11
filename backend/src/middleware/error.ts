import { Request, Response } from 'express'

export function errorHandler(err: any, req: Request, res: Response) {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
