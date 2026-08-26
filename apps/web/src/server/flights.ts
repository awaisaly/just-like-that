import { createHash } from 'node:crypto';
import type { FlightSearchInput } from '@jlt/shared';
import { money } from '@jlt/shared';
import type { NormalizedOffer, NormalizedSegment, SegmentAmenities } from '../lib/flight';
import { isMockOfferId, seatTypeLabel } from '../lib/flight';
import { airlineDisplayName } from '../lib/airline';
import { markUpFlightAmount } from '../lib/pricing';

const DUFFEL_API = 'https://api.duffel.com/air';

/** Wait less than the search route `maxDuration` so we return partial airline results instead of an empty timeout. */
const DEFAULT_SUPPLIER_TIMEOUT_MS = 15_000;
/** Duffel List Offers max page size is 200; keep a large cheapest page plus a fastest page. */
const CHEAPEST_OFFER_LIMIT = 150;
const FASTEST_OFFER_LIMIT = 50;

type DuffelAirport = { iata_code: string };
type DuffelAirline = { iata_code: string; name?: string };
type DuffelBaggage = {
  type: 'checked' | 'carry_on';
  quantity: number;
  /** Not in current Duffel docs for included bags; keep if a carrier sends it. */
  maximum_weight_kg?: number | null;
  weight_kg?: number | null;
};
type DuffelAvailableService = {
  type?: string;
  total_amount?: string;
  metadata?: {
    type?: 'checked' | 'carry_on' | string;
    maximum_weight_kg?: number | null;
  } | null;
};
type DuffelStop = {
  airport: DuffelAirport;
  arriving_at: string;
  departing_at: string;
  duration?: string | null;
};
type DuffelCabinAmenities = {
  wifi?: { available?: boolean; cost?: string | null } | null;
  power?: { available?: boolean } | null;
  seat?: { pitch?: string | number | null; type?: string | null } | null;
  /** Not in current Duffel TS types; parse if airline/provider sends it. */
  food?: { available?: boolean; cost?: string | null } | null;
  meal?: { available?: boolean; cost?: string | null } | null;
};
type DuffelSegmentPassenger = {
  baggages?: DuffelBaggage[];
  cabin_class?: string;
  cabin_class_marketing_name?: string | null;
  cabin?: {
    name?: string;
    marketing_name?: string | null;
    amenities?: DuffelCabinAmenities | null;
  } | null;
};
type DuffelSegment = {
  operating_carrier: DuffelAirline;
  marketing_carrier?: DuffelAirline;
  marketing_carrier_flight_number: string;
  operating_carrier_flight_number?: string;
  origin: DuffelAirport;
  destination: DuffelAirport;
  origin_terminal?: string | null;
  destination_terminal?: string | null;
  departing_at: string;
  arriving_at: string;
  duration?: string | null;
  aircraft?: { name?: string | null } | null;
  passengers?: DuffelSegmentPassenger[];
  stops?: DuffelStop[];
};
type DuffelSlice = {
  fare_brand_name?: string | null;
  duration?: string | null;
  segments: DuffelSegment[];
};
type DuffelOffer = {
  id: string;
  total_amount: string;
  total_currency: string;
  base_amount?: string | null;
  tax_amount?: string | null;
  expires_at: string;
  cabin_class?: string;
  slices: DuffelSlice[];
  available_services?: DuffelAvailableService[];
  conditions?: {
    refund_before_departure?: { allowed?: boolean | null } | null;
    change_before_departure?: { allowed?: boolean | null } | null;
  };
};

function duffelHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Duffel-Version': 'v2',
    Accept: 'application/json',
  };
}

export async function searchFlights(input: FlightSearchInput): Promise<NormalizedOffer[]> {
  const forceMock = process.env.DUFFEL_USE_MOCK === 'true';
  const token = process.env.DUFFEL_ACCESS_TOKEN;

  if (forceMock || (!token && process.env.NODE_ENV !== 'production')) {
    return mockSearch(input);
  }

  if (!token) {
    throw new Error('Flight search is not configured');
  }

  return duffelSearch(input, token);
}

