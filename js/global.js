// global.js

const geoWeatherBar = document.querySelector('geo-weather-bar');
const searchBar = document.querySelector('search-bar');
const searchRoot = searchBar.shadowRoot;
const footer = document.querySelector('footer');
let pointerInsideSearch = false;

function setSearchActive(active) {
    geoWeatherBar.classList.toggle('animated-hidden', active);
    footer.classList.toggle('is-hidden', active);
}

// Run before blur: engine options are not focusable, but are still search interactions.
document.addEventListener('pointerdown', event => {
    pointerInsideSearch = event.composedPath().includes(searchBar);
    setSearchActive(pointerInsideSearch);
}, true);

document.addEventListener('focusin', event => {
    const inside = event.composedPath().includes(searchBar);
    if (!inside) pointerInsideSearch = false;
    setSearchActive(inside);
});

document.addEventListener('keydown', event => {
    if (event.key === 'Tab') pointerInsideSearch = false;
}, true);

searchRoot.addEventListener('focusout', () => {
    // Wait until focus has moved between the input, engine button and submit button.
    queueMicrotask(() => {
        setSearchActive(Boolean(searchRoot.activeElement) || pointerInsideSearch);
    });
});

// 创建一个媒体查询列表对象，用于检查用户是否偏好深色模式
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function syncClockTheme() {
    document.querySelector('flipper-clock')?.setAttribute('theme', mediaQuery.matches ? 'dark' : 'light');
}
syncClockTheme();
mediaQuery.addEventListener('change', syncClockTheme);
