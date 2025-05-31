# SYP-Geosphere
Climate Data Display



Ziel Die Studierenden entwickeln eine kleine Web-Applikation (HTML + CSS + Vanilla-JS), die stündliche Klimadaten (tl, ff, rr, so_h) der Stationen 16413 (Graz Straßgang) und/oder 54 (Leibnitz-Wagna) aus der Geosphere-Austria-API abruft, tabellarisch darstellt – und optional auch grafisch visualisiert. Gearbeitet wird strikt nach dem GitHub-Flow: jede User Story ➔ eigener Branch, Pull Request, Code-Review, Merge in main.

API-Steckbrief
Aspekt 	Wert
Basis-Endpoint 	https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h
Stationen 	16413,54
Parameter 	tl (Temp 2 m, °C), ff (Wind m/s), rr (Niederschlag mm), so_h (Sonnenschein h)
Zeitformat 	ISO 8601, z. B. 2024-01-01T00:00:00Z
Beispiel-Query 	https://dataset.api.hub.geosphere.at/v1/station/historical/klima-v2-1h?station_ids=16413&parameters=tl&start=2025-01-01T00:00:00Z&end=2025-01-01T23:00:00Z

Hier das Frontend von Geosphere zum Probieren: https://dataset.api.hub.geosphere.at/app/frontend/station/historical/klima-v2-1h