export async function getFlightOffer(offerId: string): Promise<NormalizedOffer | null> {
  if (!offerId || isMockOfferId(offerId) || process.env.DUFFEL_USE_MOCK === 'true') {
    return null;
  }

  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token) {
    return null;
  }

  // Include available_services so we can read bag weight (kg) metadata when present.
  const response = await fetch(
    `${DUFFEL_API}/offers/${encodeURIComponent(offerId)}?return_available_services=true`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: duffelHeaders(token),
    },
  );

  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    console.error('Duffel get offer failed', response.status, detail);
    throw new Error('The flight provider could not load this offer');
  }

  const payload = (await response.json()) as { data: DuffelOffer };
  return normalizeDuffelOffer(payload.data);
}

function supplierTimeoutMs(): number {
  const raw = Number(process.env.DUFFEL_SUPPLIER_TIMEOUT_MS ?? DEFAULT_SUPPLIER_TIMEOUT_MS);
  if (!Number.isFinite(raw)) return DEFAULT_SUPPLIER_TIMEOUT_MS;
  return Math.min(60_000, Math.max(2_000, Math.round(raw)));
}

async function duffelSearch(
  input: FlightSearchInput,
  accessToken: string,
): Promise<NormalizedOffer[]> {
  const passengers = [
    ...Array.from({ length: input.adults }, () => ({ type: 'adult' })),
    ...Array.from({ length: input.children }, () => ({ type: 'child' })),
    ...Array.from({ length: input.infants }, () => ({ type: 'infant_without_seat' })),
  ];
  const slices = [
    {
      origin: input.origin,
      destination: input.destination,
      departure_date: input.departDate,
    },
  ];
  if (input.returnDate) {
    slices.push({
      origin: input.destination,
      destination: input.origin,
      departure_date: input.returnDate,
    });
  }

  const timeout = supplierTimeoutMs();
  const created = await fetch(
    `${DUFFEL_API}/offer_requests?return_offers=false&supplier_timeout=${timeout}`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: duffelHeaders(accessToken),
      body: JSON.stringify({
        data: {
          slices,
          passengers,
          cabin_class: input.cabin,
          max_connections: 1,
        },
      }),
    },
  );

  if (!created.ok) {
    const detail = await created.text();
    console.error('Duffel search failed', created.status, detail);
    throw new Error('The flight provider could not complete this search');
  }

  const createdPayload = (await created.json()) as { data?: { id?: string } };
  const offerRequestId = createdPayload.data?.id;
  if (!offerRequestId) {
    throw new Error('The flight provider could not complete this search');
  }

  const [cheapest, fastest] = await Promise.all([
    listDuffelOffers(accessToken, offerRequestId, 'total_amount', CHEAPEST_OFFER_LIMIT),
    listDuffelOffers(accessToken, offerRequestId, 'total_duration', FASTEST_OFFER_LIMIT),
  ]);

  return mergeDuffelOffers(cheapest, fastest).map((offer) =>
    normalizeDuffelOffer(offer, input),
  );
}

