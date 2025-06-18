    // set station Id to select of menu + loads station with select
    // leaves the selected station in the menu
    // declare sortKey and sortDirection
    let selectedStationId = null;
    let currentSortKey = "date";
    let currentSortDirection = "asc";
    let rawData = []; // holds the latest fetched unsorted station data


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
        //temperature checkbox is always checked now when loading
        document.querySelectorAll('#parameterSelection input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.value === 'tl';
        });


        document.getElementById("selectAll").addEventListener("change", function () {
            const checked = this.checked;
            document.querySelectorAll('#parameterSelection input[type="checkbox"]').forEach(cb => {
                cb.checked = checked;
            });
        });
        document.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                document.getElementById("loadDataBtn").click();
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

    function getSelectedParameters() {
        const checkboxes = document.querySelectorAll('#parameterSelection input[type="checkbox"]:checked');
        return Array.from(
            document.querySelectorAll('#parameterSelection input[type="checkbox"]:checked')
        )
            .map(cb => cb.value)
            .filter(val => val !== 'selectAll');
    }


    function renderStationData(data, selectedParams) {
        const combinedData = [...data]; // shallow copy
        const sortKey = currentSortKey;
        const sortDirection = currentSortDirection;
        const detailsList = document.getElementById("stationData");


        // Sort logic

        combinedData.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (valA === "-") return 1;
            if (valB === "-") return -1;

            if (sortKey === "date") {
                valA = new Date(valA);
                valB = new Date(valB);
            } else if (!isNaN(valA) && !isNaN(valB)) {
                valA = parseFloat(valA);
                valB = parseFloat(valB);
            }

            return sortDirection === "asc" ? valA - valB : valB - valA;
        });


        // Table headers
        const sortIcon = "\u21C5"; // ⇅

        let html = `<div class="row fw-bold border-bottom py-2">`;
        html += `<div class="col-1 align-items-center">
                <span class="me-1">Date</span>
                <span class="sort-icon text-info" data-key="date" role="button" title="Sort">${sortIcon}</span>
            </div>`;
        if (selectedParams.includes("tl")) html += `<div class="col-3 align-items-center">
                <span class="me-1">Avg Temp (°C)</span>
                <span class="sort-icon text-info" data-key="tl" role="button" title="Sort">${sortIcon}</span>
            </div>`;
        if (selectedParams.includes("ff")) html += `<div class="col-3 align-items-center">
                <span class="me-1">Avg Wind (m/s)</span>
                <span class="sort-icon text-info" data-key="ff" role="button" title="Sort">${sortIcon}</span>
            </div>`;
        if (selectedParams.includes("rr")) html += `<div class="col-3 align-items-center">
                <span class="me-1">Rainfall (mm)</span>
                <span class="sort-icon text-info" data-key="rr" role="button" title="Sort">${sortIcon}</span>
            </div>`;
        if (selectedParams.includes("so_h")) html += `<div class="col-2 align-items-center">
                <span class="me-1">Sunshine (h)</span>
                <span class="sort-icon text-info" data-key="so_h" role="button" title="Sort">${sortIcon}</span>
            </div>`;

        html += `</div>`;

        // Table rows
        for (const entry of combinedData) {
            html += `<div class="row border-bottom py-2">`;
            html += `<div class="col-1">${entry.date}</div>`;
            if (selectedParams.includes("tl")) html += `<div class="col-3">${entry.tl}</div>`;
            if (selectedParams.includes("ff")) html += `<div class="col-3">${entry.ff}</div>`;
            if (selectedParams.includes("rr")) html += `<div class="col-3">${entry.rr}</div>`;
            if (selectedParams.includes("so_h")) html += `<div class="col-2">${entry.so_h}</div>`;
            html += `</div>`;
        }

        detailsList.innerHTML = html;

        // Sorting event listeners
        document.querySelectorAll(".sort-icon").forEach(icon => {
            icon.addEventListener("click", () => {
                const key = icon.dataset.key;

                if (key !== currentSortKey) {
                    currentSortKey = key;
                    currentSortDirection = "desc"; // now sorts descending on first click
                } else {
                    currentSortDirection = currentSortDirection === "asc" ? "desc" : "asc";
                }


                renderStationData(rawData, selectedParams); // Use original unsorted data
            });
        });


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
            const selectedParams = getSelectedParameters();
            if (selectedParams.length === 0) {
                alert("Please select at least one parameter.");
                return;
            }
            const paramString = selectedParams.join(",");
            const response = await fetch(`
                        https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h?station_ids=${id}&parameters=${paramString}&start=${startISO}&end=${endISO}`
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


            const dailyData = {}; // map date -> accumulators

            timestamps.forEach((ts, i) => {
                const dt = new Date(ts);
                const dateStr = dt.toISOString().split("T")[0];

                if (!dailyData[dateStr]) {
                    dailyData[dateStr] = {
                        tempCount: 0, windCount: 0, rainCount: 0, sunCount: 0,
                        sumTemp: 0, sumWind: 0, sumRain: 0, sumSun: 0
                    };
                }

                const day = dailyData[dateStr];

                if (temperatures[i] != null) {
                    day.sumTemp += temperatures[i];
                    day.tempCount += 1;
                }
                if (wind[i] != null) {
                    day.sumWind += wind[i];
                    day.windCount += 1;
                }
                if (rainfall[i] != null) {
                    day.sumRain += rainfall[i];
                    day.rainCount += 1;
                }
                if (hoursOfSunshine[i] != null) {
                    day.sumSun += hoursOfSunshine[i];
                    day.sunCount += 1;
                }
            });

    // Now build arrays of averages
            const dates = Object.keys(dailyData);
            const avgTemp = [], avgWind = [], totalRain = [], totalSun = [];

            dates.forEach(dayStr => {
                const d = dailyData[dayStr];
                avgTemp.push(d.tempCount ? (d.sumTemp / d.tempCount).toFixed(2) : "-");
                avgWind.push(d.windCount ? (d.sumWind / d.windCount).toFixed(2) : "-");
                totalRain.push(d.rainCount ? d.sumRain.toFixed(2) : "-");
                totalSun.push(d.sunCount ? d.sumSun.toFixed(2) : "-");
            });

            rawData = []; // reset

            for (let i = 0; i < dates.length; i++) {
                rawData.push({
                    date: dates[i],
                    tl: avgTemp[i],
                    ff: avgWind[i],
                    rr: totalRain[i],
                    so_h: totalSun[i]
                });
            }

            renderStationData(rawData, getSelectedParameters());


        } catch (error) {
            console.error("Error loading details:", error);
        }
    }

