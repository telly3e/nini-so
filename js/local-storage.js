function getOrCreateUserSettings() {
    const settingsKey = 'userSettings';

  // 尝试读取并解析，如果结果为 null 或 undefined，则使用 || 后面的默认值
    const settings = JSON.parse(localStorage.getItem(settingsKey)) || {
    prefer_engine: 'baidu',
    };

  // 确保无论如何 localStorage 中都有最新的设置
    localStorage.setItem(settingsKey, JSON.stringify(settings));

    return settings;
}

function updateUserSetting(settings) {
    const settingsKey = 'userSettings';
    localStorage.setItem(settingsKey, JSON.stringify(settings));
}

// 使用方式和效果与上一个函数完全相同
const mySettings = getOrCreateUserSettings();
console.log(mySettings);