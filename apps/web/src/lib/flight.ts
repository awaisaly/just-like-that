import { z } from 'zod';
import { moneySchema } from '@jlt/shared';

const isoDateTime = z
  .string()
  .min(10)
  .max(40)
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid date-time');

export const technicalStopSchema = z.object({
  airport: z.string().length(3),
  arriveAt: isoDateTime,
  departAt: isoDateTime,
  durationMin: z.number().int().nonnegative(),
});

/** Onboard cabin amenities for a segment (from airline / Duffel when available). */
export const segmentAmenitiesSchema = z.object({
  meal: z.object({
    included: z.boolean().nullable(),
    label: z.string().max(120),
  }),
  wifi: z.object({
    available: z.boolean().nullable(),
    label: z.string().max(120),
  }),
  power: z.object({
    available: z.boolean().nullable(),
    label: z.string().max(120),
  }),
  seat: z.object({
    type: z.string().max(40).nullable(),
    pitch: z.string().max(20).nullable(),
    label: z.string().max(120),
  }),
});

export const normalizedSegmentSchema = z.object({
  carrier: z.string().min(1).max(3),
  carrierName: z.string().max(80).optional(),
  flightNumber: z.string().min(1).max(10),
  operatingCarrier: z.string().min(1).max(3).optional(),
  operatingCarrierName: z.string().max(80).optional(),
  origin: z.string().length(3),
  destination: z.string().length(3),
  originTerminal: z.string().max(10).optional(),
  destinationTerminal: z.string().max(10).optional(),
  departAt: isoDateTime,
  arriveAt: isoDateTime,
  durationMin: z.number().int().nonnegative(),
  aircraft: z.string().max(100).optional(),
  cabinMarketingName: z.string().max(80).optional(),
  amenities: segmentAmenitiesSchema.optional(),
  stops: z.array(technicalStopSchema).max(4).optional(),
});

export const normalizedOfferSchema = z.object({
  providerOfferId: z.string().min(1).max(200),
  slices: z
    .array(
      z.object({
        segments: z.array(normalizedSegmentSchema).min(1).max(8),
      }),
    )
    .min(1)
    .max(2),
  cabin: z.string().min(1).max(40),
  fareBrand: z.string().max(100).optional(),
  baggage: z.object({
    carryOn: z.string().max(200),
    checked: z.string().max(200),
  }),
  /** Offer-level summary of onboard inclusions (from the primary outbound segment). */
  amenities: segmentAmenitiesSchema.optional(),
  conditions: z.object({
    refundable: z.boolean(),
    changeable: z.boolean(),
  }),
  price: z.object({
    total: moneySchema,
    base: moneySchema,
    taxes: moneySchema,
    source: moneySchema,
    /** Instalment-only service fee; not included in `total` (listed fare). */
    serviceFee: moneySchema.optional(),
    fxRate: z.number().positive().optional(),
    convertedAt: isoDateTime.optional(),
  }),
  expiresAt: isoDateTime,
});

export const travellerSummarySchema = z.object({
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(8),
  infants: z.number().int().min(0).max(4),
  cabin: z.enum(['economy', 'premium_economy', 'business', 'first']),
});

export type TechnicalStop = z.infer<typeof technicalStopSchema>;
export type SegmentAmenities = z.infer<typeof segmentAmenitiesSchema>;
export type NormalizedSegment = z.infer<typeof normalizedSegmentSchema>;
export type NormalizedOffer = z.infer<typeof normalizedOfferSchema>;
export type TravellerSummary = z.infer<typeof travellerSummarySchema>;

const SEAT_TYPE_LABELS: Record<string, string> = {
  standard: 'Standard seat',
  extra_legroom: 'Extra legroom',
  skycouch: 'Skycouch',
  recliner: 'Recliner seat',
  angle_flat: 'Angle-flat seat',
  full_flat_pod: 'Full-flat pod',
  private_suite: 'Private suite',
};

export function seatTypeLabel(type: string | null | undefined): string | null {
  if (!type) return null;
  return SEAT_TYPE_LABELS[type] ?? type.replaceAll('_', ' ');
}

export type FlightSelection = {
  offer: NormalizedOffer;
  travellers: TravellerSummary;
};

export function isMockOfferId(offerId: string): boolean {
  return offerId.startsWith('mock_');
}
