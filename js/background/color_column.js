const colorfulBackground = {
    // 将变量作为对象的属性
    colorSchemes: {
        blue: ['#001F3F', '#003366', '#004C99', '#0066CC', '#0080FF', '#3399FF'],
        green: ['#004D1A', '#006622', '#008033', '#009933', '#00B33C', '#00CC44'],
        purple: ['#2A0033', '#3F004D', '#530066', '#660080', '#7A0099', '#8F00B3'],
        red: ['#330000', '#660000', '#990000', '#CC0000', '#FF0000', '#FF3333'],
        teal: ['#003333', '#004D4D', '#006666', '#008080', '#009999', '#00B3B3'],
        orange: ['#331100', '#662200', '#993300', '#CC4400', '#FF5500', '#FF7733'],
        pink: ['#330033', '#4D004D', '#660066', '#800080', '#990099', '#B300B3'],
        yellow: ['#332600', '#664D00', '#997300', '#CC9900', '#FFBF00', '#FFD633']
    },
    columns: null, // 将在 init 中初始化
    intervalIds: [], // 存储所有定时器的 ID，方便清除
    resizeHandler: null, // 存储 resize 事件处理函数，方便移除

    // 将函数作为对象的方法
    createColumns() {
        const wrapper = document.getElementById('wrapper');
        if (!wrapper) return;
        wrapper.innerHTML = '';

        this.columns.forEach((columnColor) => {
            const column = document.createElement('div');
            column.className = 'column';
            column.dataset.colorScheme = columnColor;

            const boxCount = Math.ceil(window.innerHeight / 16);
            for (let i = 0; i < boxCount; i++) {
                const box = document.createElement('div');
                box.className = 'box';
                column.appendChild(box);
            }
            wrapper.appendChild(column);
        });
    },

    animateColumn(column, direction = 1) {
        const boxes = Array.from(column.querySelectorAll('.box'));
        const colorScheme = this.colorSchemes[column.dataset.colorScheme];
        if (!boxes.length || !colorScheme) return;

        const currentColors = boxes.map(box => {
            const color = box.style.backgroundColor;
            return this.rgbToHex(color) || colorScheme[0];
        });

        if (direction > 0) {
            currentColors.unshift(currentColors.pop());
        } else {
            currentColors.push(currentColors.shift());
        }

        boxes.forEach((box, i) => {
            box.style.backgroundColor = currentColors[i] || colorScheme[0];
        });
    },

    initializeColumns() {
        const columns = document.querySelectorAll('.column');
        columns.forEach(column => {
            const boxes = column.querySelectorAll('.box');
            const colorScheme = this.colorSchemes[column.dataset.colorScheme];
            if (!boxes.length || !colorScheme) return;

            boxes.forEach((box, index) => {
                const colorIndex = index % colorScheme.length;
                box.style.backgroundColor = colorScheme[colorIndex];
            });
        });
    },

    rgbToHex(rgb) {
        if (!rgb || rgb.startsWith('#')) return rgb;
        const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!rgbMatch) return null;

        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);

        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    },

    // 启动函数
    init() {
        // 防止重复初始化
        if (this.intervalIds.length > 0) {
            this.destroy();
        }

        console.log('🎨 Background animation initialized.');
        this.columns = Object.keys(this.colorSchemes);

        this.createColumns();
        this.initializeColumns();

        document.querySelectorAll('.column').forEach((column, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            const intervalId = setInterval(() => {
                this.animateColumn(column, direction);
            }, 200);
            this.intervalIds.push(intervalId); // 保存 interval ID
        });

        // 保存事件处理函数，以便之后可以移除它
        this.resizeHandler = () => {
            this.init();
        };
        window.addEventListener('resize', this.resizeHandler);
    },

    // 销毁/清理函数
    destroy() {
        console.log('🧹 Cleaning up background animation.');

        // 1. 清除所有定时器
        this.intervalIds.forEach(id => clearInterval(id));
        this.intervalIds = [];

        // 2. 移除 resize 事件监听
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }

        // 3. (可选) 清空 wrapper 内容
        const wrapper = document.getElementById('wrapper');
        if (wrapper) {
            wrapper.innerHTML = '';
        }
    }
};