async function listDuffelOffers(
  accessToken: string,
  offerRequestId: string,
  sort: 'total_amount' | 'total_duration',
  limit: number,
): Promise<DuffelOffer[]> {
  const params = new URLSearchParams({
    offer_request_id: offerRequestId,
    sort,
    limit: String(limit),
  });
  const response = await fetch(`${DUFFEL_API}/offers?${params.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    headers: duffelHeaders(accessToken),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Duffel list offers failed', sort, response.status, detail);
    throw new Error('The flight provider could not complete this search');
  }

  const payload = (await response.json()) as { data?: DuffelOffer[] };
  return payload.data ?? [];
}

function mergeDuffelOffers(cheapest: DuffelOffer[], fastest: DuffelOffer[]): DuffelOffer[] {
  const seen = new Set<string>();
  const merged: DuffelOffer[] = [];
  for (const offer of [...cheapest, ...fastest]) {
    if (!offer.id || seen.has(offer.id)) continue;
    seen.add(offer.id);
    merged.push(offer);
  }
  return merged;
}

function normalizeDuffelOffer(
  offer: DuffelOffer,
  input?: FlightSearchInput,
): NormalizedOffer {
  const currency = offer.total_currency.toUpperCase();
  const sourceAmount = toMinorUnits(offer.total_amount);
  const totalAmount = markUpFlightAmount(sourceAmount, currency);
  const markup = totalAmount - sourceAmount;
  const baseAmount = offer.base_amount
    ? toMinorUnits(offer.base_amount)
    : Math.round(sourceAmount * 0.85);
  const taxAmount = offer.tax_amount
    ? toMinorUnits(offer.tax_amount) + markup
    : totalAmount - baseAmount;

  const firstPassenger = offer.slices[0]?.segments[0]?.passengers?.[0];
  const cabin =
    firstPassenger?.cabin?.name ??
    firstPassenger?.cabin_class ??
    offer.cabin_class ??
    input?.cabin ??
    'economy';
  const fareBrand =
    offer.slices.map((slice) => slice.fare_brand_name).find(Boolean) ??
    firstPassenger?.cabin?.marketing_name ??
    firstPassenger?.cabin_class_marketing_name ??
    undefined;

  const slices = offer.slices.map((slice) => ({
    segments: slice.segments.map(normalizeDuffelSegment),
  }));
  const amenities = slices[0]?.segments[0]?.amenities ?? unknownAmenities();

  return {
    providerOfferId: offer.id,
    slices,
    cabin,
    fareBrand: fareBrand || undefined,
    baggage: extractBaggage(offer),
    amenities,
    conditions: {
      refundable: Boolean(offer.conditions?.refund_before_departure?.allowed),
      changeable: Boolean(offer.conditions?.change_before_departure?.allowed),
    },
    price: {
      total: money(totalAmount, currency),
      base: money(baseAmount, currency),
      taxes: money(taxAmount, currency),
      source: money(sourceAmount, currency),
    },
    expiresAt: offer.expires_at,
  };
}

function normalizeDuffelSegment(segment: DuffelSegment): NormalizedSegment {
  const passenger = segment.passengers?.[0];
  const marketing = segment.marketing_carrier?.iata_code;
  const operating = segment.operating_carrier.iata_code;
  const amenities = extractAmenities(passenger);

  const carrierCode = marketing || operating;
  const carrierName =
    (marketing ? segment.marketing_carrier?.name : undefined) ||
    segment.operating_carrier.name ||
    undefined;
  const operatingName = segment.operating_carrier.name || undefined;

  return {
    carrier: carrierCode,
    carrierName: carrierName || undefined,
    flightNumber: segment.marketing_carrier_flight_number,
    operatingCarrier: operating && operating !== marketing ? operating : undefined,
    operatingCarrierName:
      operating && operating !== marketing ? operatingName : undefined,
    origin: segment.origin.iata_code,
    destination: segment.destination.iata_code,
    originTerminal: segment.origin_terminal ?? undefined,
    destinationTerminal: segment.destination_terminal ?? undefined,
    departAt: segment.departing_at,
    arriveAt: segment.arriving_at,
    durationMin: parseDurationMinutes(segment.duration),
    aircraft: segment.aircraft?.name ?? undefined,
    cabinMarketingName:
      passenger?.cabin?.marketing_name ??
      passenger?.cabin_class_marketing_name ??
      undefined,
    amenities,
    stops: (segment.stops ?? []).map((stop) => ({
      airport: stop.airport.iata_code,
      arriveAt: stop.arriving_at,
      departAt: stop.departing_at,
      durationMin: parseDurationMinutes(stop.duration),
    })),
  };
}

function unknownAmenities(): SegmentAmenities {
  return {
    meal: { included: null, label: 'Not specified by airline' },
    wifi: { available: null, label: 'Not specified by airline' },
    power: { available: null, label: 'Not specified by airline' },
    seat: { type: null, pitch: null, label: 'Not specified by airline' },
  };
}

function extractAmenities(passenger?: DuffelSegmentPassenger): SegmentAmenities {
  const raw = passenger?.cabin?.amenities;
  if (!raw) return unknownAmenities();

  return {
    meal: formatMealAmenity(raw.food ?? raw.meal),
    wifi: formatWifiAmenity(raw.wifi),
    power: formatPowerAmenity(raw.power),
    seat: formatSeatAmenity(raw.seat),
  };
}

function formatMealAmenity(
  food?: { available?: boolean; cost?: string | null } | null,
): SegmentAmenities['meal'] {
  if (!food || food.available == null) {
    return { included: null, label: 'Not specified by airline' };
  }
  if (!food.available) {
    return { included: false, label: 'Not included' };
  }
  const cost = (food.cost ?? '').toLowerCase();
  if (cost === 'paid') {
    return { included: false, label: 'Paid option' };
  }
  if (cost === 'free' || cost === 'free or paid') {
    return { included: true, label: cost === 'free' ? 'Included' : 'Included (or paid upgrade)' };
  }
  return { included: true, label: 'Included' };
}

function formatWifiAmenity(
  wifi?: { available?: boolean; cost?: string | null } | null,
): SegmentAmenities['wifi'] {
  if (!wifi || wifi.available == null) {
    return { available: null, label: 'Not specified by airline' };
  }
  if (!wifi.available) {
    return { available: false, label: 'Not available' };
  }
  const cost = (wifi.cost ?? '').toLowerCase();
  if (cost === 'free') return { available: true, label: 'Free' };
  if (cost === 'paid') return { available: true, label: 'Paid' };
  if (cost === 'free or paid') return { available: true, label: 'Free or paid' };
  return { available: true, label: 'Available' };
}

function formatPowerAmenity(
  power?: { available?: boolean } | null,
): SegmentAmenities['power'] {
  if (!power || power.available == null) {
    return { available: null, label: 'Not specified by airline' };
  }
  return {
    available: power.available,
    label: power.available ? 'Available' : 'Not available',
  };
}

function formatSeatAmenity(
  seat?: { pitch?: string | number | null; type?: string | null } | null,
): SegmentAmenities['seat'] {
  if (!seat) {
    return { type: null, pitch: null, label: 'Not specified by airline' };
  }
  const type = seat.type && seat.type !== 'n/a' ? seat.type : null;
  const pitchRaw = seat.pitch;
  const pitch =
    pitchRaw != null && String(pitchRaw) !== 'n/a' ? String(pitchRaw) : null;
  const typeLabel = seatTypeLabel(type);
  const parts = [
    typeLabel,
    pitch ? `${pitch}" pitch` : null,
  ].filter(Boolean);
  return {
    type,
    pitch,
    label: parts.length ? parts.join(' · ') : 'Not specified by airline',
  };
}

