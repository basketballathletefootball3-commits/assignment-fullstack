import { z } from 'zod'

export const validateEmail = (email: string) => z.string().email().safeParse(email).success
export const validatePassword = (password: string) => password.length >= 6
