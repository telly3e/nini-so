/* Network/data layer; no DOM or provider credentials. */
const WeatherService = (() => {
    function location(data) {
        const latitude = data?.latitude, longitude = data?.longitude;
        if (typeof latitude !== 'number' || !Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
            typeof longitude !== 'number' || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
            throw new Error('定位接口没有返回有效经纬度');
        }
        return { latitude, longitude, countryCode: String(data.countryCode || '').toUpperCase(),
            country: String(data.country || ''), region: String(data.region || ''),
            city: String(data.city || ''), source: String(data.source || '') };
    }

    async function json(url, signal, timeout = 6500, text = false) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        if (signal?.aborted) abort();
        signal?.addEventListener('abort', abort, { once: true });
        const timer = setTimeout(abort, timeout);
        try {
            const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            if (text) return await response.text();
            const data = await response.json();
            if (data.error) throw new Error('接口返回错误');
            return data;
        } finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', abort);
        }
    }

    // First valid CN result wins; a foreign result gets only a bounded grace period.
    function choose(providers, { preferChina = true, grace = 1200, signal } = {}) {
        return new Promise((resolve, reject) => {
            const controller = new AbortController();
            let remaining = providers.length, fallback, timer, done = false;
            const finish = (value, error) => {
                if (done) return;
                done = true;
                clearTimeout(timer);
                signal?.removeEventListener('abort', abort);
                controller.abort();
                error ? reject(error) : resolve(value);
            };
            const abort = () => finish(null, new DOMException('Aborted', 'AbortError'));
            if (signal?.aborted) return abort();
            signal?.addEventListener('abort', abort, { once: true });
            if (!remaining) return finish(null, new Error('没有可用定位服务'));
            for (const provider of providers) {
                Promise.resolve().then(() => provider(controller.signal)).then(location).then(result => {
                    if (done) return;
                    if (!preferChina || result.countryCode === 'CN') return finish(result);
                    if (!fallback) {
                        fallback = result;
                        timer = setTimeout(() => finish(fallback), grace);
                    }
                }).catch(() => {}).finally(() => {
                    if (--remaining === 0 && !done) {
                        finish(fallback, fallback ? null : new Error('自动定位不可用，请选择城市或使用设备位置'));
                    }
                });
            }
        });
    }

    function locate({ domesticUrl, ...options } = {}) {
        const providers = [
            async signal => {
                const text = await json('https://myip.ipip.net', signal, 6500, true);
                const place = parseDomestic(text);
                const params = new URLSearchParams({ name: place.city, count: '20', language: 'zh', countryCode: 'CN' });
                const data = await json(`https://geocoding-api.open-meteo.com/v1/search?${params}`, signal);
                return matchDomestic(data.results || [], place);
            },
            async signal => {
                const d = await json('https://ipapi.co/json/', signal);
                return { ...d, country: d.country_name, countryCode: d.country_code, source: 'ipapi.co' };
            },
            async signal => {
                const d = await json('https://free.freeipapi.com/api/json', signal);
                return { ...d, country: d.countryName, countryCode: d.countryCode,
                    region: d.regionName, city: d.cityName, source: 'FreeIPAPI' };
            }
        ];
        // Optional owned HTTPS endpoint, returning the normalized location schema.
        if (domesticUrl) providers.unshift(async signal => ({ ...await json(domesticUrl, signal), source: '国内定位接口' }));
        return choose(providers, options);
    }

    function parseDomestic(text) {
        // Deliberately discard the IP. Only city/province go to the geocoder.
        const match = text.match(/来自于[：:]\s*中国\s+(\S+)\s+(\S+)/);
        if (!match) throw new Error('国内探测没有返回中国城市');
        return { region: match[1], city: match[2] };
    }

    function matchDomestic(results, place) {
        const clean = name => String(name || '').replace(/(?:壮族自治区|回族自治区|维吾尔自治区|自治区|省|市)$/u, '');
        const matches = results.filter(d => d.country_code === 'CN' && clean(d.name) === clean(place.city) &&
            clean(d.admin1) === clean(place.region));
        if (matches.length !== 1) throw new Error('国内城市坐标无法唯一确定');
        return location({ ...matches[0], country: '中国', countryCode: 'CN', region: place.region,
            city: place.city, source: 'IPIP 国内探测' });
    }

    async function cities(name, signal) {
        const params = new URLSearchParams({ name, count: '8', language: 'zh', format: 'json' });
        const data = await json(`https://geocoding-api.open-meteo.com/v1/search?${params}`, signal);
        return (data.results || []).map(d => location({ ...d, city: d.name, region: d.admin1,
            countryCode: d.country_code, source: '固定城市' }));
    }

    function validWeather(data) {
        return ['temperature_2m', 'weather_code', 'is_day', 'wind_speed_10m', 'relative_humidity_2m']
            .every(key => typeof data?.current?.[key] === 'number' && Number.isFinite(data.current[key])) &&
            ['temperature_2m', 'wind_speed_10m', 'relative_humidity_2m']
            .every(key => typeof data?.current_units?.[key] === 'string');
    }

    async function weather(geo, signal) {
        location(geo);
        const params = new URLSearchParams({ latitude: geo.latitude, longitude: geo.longitude,
            current: 'temperature_2m,is_day,weather_code,rain,showers,snowfall,wind_speed_10m,relative_humidity_2m',
            wind_speed_unit: 'ms', timezone: 'auto' });
        const data = await json(`https://api.open-meteo.com/v1/forecast?${params}`, signal);
        if (!validWeather(data)) throw new Error('天气数据不完整');
        return data;
    }

    return { location, json, choose, locate, cities, weather, validWeather, parseDomestic, matchDomestic };
})();
if (typeof module !== 'undefined') module.exports = WeatherService;
