document.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href');
        if (href === currentPath || (currentPath === 'index.html' && href === 'manue.html')) {
            item.classList.add('active');
        }
    });
});

// Live Clock for the header
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('live-time').innerText = timeString;
}
setInterval(updateTime, 1000);
updateTime();
