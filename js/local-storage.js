const userSettings = {
    prefer_engine: 'baidu'
};
localStorage.setItem('settings', JSON.stringify(userSettings));

let settings = JSON.parse(localStorage.getItem('settings'));
