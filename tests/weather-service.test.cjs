const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../js/weather-service.js');
const cn = { latitude: 31.3, longitude: 120.6, countryCode: 'CN' };
const jp = { latitude: 35.7, longitude: 139.7, countryCode: 'JP' };
const later = (value, ms) => () => new Promise(resolve => setTimeout(() => resolve(value), ms));

test('foreign result first, CN inside grace wins', async () => {
    assert.equal((await service.choose([later(jp, 1), later(cn, 10)], { grace: 40 })).countryCode, 'CN');
});
test('fastest mode keeps foreign first result', async () => {
    assert.equal((await service.choose([later(jp, 1), later(cn, 20)], { preferChina: false })).countryCode, 'JP');
});
test('foreign fallback is bounded and cancels pending provider', async () => {
    let aborted = false;
    const stalled = signal => new Promise(() => signal.addEventListener('abort', () => { aborted = true; }));
    assert.equal((await service.choose([later(jp, 1), stalled], { grace: 10 })).countryCode, 'JP');
    assert.ok(aborted);
});
test('invalid success does not win; all failures reject', async () => {
    assert.equal((await service.choose([later({ error: true }, 1), later(cn, 5)])).countryCode, 'CN');
    await assert.rejects(service.choose([async () => { throw Error(); }, later({ latitude: null }, 1)]));
});
test('abort superseded request', async () => {
    const controller = new AbortController();
    const result = service.choose([later(cn, 20)], { signal: controller.signal });
    controller.abort();
    await assert.rejects(result, { name: 'AbortError' });
});
test('coordinate validation accepts zero, rejects null, empty, NaN and range errors', () => {
    assert.equal(service.location({ latitude: 0, longitude: 0 }).latitude, 0);
    for (const latitude of [null, '', NaN, 91, undefined]) assert.throws(() => service.location({ latitude, longitude: 0 }));
});
test('domestic parser discards IP and rejects overseas response', () => {
    assert.deepEqual(service.parseDomestic('当前 IP：192.0.2.1  来自于：中国 江苏 苏州  电信'), { region: '江苏', city: '苏州' });
    assert.throws(() => service.parseDomestic('当前 IP：192.0.2.1 来自于：日本 东京'));
});
test('geocoder must match country, city and province unambiguously', () => {
    const city = { name: '苏州市', admin1: '江苏省', country_code: 'CN', latitude: 31.3, longitude: 120.6 };
    const place = { region: '江苏', city: '苏州' };
    assert.equal(service.matchDomestic([city], place).countryCode, 'CN');
    assert.throws(() => service.matchDomestic([{ ...city, admin1: '安徽' }], place));
    assert.throws(() => service.matchDomestic([city, city], place));
});
test('network timeout and invalid weather fail cleanly', async () => {
    const original = global.fetch;
    try {
        global.fetch = async (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
        await assert.rejects(service.json('https://example.com', undefined, 5), { name: 'AbortError' });
        global.fetch = async () => ({ ok: true, json: async () => ({ current: {} }) });
        await assert.rejects(service.weather(cn), /不完整/);
    } finally { global.fetch = original; }
});
