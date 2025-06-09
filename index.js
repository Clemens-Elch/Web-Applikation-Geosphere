// set station Id to select of menu + loads station with select
// leaves the selected station in the menu

window.addEventListener("DOMContentLoaded", () => {
    const dropdownButton = document.getElementById("dropdownMenuButton");

    document.getElementById("leibnitz-wagna").addEventListener("click", (e) => {
        e.preventDefault();
        dropdownButton.textContent = "Leibnitz-Wagna"; // update label
        loadStationData(54);
    });

    document.getElementById("graz-strassgang").addEventListener("click", (e) => {
        e.preventDefault();
        dropdownButton.textContent = "Graz-Straßgang"; // update label
        loadStationData(16413);
    });
});


function renderStationData(timestamps, temperatures) {
    const detailsList = document.getElementById("stationData");
    detailsList.innerHTML = "";
// checks if timestamps and temperatures are valid arrays
    if (!Array.isArray(timestamps) || !Array.isArray(temperatures)) {
        detailsList.innerHTML = "Error";
        return;
    }

    //?? is a null-save fallback for null and undefined data - it replaces with string "N/A"

    timestamps.forEach((timestamp, i) => {

        const userRow = `
            <div class="row border-bottom py-2">
                <div class="col-3">
                   ${new Date(timestamp).toLocaleString()}
                </div>
                <div class="col-3">
                    ${temperatures[i] ?? "N/A"} °C
                </div>
            </div>
        `;
        detailsList.innerHTML += userRow;
    });
}

async function loadStationData(id) {
    if (!id) return; // no station selected
    try {
        const response = await fetch(`
                    https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h?station_ids=${id}&parameters=tl&start=2024-01-01T00:00:00Z&end=2025-01-01T23:59:59Z`
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
            temperatures = firstFeature.properties.parameters.tl.data;
        }

        const midday = [];
        const middayTemperatures = [];

        timestamps.forEach((ts, index) => {
            const date = new Date(ts);
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();

            if (hours === 12 && minutes === 0 && temperatures[index] !== null && temperatures[index] !== undefined) {
                midday.push(ts);
                middayTemperatures.push(temperatures[index]);
            }
        });

        renderStationData(midday, middayTemperatures);
    } catch (error) {
        console.error("Error loading details:", error);
    }
}

