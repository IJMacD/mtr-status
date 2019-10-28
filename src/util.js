import lines from './data/lines';
import stations from './data/stations';

/**
 *
 * @param {Date} d
 */
export function formatTime (d) {
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

/**
 * @param {string} code
 */
export function findStation (code) {
  for (const station of stations) {
    if (station.code === code) return station;
  }
}

/**
 * @param {string} code
 */
export function findLine (code) {
  for (const line of lines) {
    if (line.code === code) return line;
  }
}

/**
 * @param {string} code
 */
export function getStationsOnLine (code) {
  return stations.filter(s => s.lines.includes(code));
}