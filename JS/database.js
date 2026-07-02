let niftyData = {};
let bankNiftyData = {};
let currentSelectedDateObj = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Load CSV data first and wait for it
    await loadCSVData();

    const calendarGrid = document.getElementById('calendar-grid');
    const year = 2026;
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    months.forEach((monthName, monthIndex) => {
        // Create month container card
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-card';

        // Month title
        const title = document.createElement('h3');
        title.className = 'month-title';
        title.innerText = monthName;
        monthDiv.appendChild(title);

        // Days header (Sun, Mon, Tue...)
        const daysHeader = document.createElement('div');
        daysHeader.className = 'days-header';
        daysInWeek.forEach(day => {
            const dayCell = document.createElement('div');
            dayCell.innerText = day;
            daysHeader.appendChild(dayCell);
        });
        monthDiv.appendChild(daysHeader);

        // Dates grid for the month
        const datesGrid = document.createElement('div');
        datesGrid.className = 'dates-grid';

        // Calculate first day of the month and total days
        const firstDay = new Date(year, monthIndex, 1).getDay();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        // Add empty cells for alignment before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'date-cell empty';
            datesGrid.appendChild(emptyCell);
        }

        // Add the actual date cells
        for (let day = 1; day <= daysInMonth; day++) {
            const dateCell = document.createElement('a'); // Make it an anchor link
            dateCell.className = 'date-cell active-date';
            dateCell.innerText = day;

            // Format date string for the placeholder link (e.g., "2026-01-15")
            const formattedMonth = String(monthIndex + 1).padStart(2, '0');
            const formattedDay = String(day).padStart(2, '0');
            const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

            // Check if we have trading data for this date
            const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const csvDateStr = `${formattedDay}-${monthsShort[monthIndex]}-${year}`;
            if (niftyData[csvDateStr]) {
                dateCell.classList.add('has-data');
            }

            // Clicking opens a placeholder action. You can link actual images here later!
            dateCell.href = `#`;

            dateCell.onclick = (e) => {
                e.preventDefault();
                // Call the modal open function instead of alert
                openModal(year, monthIndex, monthName, day);
            };

            datesGrid.appendChild(dateCell);
        }

        monthDiv.appendChild(datesGrid);
        calendarGrid.appendChild(monthDiv);
    });
});

// Modal Logic
function openModal(year, monthIndex, monthName, day) {
    const modal = document.getElementById('date-modal');
    const title = document.getElementById('modal-date-title');
    const subtitle = document.getElementById('modal-day-subtitle');
    const holidayBadge = document.getElementById('modal-holiday-status');

    // Calculate Day of Week
    const d = new Date(year, monthIndex, day);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[d.getDay()];

    // Update Modal Text
    title.innerText = `${monthName} ${day}, ${year}`;
    subtitle.innerText = dayOfWeek;

    // Basic logic for trading holiday (Weekends are always holidays)
    if (dayOfWeek === 'Sunday' || dayOfWeek === 'Saturday') {
        holidayBadge.innerText = 'YES (Weekend)';
        holidayBadge.style.color = 'var(--accent-red)';
        holidayBadge.style.background = 'rgba(239, 68, 68, 0.2)';
    } else {
        holidayBadge.innerText = 'NO (Trading Day)';
        holidayBadge.style.color = 'var(--accent-green)';
        holidayBadge.style.background = 'rgba(16, 185, 129, 0.2)';
    }

    currentSelectedDateObj = { year, monthIndex, day };

    // Format date to match CSV: DD-MMM-YYYY
    const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const formattedDay = String(day).padStart(2, '0');
    const csvDateStr = `${formattedDay}-${monthsShort[monthIndex]}-${year}`;

    // Set Low - High text if data exists
    const nifty = niftyData[csvDateStr];
    const bankNifty = bankNiftyData[csvDateStr];

    // rand finder code herer: 
    document.getElementById('modal-nifty').innerText = nifty
        ? `${Math.round(parseFloat(nifty.low))} : ${Math.round(parseFloat(nifty.high))} = ${Math.round(parseFloat(nifty.high) - parseFloat(nifty.low))}`
        : '--';
    //   ? `${nifty.low} - ${nifty.high}` 

    document.getElementById('modal-banknifty').innerText = bankNifty
        ? `${Math.round(parseFloat(bankNifty.low))} : ${Math.round(parseFloat(bankNifty.high))} = ${Math.round(parseFloat(bankNifty.high) - parseFloat(bankNifty.low))}`
        : '--';

    // Show Modal
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('date-modal').style.display = 'none';
}

