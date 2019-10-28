import React from 'react';
import { findStation, formatTime } from './util';

export default function TV ({ station, trains }) {
    return (
        <div>
            <h1>{findStation(station).name}</h1>
            <ul>
            {
                trains.map(t => <li key={t.id}>Platform {t.platform} to {findStation(t.destination).name} at {formatTime(t.time)}</li>)
            }
            </ul>
        </div>
    );
}