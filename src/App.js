import React from 'react';
import './App.css';

import TV from './TV';
import { findLine, findStation, getStationsOnLine } from './util';
import StationPicker from './StationPicker';
import { useAlarm } from './hooks';
import { getTrainsAtStation } from './api';

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

    getTrainsAtStation(line, station).then(setNextTrains);
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
        <StationPicker line={lineData} stations={lineStations} setStation={safeSetStation} />
      </div>
      { station &&
        <div>
          <h1>{findStation(station).name}</h1>
          <TV trains={nextTrains} />
        </div>
      }
    </div>
  );
}

export default App;
