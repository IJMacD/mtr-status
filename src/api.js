import { formatTime } from "./util";

export function getTrainsAtStation (line, station) {
    return fetch(`https://rt.data.gov.hk/v1/transport/mtr/getSchedule.php?line=${line}&sta=${station}`).then(async r => {
        const data = await r.json();

        if (data.status !== 1) {
            console.log(data);
            return;
        }

        const stationData = data.data[`${line}-${station}`];
        const upList = stationData.UP || [];
        const downList = stationData.DOWN || [];

        return [
            ...upList.map(mapTrain).map(t => (t.direction = "up",t)),
            ...downList.map(mapTrain).map(t => (t.direction = "down",t)),
        ].sort((a,b) => a.time - b.time);;
    });
}
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