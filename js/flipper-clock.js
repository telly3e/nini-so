// 创建一个 <flipperClockTemplate> 元素，它会包含组件的HTML结构和CSS样式。
// 这样做效率更高，因为模板的DOM在被实际使用前不会被渲染。
const flipperClockTemplate = document.createElement('template');

flipperClockTemplate.innerHTML = /*html*/`
    <style>
        /* * 所有的CSS都从 style.css 文件复制到这里。
         * 注意：我们将一些选择器进行了修改，以适应Shadow DOM。
         * 例如，原来的 .container 选择器现在变成了 :host，它代表组件本身。
        */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :host {
            /* :host 代表了 <flipper-clock> 这个自定义元素本身 */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: "Inter", sans-serif;
            --brdrRad: 8px; /* 将一些变量提升到host层面，方便统一管理 */
        }
        
        /* 定义不同的主题 */
        :host([theme="dark"]) {
            --priBg: #1e2022;
            --secBg: #323232;
            --txtClr: #e0e0e0;
            --shade: 1;
        }

        :host([theme="light"]) {
            --priBg: #fff;
            --secBg: #e0e0e0;
            --txtClr: #383b41;
            --shade: 0.3;
        }

        .flipper-clock-container {
            list-style: none;
        }

        .flipper-clock {
            display: flex;
            gap: 0.5rem;
            perspective: 500px;
        }

        @media (min-width: 1024px) {
            .flipper-clock {
                gap: 1rem;
            }
        }

        .flipper {
            position: relative;
            width: 2rem;
            height: 2.5rem;
            transform: rotateX(8deg);
            border-radius: var(--brdrRad);
            box-shadow: 0px 10px 30px rgb(0 0 0 / 25%), 0px 5px 0px var(--secBg);
        }

        .flipper::before {
            content: "";
            position: absolute;
            left: 0px;
            top: 50%;
            z-index: 5;
            height: 2px;
            width: 100%;
            transform: translateY(-50%);
            background: var(--priBg);
        }

        @media (min-width: 768px) {
            .flipper {
                width: 2.75rem;
                height: 3.5rem;
            }
        }

        @media (min-width: 1024px) {
            .flipper {
                width: 4rem;
                height: 5rem;
            }
        }

        .flipper li {
            position: absolute;
            height: 100%;
            width: 100%;
            text-align: center;
            font-family: "Helvetica Neue", Helvetica, sans-serif;
            perspective: 200px;
            list-style: none;
        }
        
        .flipper li:has(+ li.active) {
            z-index: 3;
        }

        .flipper li.active {
            z-index: 2;
            animation: modify-z 0.5s 0.5s linear both;
        }

        .flipper li div {
            position: absolute;
            left: 0px;
            width: 100%;
            height: 50%;
            overflow: hidden;
            background: var(--priBg);
        }

        .flipper li div::before {
            content: attr(data-text);
            width: 100%;
            height: 200%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            left: 0px;
            font-size: 1.875rem;
            font-weight: 700;
            line-height: 2.25rem;
            color: var(--txtClr);
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
            transform: translateY(3px);
        }

        @media (min-width: 768px) {
            .flipper li div::before {
                font-size: 2.25rem;
                line-height: 2.5rem;
            }
        }

        @media (min-width: 1024px) {
            .flipper li div::before {
                font-size: 3.75rem;
                line-height: 1;
            }
        }

        .flipper li div::after {
            content: "";
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0px;
        }

        .flipper li div:nth-child(1) {
            top: 0px;
            transform-origin: 50% 100%;
            border-top-left-radius: var(--brdrRad);
            border-top-right-radius: var(--brdrRad);
        }

        .flipper li div:nth-child(1)::after {
            top: 0px;
        }

        .flipper li div:nth-child(1)::before {
            top: 0px;
        }

        .flipper li div:nth-child(2) {
            bottom: 0px;
            transform-origin: 50% 0%;
            border-bottom-left-radius: var(--brdrRad);
            border-bottom-right-radius: var(--brdrRad);
        }

        .flipper li div:nth-child(2)::after {
            bottom: 0px;
        }

        .flipper li div:nth-child(2)::before {
            bottom: 0px;
        }

        .flipper li.active div:nth-child(2) {
            z-index: 2;
            animation: turn1 0.5s 0.5s linear both;
        }

        .flipper li:has(+ li.active) div:nth-child(1) {
            z-index: 2;
            animation: turn2 0.5s linear both;
        }

        .flipper li:has(+ li.active) div:nth-child(1)::after {
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, calc(var(--shade) / 2)) 100%);
            animation: show-shadow 0.5s linear both;
        }

        .flipper li.active div:nth-child(1)::after {
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, calc(var(--shade) / 2)) 100%);
            animation: hide-shadow 0.5s 0.3s linear both;
        }

        .flipper li:has(+ li.active) div:nth-child(2)::after {
            background: linear-gradient(to bottom, rgba(0, 0, 0, var(--shade)) 0%, rgba(0, 0, 0, 0.1) 100%);
            animation: show-shadow 0.5s linear both;
        }

        .flipper li.active div:nth-child(2)::after {
            background: linear-gradient(to bottom, rgba(0, 0, 0, var(--shade)) 0%, rgba(0, 0, 0, 0.1) 100%);
            animation: hide-shadow 0.5s 0.3s linear both;
        }

        .seperator {
            width: 0.5rem;
            height: 0.5rem;
            align-self: center;
            border-radius: calc(var(--brdrRad) / 4);
            background: var(--priBg);
            transform: rotateX(15deg) translateY(-5px);
            box-shadow: 0px 10px 30px rgb(0 0 0 / 25%), 0px 0px 0px var(--secBg);
        }

        .seperator::before {
            content: "";
            width: 100%;
            height: 100%;
            display: inline-block;
            transform: rotateX(15deg) translateY(10px);
            background: inherit;
            box-shadow: inherit;
            border-radius: inherit;
        }
        
        /* 动画 Keyframes 部分保持不变 */
        @keyframes modify-z { 0% { z-index: 2; } 5%, 100% { z-index: 4; } }
        @keyframes turn1 { 0% { transform: rotateX(90deg); } 100% { transform: rotateX(0deg); } }
        @keyframes turn2 { 0% { transform: rotateX(0deg); } 100% { transform: rotateX(-90deg); } }
        @keyframes show-shadow { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes hide-shadow { 0% { opacity: 1; } 100% { opacity: 0; } }
    </style>
    <div class="flipper-clock">
        <ul class="flipper"></ul>
        <ul class="flipper"></ul>
        <div class="seperator"></div>
        <ul class="flipper"></ul>
        <ul class="flipper"></ul>
        <div class="seperator"></div>
        <ul class="flipper"></ul>
        <ul class="flipper"></ul>
    </div>
`;

