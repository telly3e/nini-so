// search-enhance.js

const geoWeatherBar = document.querySelector('geo-weather-bar');
const searchInput = document.querySelector('search-bar').shadowRoot.getElementById('search-input');

searchInput.addEventListener('focus', () => {
    geoWeatherBar.classList.add('animated-hidden');
    document.querySelector('footer').classList.add('is-hidden');
});

searchInput.addEventListener('blur', () => {
    geoWeatherBar.classList.remove('animated-hidden');
    document.querySelector('footer').classList.remove('is-hidden');
})