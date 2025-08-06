// global.js

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

// 创建一个媒体查询列表对象，用于检查用户是否偏好深色模式
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

if (mediaQuery.matches) {
    console.log('用户当前处于深色模式');
    document.querySelector('flipper-clock').setAttribute('theme', 'dark');
} else {
    console.log('用户当前处于浅色模式');
    document.querySelector('flipper-clock').setAttribute('theme', 'light');
}