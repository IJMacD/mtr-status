import React from 'react';
import { findStation, formatTime } from './util';
import './TV.css';

export default function TV ({ station, trains }) {
    return (
        <div className="TV-screen">
            <ul>
            {
                trains.map(t => (
                    <li key={t.id} className={`TV-direction-${t.direction}`}>
                        <span className="TV-destination">{findStation(t.destination).name}</span>
                        <span className="TV-platform">Platform {t.platform}</span>
                        <span className="TV-time">{formatTime(t.time)}</span>
                    </li>
                ))
            }
            </ul>
        </div>
    );
}