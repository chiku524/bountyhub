import { ActionFunction, json } from '@remix-run/cloudflare';
import { z } from 'zod';
import { rateUser } from '~/utils/integrity.server';
import { createDb } from '~/utils/db.server';
import { getUser } from '~/utils/auth.server';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

const RateUserSchema = z.object({
  ratedUserId: z.string().min(1, 'User ID is required'),
  rating: z.number().min(1).max(10, 'Rating must be between 1 and 10'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be less than 500 characters'),
  context: z.string().min(1, 'Context is required'),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

export const action: ActionFunction = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const db = createDb((context as any).env.DB);
    const user = await getUser(request, db);
    if (!user) {
      return json({ error: 'User not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const data = {
      ratedUserId: formData.get('ratedUserId') as string,
      rating: parseInt(formData.get('rating') as string),
      reason: formData.get('reason') as string,
      context: formData.get('context') as string,
      referenceId: formData.get('referenceId') as string || undefined,
      referenceType: formData.get('referenceType') as string || undefined,
    };

    const validatedData = RateUserSchema.parse(data);
    await rateUser(db, user, validatedData);

    return json({ 
      success: true, 
      message: 'User rated successfully' 
    });

  } catch (error) {
    console.error('Rating error:', error);
    
    if (error instanceof z.ZodError) {
      return json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }

    if (error instanceof Error) {
      return json({ 
        error: error.message 
      }, { status: 400 });
    }

    return json({ 
      error: 'An unexpected error occurred. Please try again.' 
    }, { status: 500 });
  }
}; 