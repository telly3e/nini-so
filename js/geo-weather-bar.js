// geo-weather-bar.js

const geoWeatherBarTemplate = document.createElement('template');

geoWeatherBarTemplate.innerHTML = /*html*/`
<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:host {
        display: block; /* 必须是 block 才能让 max-height 生效 */

        /* 关键：为了让 max-height 生效，超出部分需要隐藏 */
        overflow: hidden;

        /* --- 可见时的状态 (动画的起点) --- */
        opacity: 1;
        transform: translateY(0);

        /* 关键：设置一个足够大的 max-height，必须比你组件的实际高度要大。
           根据实际情况调整这个值。
        */
        max-height: 460px;

        /* --- 动画的定义 --- */
        /* 为多个属性分别定义过渡效果，可以让动画更有层次感 */
        transition: max-height 0.4s ease-in-out,
                    opacity 0.3s ease-out,
                    transform 0.3s ease-out;
}


:host(.animated-hidden) {
        opacity: 0;
        transform: translateY(-15px);

        /* 关键：将 max-height 设为 0，元素将不再占用垂直空间 */
        max-height: 0;

        /* 虽然元素高度为0了，但为了保险起见，
           最好还是加上 pointer-events: none; 来禁用所有鼠标交互。
        */
        pointer-events: none;
}

.weather-geo {
    display: flex;
    flex-direction: column;
}

.weather-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
}


.geo-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px
}

.icon-info,
.degree-part,
.other-info,
.geo-item,
.weather-info,
.weather-degree,
.wind-speed,
.humidity {
    display: flex;
    justify-content: center;
    align-items: center;
}

.w-icon {
    width: 45px;
}

.weather-info {
    white-space: nowrap;
}

.invisible {
    visibility: hidden;
}

.is-hidden {
    display: none;
}

@media screen and (max-width: 500px) {
    .weather-bar,
    .geo-bar {
        transform: scale(0.85);
    }
    .w-icon {
        height: 36px;
    }
}

.loader {
    width: 20px;
    height: 20px;
}

.controls, .city-form { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 6px; }
button, input, select { font: inherit; color: inherit; background: transparent; border: 1px solid #8886; border-radius: 6px; padding: 4px 8px; }
button { cursor: pointer; }
input { min-width: 0; width: 160px; }
select { max-width: 100%; }
option { color: #222; background: #fff; }
.status { text-align: center; font-size: 12px; opacity: .8; margin-top: 5px; }
.settings { max-width: 360px; margin: 4px auto; padding: 6px; }
:host(:not([show-settings])) .settings,
:host(:not([show-settings])) .location-status { display: none; }
summary { cursor: pointer; text-align: center; font-size: 12px; }
[hidden] { display: none !important; }
.geo-bar { flex-wrap: wrap; }
</style>

<div class="weather-geo">
    <div class="weather-bar invisible">
        <div class="icon-info">
            <img class="weather-icon w-icon" src="./img/weather-icon/not-available.svg">
            <span class="weather-info"><img class='loader' src='./img/dark-loader.svg'></span>
        </div>
        <div class="degree-part">
            <img class="degree-icon w-icon" src="./img/weather-icon/thermometer.svg">
            <div class="weather-degree"><img class='loader' src='./img/dark-loader.svg'></div>
            <img class="degree-unit w-icon" src="./img/weather-icon/fahrenheit.svg">
        </div>
        <div class="other-info">
            <img class="w-icon" src="./img/weather-icon/windsock.svg">
            <div class="wind-speed"><img class='loader' src='./img/dark-loader.svg'></div>
            <img class="w-icon" src="./img/weather-icon/humidity.svg">
            <div class="humidity"><img class='loader' src='./img/dark-loader.svg'></div>
        </div>
    </div>

    <div class="geo-bar invisible">
        <div class="geo-country geo-item">Country&nbsp <img class='loader' src='./img/dark-loader.svg'></div>
        <div class="geo-region">Region</div>
        <div class="geo-city">City</div>
    </div>
    <p class="status location-status" role="status" aria-live="polite"></p>
    <details class="settings">
        <summary>天气位置设置</summary>
        <div class="controls">
            <button type="button" class="device">使用设备位置</button>
            <button type="button" class="auto">自动 IP 定位</button>
            <button type="button" class="retry">刷新</button>
            <select class="strategy" aria-label="自动定位策略">
                <option value="china">国内优先（最多多等 1.2 秒）</option>
                <option value="fastest">最快有效结果</option>
            </select>
        </div>
        <form class="city-form">
            <input class="city-query" aria-label="城市名称" placeholder="城市名，如苏州 / Suzhou" required minlength="2" maxlength="80">
            <button type="submit">查找城市</button>
        </form>
        <div class="controls city-selection" hidden>
            <select class="city-results" aria-label="选择具体城市"></select>
            <button type="button" class="save-city">固定此城市</button>
        </div>
        <p class="status city-status" role="status"></p>
    </details>
</div>
`

class GeoWeatherBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(geoWeatherBarTemplate.content.cloneNode(true));
        this.WEATHER_CODE_INFO_ZH = {
            0: '晴天', 1: '大体晴朗', // 0 dn
            2: '局部多云', 3: '阴天', // 2,3 dn
            45: '雾', 48: '雾凇', // 45 dn
            51: '小毛毛雨', 53: '中度毛毛雨', 55: '大毛毛雨', // drizzle
            56: '轻度冻毛雨', 57: '强度冻毛雨', // sleet
            61: '小雨', 63: '中雨', 65: '大雨', // rain
            66: '轻度冻雨', 67: '强度冻雨', // sleet
            71: '小雪', 73: '中雪', 75: '大雪', // snow
            77: '米雪', // snow
            80: '小阵雨', 81: '中阵雨', 82: '强阵雨', // rain
            85: '小阵雪', 86: '大阵雪', // snow

            // 雷暴 - 可根据其他数据选择更具体的描述
            95: '雷暴', // 轻度或中度
            96: '雷暴伴有小冰雹', 99: '雷暴伴有大冰雹'
        };

        this.WEATHER_CODE_INFO_EN = {
            0: 'Clear sky', 1: 'Mainly clear', // 0 dn
            2: 'Partly cloudy', 3: 'Overcast', // 2,3 dn
            45: 'Fog', 48: 'Depositing rime fog', // 45 dn
            51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense intensity drizzle', // drizzle
            56: 'Light freezing drizzle ', 57: 'Dense freezing drizzle', // sleet
            61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain', 80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers', // rain
            66: 'Light freezing rain', 67: 'Heavy freezing rain', // sleet
            71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall', 77: 'Snow grains', 85: 'Slight snow shower', 86: 'Heavy snow shower', //  snow

            // thunderstorms - choose specific one with other data
            95: 'Thunderstorm',// Slight or moderate
            96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
        };

        this.WEATHER_CODE_ICON = {
            0: '0', 1: '0', // 0 dn
            2: '2', 3: '3', // 2,3 dn
            45: '45', 48: '45', // 45 dn
            51: 'drizzle', 53: 'drizzle', 55: 'drizzle', // drizzle
            56: 'sleet', 57: 'sleet', // sleet
            61: 'rain', 63: 'rain', 65: 'rain', 80: 'rain', 81: 'rain', 82: 'rain', // rain
            66: 'sleet', 67: 'sleet', // sleet
            71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow', 85: 'snow', 86: 'snow', //  snow

            95: 'thunderstorms',
            96: 'thunderstorms', 99: 'thunderstorms'
        };

        // --- get DOM ---
        this.weatherIcon = this.shadowRoot.querySelector('.weather-icon');
        this.weatherInfo = this.shadowRoot.querySelector('.weather-info');
        this.weatherDegree = this.shadowRoot.querySelector('.weather-degree');
        this.degreeUnit = this.shadowRoot.querySelector('.degree-unit');
        this.windSpeed = this.shadowRoot.querySelector('.wind-speed');
        this.humidity = this.shadowRoot.querySelector('.humidity');
        this.geoCountry = this.shadowRoot.querySelector('.geo-country');
        this.geoRegion = this.shadowRoot.querySelector('.geo-region');
        this.geoCity = this.shadowRoot.querySelector('.geo-city');
    }


    readSetting(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    }

    saveSetting(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    }

    setStatus(message) { this.shadowRoot.querySelector('.status').textContent = message; }

    async updateWeatherGeoInfo() {
        this.request?.abort();
        const request = this.request = new AbortController();
        const { signal } = request;
        this.setStatus('正在获取天气…');
        this.shadowRoot.querySelector('.weather-bar').classList.add('invisible');
        this.shadowRoot.querySelector('.geo-bar').classList.add('invisible');
        try {
            const geo = this.fixedCity || this.deviceLocation || await WeatherService.locate({
                preferChina: this.strategy.value !== 'fastest',
                domesticUrl: this.getAttribute('domestic-geo-url'), signal
            });
            if (signal.aborted) return;
            const values = [geo.country, geo.region, geo.city];
            [this.geoCountry, this.geoRegion, this.geoCity].forEach((element, i) => {
                element.textContent = values[i];
                element.classList.toggle('is-hidden', !values[i] || values.slice(0, i).includes(values[i]));
            });
            this.shadowRoot.querySelector('.geo-bar').classList.remove('invisible');
            const key = `${geo.latitude.toFixed(3)},${geo.longitude.toFixed(3)}`;
            const cache = this.readSetting('weather-cache-v1');
            const cached = cache?.key === key && Date.now() >= cache.savedAt && Date.now() - cache.savedAt < 600000 && WeatherService.validWeather(cache.data);
            const data = cached ? cache.data : await WeatherService.weather(geo, signal);
            if (signal.aborted) return;
            if (!cached) this.saveSetting('weather-cache-v1', { key, savedAt: Date.now(), data });
            this.renderWeather(data);
            this.shadowRoot.querySelector('.weather-bar').classList.remove('invisible');
            const hint = this.fixedCity ? '固定城市' : this.deviceLocation ? '设备位置' :
                `IP 估算 · ${geo.source}${geo.countryCode !== 'CN' ? ' · 可能是代理出口' : ''}`;
            this.setStatus(`${hint}${cached ? ' · 10 分钟内缓存' : ''}`);
        } catch {
            if (!signal.aborted) this.setStatus('定位或天气暂不可用，请选择城市、使用设备位置或重试');
        }
    }

    async useDevice() {
        if (!window.isSecureContext || !navigator.geolocation) {
            this.setStatus('设备定位需要 HTTPS 和浏览器支持，请改用固定城市');
            return;
        }
        const version = ++this.deviceVersion;
        this.request?.abort();
        this.setStatus('等待设备定位授权…');
        navigator.geolocation.getCurrentPosition(position => {
            if (version !== this.deviceVersion || !this.isConnected) return;
            try {
                this.deviceLocation = WeatherService.location({ latitude: position.coords.latitude,
                    longitude: position.coords.longitude, city: '设备所在位置', source: '设备位置' });
                this.fixedCity = null;
                this.saveSetting('weather-city-v1', null);
                this.updateWeatherGeoInfo();
            } catch { this.setStatus('设备坐标无效，请选择城市'); }
        }, () => {
            if (version === this.deviceVersion && this.isConnected) this.setStatus('设备定位失败或未获授权，请选择城市或恢复自动定位');
        }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
    }

    async searchCities(event) {
        event.preventDefault();
        this.cityRequest?.abort();
        const request = this.cityRequest = new AbortController();
        const status = this.shadowRoot.querySelector('.city-status');
        this.shadowRoot.querySelector('.city-selection').hidden = true;
        status.textContent = '正在查找城市…';
        try {
            const query = this.shadowRoot.querySelector('.city-query').value.trim();
            if (query.length < 2) throw new Error('城市名过短');
            const cities = await WeatherService.cities(query, request.signal);
            if (request.signal.aborted) return;
            this.cities = cities;
            const select = this.shadowRoot.querySelector('.city-results');
            select.replaceChildren();
            cities.forEach((city, i) => {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = [city.city, city.region, city.country].filter(Boolean).join(' · ');
                select.appendChild(option);
            });
            this.shadowRoot.querySelector('.city-selection').hidden = !cities.length;
            status.textContent = cities.length ? '确认省份和国家后固定城市，下次打开自动使用。' : '没有找到城市，试试拼音或附近的大城市';
        } catch {
            if (!request.signal.aborted) status.textContent = '城市查询失败，请稍后重试';
        }
    }

    connectedCallback() {
        this.events?.abort();
        this.events = new AbortController();
        this.deviceVersion = 0;
        const on = (selector, event, fn) => this.shadowRoot.querySelector(selector).addEventListener(event, fn, { signal: this.events.signal });
        this.strategy = this.shadowRoot.querySelector('.strategy');
        this.strategy.value = this.readSetting('weather-strategy-v1') === 'fastest' ? 'fastest' : 'china';
        try { this.fixedCity = WeatherService.location(this.readSetting('weather-city-v1')); } catch { this.fixedCity = null; }
        on('.city-form', 'submit', event => this.searchCities(event));
        on('.device', 'click', () => this.useDevice());
        on('.auto', 'click', () => {
            ++this.deviceVersion;
            this.fixedCity = this.deviceLocation = null;
            const saved = this.saveSetting('weather-city-v1', null);
            this.updateWeatherGeoInfo();
            this.shadowRoot.querySelector('.city-status').textContent = saved ? '' : '浏览器禁止保存设置，本次切换仅在当前页面有效';
        });
        on('.retry', 'click', () => { ++this.deviceVersion; this.saveSetting('weather-cache-v1', null); this.updateWeatherGeoInfo(); });
        on('.strategy', 'change', () => {
            this.saveSetting('weather-strategy-v1', this.strategy.value);
            if (!this.fixedCity && !this.deviceLocation) { ++this.deviceVersion; this.updateWeatherGeoInfo(); }
        });
        on('.save-city', 'click', () => {
            const city = this.cities?.[this.shadowRoot.querySelector('.city-results').value];
            if (!city) return;
            ++this.deviceVersion;
            this.fixedCity = city;
            this.deviceLocation = null;
            const saved = this.saveSetting('weather-city-v1', city);
            this.shadowRoot.querySelector('.city-status').textContent = saved ? '已保存固定城市' : '本次已切换，但浏览器禁止保存设置';
            this.updateWeatherGeoInfo();
        });
        this.updateWeatherGeoInfo();
    }

    disconnectedCallback() {
        ++this.deviceVersion;
        this.events?.abort();
        this.request?.abort();
        this.cityRequest?.abort();
    }

    renderWeather(weatherData) {
        // 天气图标
        if ([95, 96, 99].includes(Number(weatherData.current.weather_code))) {
            let additionWeather = '';
            if (weatherData.current.snowfall > 0) {
                additionWeather = '-snow';
            } else if (weatherData.current.rain > 0 || weatherData.current.showers > 0) {
                additionWeather = '-rain';
            }

            this.weatherIcon.setAttribute('src', `./img/weather-icon/${this.WEATHER_CODE_ICON[weatherData.current.weather_code]}${weatherData.current.is_day ? '-day' : '-night'}${additionWeather}.svg`);
        } else if ([0, 1, 2, 3, 45, 48].includes(Number(weatherData.current.weather_code))) {
            this.weatherIcon.setAttribute('src', `./img/weather-icon/${this.WEATHER_CODE_ICON[weatherData.current.weather_code]}${weatherData.current.is_day ? 'd' : 'n'}.svg`);
        } else {
            this.weatherIcon.setAttribute('src', `./img/weather-icon/${this.WEATHER_CODE_ICON[weatherData.current.weather_code] || 'not-available'}.svg`);
        }

        // 温度度数
        this.weatherDegree.textContent = `${weatherData.current.temperature_2m} `;
        // 温度单位C or F
        this.degreeUnit.setAttribute('src', `./img/weather-icon/${weatherData.current_units.temperature_2m.includes('C') ? 'celsius' : 'fahrenheit'}.svg`);
        // 风速
        this.windSpeed.textContent = `${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m} `;
        // 湿度
        this.humidity.textContent = `${weatherData.current.relative_humidity_2m} ${weatherData.current_units.relative_humidity_2m} `

        // 天气描述
        if ((navigator.language || '').startsWith('zh')) {
            this.weatherInfo.textContent = this.WEATHER_CODE_INFO_ZH[weatherData.current.weather_code] || '未知天气'
        } else {
            this.weatherInfo.textContent = this.WEATHER_CODE_INFO_EN[weatherData.current.weather_code] || 'Unknown weather'
        }

    }

}

window.customElements.define('geo-weather-bar', GeoWeatherBar);