class FlipperClock extends HTMLElement {
    constructor() {
        super();
        // 附加一个 Shadow DOM 树到这个自定义元素上。
        // 'open' 模式意味着你可以通过页面上的JavaScript访问Shadow DOM。
        this.attachShadow({ mode: 'open' });

        // 将模板的内容克隆一份，附加到Shadow DOM上。
        this.shadowRoot.appendChild(flipperClockTemplate.content.cloneNode(true));

        // 将定时器ID保存为类的属性，方便在组件销毁时清除
        this.timer = null;
    }

    // 当组件被插入到DOM中时，这个生命周期回调函数会被调用。
    connectedCallback() {
        this.initializeClockDigits();
        this.changeTime();
        this.timer = setInterval(() => this.changeTime(), 1000);

        // 设置默认主题，如果没有通过HTML属性指定的话
        if (!this.hasAttribute('theme')) {
            this.setAttribute('theme', 'dark');
        }
    }

    // 当组件从DOM中移除时，这个生命周期回调函数会被调用。
    disconnectedCallback() {
        // 清除定时器，防止内存泄漏。
        clearInterval(this.timer);
    }

    // 生成时钟的数字（0-9）
    initializeClockDigits() {
        const flippers = this.shadowRoot.querySelectorAll('.flipper');
        flippers.forEach(flipper => {
            flipper.innerHTML = ''; // 清空以防万一
            for (let i = 0; i < 10; i++) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div data-text="${i}"></div>
                    <div data-text="${i}"></div>
                `;
                flipper.appendChild(li);
            }
        });
    }

    // 更新时间的核心逻辑
    changeTime() {
        const time = new Date();
        const hour = time.getHours().toString().padStart(2, "0");
        const minute = time.getMinutes().toString().padStart(2, "0");
        const second = time.getSeconds().toString().padStart(2, "0");
        const combinedTime = `${hour}${minute}${second}`;

        // 注意这里使用了 this.shadowRoot.querySelectorAll
        // 确保我们只选择这个组件内部的元素，而不是整个页面的。
        this.shadowRoot.querySelectorAll(".flipper").forEach((flippers, index) => {
            const flipperList = flippers.querySelectorAll("li");
            flipperList.forEach((li) => li.classList.remove("active"));
            const currentTimeIndex = +combinedTime[index];
            if (flipperList[currentTimeIndex]) {
                flipperList[currentTimeIndex].classList.add("active");
            }
        });
    }
}

// 定义自定义元素，将 'flipper-clock' 标签与 FlipperClock 类关联起来。
window.customElements.define('flipper-clock', FlipperClock);