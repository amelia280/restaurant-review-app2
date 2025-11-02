// src/services/restaurantApi.js

/**
 * Searches for restaurants using Overpass API (OpenStreetMap)
 * @param {string} query - Search term (e.g., "KFC", "pizza", "Maseru")
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Array>} - Array of restaurant objects
 */
export const searchRestaurants = async (query, limit = 10) => {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = query.trim().toLowerCase();
  console.log('=== SEARCHING FOR:', searchTerm, '===');
  
  // Try multiple search strategies in parallel
  const results = await Promise.all([
    searchOverpass(searchTerm, limit),
    searchNominatim(searchTerm, limit)
  ]);

  // Combine and deduplicate results
  const allRestaurants = [...results[0], ...results[1]];
  const uniqueRestaurants = deduplicateResults(allRestaurants);

  console.log('=== FINAL RESULTS:', uniqueRestaurants.length, 'restaurants ===');
  return uniqueRestaurants.slice(0, limit);
};

/**
 * Search using Overpass API with broader geographic scope
 */
const searchOverpass = async (searchTerm, limit) => {
  // Search in a large radius around Lesotho and South Africa
  const overpassQuery = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:200000,-29.5,28.5);
      node["amenity"="fast_food"](around:200000,-29.5,28.5);
      node["amenity"="cafe"](around:200000,-29.5,28.5);
      way["amenity"="restaurant"](around:200000,-29.5,28.5);
      way["amenity"="fast_food"](around:200000,-29.5,28.5);
      way["amenity"="cafe"](around:200000,-29.5,28.5);
    );
    out center ${limit * 5};
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

  try {
    console.log('Searching Overpass API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Overpass API failed:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('Overpass returned:', data.elements?.length || 0, 'total places');

    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    // Process and filter results
    let restaurants = data.elements
      .filter(element => element.tags && element.tags.name)
      .map(formatOverpassResult);

    // Filter by search term
    restaurants = filterBySearchTerm(restaurants, searchTerm);
    console.log('Overpass after filtering:', restaurants.length, 'matches');

    return restaurants;

  } catch (error) {
    console.error('Overpass error:', error);
    return [];
  }
};

/**
 * Search using Nominatim API
 */
const searchNominatim = async (searchTerm, limit) => {
  // Try multiple search variations
  const queries = [
    `${searchTerm} restaurant`,
    `${searchTerm} food`,
    `${searchTerm} cafe`,
    searchTerm
  ];

  const allResults = [];

  for (const query of queries) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&limit=50&addressdetails=1&extratags=1`;

    try {
      console.log('Searching Nominatim with query:', query);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RestaurantReviewApp/1.0 (student@limkokwing.ac.ls)'
        }
      });

      if (!response.ok) {
        console.error('Nominatim failed:', response.status);
        continue;
      }

      const data = await response.json();
      console.log('Nominatim returned:', data.length, 'places for query:', query);

      // Filter for food-related places
      const restaurants = data
        .filter(place => {
          const isFoodRelated = 
            (place.class === 'amenity' && 
             ['restaurant', 'fast_food', 'cafe', 'food_court', 'bar', 'pub'].includes(place.type)) ||
            place.type === 'restaurant' ||
            place.display_name.toLowerCase().includes('restaurant') ||
            place.display_name.toLowerCase().includes('cafe') ||
            place.display_name.toLowerCase().includes('pizza') ||
            place.display_name.toLowerCase().includes('food');
          return isFoodRelated;
        })
        .map(formatNominatimResult);

      allResults.push(...restaurants);

      // Stop if we have enough results
      if (allResults.length >= limit * 2) break;

    } catch (error) {
      console.error('Nominatim error for query', query, ':', error);
    }
  }

  console.log('Nominatim total results:', allResults.length);
  return allResults;
};

/**
 * Format Overpass API result
 */
const formatOverpassResult = (element) => {
  const lat = element.lat || element.center?.lat;
  const lon = element.lon || element.center?.lon;
  
  return {
    id: `osm-${element.id}`,
    source: 'overpass',
    name: element.tags.name,
    displayName: `${element.tags.name}${element.tags['addr:city'] ? ', ' + element.tags['addr:city'] : ''}`,
    type: element.tags.amenity || 'restaurant',
    cuisine: element.tags.cuisine || element.tags.name.toLowerCase().includes('pizza') ? 'Pizza' : 'Not specified',
    lat: lat,
    lon: lon,
    address: {
      street: element.tags['addr:street'] || 'N/A',
      city: element.tags['addr:city'] || 'N/A',
      postcode: element.tags['addr:postcode'] || 'N/A'
    },
    fullAddress: [
      element.tags['addr:street'],
      element.tags['addr:city'],
      element.tags['addr:country']
    ].filter(Boolean).join(', ') || 'Address not available',
    phone: element.tags.phone || element.tags['contact:phone'] || 'N/A',
    website: element.tags.website || element.tags['contact:website'] || null,
    openingHours: element.tags.opening_hours || 'Not available',
    osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`
  };
};

/**
 * Format Nominatim API result
 */
const formatNominatimResult = (place) => {
  return {
    id: `nom-${place.place_id}`,
    source: 'nominatim',
    name: place.display_name.split(',')[0].trim() || place.name || 'Restaurant',
    displayName: place.display_name,
    type: place.type || 'restaurant',
    cuisine: place.extratags?.cuisine || 
             (place.display_name.toLowerCase().includes('pizza') ? 'Pizza' : 'Not specified'),
    lat: parseFloat(place.lat),
    lon: parseFloat(place.lon),
    address: place.address || {},
    fullAddress: place.display_name,
    phone: place.extratags?.phone || 'N/A',
    website: place.extratags?.website || null,
    openingHours: place.extratags?.opening_hours || 'Not available',
    osmUrl: `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`
  };
};

/**
 * Filter results by search term
 */
const filterBySearchTerm = (restaurants, searchTerm) => {
  return restaurants.filter(r => 
    r.name.toLowerCase().includes(searchTerm) ||
    r.cuisine.toLowerCase().includes(searchTerm) ||
    r.type.toLowerCase().includes(searchTerm) ||
    r.displayName.toLowerCase().includes(searchTerm) ||
    (searchTerm === 'restaurant' && r.type === 'restaurant') ||
    (searchTerm === 'cafe' && r.type === 'cafe') ||
    (searchTerm === 'pizza' && (
      r.cuisine.toLowerCase().includes('pizza') ||
      r.name.toLowerCase().includes('pizza')
    ))
  );
};

/**
 * Remove duplicate results based on name and location
 */
const deduplicateResults = (restaurants) => {
  const seen = new Set();
  return restaurants.filter(r => {
    const key = `${r.name.toLowerCase()}-${r.lat?.toFixed(4)}-${r.lon?.toFixed(4)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

/**
 * Get restaurant details by ID
 */
export const getRestaurantDetails = async (restaurantId) => {
  const osmId = restaurantId.replace('osm-', '').replace('nom-', '');
  
  try {
    const url = `https://nominatim.openstreetmap.org/lookup?osm_ids=N${osmId}&format=json&addressdetails=1&extratags=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RestaurantReviewApp/1.0 (student@limkokwing.ac.ls)'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const place = data[0];
      return {
        id: restaurantId,
        name: place.display_name.split(',')[0],
        displayName: place.display_name,
        address: place.address,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        cuisine: place.extratags?.cuisine || 'Not specified',
        phone: place.extratags?.phone || 'N/A',
        website: place.extratags?.website || null,
        openingHours: place.extratags?.opening_hours || 'Not available'
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    return null;
  }
};