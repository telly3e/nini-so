function normalizeUserSettings(value) {
    const settings = value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
    if (!['baidu', 'bing', 'google', 'duckduckgo'].includes(settings.prefer_engine)) {
        settings.prefer_engine = 'baidu';
    }
    return settings;
}

function getOrCreateUserSettings() {
    let stored;
    try { stored = JSON.parse(localStorage.getItem('userSettings')); } catch { /* Use defaults. */ }
    const settings = normalizeUserSettings(stored);
    updateUserSetting(settings);
    return settings;
}

function updateUserSetting(settings) {
    try {
        localStorage.setItem('userSettings', JSON.stringify(normalizeUserSettings(settings)));
        return true;
    } catch {
        // Storage can be unavailable or full; current-page preferences still work.
        return false;
    }
}

const mySettings = getOrCreateUserSettings();
