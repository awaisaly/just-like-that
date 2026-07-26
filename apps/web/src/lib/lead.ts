import { z } from 'zod';
import { normalizedOfferSchema, travellerSummarySchema } from './flight';

export const callbackLeadSchema = z.object({
  contact: z.object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().min(7).max(30),
  }),
  preferredTime: z.string().trim().min(1).max(100),
  paymentPreference: z.enum(['full', 'installments']),
  travellers: travellerSummarySchema,
  offer: normalizedOfferSchema,
  consent: z.literal(true),
  company: z.string().max(0).optional().default(''),
});

export type CallbackLeadInput = z.infer<typeof callbackLeadSchema>;
