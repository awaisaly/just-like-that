export const BOOKING_STATUSES = [
  'draft',
  'call_requested',
  'agent_contacted',
  'awaiting_payment',
  'confirmed',
  'completed',
  'expired',
  'cancelled',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ['call_requested', 'expired', 'cancelled'],
  call_requested: ['agent_contacted', 'expired', 'cancelled'],
  agent_contacted: ['awaiting_payment', 'cancelled'],
  awaiting_payment: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  expired: [],
  cancelled: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export const USER_ROLES = ['customer', 'agent', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const INSTALLMENT_STATUSES = ['pending', 'paid', 'overdue', 'waived'] as const;
export type InstallmentStatus = (typeof INSTALLMENT_STATUSES)[number];

export const PLAN_STATUSES = [
  'draft',
  'active',
  'completed',
  'defaulted',
  'cancelled',
] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export const CALL_REQUEST_STATUSES = [
  'pending',
  'assigned',
  'contacted',
  'no_answer',
  'completed',
  'cancelled',
] as const;
export type CallRequestStatus = (typeof CALL_REQUEST_STATUSES)[number];

export const SEO_PAGE_TYPES = [
  'route',
  'destination',
  'airline',
  'guide',
  'custom',
] as const;
export type SeoPageType = (typeof SEO_PAGE_TYPES)[number];
