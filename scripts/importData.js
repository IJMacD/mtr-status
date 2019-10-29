const path = require('path');
const fs = require('fs');
const fetch = require("fetch-everywhere");

const LINE_FILENAME = path.join(__dirname, "../src/data/lines.json");
const STATION_FILENAME = path.join(__dirname, "../src/data/stations.json");

const headers = new Headers();
headers.set("Referer", "http://www.mtr.com.hk/en/customer/services/index.php");

fetch("http://www.mtr.com.hk/share/customer/include/jp.php", { headers }).then(async r => {
    const body = await r.text();

    const match = /var heavyRailDetails = ([^;]+)/.exec(body);

    if (!match) {
        console.error("Can't find data.");
        return;
    }

    const data = JSON.parse(match[1]);

    const lines = data.lines.map(l => ({
        id: l.ID,
        code: l.alias,
        name: l.nameEN,
        nameZH: l.name,
        color: "#" + l.color,
        stations: l.stationIDs.map(id => data.stations.find(s => s.ID === id).alias),
    }));

    const stations = data.stations.map(s => ({
        id: s.ID,
        code: s.alias,
        name: s.nameEN,
        nameZH: s.name,
        lines: s.lineIDs.map(id => data.lines.find(l => l.ID === id).alias),
        coordinates: s.coordinates,
    }));

    fs.writeFile(LINE_FILENAME, JSON.stringify(lines, null, 4), e => e && console.log(e));

    fs.writeFile(STATION_FILENAME, JSON.stringify(stations, null, 4), e => e && console.log(e));
});