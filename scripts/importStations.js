const fetch = require("fetch-everywhere");
const lines = require('../src/data/lines');
const station_codes = require('../src/data/station_codes');

Promise.all([
    fetch("http://www.mtr.com.hk/st/data/fcdata_json.php"),
    fetch("http://www.mtr.com.hk/share/customer/js/jplannerdata_en.js"),
]).then(async ([r1, r2]) => {
    const facilitiesData = await r1.json();
    const js = await r2.text();

    const facilitiesStations = facilitiesData.faresaver.facilities.map(s => {
        return {
            id: +s.STATION_ID,
            name: s.STATION_NAME_EN,
            nameZH: unescape(s.STATION_NAME_TC),
        };
    });

    const idRegex = /myValue(\d+) = "(\d*)"/ig;
    const nameRegex = /caption(\d+) = "([a-z &-]*)"/ig;

    let line, idMatch, nameMatch;

    const stations = [];

    while(idMatch = idRegex.exec(js)) {
        nameMatch = nameRegex.exec(js);

        if (!nameMatch) {
            console.error("No name match. id: " + idMatch[1]);
            break;
        }

        if (idMatch[1] !== nameMatch[1]) {
            console.error("Name out of sync. index: " + idMatch[1]);
            break;
        }

        // Over 200 includes Shenzhen and West Kowloon HSR
        if (+idMatch[1] > 200) {
            break;
        }

        const id = +idMatch[2];
        const name = nameMatch[2];

        if (name) {
            if (id === 0) {
                const lineMatch = /-- ([a-z &]+) --/i.exec(name);
                if (lineMatch) {
                    line = lines.find(l => l.name === lineMatch[1]);
                } else {
                    line = null;
                }
            } else {
                let stationLines;
                const lineMatch = new RegExp(`lineValue${idMatch[1]} = "([a-z,]*)"`).exec(js);
                if (lineMatch) {
                    if (lineMatch[1] === "tcline") {
                        stationLines = [ lines.find(l => l.code === "TCL").code ];
                    } else if (lineMatch[1] === "drline") {
                        stationLines = [ lines.find(l => l.code === "DRL").code ];
                    } else if (lineMatch[1] === "tcline,drline") {
                        stationLines = [
                            lines.find(l => l.code === "TCL").code,
                            lines.find(l => l.code === "DRL").code,
                        ];
                    } else if (line) {
                        stationLines = [ line.code ];
                    }
                } else if (line) {
                    stationLines = [ line.code ];
                } else {
                    console.error({id, name});
                    break;
                }

                const fs = facilitiesStations.find(s => s.id === id);

                if (!fs) {
                    console.error("Can't find ID: " + id);
                    break;
                }

                const addedStation = stations.find(s => s.id === id);
                const duplicateStation = stations.find(s => s.name === fs.name);

                if (addedStation) {
                    addedStation.lines.push(...stationLines);
                } else if (duplicateStation) {
                    duplicateStation.altID = Math.max(duplicateStation.id, id);
                    duplicateStation.id = Math.min(duplicateStation.id, id);
                    duplicateStation.lines.push(...stationLines);
                } else {
                    const station = {
                        ...fs,
                        lines: stationLines,
                    };

                    const code = findCode(station.name);

                    if (code) {
                        station.code = code;
                    }

                    stations.push(station);
                }
            }
        }
    }

    // stations.sort((a,b) => a.name.localeCompare(b.name));

    console.log(JSON.stringify(stations, null, 4));
});

/**
 *
 * @param {string} s
 */
function unescape(s) {
    const re = /&#([0-9]+);/g;
    return s.replace(re, ss => {
        const m = re.exec(ss);
        return String.fromCodePoint(+m[1]);
    });
}

function findCode (name) {
    for (const code in station_codes) {
        if (station_codes[code] === name) return code;
    }
}