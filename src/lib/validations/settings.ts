import { z } from 'zod';

export const ProfileSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional()
    .or(z.literal('')),
  timezone: z.string().min(1, 'Timezone is required'),
  profilePhoto: z.string().url().optional().or(z.literal('')),
});

export type ProfileSettingsInput = z.infer<typeof ProfileSettingsSchema>;
