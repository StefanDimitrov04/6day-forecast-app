const searchButton = document.querySelector('.search-btn');
const cityNameInput = document.querySelector('.city-input');
const divWeatherCard = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const currentLocationButton = document.querySelector('.location-btn');

const apiKEY = 'dc6cc46c5d59cf6e1be95529a0ce71b5';

const errorContainer = document.querySelector('.error-container');
const errorMessage = document.querySelector('.error-message');

//layouts for current weather and for the next 6 days
const createCardForDay = (cityName, cardForDay, index) => {
  if(index === 0) {
    return `
    <div class="details">
    <h2>${cityName} (${cardForDay.dt_txt.split(" ")[0]})</h2>
    <h6>Temperature: ${(Number(cardForDay.main.temp) - 273.15).toFixed(2)}°C</h6>
    <h6>Wind: ${cardForDay.wind.speed} M/S</h6>
    <h6>Humidity: ${cardForDay.main.humidity}%</h6>
  </div>
  <div class="icon">
  <img src="https://openweathermap.org/img/wn/${cardForDay.weather[0].icon}.png" alt="weather-icon">
  <h4>${cardForDay.weather[0].description}</h4>
</div>
    `;
  } else {
   return `
    <li class="card">
    <h3>${cardForDay.dt_txt.split(" ")[0]}</h3>
    <img src="https://openweathermap.org/img/wn/${cardForDay.weather[0].icon}.png" alt="weather-icon">
    <h6>Temp:${(Number(cardForDay.main.temp) - 273.15).toFixed(2)}°C</h6>
    <h6>Wind: ${cardForDay.wind.speed} M/S</h6>
    <h6>Humidity: ${cardForDay.main.humidity}%</h6>
  </li>
    `;
  }
};

//getting city from the value of the search input
async function getCity(city) {
  try {
    const currentCity = city.trim();
    if(!currentCity) return;

    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const {lat, lon, name } = data[0];
    getWeatherDetails(lat, lon, name);
  } catch (error) {
    errorMessage.textContent = "Invalid city name!";
    errorContainer.style.display = 'block';
    cityNameInput.value = "";
    setTimeout(function() {
      errorContainer.style.display = "none";
    }, 2000);
  } 
}

//getting the details of the weather from the api response
async function getWeatherDetails(lat, lon, cityName) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    const newForecastDates = [];
    const fiveDaysForecast = data.list.filter(forecast => {
      const dateForecast = new Date(forecast.dt_txt).getDate();
      if(!newForecastDates.includes(dateForecast)) {
          return newForecastDates.push(dateForecast);
      }
    });
    
    cityNameInput.value = "";

    divWeatherCard.innerHTML = "";
    currentWeatherDiv.innerHTML = "";

    fiveDaysForecast.forEach((weatherDay, index) => {
      if(index === 0) {
        currentWeatherDiv.insertAdjacentHTML('beforeend', createCardForDay(cityName, weatherDay, index))
      } else {
        divWeatherCard.insertAdjacentHTML('beforeend', createCardForDay(cityName, weatherDay, index));
      }
    });
  } catch (error) {
    errorMessage.textContent = error.message;
    errorContainer.style.display = 'block';
    setTimeout(function() {
      errorContainer.style.display = "none";
    }, 2000);
  }

}

const getUserCoords = () => {
  navigator.geolocation.getCurrentPosition(
    position => {
      const {latitude, longitude} = position.coords;
      console.log(latitude, longitude);
      const reverseGeocodingURL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKEY}`;
      
      fetch(reverseGeocodingURL)
        .then(res => res.json())
        .then(data => {
          const  name = data[0].name;
          console.log(name);
          getWeatherDetails(latitude, longitude, name);
        });

    },
    error =>  {
      errorMessage.textContent = error.message;
      errorContainer.style.display = 'block';
      setTimeout(function() {
        errorContainer.style.display = "none";
      }, 2000);
    }
  );
}

searchButton.addEventListener('click', () => {
  getCity(cityNameInput.value);
});

currentLocationButton.addEventListener('click', () => {
  getUserCoords();
});