// Close modal if user clicks outside the modal box
window.onclick = function (event) {
    const modal = document.getElementById('date-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function closeHolcFloating() {
    document.getElementById('holc-floating-window').style.display = 'none';
}

// Draggable window logic
document.addEventListener("DOMContentLoaded", () => {
    const floatingWindow = document.getElementById("holc-floating-window");
    const header = document.getElementById("holc-floating-header");

    if (header && floatingWindow) {
        let isDragging = false;
        let initialX, initialY, xOffset = 0, yOffset = 0, currentX, currentY;

        header.addEventListener("mousedown", dragStart);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            isDragging = true;
            header.style.cursor = 'grabbing';
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, floatingWindow);
            }
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
        }

        function dragEnd(e) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            header.style.cursor = 'grab';
        }
    }
});

async function displayNiftyHOLClist() {
    if (!currentSelectedDateObj) return;

    // show floating window
    const floatWin = document.getElementById('holc-floating-window');
    if (floatWin) floatWin.style.display = 'flex';

    const tbody = document.getElementById('holc-floating-body');
    if (tbody) tbody.innerHTML = '';

    const loading = document.getElementById('holc-floating-loading');
    if (loading) loading.style.display = 'block';

    // Format date string as YYYY-MM-DD
    const { year, monthIndex, day } = currentSelectedDateObj;
    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const title = document.getElementById('holc-floating-title');
    if (title) title.innerText = `Nifty 50 HOLC - ${targetDateStr}`;

    try {
        const response = await fetch('index_HOLC_data/NIFTY_HOLC.csv');
        const text = await response.text();
        const lines = text.split('\n');

        let html = '';
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Check if line starts with targetDateStr
            if (line.startsWith(targetDateStr)) {
                const cols = line.split(',');
                if (cols.length >= 5) {
                    const datetime = cols[0]; // e.g. "2017-05-19 03:46:00"
                    const timeUTC = datetime.split(' ')[1]; // "03:46:00"

                    // Convert UTC to IST
                    const [h, m, s] = timeUTC.split(':').map(Number);
                    const dateObj = new Date(Date.UTC(2000, 0, 1, h, m, s));
                    const istHours = dateObj.getHours().toString().padStart(2, '0');
                    const istMinutes = dateObj.getMinutes().toString().padStart(2, '0');
                    const istTimeStr = `${istHours}:${istMinutes}`;

                    html += `
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <td style="padding: 8px;">${istTimeStr}</td>
                            <td style="padding: 8px; color: var(--accent-blue);">${cols[1]}</td>
                            <td style="padding: 8px; color: var(--accent-green);">${cols[2]}</td>
                            <td style="padding: 8px; color: var(--accent-red);">${cols[3]}</td>
                            <td style="padding: 8px; color: #c084fc;">${cols[4]}</td>
                        </tr>
                    `;
                }
            }
        }

        if (html === '') {
            html = '<tr><td colspan="5" style="padding: 20px;">No HOLC data available for this date.</td></tr>';
        }
        if (tbody) tbody.innerHTML = html;

    } catch (e) {
        console.error(e);
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="padding: 20px; color: red;">Error loading data.</td></tr>';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

// Function to fetch and parse CSV
async function loadCSVData() {
    try {
        const [niftyRes, bankRes] = await Promise.all([
            fetch('index_HOLC_data/NIFTY_2026.csv'),
            fetch('index_HOLC_data/NIFTY_BANK_2026.csv')
        ]);

        const niftyText = await niftyRes.text();
        const bankText = await bankRes.text();

        niftyData = parseCSV(niftyText);
        bankNiftyData = parseCSV(bankText);
        console.log("Data loaded successfully.");
    } catch (error) {
        console.error("Error loading CSV data:", error);
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const dataObj = {};
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length >= 5) {
            const date = cols[0].trim();
            dataObj[date] = {
                open: cols[1].trim(),
                high: cols[2].trim(),
                low: cols[3].trim(),
                close: cols[4].trim()
            };
        }
    }
    return dataObj;
}

