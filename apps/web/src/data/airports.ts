import rawAirports from './airports.json';

export type Airport = {
  iata: string;
  name: string;
  city: string;
  country: string;
  popularity: number;
  lat: number | null;
  lon: number | null;
};

/** Prefer UK–Nigeria hubs when the combobox opens with an empty query. */
const popularityBoost: Record<string, number> = {
  LOS: 200,
  ABV: 195,
  PHC: 190,
  LHR: 185,
  LGW: 180,
  MAN: 175,
  BHX: 170,
};

/**
 * OurAirports often stores the physical municipality (e.g. ISB → Attock).
 * Prefer the metro city travellers actually search for.
 */
const metroCityByIata: Record<string, string> = {
  ISB: 'Islamabad',
  LHR: 'London',
  LGW: 'London',
  LCY: 'London',
  STN: 'London',
  LTN: 'London',
  SEN: 'London',
  BQH: 'London',
  LON: 'London',
  DXB: 'Dubai',
  DWC: 'Dubai',
  CDG: 'Paris',
  ORY: 'Paris',
  BVA: 'Paris',
  MXP: 'Milan',
  LIN: 'Milan',
  BGY: 'Milan',
  FCO: 'Rome',
  CIA: 'Rome',
  FRA: 'Frankfurt',
  HHN: 'Frankfurt',
  JFK: 'New York',
  LGA: 'New York',
  EWR: 'New York',
  IST: 'Istanbul',
  SAW: 'Istanbul',
  MAN: 'Manchester',
  BHX: 'Birmingham',
  LOS: 'Lagos',
  ABV: 'Abuja',
  PHC: 'Port Harcourt',
  ENU: 'Enugu',
  BNI: 'Benin City',
  QOW: 'Owerri',
  EMA: 'East Midlands',
  LHE: 'Lahore',
  KHI: 'Karachi',
};

function cleanCityLabel(city: string, name: string, iata: string): string {
  const metro = metroCityByIata[iata];
  if (metro) return metro;
  if (/^London\b/i.test(name)) return 'London';
  const cleaned = city
    .replace(/\(.*?\)/g, ' ')
    .replace(/（.*?）/g, ' ')
    .split(',')[0]
    ?.replace(/\s+/g, ' ')
    .trim();
  return cleaned || city;
}

export const airports = (rawAirports as Airport[]).map((airport) => {
  const boost = popularityBoost[airport.iata];
  const city = cleanCityLabel(airport.city, airport.name, airport.iata);
  return {
    ...airport,
    city,
    popularity: boost ? Math.max(airport.popularity, boost) : airport.popularity,
  };
});

const byIata = new Map(airports.map((airport) => [airport.iata, airport]));

const regionNames =
  typeof Intl !== 'undefined' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

