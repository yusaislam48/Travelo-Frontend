let map, service;

// Language and currency globals
let selectedLanguage = 'bn'; // Default to Bangla
let selectedCurrency = 'BDT'; // Default to BDT

// Handle section tabs
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.section-tab');
  const sections = ['mapSection', 'hotelsSection', 'restaurantsSection', 'itinerarySection'];

  // Initially hide all sections except map
  sections.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.style.display = id === 'mapSection' ? 'block' : 'none';
    }
  });

  // Tab click handlers
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sectionId = tab.dataset.section + 'Section';
      sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.style.display = id === sectionId ? 'block' : 'none';
        }
      });
    });
  });
});

document.getElementById('tripForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const origin = document.getElementById('origin').value;
  const destination = document.getElementById('destination').value;
  const date = document.getElementById('date').value;
  const language = document.getElementById('langSelect').value;  
  const currency = document.getElementById('currencySelect').value;

  // Reset UI
  document.getElementById('funnyLoader').style.display = 'block';
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('resultBox').style.display = 'none';
  document.getElementById('hotelsList').innerHTML = '';
  document.getElementById('restaurantsList').innerHTML = '';
  
  try {
    // Fetch trip plan
    const response = await fetch('https://travelo-backend-production-454e.up.railway.app/api/plan-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, date, language, currency })
    });

    const data = await response.json();
    
    if (data.result) {
      // Show results container
      document.getElementById('resultBox').style.display = 'block';
      
      // Initialize map and fetch places
      initializeMapAndPlaces(destination);
      
      // Display itinerary
      document.getElementById('itineraryContent').innerHTML = marked.parse(data.result);
      
      // Fetch additional data
      await Promise.all([
        fetchWeather(destination),
        fetchDistanceAndDuration(origin, destination)
      ]);
    } else {
      throw new Error(data.error || 'Failed to get trip plan');
    }
  } catch (err) {
    document.getElementById('errorBox').style.display = 'block';
    document.getElementById('errorBox').innerText = 'Error: ' + err.message;
  } finally {
    document.getElementById('funnyLoader').style.display = 'none';
  }
});

async function initializeMapAndPlaces(destination) {
  const geocoder = new google.maps.Geocoder();
  
  try {
    const results = await new Promise((resolve, reject) => {
      geocoder.geocode({ address: destination }, (results, status) => {
        if (status === "OK") resolve(results);
        else reject(new Error('Geocoding failed'));
      });
    });

    const location = results[0].geometry.location;
    map.setCenter(location);
    map.setZoom(13);

    // Add destination marker
    new google.maps.Marker({
      map,
      position: location,
      title: destination,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#2563eb",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      }
    });

    // Search for hotels and restaurants
    service = new google.maps.places.PlacesService(map);
    
    // Fetch hotels
    const hotels = await searchNearbyPlaces(location, "lodging");
    displayHotels(hotels);
    hotels.forEach(place => addPlaceMarker(place, "hotel"));

    // Fetch restaurants
    const restaurants = await searchNearbyPlaces(location, "restaurant");
    displayRestaurants(restaurants);
    restaurants.forEach(place => addPlaceMarker(place, "restaurant"));

  } catch (error) {
    console.error('Error initializing map:', error);
    document.getElementById('errorBox').style.display = 'block';
    document.getElementById('errorBox').innerText = 'Error loading map: ' + error.message;
  }
}

function searchNearbyPlaces(location, type) {
  return new Promise((resolve, reject) => {
    service.nearbySearch({
      location: location,
      radius: type === 'lodging' ? 15000 : 5000,
      type: type
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        resolve(results);
      } else {
        reject(new Error(`Failed to fetch ${type}s`));
      }
    });
  });
}

function addPlaceMarker(place, type) {
  const icon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 8,
    fillColor: type === "hotel" ? "#f59e0b" : "#10b981",
    fillOpacity: 1,
    strokeColor: "#ffffff",
    strokeWeight: 2,
  };

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name,
    icon: icon
  });

  // Add click listener for info window
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div style="padding: 8px;">
        <h5 style="margin: 0 0 8px 0;">${place.name}</h5>
        <p style="margin: 0 0 4px 0;">${place.vicinity}</p>
        ${place.rating ? `<p style="margin: 0;">Rating: ⭐ ${place.rating}</p>` : ''}
      </div>
    `
  });

  marker.addListener('click', () => {
    infoWindow.open(map, marker);
  });
}

function displayHotels(hotels) {
  const container = document.getElementById('hotelsList');
  container.innerHTML = hotels.length ? '' : '<p class="text-muted">No hotels found in this area.</p>';

  hotels.slice(0, 6).forEach((hotel) => {
    const photoUrl = hotel.photos?.[0]?.getUrl({ maxWidth: 400 }) || 'https://via.placeholder.com/400x200?text=No+Image';
    const rating = hotel.rating || 0;
    const stars = '⭐'.repeat(Math.round(rating));
    const priceLevel = hotel.price_level ? '💰'.repeat(hotel.price_level) : "N/A";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.vicinity)}`;

    container.innerHTML += `
      <div class="place-card">
        <img src="${photoUrl}" alt="${hotel.name}" class="place-card-image" loading="lazy">
        <div class="place-card-content">
          <h4 class="place-card-title">${hotel.name}</h4>
          <p class="place-card-info">${hotel.vicinity}</p>
          <div class="place-card-rating">
            <span class="rating-stars">${stars}</span>
            <span>(${rating})</span>
          </div>
          <p class="place-card-info">Price Level: ${priceLevel}</p>
          <a href="${mapsUrl}" target="_blank" class="place-card-link">
            View on Google Maps
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
          </a>
        </div>
      </div>
    `;
  });
}

