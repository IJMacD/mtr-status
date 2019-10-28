import React from 'react';
import { findStation, formatTime } from './util';
import './TV.css';

export default function TV ({ station, trains }) {
    return (
        <div>
            <h1>{findStation(station).name}</h1>
            <div className="TV-screen">
                <ul>
                {
                    trains.map(t => <li key={t.id}>Platform {t.platform} to {findStation(t.destination).name} at {formatTime(t.time)}</li>)
                }
                </ul>
            </div>
        </div>
    );
}