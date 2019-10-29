import React from 'react';
import './App.css';

import TV from './TV';
import { formatTime, findLine, findStation, getStationsOnLine } from './util';

const liveLines = [ "AEL", "TCL", "WRL", "TKL" ];

function App() {
  const [ line, setLine ] = React.useState("WRL");
  const [ station, setStation ] = React.useState("HUH");
  const [ nextTrains, setNextTrains ] = React.useState([]);
  const count = useAlarm(60 * 1000);

  React.useEffect(() => {
    if (!line || !station) {
      return;
    }

    fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${station}`).then(async r => {
      const data = await r.json();

      if (data.status !== 1) {
        console.log(data);
        return;
      }

      const stationData = data.data[`${line}-${station}`];
      const upList = stationData.UP || [];
      const downList = stationData.DOWN || [];

      const nextTrains = [
        ...upList.map(mapTrain).map(t => (t.direction = "up",t)),
        ...downList.map(mapTrain).map(t => (t.direction = "down",t)),
      ];

      nextTrains.sort((a,b) => a.time - b.time);

      setNextTrains(nextTrains);
    });
  }, [ line, station, count ]);

  function safeSetLine (line) {
    safeSetStation("");
    setLine(line);
  }

  function safeSetStation (station) {
    setStation(station);
    setNextTrains([]);
  }

  const lineData = findLine(line);
  const lineStations = getStationsOnLine(line);

  return (
    <div className="App">
      <ul className="App-line-list">
        {
          liveLines.map(l => {
            const line = findLine(l);
            return (
              <li key={l}>
                <button
                  onClick={() => safeSetLine(l)}
                  className="App-lineButton"
                  style={{ background: line.color, color: "white" }}
                >
                  {line.name}
                </button>
              </li>
            )
          })
        }
      </ul>
      <div>
        <h2>{lineData.name}</h2>
        <ul className="App-station-list">
        {
          lineStations.map((s,i) => (
            <li key={s.id}>
              <button className="App-stationButton" onClick={() => safeSetStation(s.code)}>
                <div className={`App-line ${i===0?"App-lineStart":""} ${i===lineStations.length-1?"App-lineEnd":""}`} style={{ backgroundColor: lineData.color }} />
                <div className="App-station" />
                <div className="App-stationName">{s.name}</div>
              </button>
            </li>
          ))
        }
        </ul>
      </div>
      { station &&
        <div>
          <h1>{findStation(station).name}</h1>
          <TV station={station} trains={nextTrains} />
        </div>
      }
    </div>
  );
}

export default App;

/**
 *
 * @param {object} t
 * @param {string} t.ttnt   "0", Time To Next Train
 * @param {string} t.valid  "Y",
 * @param {string} t.plat   "1",
 * @param {string} t.time   "2019-10-28 10:52:00",
 * @param {string} t.source "-", "+",
 * @param {string} t.dest   "TUM",
 * @param {string} t.seq    "1"
 */
function mapTrain (t) {
  const time = new Date(t.time.replace(" ", "T") + "+08:00");

  return {
    // id: `${station}:${t.dest}:${formatTime(time)}`,
    id: `${t.dest}:${formatTime(time)}`,
    time,
    destination: t.dest,
    platform: t.plat,
  }
}

function useAlarm (duration) {
  const [ count, setCount ] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setCount(count => count + 1), duration);
    return () => clearInterval(id);
  }, [duration])

  return count;
}