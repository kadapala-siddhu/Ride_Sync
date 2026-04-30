export const PREDEFINED_ROUTES = [
  {
    id: "vijayawada_route",
    name: "Vijayawada Route",
    stops: ["Vijayawada", "Mangalagiri", "Nedamaru", "Kuragallu", "SRM"]
  },
  {
    id: "guntur_route",
    name: "Guntur Route",
    stops: ["Guntur", "Pedaparimi", "Nerukonda", "SRM"]
  }
];

export const getValidRoutesForSegment = (origin, destination) => {
  // Case insensitive match
  return PREDEFINED_ROUTES.filter(route => {
    const stopsCI = route.stops.map(s => s.toLowerCase());
    const originIdx = stopsCI.indexOf(origin?.toLowerCase());
    const destIdx = stopsCI.indexOf(destination?.toLowerCase());
    // Valid if both exist on the route and are not the same (allows forward AND backward)
    return originIdx !== -1 && destIdx !== -1 && originIdx !== destIdx;
  });
};

export const getAllUniqueStops = () => {
  const stops = new Set();
  PREDEFINED_ROUTES.forEach(route => {
    route.stops.forEach(stop => stops.add(stop));
  });
  return Array.from(stops);
};

// Get all possible destinations given an origin
export const getPossibleDestinations = (origin) => {
  if (!origin) return [];
  const originLower = origin.toLowerCase();
  const destSet = new Set();
  
  PREDEFINED_ROUTES.forEach(route => {
    const stopsCI = route.stops.map(s => s.toLowerCase());
    if (stopsCI.includes(originLower)) {
      // Add all stops from this route except the origin itself
      route.stops.forEach(stop => {
        if (stop.toLowerCase() !== originLower) {
          destSet.add(stop);
        }
      });
    }
  });
  
  return Array.from(destSet);
};
