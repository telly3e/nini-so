// app.refactored.js
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.theme-button').forEach(button => {
        button.addEventListener('click', (event) => {
            // 使用 event.currentTarget 确保总是获取到绑定事件的元素
            const themeName = event.currentTarget.dataset.theme;
            switchTheme(themeName);
        });
    });
});

/**
 * @description 创建并附加一个DOM元素
 * @param {string} tagName - 元素的标签名 (例如 'div', 'span')
 * @param {string | string[]} classNames - 元素的类名，可以是字符串或数组
 * @param {HTMLElement} parent - 要附加到的父元素，默认为 document.body
 * @returns {HTMLElement} 创建的元素
 */
function createAndAppend(tagName, classNames = [], parent = document.body) {
    const element = document.createElement(tagName);
    // 确保 classNames 是数组，然后用展开语法添加，更稳健
    element.classList.add(...(Array.isArray(classNames) ? classNames : classNames.split(' ')));
    parent.append(element);
    return element;
}

/**
 * @description 主题配置中心 (策略模式)
 * 每个主题都是一个对象，包含自己的创建(create)和销毁(destroy)逻辑
 */
const themeConfig = {
    'wavy': {
        create() {
            const wavyElement = createAndAppend('div', ['wave', 'bg-element']);
            // 使用循环和辅助函数创建子元素
            for (let i = 0; i < 3; i++) {
                createAndAppend('span', [], wavyElement);
            }
        }
    },
    'shooting_star': {
        create() {
            // 使用 DocumentFragment 优化性能，一次性插入DOM
            const fragment = document.createDocumentFragment();
            createAndAppend('div', ['stars', 'bg-element'], fragment);
            for (let i = 0; i < 6; i++) {
                const starElement = createAndAppend('div', ['shooting-star', 'bg-element'], fragment);
                starElement.style.top = `${Math.random() * 100}%`;
                starElement.style.left = '-100px';
                starElement.style.animationDelay = `${Math.random() * 3}s`;
            }
            document.body.append(fragment);
        }
    },
    'color_column': {
        // 直接引用外部已加载的对象
        init() {
            const wrapperElement = createAndAppend('div', ['bg-element', 'wrapper']);
            wrapperElement.id = 'wrapper';
            // 外部JS对象需要提供一个 init 方法
            if (colorfulBackground && typeof colorfulBackground.init === 'function') {
                colorfulBackground.init();
            }
        },
        destroy() {
            // 外部JS对象也需要提供一个 destroy 方法
            if (colorfulBackground && typeof colorfulBackground.destroy === 'function') {
                colorfulBackground.destroy();
            }
        }
    },
    'advanced_rainbow': {
        create() {
            const fragment = document.createDocumentFragment();
            for (let i = 0; i < 25; i++) {
                createAndAppend('div', ['rainbow', 'bg-element'], fragment);
            }
            createAndAppend('div', ['h', 'bg-element'], fragment);
            createAndAppend('div', ['v', 'bg-element'], fragment);
            document.body.append(fragment);
        }
    },
    'parallel_star': {
        create() {
            for (let i = 0; i < 3; i++) {
                const star = createAndAppend('div', 'bg-element');
                star.id = `stars${i + 1}`;
            }
        }
    }
};

// 全局变量，用于追踪当前具有JS逻辑的主题控制器
let currentJsThemeController = null;

/**
 * 切换（加载/替换）主题CSS和JS文件的函数
 * @param {string} themeName - 主题的名称 (例如 'wavy', 'color_column')
 */
function switchTheme(themeName) {
    console.log(`--- Switching to theme: ${themeName} ---`);

    // --- 步骤 1: 统一清理旧主题 ---
    if (currentJsThemeController && typeof currentJsThemeController.destroy === 'function') {
        console.log(`Destroying previous JS theme...`);
        currentJsThemeController.destroy();
    }
    currentJsThemeController = null; // 重置控制器

    document.querySelectorAll('.bg-element').forEach(element => element.remove());

    // --- 步骤 2: 加载/移除 CSS ---
    const stylesheetId = 'dynamic-theme';
    const existingLink = document.getElementById(stylesheetId);

    if (themeName === 'none') {
        if (existingLink) existingLink.remove();
        console.log('主题已移除。');
        return;
    }

    const themeHref = `./css/background/${themeName}.css`;
    if (existingLink) {
        if (existingLink.getAttribute('href') !== themeHref) {
            existingLink.setAttribute('href', themeHref);
            console.log(`主题CSS已切换为: ${themeName}`);
        }
    } else {
        const linkElement = createAndAppend('link', [], document.head);
        linkElement.id = stylesheetId;
        linkElement.rel = 'stylesheet';
        linkElement.href = themeHref;
        console.log(`主题CSS已加载: ${themeName}`);
    }

    // --- 步骤 3: 执行新主题的创建逻辑 ---
    const newTheme = themeConfig[themeName];
    if (newTheme) {
        if (typeof newTheme.create === 'function') {
            newTheme.create();
        } else if (typeof newTheme.init === 'function') {
            // 对于有复杂JS逻辑的主题，执行init并保存其控制器
            newTheme.init();
            currentJsThemeController = newTheme;
        }
        console.log(`主题DOM和JS已加载: ${themeName}`);
    }
}

switchTheme("advanced_rainbow")