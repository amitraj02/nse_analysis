document.addEventListener('DOMContentLoaded', async () => {
    // Extract query parameters
    const params = new URLSearchParams(window.location.search);
    const dateStr = params.get('date');
    const year = parseInt(params.get('y'));
    const monthIndex = parseInt(params.get('m'));
    const day = parseInt(params.get('d'));

    if (!dateStr || isNaN(year)) {
        document.getElementById('page-title').innerText = "Error: No Date Selected";
        return;
    }

    document.getElementById('page-title').innerText = `Nifty Analysis - ${dateStr}`;

    try {
        // Load Daily data to compute Range and ATM
        const res = await fetch('index_HOLC_data/NIFTY_2026.csv');
        const text = await res.text();
        const lines = text.trim().split('\n');

        let nifty = null;
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length >= 5 && cols[0].trim() === dateStr) {
                nifty = {
                    high: parseFloat(cols[2]),
                    low: parseFloat(cols[3]),
                    close: parseFloat(cols[4])
                };
                break;
            }
        }

        if (nifty) {
            const range = nifty.high - nifty.low;
            document.getElementById('analysis-nifty-range').innerText = `${Math.round(range)} points (${Math.round(nifty.low)} - ${Math.round(nifty.high)})`;

            // Calculate ATM
            const atm = Math.round(nifty.close / 50) * 50;

            const strikesList = document.getElementById('analysis-strikes-list');
            let html = '';
            for (let i = 3; i >= -3; i--) {
                const strike = atm + (i * 50);
                if (i === 0) {
                    html += `<li style="color:; font-weight: bold; font-size:small; background: rgba(41, 40, 40, 0.2); padding: 0px; border-radius: 4px;">ATM: ${strike}</li>`; // ATM strike print krega
                } else if (i > 0) {
                    html += `<li style="color: #077616ff; font-size:small; font-weight: bold;"> +${i}: ${strike}</li>`; // Call type CE print krega
                } else {
                    html += `<li style="color: #720c0cff; font-size:small; font-weight: bold;"> -${i}: ${strike}</li>`;    // Put type PE print krega helpcode- html += `<li style="color: #720c0cff;">${i} ATM: ${strike}</li>`;
                }
            }

            strikesList.innerHTML = html;
            
            // Assign strike prices to Call and Put buttons
            const callButtons = document.querySelectorAll('.call_option button');
            const putButtons = document.querySelectorAll('.put_option button');
            
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const monthStr = monthNames[monthIndex];
            const dayStr = String(day).padStart(2, '0');
            
            let index = 0;
            for (let i = 3; i >= -3; i--) {
                const strike = atm + (i * 50);
                
                if (callButtons[index]) {
                    const btn = callButtons[index];
                    btn.innerText = `Call ${strike}`;
                    btn.onclick = () => loadOptionImage('CALL', strike);
                    
                    // Pre-check if image exists by trying to load it
                    const imgUrl = `option_chart_image/NIFTY ${dayStr} ${monthStr} ${strike} CALL.png`;
                    const imgTest = new Image();
                    imgTest.onload = () => {
                        btn.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#2ecc71';
                    };
                    imgTest.src = imgUrl;
                }
                
                if (putButtons[index]) {
                    const btn = putButtons[index];
                    btn.innerText = `Put ${strike}`;
                    btn.onclick = () => loadOptionImage('PUT', strike);
                    
                    // Pre-check if image exists by trying to load it
                    const imgUrl = `option_chart_image/NIFTY ${dayStr} ${monthStr} ${strike} PUT.png`;
                    const imgTest = new Image();
                    imgTest.onload = () => {
                        btn.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
                        btn.style.color = 'white';
                        btn.style.borderColor = '#2ecc71';
                    };
                    imgTest.src = imgUrl;
                }
                index++;
            }
        } else {
            document.getElementById('analysis-nifty-range').innerText = '--';
            document.getElementById('analysis-strikes-list').innerHTML = '<li>No Data Available for this Date</li>';
        }

    } catch (e) {
        console.error(e);
        document.getElementById('analysis-nifty-range').innerText = 'Error';
    }

    // Save date info to window object so displayNiftyChart can use it
    window.chartTargetInfo = { dateStr, year, monthIndex, day };
});

let chartInstance = null;
let candleSeries = null;

async function displayNiftyChart() {
    const { year, monthIndex, day } = window.chartTargetInfo;
    if (!year) return;

    const formattedMonth = String(monthIndex + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const targetDateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const container = document.getElementById('chart-container');
    container.style.display = 'block';
    container.innerHTML = '';

    const loading = document.getElementById('chart-loading');
    loading.style.display = 'block';

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

                    const dateObj = new Date(Date.UTC(2000, 0, 1, h, m, s));
                    const istTimeMs = dateObj.getTime() + (5.5 * 60 * 60 * 1000);
                    const istDateObj = new Date(istTimeMs);
                    const istHours = istDateObj.getUTCHours();
                    const istMinutes = istDateObj.getUTCMinutes();

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

        loading.style.display = 'none';

        if (chartData.length === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center; color: white;">No chart data available for this date.</div>';
            return;
        }

        chartData.sort((a, b) => a.time - b.time);

        const uniqueChartData = [];
        for (let i = 0; i < chartData.length; i++) {
            if (i === 0 || chartData[i].time !== chartData[i - 1].time) {
                uniqueChartData.push(chartData[i]);
            }
        }

        chartInstance = LightweightCharts.createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight || 400,
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

        // Scroll to chart
        container.scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
        console.error(e);
        loading.innerText = 'Error loading chart data.';
    }
}

// Function to load the option chart image in Section 2
function loadOptionImage(type, strike) {
    if (!window.chartTargetInfo) {
        alert("Please select a date first!");
        return;
    }
    
    const { year, monthIndex, day } = window.chartTargetInfo;
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthStr = monthNames[monthIndex];
    
    // Construct the expected file name (e.g. NIFTY 10 FEB 25850 PUT)
    // Note: The actual files have timestamps (e.g. _Tue 10 Feb '26_04-43-55) which static JS cannot match.
    // They must be renamed to match this base format, or a backend is needed.
    const filePrefix = `NIFTY ${String(day).padStart(2, '0')} ${monthStr} ${strike} ${type}`;
    
    if (type === 'CALL') {
        const img = document.getElementById('call-image-display');
        const placeholder = document.getElementById('call-image-placeholder');
        if (img && placeholder) {
            // We use wildcard in theory, but in HTML img src it needs to be exact.
            // Using the base name. You can use the terminal to strip timestamps from your images!
            img.src = `option_chart_image/${filePrefix}.png`; 
            img.style.display = 'block';
            placeholder.style.display = 'none';
        }
    } else {
        const img = document.getElementById('put-image-display');
        const placeholder = document.getElementById('put-image-placeholder');
        if (img && placeholder) {
            img.src = `option_chart_image/${filePrefix}.png`;
            img.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }
}