function extractBaggage(offer: DuffelOffer): { carryOn: string; checked: string } {
  // Use the first adult segment passenger allowance (airline-included bags).
  // Duffel only guarantees type + quantity here; kg is often absent.
  const bags =
    offer.slices[0]?.segments[0]?.passengers?.[0]?.baggages ??
    offer.slices
      .flatMap((slice) => slice.segments)
      .flatMap((segment) => segment.passengers?.[0]?.baggages ?? []);

  if (!bags.length) {
    return {
      carryOn: 'Not specified by airline',
      checked: 'Not specified by airline',
    };
  }

  const carryOnBags = bags.filter((bag) => bag.type === 'carry_on');
  const checkedBags = bags.filter((bag) => bag.type === 'checked');
  const carryOn = carryOnBags.reduce((sum, bag) => sum + bag.quantity, 0);
  const checked = checkedBags.reduce((sum, bag) => sum + bag.quantity, 0);

  return {
    carryOn: formatBagAllowance(
      carryOn,
      'cabin bag',
      resolveBagWeightKg(carryOnBags, offer.available_services, 'carry_on'),
    ),
    checked: formatBagAllowance(
      checked,
      'checked bag',
      resolveBagWeightKg(checkedBags, offer.available_services, 'checked'),
    ),
  };
}

