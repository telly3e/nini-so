//search-bar.js

const searchBarTemplate = document.createElement('template');
searchBarTemplate.innerHTML = /*html*/`
<style>
:host {
    --bar-width: 50vw;
    --bar-height: 50px;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    position: relative;
}

.container {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
}

#search-bar {
    gap: 10px;
    display: flex;
    align-items: center;
    height: var(--bar-height);
    width: var(--bar-width);
    border: 1px solid rgb(171, 171, 171);
    border-radius: 25px;
    box-shadow: 0px 3px 10px 0px rgba(31, 31, 31, 0.08);
    background-color: rgba(255, 255, 255, 0.2);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
}

#search-bar:hover {
    box-shadow: 0 2px 8px 1px rgba(64, 60, 67, .24);
}

.search-input-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#search-input {
    width: 100%;
    height: 100%;
    border: none;
    background: none;
    font-size: 16px;
    color: black;
    font-family: inherit;
}

#search-input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    display: none;
}

#search-input:focus-visible {
    outline: none;
}

#search-bar:has(#search-input:focus-visible) {
    box-shadow: 0 2px 8px 1px rgba(64, 60, 67, .24);
}

.clear-btn {
    display: none;
    background: none;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.clear-btn svg {
    height: 18px;
    width: 18px;
}

#search-input:not(:placeholder-shown):focus+.clear-btn {
    display: flex;
}

.search-input-wrapper:hover input:not(:placeholder-shown)+.clear-btn {
    display: flex;
}

.engine-btn {
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    background: none;
    border: 0px solid;
    border-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.engine-btn svg {
    width: 24px;
    height: 24px;
}

.search-btn {
    padding-left: 20px;
    padding-right: 20px;
    height: 100%;
    background: none;
    border-radius: inherit;
    /*lt rt rb lb*/
    border: 0px solid;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.search-btn:hover,
.engine-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.search-btn svg {
    width: 24px;
    height: 24px;
}

/* 搜索引擎grid */
.search-engine-collection {
    max-width: 640px;
    display: grid;
    grid-Template-columns: repeat(auto-fit, minmax(140px, 1fr));
    /* grid-searchBarTemplate-rows: auto auto auto; */
    row-gap: 16px;
    column-gap: 16px;
    justify-content: center;
    align-items: center;
    overflow-y: scroll;
    max-height: 160px;
    padding: 10px 2px 10px 10px;
    border-radius: 6px;
    background-color: rgba(88, 88, 88, 0.2);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(64, 60, 67, .24);
    box-shadow: 3px 3px 8px 0px rgba(64, 60, 67, .24);
}

/* 对 .scrollable-area 的滚动条进行美化 */
.scrollable-area::-webkit-scrollbar {
    width: 8px;
    /* 滚动条宽度 */
}

.scrollable-area::-webkit-scrollbar-track {
    /* background: #f1f1f1; */
    /* 轨道背景色 */
}

.scrollable-area::-webkit-scrollbar-thumb {
    background: #00000068;
    /* 滑块颜色 */
    border-radius: 6px;
    /* 滑块圆角 */
}

.scrollable-area::-webkit-scrollbar-thumb:hover {
    background: #000000a8;
    /* 鼠标悬停时滑块颜色 */
}

.engine-item {
    cursor: pointer;
    display: flex;
    gap: 5px;
    justify-content: center;
    align-items: center;
    width: 140px;
    height: 40px;
    border: 0px solid;
    border-radius: 6px;
    background-color: #00000040;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
}

.engine-item:hover,
.engine-item.active {
    background-color: #ffffffbb;
}

.engine-icon {
    border: 0px solid;
    border-radius: 7px;
    background-color: white;
    padding: 3px;
    width: 27px;
    height: 27px;
}

.search-suggest {
    width: var(--bar-width);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    border-radius: 6px;
    box-shadow: 0px 3px 10px 0px rgba(31, 31, 31, 0.08);
    background-color: rgba(255, 255, 255, 0.3);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
}

.suggest {
    border-radius :inherit;
    padding: 0px 10px 0px 10px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    min-height: 30px;
}

.suggest:hover{
    background: white;
    padding-left: 16px;
}

.suggest-icon {
    width:24px;
}

.keyword {
    width:100%;
}

.loader{
    width:24px;
    display: flex;
    align-self: center;
    padding: 3px;
}

/* 移动端调整 */
@media screen and (max-width: 500px) {
    .container {
        gap: 5px;
    }

    :host{
    --bar-height: 40px;
    --bar-width: 80vw;
    }

    .engine-btn,
    .search-btn {
        height: 100%;
        padding-left: 10px;
        padding-right: 10px;
        background: none;
        border: 0px solid;
        border-radius: inherit;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .engine-btn svg,
    .search-btn svg{
        width: 16px;
        height: 16px;
    }

    .search-engine-collection {
        max-width: 90vw;
        transform: scale(0.85);
    }
}

@media screen and (max-width: 730px) {
    .search-engine-collection {
        max-width: 90vw;
    }
}

/* 状态类 */
.selected {
    background-color: #eee;
}

.btn-active {
    background-color: rgba(0, 0, 0, 0.25);
}

.is-hidden {
    display: none !important; /* Use important to ensure override */
}

.no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}
</style>

<div class="container">

    <form id='search-bar' method="get" target="_blank">
        <button type='button' class="engine-btn">
            <svg viewBox="-0.5 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <path
                        d="M22 11.8201C22 9.84228 21.4135 7.90885 20.3147 6.26436C19.2159 4.61987 17.6542 3.33813 15.8269 2.58126C13.9996 1.82438 11.9889 1.62637 10.0491 2.01223C8.10927 2.39808 6.32748 3.35052 4.92896 4.74904C3.53043 6.14757 2.578 7.92935 2.19214 9.86916C1.80629 11.809 2.00436 13.8197 2.76123 15.6469C3.51811 17.4742 4.79985 19.036 6.44434 20.1348C8.08883 21.2336 10.0222 21.8201 12 21.8201"
                        stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                    <path d="M2 11.8201H22" stroke="#000000" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    <path
                        d="M12 21.8201C10.07 21.8201 8.5 17.3401 8.5 11.8201C8.5 6.30007 10.07 1.82007 12 1.82007C13.93 1.82007 15.5 6.30007 15.5 11.8201"
                        stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                    <path
                        d="M18.3691 21.6901C20.3021 21.6901 21.8691 20.1231 21.8691 18.1901C21.8691 16.2571 20.3021 14.6901 18.3691 14.6901C16.4361 14.6901 14.8691 16.2571 14.8691 18.1901C14.8691 20.1231 16.4361 21.6901 18.3691 21.6901Z"
                        stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                    <path d="M22.9998 22.8202L20.8398 20.6702" stroke="#000000" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"></path>
                </g>
            </svg>
        </button>
        <div class="search-input-wrapper">
            <input id="search-input" class="no-select" type="text" placeholder="siuuu..." title='' required autocomplete="off">
            <button type="button" class="clear-btn">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                        <path
                            d="M16 8L8 16M8.00001 8L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
                            fill="rgba(51, 51, 51, 0.1)">
                        </path>
                    </g>
                </svg></button>
        </div>

        <button type="submit" class="search-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                <g id="SVGRepo_iconCarrier">
                    <path
                        d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    </path>
                </g>
            </svg>
        </button>
    </form>

    <div class='search-suggest is-hidden'></div>

    <div class="search-engine-collection is-hidden scrollable-area no-select"></div>
</div>
`;

class SearchBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({
            mode: 'open'
        });
        this.shadowRoot.appendChild(searchBarTemplate.content.cloneNode(true));

        this.SEARCH_ENGINES = {
            'google': {
                displayName: 'Google',
                icon: './img/engine/google.svg',
                action: 'https://www.google.com/search',
                name: 'q'
            },
            'baidu': {
                displayName: 'Baidu',
                icon: './img/engine/baidu.svg',
                action: 'https://www.baidu.com/s',
                name: 'wd'
            },
            'bing': {
                displayName: 'Bing',
                icon: './img/engine/bing.svg',
                action: 'https://www.bing.com/search',
                name: 'q'
            },
            'duckduckgo': {
                displayName: 'DuckDuckGo',
                icon: './img/engine/duckduckgo.svg',
                action: 'https://duckduckgo.com/',
                name: 'q'
            }
        };

        this.inputElement = this.shadowRoot.getElementById('search-input');
        this.engineCollection = this.shadowRoot.querySelector('.search-engine-collection');
        this.engineBtn = this.shadowRoot.querySelector('.engine-btn');
        this.form = this.shadowRoot.getElementById('search-bar');
        this.searchInput = this.shadowRoot.getElementById('search-input');
        this.selectedEngine;
        this.clearBtn = this.shadowRoot.querySelector('.clear-btn');
        this.searchSuggest = this.shadowRoot.querySelector(".search-suggest");

        // Cache keys contain both the engine and query.
        this.suggestionsCache = new Map();
    }

    renderSearchEngines() {
        this.engineCollection.innerHTML = '';
        let isFirst = true;
        for (const [engineKey, engineData] of Object.entries(this.SEARCH_ENGINES)) {
            const itemHTML = `
                <div class="engine-item ${isFirst ? 'active' : ''}" data-engine="${engineKey}">
                    <img class="engine-icon" src="${engineData.icon}" />
                    <span class="engine-name">${engineData.displayName}</span>
                </div>`;
            this.engineCollection.insertAdjacentHTML('beforeend', itemHTML);
            isFirst = false;
        }
    }

    updateEngineViaAttribute(engineAttribute) {
        if (!Object.hasOwn(this.SEARCH_ENGINES, engineAttribute)) engineAttribute = 'baidu';
        this.cancelSuggestions();
        this.engineCollection.querySelectorAll('.engine-item').forEach(btn => btn.classList.remove('active'));
        const selectedItem = this.shadowRoot.querySelector(`[data-engine="${engineAttribute}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
            this.selectedEngine = engineAttribute;
            this.searchSuggest.classList.add('is-hidden'); // Hide suggestions on engine switch
        }
    }

    updateDefaultEngine() {
        const defaultEngine = this.getAttribute('default-engine');
        if (defaultEngine && this.SEARCH_ENGINES[defaultEngine]) {
            this.updateEngineViaAttribute(defaultEngine);
        }
    }

    // Each JSONP response belongs to one component, engine and query.
    static nextRequestId = 0;

    cancelSuggestions() {
        const request = this.suggestionRequest;
        if (!request) return;
        clearTimeout(request.timer);
        request.script.remove();
        delete window[request.callbackName];
        this.suggestionRequest = null;
    }

    getSuggestions() {
        this.cancelSuggestions();
        const query = this.searchInput.value.trim();
        const engine = this.selectedEngine;
        if (!query || engine === 'duckduckgo') {
            this.searchSuggest.replaceChildren();
            this.searchSuggest.classList.add('is-hidden');
            return;
        }
        const cacheKey = JSON.stringify([engine, query]);
        if (this.suggestionsCache.has(cacheKey)) {
            this.renderSuggestions(this.suggestionsCache.get(cacheKey));
            return;
        }
        this.engineCollection.classList.add('is-hidden');
        this.engineBtn.classList.remove('btn-active');
        this.searchSuggest.classList.remove('is-hidden');
        this.searchSuggest.innerHTML = `<img class='loader' src='./img/dark-loader.svg'>`;

        const callbackName = `siuSuggestions${++SearchBar.nextRequestId}`;
        const term = encodeURIComponent(query);
        const urls = {
            baidu: `https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&wd=${term}&cb=${callbackName}`,
            bing: `https://api.bing.com/qsonhs.aspx?type=cb&q=${term}&cb=${callbackName}`,
            google: `https://suggestqueries.google.com/complete/search?client=chrome&q=${term}&callback=${callbackName}`
        };
        const script = document.createElement('script');
        const request = { script, callbackName, engine, query, cacheKey };
        this.suggestionRequest = request;
        const fail = () => {
            if (this.suggestionRequest !== request) return;
            this.cancelSuggestions();
            this.searchSuggest.replaceChildren();
            this.searchSuggest.classList.add('is-hidden');
        };
        window[callbackName] = data => {
            if (this.suggestionRequest !== request) return;
            const raw = engine === 'baidu' ? data?.g : engine === 'bing' ? data?.AS?.Results?.[0]?.Suggests : data?.[1];
            const values = Array.isArray(raw) ? raw.map(item => engine === 'baidu' ? item?.q : engine === 'bing' ? item?.Txt : item) : [];
            const suggestions = [...new Set(values.filter(value => typeof value === 'string'))].slice(0, 10);
            // Bound the cache rather than retaining every query for the page's lifetime.
            if (this.suggestionsCache.size >= 100) this.suggestionsCache.delete(this.suggestionsCache.keys().next().value);
            this.suggestionsCache.set(cacheKey, suggestions);
            this.cancelSuggestions();
            if (this.isConnected && engine === this.selectedEngine && query === this.searchInput.value.trim()) {
                this.renderSuggestions(suggestions);
            }
        };
        script.src = urls[engine];
        script.onerror = fail;
        script.onload = fail; // A script that never invokes its callback is also a failure.
        request.timer = setTimeout(fail, 6500);
        document.body.appendChild(script);
    }

    renderSuggestions(suggestions) {
        this.searchSuggest.innerHTML = '';
        if (suggestions.length === 0) {
            this.searchSuggest.classList.add('is-hidden');
            return;
        }

        this.searchSuggest.classList.remove('is-hidden');
        this.engineCollection.classList.add('is-hidden');
        this.engineBtn.classList.remove('btn-active')

        suggestions.forEach(txt => {
            const suggestDiv = document.createElement("div");
            suggestDiv.classList.add('suggest');
            const icon = document.createElement('img');
            icon.className = 'suggest-icon';
            icon.src = './img/suggest.svg';
            icon.alt = '';
            const keyword = document.createElement('span');
            keyword.className = 'keyword';
            keyword.textContent = txt;
            suggestDiv.append(icon, keyword);
            this.searchSuggest.appendChild(suggestDiv);
        });
    }

    connectedCallback() {
        this.events?.abort();
        this.events = new AbortController();
        const on = (target, type, handler) => target.addEventListener(type, handler, { signal: this.events.signal });
        this.renderSearchEngines();

        this.selectedEngine = mySettings['prefer_engine'];
        this.updateEngineViaAttribute(this.selectedEngine);

        on(this.engineCollection, 'click', (event) => {
            const clickedBtn = event.target.closest('.engine-item');
            if (!clickedBtn) return;
            const engineName = clickedBtn.dataset.engine;
            if (engineName && this.SEARCH_ENGINES[engineName]) {
                this.updateEngineViaAttribute(engineName);
                mySettings['prefer_engine'] = engineName;
                updateUserSetting(mySettings);
            }
        });

        on(this.form, 'submit', (event) => {
            const engineConfig = this.SEARCH_ENGINES[this.selectedEngine];
            this.form.action = engineConfig.action;
            this.searchInput.name = engineConfig.name;
        });

        on(this.searchInput, 'focus', () => {
            if (this.searchInput.value) {
                this.getSuggestions();
            }
        });

        on(this.searchInput, 'invalid', (event) => {
            event.preventDefault();
        });

        on(this.clearBtn, 'click', () => {
            this.cancelSuggestions();
            this.inputElement.value = '';
            this.searchSuggest.innerHTML = '';
            this.searchSuggest.classList.add('is-hidden');
            this.inputElement.focus();
        });

        on(document, 'click', (event) => {
            if (!this.contains(event.target)) {
                this.engineCollection.classList.add('is-hidden');
                this.engineBtn.classList.remove('btn-active');
                this.cancelSuggestions();
                this.searchSuggest.classList.add('is-hidden');
            }
        });

        on(this.shadowRoot, 'click', (event) => {
            if (!event.target.closest('.engine-btn') && !this.engineCollection.classList.contains('is-hidden')) {
                this.engineCollection.classList.toggle('is-hidden');
                this.engineBtn.classList.toggle('btn-active');
            }
        })

        on(this.engineBtn, 'click', () => {
            this.cancelSuggestions();
            this.engineCollection.classList.toggle('is-hidden');
            this.engineBtn.classList.toggle('btn-active');
            this.searchSuggest.classList.add('is-hidden');
        });

        on(this.searchInput, "input", () => this.getSuggestions());

        on(this.searchSuggest, 'mousedown', event => {
            const suggestion = event.target.closest('.suggest');
            if (!suggestion || this.searchSuggest.classList.contains('is-hidden')) return;
            event.preventDefault();
            this.searchInput.value = suggestion.querySelector('.keyword').textContent;
            this.form.requestSubmit();
        });

        on(this.searchInput, 'keydown', (e) => {
            const suggestions = this.searchSuggest.querySelectorAll('.suggest');
            if (suggestions.length === 0 || this.searchSuggest.classList.contains('is-hidden')) {
                return;
            }

            let selectedIndex = -1;
            for (let i = 0; i < suggestions.length; i++) {
                if (suggestions[i].classList.contains('selected')) {
                    selectedIndex = i;
                    break;
                }
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (selectedIndex < suggestions.length - 1) {
                    if (selectedIndex !== -1) {
                        suggestions[selectedIndex].classList.remove('selected');
                    }
                    suggestions[selectedIndex + 1].classList.add('selected');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selectedIndex > 0) {
                    suggestions[selectedIndex].classList.remove('selected');
                    suggestions[selectedIndex - 1].classList.add('selected');
                }
            } else if (e.key === 'Enter') {
                if (selectedIndex !== -1) {
                    e.preventDefault();
                    this.searchInput.value = suggestions[selectedIndex].querySelector('.keyword').textContent;
                    this.form.requestSubmit();
                }
            }
        });

    }

    disconnectedCallback() {
        this.events?.abort();
        this.cancelSuggestions();
        this.searchSuggest.replaceChildren();
        this.searchSuggest.classList.add('is-hidden');
    }
}

window.customElements.define('search-bar', SearchBar);
