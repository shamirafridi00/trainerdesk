import { prisma } from '@/lib/prisma';

/**
 * Generate a URL-safe subdomain from business name
 */
export function slugifySubdomain(businessName: string): string {
  return businessName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63); // Max subdomain length
}

/**
 * Generate a unique subdomain by checking database
 * If subdomain exists, append a number (e.g., fitness-2, fitness-3)
 */
export async function generateUniqueSubdomain(
  businessName: string
): Promise<string> {
  const baseSubdomain = slugifySubdomain(businessName);
  let subdomain = baseSubdomain;
  let counter = 2;

  // Check if subdomain exists
  while (true) {
    const existingTrainer = await prisma.trainer.findUnique({
      where: { subdomain },
    });

    if (!existingTrainer) {
      return subdomain;
    }

    // Subdomain exists, try with counter
    subdomain = `${baseSubdomain}-${counter}`;
    counter++;

    // Prevent infinite loop
    if (counter > 100) {
      throw new Error('Unable to generate unique subdomain');
    }
  }
}
