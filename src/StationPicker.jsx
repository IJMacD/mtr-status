import React from 'react';

export default function StationPicker({ stations, setStation, line }) {
  return (
    <ul className="App-station-list">
      {stations.map((s, i) => (<li key={s.id}>
        <button className="App-stationButton" onClick={() => setStation(s.code)}>
          <div className={`App-line ${i === 0 ? "App-lineStart" : ""} ${i === stations.length - 1 ? "App-lineEnd" : ""}`} style={{ backgroundColor: line.color }} />
          <div className="App-station" />
          <div className="App-stationName">{s.name}</div>
        </button>
      </li>))}
    </ul>
  );
}
