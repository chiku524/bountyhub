import { ActionFunction, json } from '@remix-run/node';
import { z } from 'zod';
import { reportViolation } from '~/utils/integrity.server';

const ReportViolationSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  violationType: z.string().min(1, 'Violation type is required'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  evidence: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
});

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const data = {
      targetUserId: formData.get('targetUserId') as string,
      violationType: formData.get('violationType') as string,
      description: formData.get('description') as string,
      evidence: formData.get('evidence') as string || undefined,
      referenceId: formData.get('referenceId') as string || undefined,
      referenceType: formData.get('referenceType') as string || undefined,
    };

    const validatedData = ReportViolationSchema.parse(data);
    const violation = await reportViolation(request, validatedData);

    return json({ 
      success: true, 
      violation,
      message: 'Violation reported successfully' 
    });

  } catch (error) {
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
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}; 