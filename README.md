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


Backlog – 5 User Stories (+ 1 Bonus)

    Hinweis • Alle Stories sind vertical slices: Backend-Fetch → UI. • Acceptance Criteria (AC) sind zu testen und die Tests zu dokumentieren (als Textdatei). • Naming-Konvention für Branches: US<n>-<stichwort>.

US 1 – „Erste Daten sichtbar machen“

    Als Nutzer möchte ich für Station 54 den Parameter tl im festen Zeitraum 01.01.2024 – 01.01.2025 sehen, damit ich einen ersten Temperatur-Überblick erhalte.

AC

    Statischer HTML-Button „Daten laden“ oder automatische Initialisierung.
    Fetch → JSON → Tabelle (Datum | tl).
    Werte in °C, auf 1 Dezimalstelle gerundet.
    Simple Fehlerbehandlung (Console Log reicht).

US 2 – „Stationswahl ermöglichen“

    Als Nutzer möchte ich zwischen den Stationen Graz Straßgang (16413) und Leibnitz-Wagna (54) umschalten können, um Messungen vergleichen zu können.

AC

    Dropdown mit den beiden Stationsnamen.
    Auswahl triggert neuen Fetch; Tabelle aktualisiert sich.
    Datum & tl bleiben wie in US 1.

US 3 – „Zeitraum frei wählen“

    Als Nutzer möchte ich Start- und Enddatum über zwei Date-Picker eingeben, um beliebige Zeitbereiche auszuwerten.

AC

    Zwei <input type="date"> Felder (min/max = API-Grenzen).
    Validierung: Start ≤ Ende, Zeitspanne ≤ 10 Tage (Performance-Schutz).
    Tabelle zeigt tl für den gewählten Range.
    Stationswahl aus US 2 bleibt funktionsfähig.

US 4 – „Parameter auswählen“

    Als Nutzer möchte ich über Checkboxen bestimmen, welche Messgrößen (tl, ff, rr, so_h) abgefragt werden, um nur relevante Daten zu sehen.

AC

    Vier Checkboxen, tl vorselektiert.
    Tabelle zeigt jeweils eine Spalte pro aktivem Parameter, inklusive Einheiten.
    Neustart des Fetch, wenn Auswahl geändert wird.
    Leere Werte sauber kennzeichnen (z. B. „–“).

US 5 – „Tabelle nutzbar machen“

    Als Nutzer möchte ich die Tabelle sortieren (auf Header-Klick).

AC

    Sortieren auf jede Spaltenüberschrift (asc/desc-Toggle).
    Responsives Layout ⇒ auf Smartphone horizontal scrollbar.

BONUS-US 6 – „Daten grafisch erleben“

    Als User möchte ich eine interaktive Grafik der ausgewählten Parameter sehen, um Trends schneller zu erkennen.

Empfohlene Library: Chart.js v4 (leichtgewichtig, vanilla-freundlich).

AC

    Button „Diagramm anzeigen“ öffnet Canvas mit Linien- oder Balkendiagramm.
    Mehrere Parameter ⇒ unterschiedliche Linien (Legende, Tooltip).
    Aktualisiert sich bei Filter-/Datums-Änderung (Re-Render).
