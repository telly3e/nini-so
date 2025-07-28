// --- 配置区域 ---
const SEARCH_ENGINES = {
    // 'google' 是内部使用的key, 用于事件委托和表单提交
    'google': {
        displayName: 'Google', // 用于显示在 <span class="engine-name">
        icon: './asset/img/google.svg', // 用于 <img class="engine-icon"> 的 src
        action: 'https://www.google.com/search',
        name: 'q' // 用于 <input> 的 name 属性
    },
    'baidu': {
        displayName: 'Baidu',
        icon: './asset/img/baidu.svg',
        action: 'https://www.baidu.com/s',
        name: 'wd'
    },
    'bing': {
        displayName: 'Bing',
        icon: './asset/img/bing.svg',
        action: 'https://www.bing.com/search',
        name: 'q'
    },
    'duckduckgo': {
        displayName: 'DuckDuckGo',
        icon: './asset/img/duckduckgo.svg',
        action: 'https://duckduckgo.com/',
        name: 'q'
    }
    // 未来添加新引擎，只需在这里新增一个对象即可
};
// 未来可以轻松添加，例如：
// 'github': {
//     action: 'https://github.com/search',
//     name: 'q'
// }

// 根据 SEARCH_ENGINES 对象渲染搜索引擎列表的函数
function renderSearchEngines() {
    engineCollection.innerHTML = '';

    isFirst = true;

    for (const [engineKey, engineData] of Object.entries(SEARCH_ENGINES)) {
        const itemHTML = `
        <div class="engine-item ${isFirst ? 'active' : ''}" data-engine="${engineKey}">
            <img class="engine-icon" src="${engineData.icon}" />
            <span class="engine-name">${engineData.displayName}</span>
        </div>
        `;

        engineCollection.insertAdjacentHTML('beforeend', itemHTML);
        isFirst = false
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM 元素获取 ---
    const form = document.getElementById('search-bar');
    const searchInput = document.getElementById('search-input');
    const engineCollection = document.querySelector('.search-engine-collection');

    renderSearchEngines();

    // --- 状态管理 ---
    // 默认搜索引擎
    let selectedEngine = 'bing';
    updateEngineViaAttribute(selectedEngine);

    // 事件监听
    engineCollection.addEventListener('click', function (event) {
        // event.target 是用户实际点击的元素 (可能是<img>或<span>)
        // .closest() 方法会从 event.target 开始向上查找，直到找到匹配 '.engine-item' 的祖先元素
        const clickedBtn = event.target.closest('.engine-item');
        if (!clickedBtn) {
            return;
        }

        const engineName = clickedBtn.dataset.engine;

        if (!engineName || !SEARCH_ENGINES[engineName]) {
            return;
        }

        engineCollection.querySelectorAll('.engine-item').forEach(btn => {
            btn.classList.remove('active');
        });

        // 给当前点击的按钮添加 'active' 类
        clickedBtn.classList.add('active');

        selectedEngine = engineName;
        console.log(`搜索引擎已切换为${selectedEngine}`)
    });


    // 在表单提交前，根据选择的搜索引擎更新 action 和 name 属性
    form.addEventListener('submit', function (event) {
        const engineConfig = SEARCH_ENGINES[selectedEngine];
        form.action = engineConfig.action;
        searchInput.name = engineConfig.name;
    });

    // 监听 invalid 事件
    searchInput.addEventListener('invalid', function (event) {
        // 阻止浏览器显示默认的验证提示气泡
        event.preventDefault();

        // 你可以在这里添加逻辑，比如用我们自定义的提示
        console.log("输入框为空，已阻止浏览器默认提示。");
        // 注意：上面的CSS :invalid 伪类会自动处理显示/隐藏我们的自定义消息
    });

});

function updateEngineViaAttribute(engineAttribute) {
    engineCollection.querySelectorAll('.engine-item').forEach(btn => {
        btn.classList.remove('active');
    });
    const selectedItem = document.querySelector(`[data-engine="${engineAttribute}"]`);
    selectedItem.classList.add('active');
    selectedEngine = engineAttribute;
    console.log(`搜索引擎已切换为${selectedEngine}`)
}