import { z } from 'zod';
import { BOOKING_STATUSES, USER_ROLES } from './enums.js';

export const moneySchema = z.object({
  amount: z.number().int(),
  currency: z.string().length(3).toUpperCase(),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const flightSearchSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  adults: z.number().int().min(1).max(9).default(1),
  children: z.number().int().min(0).max(8).default(0),
  infants: z.number().int().min(0).max(4).default(0),
  cabin: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
});

export const passengerSchema = z.object({
  type: z.enum(['adult', 'child', 'infant']),
  title: z.enum(['mr', 'mrs', 'ms', 'miss', 'dr']),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['male', 'female', 'other']),
});

export const createBookingSchema = z.object({
  offerId: z.string().min(1),
  passengers: z.array(passengerSchema).min(1),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(7),
  }),
  paymentPreference: z.enum(['full', 'installments']),
});

export const callRequestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  preferredTimeWindow: z.string().optional(),
  source: z.enum(['click_to_call', 'callback_form']).default('callback_form'),
  turnstileToken: z.string().optional(),
});

export const transitionBookingSchema = z.object({
  to: z.enum(BOOKING_STATUSES),
  note: z.string().optional(),
});

export const createInstallmentPlanSchema = z.object({
  depositAmount: z.number().int().nonnegative().optional(),
  installments: z
    .array(
      z.object({
        amount: z.number().int().positive(),
        dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }),
    )
    .min(1)
    .max(24),
});

export const recordPaymentSchema = z.object({
  amount: z.number().int().positive(),
  method: z.enum(['phone_card', 'bank_transfer', 'cash', 'other']),
  paidAt: z.string().datetime().optional(),
  note: z.string().optional(),
  paymentRef: z.string().optional(),
});

export const seoImportItemSchema = z.object({
  type: z.enum(['route', 'destination', 'airline', 'guide', 'custom']),
  slug: z.string().min(1),
  targetKeywords: z.array(z.string()).default([]),
  title: z.string().min(1),
  metaDescription: z.string().min(1),
  h1: z.string().min(1),
  faq: z
    .array(z.object({ q: z.string(), a: z.string() }))
    .optional()
    .default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  originIata: z.string().length(3).optional(),
  destinationIata: z.string().length(3).optional(),
});

export const seoImportSchema = z.object({
  pages: z.array(seoImportItemSchema).min(1),
});

export const roleSchema = z.enum(USER_ROLES);

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CallRequestInput = z.infer<typeof callRequestSchema>;
export type CreateInstallmentPlanInput = z.infer<typeof createInstallmentPlanSchema>;
export type SeoImportInput = z.infer<typeof seoImportSchema>;
