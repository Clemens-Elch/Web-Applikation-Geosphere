// set station Id to select of menu + loads station with select
// leaves the selected station in the menu
let selectedStationId = null;

window.addEventListener("DOMContentLoaded", () => {
    const dropdownButton = document.getElementById("dropdownMenuButton");

    document.getElementById("leibnitz-wagna").addEventListener("click", (e) => {
        e.preventDefault();
        dropdownButton.textContent = "Leibnitz-Wagna"; // update label
        selectedStationId = 54;
    });

    document.getElementById("graz-strassgang").addEventListener("click", (e) => {
        e.preventDefault();
        dropdownButton.textContent = "Graz-Straßgang"; // update label
        selectedStationId = 16413;
    });
    setEndDay()
    setStartDay()

    document.getElementById("loadDataBtn").addEventListener("click", () => {
        if (selectedStationId) {
            loadStationData(selectedStationId);
        } else {
            alert("Please select a station.");
        }
    });
});

// set date as default in date input
function setStartDay() {
    const endDate = new Date(document.getElementById("dateEnd").value);
    endDate.setDate(endDate.getDate() - 9);
    const startDateStr = endDate.toISOString().split("T")[0];
    document.getElementById("dateStart").value = startDateStr;
}
function setEndDay() {
    let today = new Date().toISOString().split("T")[0]
    document.getElementById("dateEnd").value = today;
}


function renderStationData(dates, avgTemp, avgWind, totalRain, totalSun) {
    const detailsList = document.getElementById("stationData");
    let html = `
    <div class="row fw-bold border-bottom py-2">
      <div class="col-2">Date</div><div class="col-2">Avg Temp (°C)</div>
      <div class="col-2">Avg Wind (m/s)</div><div class="col-2">Rainfall (mm)</div>
      <div class="col-2">Sunshine (h)</div>
    </div>
  `;
    dates.forEach((date, i) => {
        html += `
      <div class="row border-bottom py-2">
        <div class="col-2">${date}</div>
        <div class="col-2">${avgTemp[i]}</div>
        <div class="col-2">${avgWind[i]}</div>
        <div class="col-2">${totalRain[i]}</div>
        <div class="col-2">${totalSun[i]}</div>
      </div>`;
    });
    detailsList.innerHTML = html;
}

async function loadStationData(id) {
    if (!id) return; // no station selected
    //getting my dates and formatting them
    const startDate = document.getElementById("dateStart").value;
    const endDate = document.getElementById("dateEnd").value;

    if (!startDate || !endDate) {
        alert("Start or end date missing");
        return;
    }

    // Convert to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate the difference in days
    const diffTime = Math.abs(end - start);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 10) {
        alert("The date range must not exceed 10 days.");
        return;
    }

    const startISO = `${startDate}T00:00:00Z`;
    const endISO = `${endDate}T23:59:59Z`;

    try {
        const response = await fetch(`
                    https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h?station_ids=${id}&parameters=tl,ff,rr,so_h&start=${startISO}&end=${endISO}`
        );
        const data = await response.json();

        const timestamps = Array.isArray(data.timestamps) ? data.timestamps : [];
        const features = Array.isArray(data.features) ? data.features : [];
        const firstFeature = features[0];

        let temperatures = [];
        // safely checks if the temperature data (tl.data) exists and is a valid array before assigning it to the temperatures variable.
        if (
            firstFeature?.properties?.parameters?.tl?.data &&
            Array.isArray(firstFeature.properties.parameters.tl.data)
        ) {
            temperatures = firstFeature?.properties?.parameters?.tl?.data ?? [];
        }

        let wind = [];
        // safely checks if the wind data (ff.data) exists and is a valid array before assigning it to the wind variable.
        if (
            firstFeature?.properties?.parameters?.ff?.data &&
            Array.isArray(firstFeature.properties.parameters.ff.data)
        ) {
            wind = firstFeature?.properties?.parameters?.ff?.data ?? [];

        }

        let rainfall = [];
        // safely checks if the rainfall data (rr.data) exists and is a valid array before assigning it to the rainfall variable.
        if (
            firstFeature?.properties?.parameters?.rr?.data &&
            Array.isArray(firstFeature.properties.parameters.rr.data)
        ) {
            rainfall = firstFeature?.properties?.parameters?.rr?.data ?? [];

        }

        let hoursOfSunshine = [];
        // safely checks if the sun data (so_h.data) exists and is a valid array before assigning it to the sun variable.
        if (
            firstFeature?.properties?.parameters?.so_h?.data &&
            Array.isArray(firstFeature.properties.parameters.so_h.data)
        ) {
            hoursOfSunshine = firstFeature?.properties?.parameters?.so_h?.data ?? [];

        }

        const midday = [];
        const middayTemperatures = [];
        const middayWind = [];
        const middayRainfall = [];
        const middayHoursOfSunshine = [];

        timestamps.forEach((ts, index) => {
            const date = new Date(ts);
            if (
                date.getUTCHours() === 12 &&
                date.getUTCMinutes() === 0 &&
                temperatures[index] != null &&
                wind[index] != null &&
                rainfall[index] != null &&
                hoursOfSunshine[index] != null
            ) {
                midday.push(ts);
                middayTemperatures.push(temperatures[index]);
                middayWind.push(wind[index]);
                middayRainfall.push(rainfall[index]);
                middayHoursOfSunshine.push(hoursOfSunshine[index]);
            }
        });

        const dailyData = {}; // map date -> accumulators

        timestamps.forEach((ts, i) => {
            const dt = new Date(ts);
            const dateStr = dt.toISOString().split("T")[0];

            if (!dailyData[dateStr]) {
                dailyData[dateStr] = { count: 0, sumTemp: 0, sumWind: 0, sumRain: 0, sumSun: 0 };
            }
            const day = dailyData[dateStr];
            if (temperatures[i] != null) { day.sumTemp += temperatures[i]; day.count += 1; }
            if (wind[i] != null) { day.sumWind += wind[i]; }
            if (rainfall[i] != null) { day.sumRain += rainfall[i]; }
            if (hoursOfSunshine[i] != null) { day.sumSun += hoursOfSunshine[i]; }
        });

// Now build arrays of averages
        const dates = Object.keys(dailyData).sort();
        const avgTemp = [], avgWind = [], totalRain = [], totalSun = [];

        dates.forEach(dayStr => {
            const d = dailyData[dayStr];
            avgTemp.push((d.sumTemp / d.count).toFixed(2));
            avgWind.push((d.sumWind / d.count).toFixed(2));
            totalRain.push(d.sumRain.toFixed(2));
            totalSun.push(d.sumSun.toFixed(2));
        });

// Render
        renderStationData(dates, avgTemp, avgWind, totalRain, totalSun);
    } catch (error) {
        console.error("Error loading details:", error);
    }
}

