function renderStation54(timestamps, temperatures) {
    const detailsList = document.getElementById("station54");
    detailsList.innerHTML = "";

    if (!Array.isArray(timestamps) || !Array.isArray(temperatures)) {
        detailsList.innerHTML = "<p>Invalid data received.</p>";
        return;
    }

    timestamps.forEach((timestamp, i) => {
        const temperature = temperatures[i] ?? "N/A";

        const userRow = `
            <div class="row border-bottom py-2">
                <div class="col-3">
                   ${new Date(timestamp).toLocaleString()}
                </div>
                <div class="col-2">
                    ${temperature} °C
                </div>
            </div>
        `;
        detailsList.innerHTML += userRow;
    });
}






async function loadStation54() {
    try {
        const response = await fetch(
            "https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h?station_ids=54&parameters=tl&start=2025-01-01T00:00:00Z&end=2025-01-01T23:00:00Z"
        );
        const data = await response.json();

        console.log("typeof data.features:", typeof data.features);
        console.log("Is array?", Array.isArray(data.features));
        console.log("data.features:", data.features);

        const timestamps = Array.isArray(data.timestamps) ? data.timestamps : [];

        const features = Array.isArray(data.features) ? data.features : [];
        const firstFeature = features[0];

        let temperatures = [];

        if (
            firstFeature &&
            firstFeature.properties &&
            firstFeature.properties.parameters &&
            firstFeature.properties.parameters.tl &&
            Array.isArray(firstFeature.properties.parameters.tl.data)
        ) {
            temperatures = firstFeature.properties.parameters.tl.data;
        }

        console.log("Timestamps:", timestamps);
        console.log("Temperatures:", temperatures);

        renderStation54(timestamps, temperatures);
    } catch (error) {
        console.error("Error loading details:", error);
    }
}

window.onload = loadStation54;
