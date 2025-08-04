// geo-weather-bar.js
const geoWeatherBarTemplate = document.createElement('template');

geoWeatherBarTemplate.innerHTML = `
<style>
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
</div>
`

class GeoWeatehrBar extends HTMLElement {
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


    async getGeoData() {
        // 定义两个API的请求函数
        // 每个函数都包含 fetch、错误检查 和 数据标准化
        const fetchFromIpApi = async () => {
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error(`ipapi.co failed with status: ${response.status}`);
            }
            const data = await response.json();
            return ['ipapi', data];
        };

        const fetchFromFreeIpApi = async () => {
            // 注意：你需要确认 freeipapi.com 的确切URL，这里假设是 HTTPS
            const response = await fetch('https://free.freeipapi.com/api/json');
            if (!response.ok) {
                throw new Error(`freeipapi.com failed with status: ${response.status}`);
            }
            const data = await response.json();
            return ['freeipapi', data];
        };

        try {
            // 将两个API的调用（它们返回Promise）放入一个数组
            const promises = [
                fetchFromIpApi(),
                fetchFromFreeIpApi()
            ];

            // Promise.any 会等待第一个成功的Promise，并返回其结果
            const firstResult = await Promise.any(promises);

            // 使用最快返回的、且已标准化的结果
            console.log(`Data from the fastest API (${firstResult[0]}):`);
            if (firstResult[0] === 'freeipapi') {
                console.log(`You are in ${firstResult[1].cityName}, ${firstResult[1].regionName}, ${firstResult[1].countryName}.`);
                console.log(`Latitude:${firstResult[1].latitude}, Longitude:${firstResult[1].longitude}`);
            } else if (firstResult[0] === 'ipapi') {
                console.log(`You are in ${firstResult[1].city}, ${firstResult[1].country_name}.`);
                console.log(`Latitude:${firstResult[1].latitude}, Longitude:${firstResult[1].longitude}`);
            }

            console.log('Full Geo data object:', firstResult[1]);

            return firstResult;

        } catch (error) {
            // 只有当所有的Promise都失败时，Promise.any才会抛出错误
            // error 会是一个 AggregateError，包含了所有失败的原因
            console.error('All APIs failed to provide geo data.');
            console.error(error);
            throw error;
        }
    }


    async getWeatherData(geoData) {
        // Use a try...catch block to handle potential network errors

        // 1. Fetch the API endpoint and wait for the response
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData[1].latitude}&longitude=${geoData[1].longitude}&current=temperature_2m,is_day,weather_code,rain,showers,snowfall,wind_speed_10m,relative_humidity_2m&wind_speed_unit=ms&forecast_minutely_15=4&past_minutely_15=4`);

        // Check if the request was successful (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 2. Parse the JSON response body and wait for it to complete
        const data = await response.json();

        // 3. Now you can use the data from the JSON object
        console.log('Full weather data object:', data);
        return data;

    }

    async updateWeatherGeoInfo() {
        let geoData;
        let weatherData;

        // --- geo data ---
        try {
            this.shadowRoot.querySelector('.geo-bar').classList.remove('invisible');
            geoData = await this.getGeoData();
        } catch (error) {
            console.log('IP-api获取失败', error);
            this.shadowRoot.querySelector('.geo-bar').classList.add('invisible');
            this.shadowRoot.querySelector('.weather-bar').classList.add('invisible');
        }

        // 位置
        // 从 geoData 中解构并获取数据，使用短变量名让代码更简洁
        let region, city, country;
        if (geoData[0] === 'freeipapi') {
            region = geoData[1].regionName;
            city = geoData[1].cityName;
            country = geoData[1].countryName;
        } else if (geoData[0] === 'ipapi') {
            region = geoData[1].region;
            city = geoData[1].city;
            country = geoData[1].country_name;
        }

        // 1. 先清空所有元素的现有内容，这对于重复调用函数很重要
        this.geoCity.innerHTML = '';
        this.geoRegion.innerHTML = '';
        this.geoCountry.innerHTML = '';

        // 2. 按顺序处理和赋值
        let lastValue = null; // 用于跟踪上一个赋的值，避免重复

        // 首先处理国家，因为它是最基础的单位
        if (country) {
            this.geoCountry.innerHTML = country;
            lastValue = country;
        }

        // 接着处理地区，前提是地区存在且不与国家名称重复
        if (region && region !== lastValue) {
            this.geoRegion.innerHTML = region;
            lastValue = region;
        }

        // 最后处理城市，前提是城市存在且不与地区名称重复
        // （如果地区和国家一样，lastValue已经是国家名了，这里也能正确处理）
        if (city && city !== lastValue) {
            this.geoCity.innerHTML = city;
        }




        // --- weather data ---
        try {
            this.shadowRoot.querySelector('.weather-bar').classList.remove('invisible');
            weatherData = await this.getWeatherData(geoData);
        } catch (error) {
            console.log('天气获取失败', error);
            this.shadowRoot.querySelector('.weather-bar').classList.add('invisible');
        }

        // 天气图标
        if ([95, 96, 99].includes(Number(weatherData.current.weather_code))) {
            let additionWeather = '';
            console.log('--special thunderstorm weather🌩️--');
            if (weatherData.current.snowfall > 0) {
                additionWeather = '-snow';
            } else if (weatherData.current.rain > 0 || weatherData.current.showers > 0) {
                additionWeather = '-rain';
            }

            this.weatherIcon.setAttribute('src', `./img/weather-icon/${this.WEATHER_CODE_ICON[weatherData.current.weather_code]}${weatherData.current.is_day ? '-day' : '-night'}${additionWeather}.svg`);
        } else if ([0, 1, 2, 3, 45, 48].includes(Number(weatherData.current.weather_code))) {
            this.weatherIcon.setAttribute('src', `./img/weather-icon/${weatherData.current.weather_code.toString()}${weatherData.current.is_day ? 'd' : 'n'}.svg`);
        } else {
            this.weatherIcon.setAttribute('src', `./img/weather-icon/${this.WEATHER_CODE_ICON[weatherData.current.weather_code]}.svg`);
        }

        // 温度度数
        this.weatherDegree.innerHTML = `${weatherData.current.temperature_2m} `;
        // 温度单位C or F
        this.degreeUnit.setAttribute('src', `./img/weather-icon/${weatherData.current_units.temperature_2m.includes('C') ? 'celsius' : 'fahrenheit'}.svg`);
        // 风速
        this.windSpeed.innerHTML = `${weatherData.current.wind_speed_10m} ${weatherData.current_units.wind_speed_10m} `;
        // 湿度
        this.humidity.innerHTML = `${weatherData.current.relative_humidity_2m} ${weatherData.current_units.relative_humidity_2m} `

        // 天气描述
        if (country === 'China') {
            this.weatherInfo.innerHTML = `${this.WEATHER_CODE_INFO_ZH[weatherData.current.weather_code]}`
        } else {
            this.weatherInfo.innerHTML = `${this.WEATHER_CODE_INFO_EN[weatherData.current.weather_code]}`
        }

    }

    connectedCallback() { this.updateWeatherGeoInfo() }
}

window.customElements.define('geo-weather-bar', GeoWeatehrBar);