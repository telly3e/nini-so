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
    gap: 5px;
    cursor: pointer;
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
.btn-active {
    background-color: rgba(0, 0, 0, 0.25);
}

.is-hidden {
    display: none;
}

.no-select {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
}
</style>

<!-- 搜索栏 -->
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
            <input id="search-input" class="no-select" type="text" placeholder="siuuu..." title='' required>
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

<div class='search-suggest'>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>1</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>2</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>3</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>4</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>5</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>6</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>7</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>8</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>9</span></div>
    <div class='suggest'><img class='suggest-icon' src='./img/suggest.svg'><span class='keyword'>10</span></div>
</div>

    <div class="search-engine-collection is-hidden scrollable-area no-select"></div>
</div>
`;

class SearchBar extends HTMLElement {
    constructor() {
        // 必须首先调用 super()
        super();

        // 1. 创建 Shadow Root
        // 将 Shadow DOM 附加到我们的组件上
        this.attachShadow({ mode: 'open' }); // 'open' 表示可以从外部JS访问Shadow DOM

        // 2. 将模板内容附加到 Shadow Root
        // .cloneNode(true) 表示深度克隆，包含所有子元素
        this.shadowRoot.appendChild(searchBarTemplate.content.cloneNode(true));

        // 3. 将组件内的元素缓存起来，方便后续使用
        // 注意我们是从 this.shadowRoot 中查询元素的
        this.SEARCH_ENGINES = {
            // 'google' 是内部使用的key, 用于事件委托和表单提交
            'google': {
                displayName: 'Google', // 用于显示在 <span class="engine-name">
                icon: './img/engine/google.svg', // 用于 <img class="engine-icon"> 的 src
                action: 'https://www.google.com/search',
                name: 'q' // 用于 <input> 的 name 属性
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
            // 未来添加新引擎，只需在这里新增一个对象即可
            // 未来可以轻松添加，例如：
            // 'github': {
            //     action: 'https://github.com/search',
            //     name: 'q'
            // }
        };
        // 搜索按钮
        this.inputElement = this.shadowRoot.getElementById('search-input');
        // 引擎grid
        this.engineCollection = this.shadowRoot.querySelector('.search-engine-collection');
        this.engineBtn = this.shadowRoot.querySelector('.engine-btn');
        // --- DOM 元素获取 ---
        this.form = this.shadowRoot.getElementById('search-bar');
        this.searchInput = this.shadowRoot.getElementById('search-input');
        this.selectedEngine;
        this.clearBtn = this.shadowRoot.querySelector('.clear-btn')
        this.searchSuggest = this.shadowRoot.querySelector(".search-suggest");
    }

    // --- 配置区域 ---

    // 根据 SEARCH_ENGINES 对象渲染搜索引擎列表的函数
    renderSearchEngines() {
        this.engineCollection.innerHTML = '';

        let isFirst = true;

        for (const [engineKey, engineData] of Object.entries(this.SEARCH_ENGINES)) {
            const itemHTML = `
    <div class="engine-item ${isFirst ? 'active' : ''}" data-engine="${engineKey}">
        <img class="engine-icon" src="${engineData.icon}" />
        <span class="engine-name">${engineData.displayName}</span>
    </div>
    `;

            this.engineCollection.insertAdjacentHTML('beforeend', itemHTML);
            isFirst = false
        }
    }

    updateEngineViaAttribute(engineAttribute) {
        this.engineCollection.querySelectorAll('.engine-item').forEach(btn => {
            btn.classList.remove('active');
        });
        const selectedItem = this.shadowRoot.querySelector(`[data-engine="${engineAttribute}"]`);
        selectedItem.classList.add('active');
        this.selectedEngine = engineAttribute;
        console.log(`搜索引擎已切换为${this.selectedEngine}`);
    }

    // 一个自定义方法，用来根据属性更新engine
    updateDefaultEngine() {
        const defaultEngine = this.getAttribute('default-engine');
        if (defaultEngine) {
            this.updateEngineViaAttribute(defaultEngine);
        }
    }


    // --- 搜索建议 ---
    getSuggestions() {
        const valWord = this.searchInput.value.trim();
        this.searchSuggest.classList.remove('is-hidden');
        this.searchSuggest.innerHTML = `
        <img class='loader' src='./img/dark-loader.svg'>
        `;

        // 移除旧的 script
        const old = document.getElementById("jsonp_script");
        if (old) document.body.removeChild(old);

        if (!valWord) {
            this.searchSuggest.innerHTML = '';
            this.searchSuggest.classList.add('is-hidden');
            return;
        }

        // --- 关键修改：将组件的方法暴露到全局 ---
        // 使用 .bind(this) 来确保回调函数中的 'this' 指向组件实例
        window.jsonpCallback = this.jsonpCallback.bind(this);
        // --- 修改结束 ---

        let url = "";
        const callbackName = "jsonpCallback"; // 回调函数名固定为我们挂在window上的那个

        switch (this.selectedEngine) {
            case "baidu":
                url = `https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&wd=${encodeURIComponent(valWord)}&cb=${callbackName}`;
                break;
            case "bing":
                url = `https://api.bing.com/qsonhs.aspx?type=cb&q=${encodeURIComponent(valWord)}&cb=${callbackName}`;
                break;
            case "google":
                url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(valWord)}&callback=${callbackName}`;
                break;
        }

        if (!url) return; // 如果没有匹配的引擎，则不执行后续操作

        const sc = document.createElement("script");
        sc.src = url;
        sc.id = "jsonp_script";
        document.body.appendChild(sc);
    }

    jsonpCallback(data) {
        const searchSuggest = this.searchSuggest;
        const engine = this.selectedEngine;
        let suggestions = [];

        // ... (您原来的 switch-case 逻辑保持不变)
        switch (engine) {
            case "baidu":
                suggestions = data?.g?.map(item => item.q) || [];
                break;
            case "bing":
                suggestions = data?.AS?.Results?.[0]?.Suggests?.map(item => item.Txt) || [];
                break;
            case "google":
                suggestions = data?.[1] || [];
                break;
        }

        const uniqueSuggestions = new Set();
        for (const txt of suggestions) {
            if (uniqueSuggestions.size < 10) {
                uniqueSuggestions.add(txt);
            } else { break; }
        }

        // 清空旧的建议
        this.searchSuggest.innerHTML = '';

        uniqueSuggestions.forEach(txt => {
            const suggestDiv = document.createElement("div"); // 注意：是在 document 上创建
            suggestDiv.classList.add('suggest');
            suggestDiv.innerHTML = `
            <img class='suggest-icon' src='./img/suggest.svg'>
            <span class='keyword'>${txt}</span>
        `;
            suggestDiv.onclick = () => window.open(`https://www.${engine}.com/search?q=${encodeURIComponent(txt)}`);
            searchSuggest.appendChild(suggestDiv);
        });

        // --- 关键修改：清理工作 ---
        // 1. 清除 script 标签
        const sc = document.getElementById("jsonp_script");
        if (sc) sc.remove(); // .remove() 是更现代的写法

        // 2. 将挂载到 window 上的函数删除，避免内存泄漏和全局污染
        delete window.jsonpCallback;
        // --- 修改结束 ---

        console.log(engine, data);
    }


    // connectedCallback --> 当元素被添加到文档DOM中时触发
    connectedCallback() {
        // 渲染引擎grid
        this.renderSearchEngines();

        // --- 状态管理 ---
        // 设置默认搜索引擎
        this.selectedEngine = 'bing';
        this.updateEngineViaAttribute(this.selectedEngine);

        // --- 事件监听 ---
        this.engineCollection.addEventListener('click', (event) => {
            const clickedBtn = event.target.closest('.engine-item');
            if (!clickedBtn) return;

            const engineName = clickedBtn.dataset.engine;
            if (!engineName || !this.SEARCH_ENGINES[engineName]) return;

            this.engineCollection.querySelectorAll('.engine-item').forEach(btn => {
                btn.classList.remove('active');
            });

            clickedBtn.classList.add('active');
            this.selectedEngine = engineName;
            console.log(`搜索引擎已切换为 ${this.selectedEngine}`);
        });

        // form submit监听 --> 更新搜索引擎
        this.form.addEventListener('submit', (event) => {
            const engineConfig = this.SEARCH_ENGINES[this.selectedEngine];
            this.form.action = engineConfig.action;
            this.searchInput.name = engineConfig.name;
        });

        // 搜索栏聚焦监测 --> 若建议为空则获取建议，同时隐藏引擎grid，去除引擎按钮高亮
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value && this.searchSuggest.innerHTML === '') {
                this.getSuggestions();
                this.engineCollection.classList.add('is-hidden');
                this.engineBtn.classList.remove('btn-active');
            }
        });

        // 输入框为空阻止submit
        this.searchInput.addEventListener('invalid', (event) => {
            event.preventDefault();
            console.log("输入框为空，已阻止浏览器默认提示。");
        });

        // 清除按钮点击监测 --> 清空输入栏和搜索建议
        this.clearBtn.addEventListener('click', () => {
            this.inputElement.value = '';
            this.searchSuggest.innerHTML = '';
            this.searchSuggest.classList.add('is-hidden');
            this.inputElement.focus();
        });

        // 点击到页面其他部分 --> 收起 引擎grid和搜索建议
        document.addEventListener('click', (event) => {
            if (!this.engineCollection.classList.contains('is-hidden') && event.target.tagName.toLowerCase() != 'search-bar') {
                this.engineCollection.classList.add('is-hidden');
                this.engineBtn.classList.remove('btn-active');
            }

            if (!event.target.closest('.search-suggest') && event.target.tagName.toLowerCase() != 'search-bar') {
                this.searchSuggest.innerHTML = '';
                this.searchSuggest.classList.add('is-hidden');
            }
        })

        // 引擎按钮监测 --> 切换
        this.shadowRoot.addEventListener('click', (event) => {    
            const clickedEngineBtn = event.target.closest('.engine-btn');

            if (clickedEngineBtn) {
                this.engineCollection.classList.toggle('is-hidden');
                this.engineBtn.classList.toggle('btn-active');
                this.searchSuggest.classList.add('is-hidden'); // 防止搜索建议占位
            } else if (!this.engineCollection.classList.contains('is-hidden') && !event.target.closest('.search-engine-collection')) {
                this.engineCollection.classList.add('is-hidden');
                this.engineBtn.classList.toggle('btn-active');
            }
        });

        // 监测输入栏 --> 更新搜索建议
        this.searchInput.addEventListener("input", () => this.getSuggestions());   

        this.updateDefaultEngine();
    }

    disconnectedCallback() {
        this.engineCollection.removeEventListener('click');
        this.form.removeEventListener('submit');
        this.searchInput.removeEventListener('invalid');
        this.shadowRoot.querySelector('.clear-btn').removeEventListener('click');
        document.removeEventListener('click');
    }


}

window.customElements.define('search-bar', SearchBar);