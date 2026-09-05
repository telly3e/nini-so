const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = file => fs.readFileSync(path.join(__dirname, '../js', file), 'utf8');

function storageContext(raw, unavailable = false) {
    let stored = raw;
    const context = vm.createContext({ localStorage: {
        getItem() { if (unavailable) throw Error('denied'); return stored; },
        setItem(_key, value) { if (unavailable) throw Error('quota'); stored = value; }
    } });
    vm.runInContext(source('local-storage.js'), context);
    return context;
}

test('corrupt JSON, null, array and invalid engine fall back safely', () => {
    for (const raw of ['{broken', 'null', '[]', '42', '"baidu"', '{"prefer_engine":"__proto__"}']) {
        const ctx = storageContext(raw);
        assert.equal(vm.runInContext('mySettings.prefer_engine', ctx), 'baidu');
    }
});
test('valid preferences and unrelated settings are preserved', () => {
    const ctx = storageContext('{"prefer_engine":"bing","other":123}');
    assert.equal(vm.runInContext('mySettings.prefer_engine', ctx), 'bing');
    assert.equal(vm.runInContext('mySettings.other', ctx), 123);
});
test('blocked storage still permits an in-memory engine switch', () => {
    const ctx = storageContext(null, true);
    assert.equal(vm.runInContext("mySettings.prefer_engine = 'google'; updateUserSetting(mySettings)", ctx), false);
    assert.equal(vm.runInContext('mySettings.prefer_engine', ctx), 'google');
});

// Small DOM stand-in: exercises production methods without loading remote scripts.
class Element extends EventTarget {
    constructor(tag = 'div') {
        super(); this.tagName = tag; this.children = []; this.value = ''; this.classes = new Set();
        this.classList = {
            add: name => this.classes.add(name), remove: name => this.classes.delete(name),
            contains: name => this.classes.has(name),
            toggle: name => this.classes.has(name) ? this.classes.delete(name) : this.classes.add(name)
        };
    }
    set innerHTML(value) { this.html = value; this.children = []; }
    get innerHTML() { return this.html || ''; }
    append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
    appendChild(node) { this.children.push(node); node.parent = this; }
    replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(node => node !== this); }
    querySelectorAll() { return []; }
    querySelector() { return null; }
    focus() { this.dispatchEvent(new Event('focus')); }
}
function searchContext() {
    const document = new Element('document');
    document.createElement = tag => new Element(tag);
    document.body = new Element('body');
    const timers = new Map(); let nextTimer = 0;
    const context = vm.createContext({ document, HTMLElement: Element, AbortController,
        setTimeout: fn => { const id = ++nextTimer; timers.set(id, fn); return id; },
        clearTimeout: id => timers.delete(id),
        window: { customElements: { define() {} } }, mySettings: { prefer_engine: 'baidu' }, updateUserSetting() {} });
    vm.runInContext(source('search-bar.js') + '\nthis.SearchBar = SearchBar;', context);
    const bar = Object.create(context.SearchBar.prototype);
    for (const key of ['engineCollection', 'engineBtn', 'form', 'searchInput', 'clearBtn', 'searchSuggest', 'shadowRoot']) bar[key] = new Element();
    bar.inputElement = bar.searchInput;
    bar.suggestionsCache = new Map(); bar.isConnected = true;
    bar.SEARCH_ENGINES = { baidu: { action: 'https://www.baidu.com/s', name: 'wd' }, google: { action: 'https://www.google.com/search', name: 'q' } };
    bar.renderSearchEngines = () => {};
    bar.updateEngineViaAttribute = engine => { bar.cancelSuggestions(); bar.selectedEngine = engine; };
    bar.contains = () => false;
    bar.connectedCallback();
    return { bar, context, document, timers };
}
test('suggestion HTML is rendered as literal text without creating injected elements', () => {
    const { bar } = searchContext();
    const payload = '<img src=x onerror=alert(1)>';
    bar.renderSuggestions([payload]);
    const row = bar.searchSuggest.children[0];
    assert.equal(row.children.length, 2);
    assert.equal(row.children[1].tagName, 'span');
    assert.equal(row.children[1].textContent, payload);
    assert.equal(row.innerHTML, '');
    bar.disconnectedCallback();
});
test('old query callback cannot overwrite newer query, malformed values are dropped', () => {
    const { bar, context } = searchContext();
    bar.searchInput.value = 'old'; bar.getSuggestions();
    const old = context.window[bar.suggestionRequest.callbackName];
    bar.searchInput.value = 'new'; bar.getSuggestions();
    old({ g: [{ q: 'wrong' }] });
    assert.equal(bar.searchSuggest.children.length, 0);
    context.window[bar.suggestionRequest.callbackName]({ g: [{ q: 'right' }, { q: {} }, { q: 'right' }] });
    assert.equal(bar.searchSuggest.children.length, 1);
    assert.equal(bar.searchSuggest.children[0].children[1].textContent, 'right');
    bar.disconnectedCallback();
});
test('clear input and script timeout remove pending callbacks, scripts and spinner', () => {
    const { bar, context, document, timers } = searchContext();
    bar.searchInput.value = 'query'; bar.getSuggestions();
    const name = bar.suggestionRequest.callbackName;
    bar.clearBtn.dispatchEvent(new Event('click'));
    assert.equal(context.window[name], undefined);
    assert.equal(document.body.children.length, 0);
    assert.equal(timers.size, 0);
    bar.searchInput.value = 'timeout'; bar.getSuggestions();
    [...timers.values()][0]();
    assert.ok(bar.searchSuggest.classList.contains('is-hidden'));
    assert.equal(timers.size, 0);
    bar.disconnectedCallback();
});
test('disconnect cancels resources and all handlers; reconnect installs handlers once', () => {
    const { bar, context, document, timers } = searchContext();
    bar.searchInput.value = 'query'; bar.getSuggestions();
    const name = bar.suggestionRequest.callbackName;
    bar.disconnectedCallback();
    assert.equal(context.window[name], undefined);
    assert.equal(timers.size, 0);
    assert.equal(document.body.children.length, 0);
    let count = 0; bar.getSuggestions = () => { count++; };
    bar.searchInput.dispatchEvent(new Event('input'));
    assert.equal(count, 0);
    bar.connectedCallback(); bar.connectedCallback();
    bar.searchInput.dispatchEvent(new Event('input'));
    assert.equal(count, 1);
    bar.disconnectedCallback();
});
test('clock theme follows initial preference and subsequent changes', () => {
    const media = new EventTarget(); media.matches = false;
    const input = new Element(); let theme;
    const context = vm.createContext({ window: { matchMedia: () => media }, document: { querySelector: selector =>
        selector === 'search-bar' ? { shadowRoot: { getElementById: () => input } } :
        selector === 'flipper-clock' ? { setAttribute: (_name, value) => { theme = value; } } : new Element() } });
    vm.runInContext(source('global.js'), context);
    assert.equal(theme, 'light');
    media.matches = true; media.dispatchEvent(new Event('change'));
    assert.equal(theme, 'dark');
    media.matches = false; media.dispatchEvent(new Event('change'));
    assert.equal(theme, 'light');
});
