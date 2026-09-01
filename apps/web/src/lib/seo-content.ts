import { AGENCY_NAME } from './brand';

/** Richer on-page copy for high-intent UK ↔ Africa / Nigeria landings. */
export function routeAboutCopy(fromCity: string, toCity: string, origin: string, destination: string) {
  const pair = `${fromCity}–${toCity}`;
  const originCode = origin.toUpperCase();
  const destCode = destination.toUpperCase();

  if (originCode === 'LHR' && destCode === 'LOS') {
    return {
      lead: `Looking for cheap flights from London to Lagos? Compare live fares with ${AGENCY_NAME} for a flight ticket to Nigeria from London (Heathrow or Gatwick to LOS), then finalise with a UK agent — pay in instalments or in full.`,
      support: `Flights to Nigeria from London are our busiest corridor. Search Heathrow, Gatwick, Manchester and more, filter direct vs connecting options, and request a callback when you are ready to book ${pair}.`,
    };
  }

  if (originCode === 'LOS' && destCode === 'LHR') {
    return {
      lead: `Need tickets from Lagos to London? Search a cheap ticket from Lagos to London and a flight from Nigeria to London with ${AGENCY_NAME} — compare LOS to Heathrow or Gatwick, then book with a UK agent.`,
      support: `Whether you are visiting family, studying, or travelling for business, we re-confirm bags, seats, and your payment plan before ticketing. Instalments are available on many Nigeria–UK itineraries.`,
    };
  }

  const isUkToNigeria =
    /london|manchester|birmingham|edinburgh|glasgow|bristol|newcastle|leeds|east midlands/i.test(
      fromCity,
    ) && /lagos|abuja|port harcourt|enugu|kano|calabar|asaba|owerri|benin|ibadan|kaduna|jos|akure/i.test(toCity);
  const isNigeriaToUk =
    /lagos|abuja|port harcourt|enugu|kano/i.test(fromCity) &&
    /london|manchester|birmingham|edinburgh|glasgow|bristol/i.test(toCity);
  const isUkToAfrica =
    /london|manchester|birmingham/i.test(fromCity) &&
    /accra|nairobi|johannesburg|cape town|cairo|casablanca|lagos|abuja/i.test(toCity);

  if (isUkToNigeria) {
    return {
      lead: `Looking for cheap flights from ${fromCity} (${origin}) to ${toCity}, Nigeria (${destination})? Compare live fares with ${AGENCY_NAME}, then finalise with a UK agent — pay in instalments or in full.`,
      support: `UK to Nigeria is one of our busiest corridors. Search Heathrow, Gatwick, Manchester, Birmingham and more, filter direct vs connecting options, and request a callback when you are ready to book ${pair}.`,
    };
  }

  if (isNigeriaToUk) {
    return {
      lead: `Search flights from ${fromCity}, Nigeria (${origin}) to ${toCity}, UK (${destination}). ${AGENCY_NAME} helps travellers flying Nigeria to the UK compare fares and book with a real UK agent.`,
      support: `Whether you are visiting family, studying, or travelling for business, we re-confirm bags, seats, and your payment plan before ticketing. Instalments are available on many Nigeria–UK itineraries.`,
    };
  }

  if (isUkToAfrica) {
    return {
      lead: `Find cheap flights from ${fromCity} (${origin}) to ${toCity}, Africa (${destination}). Search live prices with ${AGENCY_NAME} and book through a UK agent who knows Africa routes.`,
      support: `From West Africa gateways to East and Southern Africa hubs, we help UK travellers compare airlines, stopovers, and cabin options — then set up instalments if you need to spread the cost.`,
    };
  }

  return {
    lead: `Looking for flights from ${fromCity} (${origin}) to ${toCity} (${destination})? Use search to check live availability for your dates. Prices move with airline inventory, so an ${AGENCY_NAME} agent will re-confirm the fare when you request a callback.`,
    support: `Popular with travellers planning city breaks, family visits, and longer-haul trips. Filter by direct flights, departure time, and airline once you reach the results page.`,
  };
}

export function destinationAboutCopy(city: string, country: string, iata: string, region: string) {
  if (city === 'Lagos') {
    return {
      lead: `Planning cheap flights from London to Lagos, Nigeria (${iata})? Search flights to Nigeria from London with ${AGENCY_NAME} — compare Heathrow, Gatwick, Manchester and other UK departures, then request a callback to book a flight ticket to Nigeria from London.`,
      support: `Need the other direction? We also sell tickets from Lagos to London. Filter by stops and airline on results, and ask about instalments when you speak to your agent.`,
    };
  }

  if (city === 'London' && (country === 'United Kingdom' || region === 'United Kingdom')) {
    return {
      lead: `Flying to London from Nigeria? Book a flight from Nigeria to London with ${AGENCY_NAME}. Compare tickets from Lagos to London and a cheap ticket from Lagos to London — plus Abuja and Port Harcourt — then finalise with a UK agent.`,
      support: `Family bookings, student travel, and return trips are common on this corridor. Your agent confirms seats, bags, and payment — including instalments where available.`,
    };
  }

  if (country === 'Nigeria' || region === 'Nigeria') {
    return {
      lead: `Planning cheap flights to ${city}, Nigeria (${iata}) from the UK? Search live fares with ${AGENCY_NAME}, compare London, Manchester, Birmingham and other UK departures, then request a callback to book with a UK agent.`,
      support: `Nigeria routes are a core focus for us — Lagos, Abuja, Port Harcourt and more. Filter by stops and airline on results, and ask about instalments when you speak to your agent.`,
    };
  }

  if (region === 'Africa') {
    return {
      lead: `Looking for cheap flights to ${city}, Africa (${iata}) from the UK? ${AGENCY_NAME} helps you compare live fares across popular Africa destinations, then finalise booking with a UK agent.`,
      support: `Ask about the best departure airport, baggage, and whether an instalment plan suits your travel dates. Fares change with airline inventory — we re-confirm before you pay.`,
    };
  }

  if (country === 'United Kingdom' || region === 'United Kingdom') {
    return {
      lead: `Flying to ${city}, UK (${iata}) from Nigeria or elsewhere in Africa? Search arrivals into ${city}, compare options, and book with ${AGENCY_NAME} — a UK-based agency that regularly handles Nigeria to UK travel.`,
      support: `Family bookings, student travel, and return trips are common on this corridor. Your agent confirms seats, bags, and payment — including instalments where available.`,
    };
  }

  if (country === 'Pakistan' || city === 'Islamabad') {
    return {
      lead: `Looking for cheap flights to Islamabad, Pakistan (${iata}) from the UK? Search live fares to ISB with ${AGENCY_NAME}, then request a callback to book with a UK agent — pay in instalments or in full.`,
      support: `Family visits, student travel, and business trips to Pakistan’s capital are common. Your agent re-confirms bags, seats, and the live fare before ticketing.`,
    };
  }

  return {
    lead: `Planning a trip to ${city}, ${country}? Search from your preferred airport to ${iata}, compare options, and request a callback when you are ready. An ${AGENCY_NAME} agent will re-confirm the fare before you pay.`,
    support: `Filter by stops, departure time, and airline on the results page. Need help with family bookings or instalments? Contact us.`,
  };
}
