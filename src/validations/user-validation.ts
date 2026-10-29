import { z } from 'zod';

export const RegisterUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Format email tidak valid').max(255),
  password: z.string().min(1, 'Password is required').max(255),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
