function setActive(clickedElement) {
    // Remove 'active' class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Add 'active' class to the clicked element
    clickedElement.classList.add('active');
}

// Live Clock for the header
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('live-time').innerText = timeString;
}
setInterval(updateTime, 1000);
updateTime();