function resolveBagWeightKg(
  included: DuffelBaggage[],
  services: DuffelAvailableService[] | undefined,
  type: 'checked' | 'carry_on',
): number | null {
  for (const bag of included) {
    const direct = bag.maximum_weight_kg ?? bag.weight_kg;
    if (typeof direct === 'number' && direct > 0) return direct;
  }

  // Weight usually lives on purchasable bag services, not included allowances.
  // Use the lightest matching service weight as the airline's per-bag limit.
  const weights = (services ?? [])
    .filter(
      (service) =>
        service.type === 'baggage' &&
        service.metadata?.type === type &&
        typeof service.metadata.maximum_weight_kg === 'number' &&
        service.metadata.maximum_weight_kg > 0,
    )
    .map((service) => service.metadata!.maximum_weight_kg as number)
    .sort((a, b) => a - b);

  return weights[0] ?? null;
}

function formatBagAllowance(
  quantity: number,
  label: string,
  weightKg: number | null = null,
): string {
  if (quantity <= 0) return 'Not included';
  const countLabel = quantity === 1 ? `1 ${label}` : `${quantity} ${label}s`;
  if (weightKg == null) return countLabel;
  const kg = Number.isInteger(weightKg) ? String(weightKg) : weightKg.toFixed(1);
  return quantity === 1
    ? `${countLabel} · up to ${kg} kg`
    : `${countLabel} · up to ${kg} kg each`;
}