function displayRestaurants(restaurants) {
  const container = document.getElementById('restaurantsList');
  container.innerHTML = restaurants.length ? '' : '<p class="text-muted">No restaurants found in this area.</p>';

  restaurants.slice(0, 6).forEach((restaurant) => {
    const photoUrl = restaurant.photos?.[0]?.getUrl({ maxWidth: 400 }) || 'https://via.placeholder.com/400x200?text=No+Image';
    const rating = restaurant.rating || 0;
    const stars = '⭐'.repeat(Math.round(rating));
    const priceLevel = restaurant.price_level ? '💰'.repeat(restaurant.price_level) : "N/A";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.vicinity)}`;

    container.innerHTML += `
      <div class="place-card">
        <img src="${photoUrl}" alt="${restaurant.name}" class="place-card-image" loading="lazy">
        <div class="place-card-content">
          <h4 class="place-card-title">${restaurant.name}</h4>
          <p class="place-card-info">${restaurant.vicinity}</p>
          <div class="place-card-rating">
            <span class="rating-stars">${stars}</span>
            <span>(${rating})</span>
          </div>
          <p class="place-card-info">Price Level: ${priceLevel}</p>
          <a href="${mapsUrl}" target="_blank" class="place-card-link">
            View on Google Maps
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
              <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
            </svg>
          </a>
        </div>
      </div>
    `;
  });
}

async function fetchWeather(city) {
  try {
    const keyRes = await fetch('https://travelo-backend-production-454e.up.railway.app/api/config/weather-key');
    const keyData = await keyRes.json();
    const weatherApiKey = keyData.key;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
      throw new Error(data.message || "Weather fetch error");
    }

    const weatherHtml = `
      <div class="weather-temp">
        ${Math.round(data.main.temp)}°C
      </div>
      <div class="weather-info">
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" width="64" />
        <div>${data.weather[0].description}</div>
        <div>Humidity: ${data.main.humidity}%</div>
        <div>Wind: ${data.wind.speed} m/s</div>
      </div>
    `;
    
    document.getElementById('weatherContent').innerHTML = weatherHtml;
    document.getElementById('weatherBox').style.display = 'block';
  } catch (err) {
    console.error("Weather fetch failed:", err);
  }
}

function fetchDistanceAndDuration(origin, destination) {
  const directionsService = new google.maps.DirectionsService();

  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const route = result.routes[0].legs[0];
        document.getElementById('distanceValue').textContent = route.distance.text;
        document.getElementById('durationValue').textContent = route.duration.text;
        document.getElementById('distanceBox').style.display = 'flex';
      } else {
        console.error("Directions request failed due to", status);
      }
    }
  );
}

// Google Maps initialization
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: { lat: 23.8103, lng: 90.4125 },
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  });
};

// Google Maps API loader
async function loadGoogleMapsScript() {
  try {
    const res = await fetch('https://travelo-backend-production-454e.up.railway.app/api/config/maps-key');
    const data = await res.json();
    const apiKey = data.key;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  } catch (err) {
    console.error("Failed to load Google Maps API key:", err);
    document.getElementById('errorBox').style.display = 'block';
    document.getElementById('errorBox').innerText = 'Error loading Google Maps: ' + err.message;
  }
}

// Initialize Google Maps when the page loads
loadGoogleMapsScript();

// Handle language selection
document.querySelectorAll('#languageDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    selectedLanguage = item.getAttribute('data-lang');
    document.getElementById('languageDropdown').textContent = `🌐 ${item.textContent}`;
  });
});

// Handle currency selection
document.querySelectorAll('#currencyDropdown .dropdown-item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    selectedCurrency = item.getAttribute('data-currency');
    document.getElementById('currencyDropdown').textContent = `💱 ${item.textContent}`;
  });
});

async function fetchWeatherKey() {
  try {
    const keyRes = await fetch('https://travelo-backend-production-454e.up.railway.app/api/config/weather-key');
    const keyData = await keyRes.json();
    return keyData.key;
  } catch (error) {
    console.error('Error fetching weather API key:', error);
    return null;
  }
} 