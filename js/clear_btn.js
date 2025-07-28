const inputElement = document.getElementById('search-input');

document.querySelector('.clear-btn').addEventListener('click', function () {
    inputElement.value = '';
    inputElement.focus();
});