function displayAnalysisPage() {
    if (!currentSelectedDateObj) return;

    const { year, monthIndex, day } = currentSelectedDateObj;
    const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const formattedDay = String(day).padStart(2, '0');
    const csvDateStr = `${formattedDay}-${monthsShort[monthIndex]}-${year}`;
    
    // Jump to the new analysis page, passing the date in the URL
    window.location.href = `analysis.html?date=${csvDateStr}&y=${year}&m=${monthIndex}&d=${day}`;
}

// Chart logic
let chartInstance = null;
let candleSeries = null;

function closeChartModal() {
    document.getElementById('chart-modal').style.display = 'none';
    if (chartInstance) {
        chartInstance.remove();
        chartInstance = null;
        candleSeries = null;
    }
}

async function displayNiftyChart() {
    if (!currentSelectedDateObj) return;

    const modal = document.getElementById('chart-modal');
    if (modal) modal.style.display = 'flex';

    const container = document.getElementById('chart-container');
    if (container) container.innerHTML = '';

    const loading = document.getElementById('chart-loading');
    if (loading) loading.style.display = 'block';

    const { year, monthIndex, day } = currentSelectedDateObj;
    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const title = document.getElementById('chart-modal-title');
    if (title) title.innerText = `Nifty 50 Chart - ${targetDateStr}`;

    try {
        const response = await fetch('index_HOLC_data/NIFTY_HOLC.csv');
        const text = await response.text();
        const lines = text.split('\n');

        const chartData = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            if (line.startsWith(targetDateStr)) {
                const cols = line.split(',');
                if (cols.length >= 5) {
                    const datetime = cols[0];
                    const timeUTC = datetime.split(' ')[1];
                    const [h, m, s] = timeUTC.split(':').map(Number);

                    // Parse the UTC time from the CSV
                    const dateObj = new Date(Date.UTC(2000, 0, 1, h, m, s));
                    // Get the IST equivalent time (assuming browser is in IST or we just add 5.5 hours)
                    // Better to explicitly add 5 hours 30 mins to avoid browser timezone issues
                    const istTimeMs = dateObj.getTime() + (5.5 * 60 * 60 * 1000);
                    const istDateObj = new Date(istTimeMs);
                    const istHours = istDateObj.getUTCHours();
                    const istMinutes = istDateObj.getUTCMinutes();

                    // LightweightCharts formats timestamps as UTC by default.
                    // By passing our IST time as UTC to the timestamp, it will display IST correctly.
                    const timestamp = Math.floor(Date.UTC(year, monthIndex, day, istHours, istMinutes, s) / 1000);

                    chartData.push({
                        time: timestamp,
                        open: parseFloat(cols[1]),
                        high: parseFloat(cols[2]),
                        low: parseFloat(cols[3]),
                        close: parseFloat(cols[4])
                    });
                }
            }
        }

        if (loading) loading.style.display = 'none';

        if (chartData.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: white;">No chart data available for this date.</div>';
            return;
        }

        // Sort data by time ascending just in case
        chartData.sort((a, b) => a.time - b.time);

        // Remove duplicates (Lightweight Charts requires strictly monotonic time)
        const uniqueChartData = [];
        for (let i = 0; i < chartData.length; i++) {
            if (i === 0 || chartData[i].time !== chartData[i - 1].time) {
                uniqueChartData.push(chartData[i]);
            }
        }

        chartInstance = LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: 500,
            layout: {
                background: { type: 'solid', color: '#1E222D' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: 'rgba(43, 43, 67, 0.5)' },
                horzLines: { color: 'rgba(43, 43, 67, 0.5)' },
            },
            crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
            rightPriceScale: { borderColor: 'rgba(43, 43, 67, 0.5)' },
            timeScale: {
                borderColor: 'rgba(43, 43, 67, 0.5)',
                timeVisible: true,
                secondsVisible: false,
            },
        });

        candleSeries = chartInstance.addCandlestickSeries({
            title: 'Nifty 50',
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a',
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.05,
            }
        });

        candleSeries.setData(uniqueChartData);
        chartInstance.timeScale().fitContent();

    } catch (e) {
        console.error(e);
        if (loading) loading.style.display = 'none';
        if (container) container.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Error loading data: ${e.message}<br><pre style="text-align:left; color: #ff8888; font-size: 10px;">${e.stack}</pre></div>`;
    }
}
