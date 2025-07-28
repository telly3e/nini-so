// clock.js

const clockElement = document.getElementById('clock')

function updataClock() {
    // get current time
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // format time to 2 digit 
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    // create time string
    const currentTime = `${hours}:${minutes}:${seconds}`;

    clockElement.textContent = currentTime;
}

//update onece per 1s = 1000ms
setInterval(updataClock, 1000)

//update once the js is loaded
updataClock()