function mockSearch(input: FlightSearchInput): NormalizedOffer[] {
  const key = createHash('sha1').update(JSON.stringify(input)).digest('hex').slice(0, 8);
  const basePrice = 18_000 + (key.charCodeAt(0) % 50) * 250;
  const carriers = [
    { iata: 'BA', flight: 216, stops: 0, durationMin: 425, departHour: 8 },
    { iata: 'EK', flight: 4, stops: 0, durationMin: 400, departHour: 14 },
    { iata: 'VS', flight: 401, stops: 1, durationMin: 555, departHour: 21 },
    { iata: 'EK', flight: 30, stops: 0, durationMin: 415, departHour: 10 },
    { iata: 'BA', flight: 106, stops: 1, durationMin: 610, departHour: 6 },
    { iata: 'FR', flight: 812, stops: 1, durationMin: 690, departHour: 17 },
  ];

  return carriers.map((carrier, index) => {
    const amount = basePrice + index * 2_600 + carrier.stops * 1_500;
    const amenities = mockAmenities(carrier.iata, input.cabin, index);
    const outbound = createMockSlice(
      input.departDate,
      input.origin,
      input.destination,
      carrier,
      amenities,
    );
    const slices = [{ segments: outbound }];

    if (input.returnDate) {
      slices.push({
        segments: createMockSlice(
          input.returnDate,
          input.destination,
          input.origin,
          {
            ...carrier,
            flight: carrier.flight + 200,
            departHour: 14,
          },
          amenities,
        ),
      });
    }

    return {
      providerOfferId: `mock_${key}_${index}`,
      slices,
      cabin: input.cabin,
      fareBrand: index % 2 === 0 ? 'Economy Saver' : 'Economy Flex',
      baggage: {
        carryOn: isLccMock(carrier.iata)
          ? '1 cabin bag · up to 10 kg'
          : '1 cabin bag · up to 7 kg',
        checked:
          index % 2 === 0
            ? 'Not included'
            : isLccMock(carrier.iata)
              ? '1 checked bag · up to 20 kg'
              : '1 checked bag · up to 23 kg',
      },
      amenities,
      conditions: {
        refundable: index % 2 === 1,
        changeable: index % 2 === 1,
      },
      price: (() => {
        const sourceAmount = amount;
        const totalAmount = markUpFlightAmount(sourceAmount, 'GBP');
        const baseAmount = Math.round(sourceAmount * 0.85);
        return {
          total: money(totalAmount, 'GBP'),
          base: money(baseAmount, 'GBP'),
          taxes: money(totalAmount - baseAmount, 'GBP'),
          source: money(sourceAmount, 'GBP'),
        };
      })(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    } satisfies NormalizedOffer;
  });
}

function isLccMock(carrier: string): boolean {
  return carrier === 'FR' || carrier === 'EZY';
}

function mockAmenities(
  carrier: string,
  cabin: string,
  index: number,
): SegmentAmenities {
  const isPremium = cabin === 'business' || cabin === 'first' || cabin === 'premium_economy';
  const isLcc = isLccMock(carrier);

  if (isLcc) {
    return {
      meal: { included: false, label: 'Not included' },
      wifi: { available: false, label: 'Not available' },
      power: { available: index % 2 === 0, label: index % 2 === 0 ? 'Available' : 'Not available' },
      seat: {
        type: 'standard',
        pitch: '29',
        label: 'Standard seat · 29" pitch',
      },
    };
  }

  return {
    meal: {
      included: true,
      label: isPremium ? 'Included (multi-course)' : 'Included',
    },
    wifi: {
      available: true,
      label: carrier === 'EK' || isPremium ? 'Free' : 'Paid',
    },
    power: { available: true, label: 'Available' },
    seat: {
      type: isPremium ? 'recliner' : 'standard',
      pitch: isPremium ? '42' : '31',
      label: isPremium ? 'Recliner seat · 42" pitch' : 'Standard seat · 31" pitch',
    },
  };
}

function createMockSlice(
  date: string,
  origin: string,
  destination: string,
  carrier: {
    iata: string;
    flight: number;
    stops: number;
    durationMin: number;
    departHour: number;
  },
  amenities: SegmentAmenities,
): NormalizedSegment[] {
  const departAt = atUtc(date, carrier.departHour, 30);
  const arriveAt = new Date(new Date(departAt).getTime() + carrier.durationMin * 60_000).toISOString();

  if (!carrier.stops) {
    return [
      {
        carrier: carrier.iata,
        carrierName: airlineDisplayName(carrier.iata),
        flightNumber: String(carrier.flight),
        origin,
        destination,
        originTerminal: '5',
        destinationTerminal: '3',
        departAt,
        arriveAt,
        durationMin: carrier.durationMin,
        aircraft: 'A350',
        cabinMarketingName: 'Economy',
        amenities,
      },
    ];
  }

  const connection = 'IST';
  const firstArrival = new Date(
    new Date(departAt).getTime() + Math.round(carrier.durationMin * 0.45) * 60_000,
  ).toISOString();
  const secondDeparture = new Date(new Date(firstArrival).getTime() + 90 * 60_000).toISOString();

  return [
    {
      carrier: carrier.iata,
      carrierName: airlineDisplayName(carrier.iata),
      flightNumber: String(carrier.flight),
      origin,
      destination: connection,
      originTerminal: '2',
      destinationTerminal: '1',
      departAt,
      arriveAt: firstArrival,
      durationMin: Math.round(carrier.durationMin * 0.45),
      aircraft: 'A350',
      cabinMarketingName: 'Economy',
      amenities,
    },
    {
      carrier: carrier.iata,
      carrierName: airlineDisplayName(carrier.iata),
      flightNumber: String(carrier.flight + 1),
      origin: connection,
      destination,
      originTerminal: '1',
      destinationTerminal: '3',
      departAt: secondDeparture,
      arriveAt,
      durationMin: Math.max(
        1,
        Math.round(
          (new Date(arriveAt).getTime() - new Date(secondDeparture).getTime()) / 60_000,
        ),
      ),
      aircraft: 'B777',
      cabinMarketingName: 'Economy',
      amenities,
    },
  ];
}

function atUtc(date: string, hour: number, minute: number): string {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
}

function toMinorUnits(value: string): number {
  return Math.round(Number.parseFloat(value) * 100);
}

function parseDurationMinutes(duration?: string | null): number {
  if (!duration) return 0;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(duration);
  if (!match) return 0;
  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
}
