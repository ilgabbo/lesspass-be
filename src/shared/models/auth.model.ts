import { UserRole } from 'shared/enums/role.enum';
import { z } from 'zod';

export const BaseAuthSchema = z.object({
  email: z.string().email({ message: 'Invalid mail' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(20, { message: 'Password must be at most 20 characters' }),
  key: z.string(),
});

export const SignupAuthSchema = BaseAuthSchema.omit({ key: true }).extend({
  firstName: z
    .string({ message: 'First name required' })
    .min(2, { message: 'First name must be at least 2 characters' })
    .max(25, { message: 'First name must be at most 25 characters' }),
  lastName: z.string().min(2).max(25),
  role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
});

export type SignupModel = z.infer<typeof SignupAuthSchema>;
export type SigninModel = z.infer<typeof BaseAuthSchema>;
