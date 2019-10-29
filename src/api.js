import { formatTime, findLine } from "./util";

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
            ...upList.map(mapTrain).map(t => (t.id = `${station}:${t.id}`,t.direction = "up",t)),
            ...downList.map(mapTrain).map(t => (t.id = `${station}:${t.id}`,t.direction = "down",t)),
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

export async function getAllTrainsOnLine (line) {
    const stationCodes = findLine(line).stations;
    const allTrains = await Promise.all(stationCodes.map(s => getTrainsAtStation(line, s)));

    const allDownTrains = allTrains.map(trains => trains.filter(t => t.direction === "down"));

    const trains = [];

    /*
        1	*16:21	16:18	16:15
        2	*16:26	16:24	16:21	16:18
        3	*16:32	16:30	16:27	16:24	16:20	16:19	16:16
        4	*16:38	16:36	16:33	16:30	16:26	16:25	16:22	16:20	16:17
        5	*16:44	16:42	16:39	16:36	16:32	16:31	16:28	16:26	16:23	16:18	16:16
        6				            *16:42	16:37	16:35	16:31	16:29	16:27	16:22	16:20
        7					                *16:41	16:38	16:35	16:33	16:30	16:26	16:23
        8								                            *16:36	16:34	16:29	16:27
        9										                                    *16:33	16:30

    */

    trains.push(...allDownTrains[1].map(makeTrain));

    let cumlSkip = 0;

    for (let i = 2; i < allDownTrains.length; i++) {
        const prevStationTrains = allDownTrains[i-1];
        const stationTrains = allDownTrains[i];

        if (!stationTrains) {
            continue;
        }

        let skipCount = 0;

        if (prevStationTrains) {
            while (stationTrains[0].time >= prevStationTrains[skipCount].time) skipCount++;
        }

        cumlSkip += skipCount;

        for (let j = 0; j < stationTrains.length; j++) {
            const index = j + cumlSkip;

            if (index < trains.length) {
                const { destination, direction, ...trainAtStation } = stationTrains[j];
                trainAtStation.station = stationTrains[j].id.substr(0,3);
                trains[index].schedule.push(trainAtStation);
            } else  {
                trains.push(makeTrain(stationTrains[j]));
            }
        }
    }

    for (const train of trains) {
        train.currentStation = train.schedule[train.schedule.length - 1].station;
    }

    return trains;
}

let TID = 1;
function makeTrain(train) {
    const { destination, direction, ...trainAtStation } = train;
    trainAtStation.station = train.id.substr(0,3);
    return {
        id: `T${String(TID++).padStart(4, "0")}`,
        destination,
        direction,
        schedule: [
            trainAtStation,
        ],
    };
}