export function countryLabel(code: string): string {
  if (!code) return '';
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

export function findAirport(iata: string): Airport | undefined {
  const code = iata.trim().toUpperCase();
  return byIata.get(code);
}

export function isAllAirportsEntry(airport: Airport): boolean {
  return /all airports/i.test(airport.name);
}

/** Collapse "Dubai(Jebel Ali)" → "dubai" for metro grouping. */
export function normalizeCityName(city: string): string {
  return city.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

export type NearbyAirport = {
  airport: Airport;
  km: number;
};

export type AirportGroup = {
  key: string;
  city: string;
  country: string;
  /** Metro / all-airports code when present (e.g. LON). */
  allAirports: Airport | null;
  airports: Airport[];
  nearby: NearbyAirport[];
};

export type AirportPickItem =
  | { kind: 'city'; group: AirportGroup; pick: Airport }
  | { kind: 'airport'; group: AirportGroup; airport: Airport }
  | { kind: 'nearby'; group: AirportGroup; airport: Airport; km: number };

/**
 * Match priority for From/To search:
 * 1. IATA code
 * 2. City / airport name
 * 3. Country
 *
 * Popularity is only a tie-breaker within the same tier (gaps keep tiers strict).
 */
function scoreAirport(airport: Airport, q: string): number {
  if (!q) return airport.popularity;

  const iata = airport.iata.toLowerCase();
  const city = airport.city.toLowerCase();
  const cityNorm = normalizeCityName(airport.city);
  const name = airport.name.toLowerCase();
  const country = airport.country.toLowerCase();
  const countryName = countryLabel(airport.country).toLowerCase();
  const pop = airport.popularity;

  // 1) IATA
  if (iata === q) return 3_000 + pop;
  if (iata.startsWith(q)) return 2_800 + pop;
  if (q.length >= 2 && iata.includes(q)) return 2_600 + pop;

  // 2) City & airport name
  if (cityNorm === q || city === q) return 2_000 + pop;
  if (cityNorm.startsWith(q) || city.startsWith(q)) return 1_800 + pop;
  if (name.startsWith(q)) return 1_600 + pop;
  if (cityNorm.includes(q) || city.includes(q)) return 1_400 + pop;
  if (name.includes(q)) return 1_200 + pop;

  // 3) Country (name or ISO code)
  if (countryName === q || country === q) return 800 + pop;
  if (countryName.startsWith(q) || country.startsWith(q)) return 600 + pop;
  if (countryName.includes(q)) return 400 + pop;

  return 0;
}

function isIataMatchScore(score: number): boolean {
  return score >= 2_600;
}

function isCountryMatchScore(score: number): boolean {
  return score > 0 && score < 1_200;
}

function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

function groupCentroid(members: Airport[]): { lat: number; lon: number } | null {
  const points = members.filter(
    (a): a is Airport & { lat: number; lon: number } =>
      a.lat != null && a.lon != null && !isAllAirportsEntry(a),
  );
  if (!points.length) return null;
  const lat = points.reduce((sum, a) => sum + a.lat, 0) / points.length;
  const lon = points.reduce((sum, a) => sum + a.lon, 0) / points.length;
  return { lat, lon };
}

function findNearby(
  center: { lat: number; lon: number },
  country: string,
  excludeIatas: Set<string>,
  excludeKey: string,
  limit = 4,
  maxKm = 100,
): NearbyAirport[] {
  const found: NearbyAirport[] = [];
  for (const airport of airports) {
    if (excludeIatas.has(airport.iata)) continue;
    if (isAllAirportsEntry(airport)) continue;
    if (airport.country !== country) continue;
    if (airport.lat == null || airport.lon == null) continue;
    if (airport.popularity < 25) continue;
    const key = `${normalizeCityName(airport.city)}|${airport.country}`;
    if (key === excludeKey) continue;
    const km = haversineKm(center, { lat: airport.lat, lon: airport.lon });
    if (km > maxKm || km < 1) continue;
    found.push({ airport, km: Math.round(km) });
  }

  return found
    .sort(
      (a, b) =>
        a.km - b.km || b.airport.popularity - a.airport.popularity,
    )
    .slice(0, limit);
}

function groupAirports(list: Airport[]): AirportGroup[] {
  const map = new Map<string, Airport[]>();
  for (const airport of list) {
    const key = `${normalizeCityName(airport.city)}|${airport.country}`;
    const bucket = map.get(key);
    if (bucket) bucket.push(airport);
    else map.set(key, [airport]);
  }

  const groups: AirportGroup[] = [];
  for (const [key, members] of map) {
    const allAirports = members.find(isAllAirportsEntry) ?? null;
    const cityAirports = members
      .filter((a) => !isAllAirportsEntry(a))
      .sort((a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name));
    if (!allAirports && cityAirports.length === 0) continue;

    const labelCity =
      allAirports?.city ?? cityAirports[0]!.city.replace(/\(.*?\)/g, '').trim();

    groups.push({
      key,
      city: labelCity,
      country: allAirports?.country ?? cityAirports[0]!.country,
      allAirports,
      airports: cityAirports,
      nearby: [],
    });
  }

  return groups;
}

function attachNearby(groups: AirportGroup[]): AirportGroup[] {
  const excludeAll = new Set<string>();
  for (const group of groups) {
    if (group.allAirports) excludeAll.add(group.allAirports.iata);
    for (const airport of group.airports) excludeAll.add(airport.iata);
  }

  return groups.map((group) => {
    const members = [
      ...(group.allAirports ? [group.allAirports] : []),
      ...group.airports,
    ];
    const center = groupCentroid(members);
    if (!center) return group;
    return {
      ...group,
      nearby: findNearby(center, group.country, excludeAll, group.key),
    };
  });
}

function groupScore(group: AirportGroup, q: string): number {
  const candidates = [
    ...(group.allAirports ? [group.allAirports] : []),
    ...group.airports,
  ];
  return Math.max(...candidates.map((a) => scoreAirport(a, q)), 0);
}

function sortAirportsForQuery(airportsList: Airport[], q: string): Airport[] {
  if (!q) {
    return [...airportsList].sort(
      (a, b) => b.popularity - a.popularity || a.name.localeCompare(b.name),
    );
  }
  return [...airportsList].sort(
    (a, b) =>
      scoreAirport(b, q) - scoreAirport(a, q) ||
      b.popularity - a.popularity ||
      a.name.localeCompare(b.name),
  );
}

export function searchAirportGroups(query: string, maxGroups = 8): AirportGroup[] {
  const q = query.trim().toLowerCase();

  if (!q) {
    const popular = [...airports]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 40);
    return groupAirports(popular)
      .sort((a, b) => groupScore(b, '') - groupScore(a, ''))
      .slice(0, maxGroups);
  }

  const matched = airports.filter((airport) => scoreAirport(airport, q) > 0);
  const groups = groupAirports(matched)
    .map((group) => ({
      ...group,
      airports: sortAirportsForQuery(group.airports, q),
    }))
    .sort(
      (a, b) =>
        groupScore(b, q) - groupScore(a, q) || a.city.localeCompare(b.city),
    )
    .slice(0, maxGroups);

  // Nearby is useful for IATA/city hits; skip for country-only matches.
  const forNearby = groups.filter((group) => !isCountryMatchScore(groupScore(group, q)));
  const nearbyByKey = new Map(attachNearby(forNearby).map((group) => [group.key, group.nearby]));
  return groups.map((group) => ({
    ...group,
    nearby: nearbyByKey.get(group.key) ?? [],
  }));
}

/** Flatten groups into keyboard-navigable picks (IATA hits first, then city/airports). */
export function flattenAirportPicks(
  groups: AirportGroup[],
  query = '',
): AirportPickItem[] {
  const q = query.trim().toLowerCase();
  const items: AirportPickItem[] = [];

  for (const group of groups) {
    const best = group.airports[0];
    const bestScore = best ? scoreAirport(best, q) : 0;
    const iataHit = Boolean(q) && best && isIataMatchScore(bestScore);
    const showCityRow = Boolean(group.allAirports || group.airports.length > 1);

    // When the query matches an IATA code, surface that airport before "All airports".
    if (iataHit && best) {
      items.push({ kind: 'airport', group, airport: best });
      if (showCityRow) {
        const pick = group.allAirports ?? group.airports[0]!;
        items.push({ kind: 'city', group, pick });
      }
      for (const airport of group.airports) {
        if (airport.iata === best.iata) continue;
        items.push({ kind: 'airport', group, airport });
      }
    } else {
      if (showCityRow) {
        const pick = group.allAirports ?? group.airports[0]!;
        items.push({ kind: 'city', group, pick });
      }
      for (const airport of group.airports) {
        items.push({ kind: 'airport', group, airport });
      }
    }

    for (const nearby of group.nearby) {
      items.push({ kind: 'nearby', group, airport: nearby.airport, km: nearby.km });
    }
  }
  return items;
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [...airports].sort((a, b) => b.popularity - a.popularity).slice(0, Math.min(limit, 30));
  }

  return airports
    .map((airport) => ({ airport, score: scoreAirport(airport, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.airport.city.localeCompare(b.airport.city))
    .slice(0, limit)
    .map((item) => item.airport);
}

export function airportSelectionLabel(airport: Airport): { title: string; subtitle: string } {
  if (isAllAirportsEntry(airport)) {
    return {
      title: airport.city.replace(/\(.*?\)/g, '').trim(),
      subtitle: 'All airports',
    };
  }
  return {
    title: `${airport.city.replace(/\(.*?\)/g, '').trim()} (${airport.iata})`,
    subtitle: airport.name,
  };
}

/** Compact place label for search summaries, e.g. "London (LHR), GB". */
export function formatAirportPlace(airport: Airport): string {
  const city = airport.city.replace(/\(.*?\)/g, '').trim();
  const country = airport.country.toUpperCase();
  if (isAllAirportsEntry(airport)) {
    return `${city}, ${country}`;
  }
  return `${city} (${airport.iata}), ${country}`;
}

export function formatDistanceKm(km: number): string {
  return `${km} km away`;
}
