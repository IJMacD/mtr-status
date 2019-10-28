import React from 'react';
import './App.css';

import TV from './TV';
import { formatTime, findLine, getStationsOnLine } from './util';

const liveLines = [ "AEL", "TCL", "WRL", "TKL" ];

function App() {
  const [ line, setLine ] = React.useState("WRL");
  const [ station, setStation ] = React.useState("HUH");
  const [ nextTrains, setNextTrains ] = React.useState([]);
  const count = useAlarm(60 * 1000);

  React.useEffect(() => {
    setNextTrains([]);

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
        ...upList.map(mapTrain),
        ...downList.map(mapTrain),
      ];

      nextTrains.sort((a,b) => a.time - b.time);

      setNextTrains(nextTrains);
    });
  }, [ line, station, count ]);

  function safeSetLine (line) {
    setStation("");
    setLine(line);
  }

  return (
    <div className="App">
      <ul>
        {
          liveLines.map(l => <li key={l}><button onClick={() => safeSetLine(l)}>{findLine(l).name}</button></li>)
        }
      </ul>
      <div>
        <h2>{findLine(line).name}</h2>
        <ul>
        {
          getStationsOnLine(line).map(s => <li key={s.id}><button onClick={() => setStation(s.code)}>{s.name}</button></li>)
        }
        </ul>
      </div>
      { station && <TV station={station} trains={nextTrains} /> }
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