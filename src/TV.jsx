import React from 'react';
import { findStation, formatTime } from './util';
import './TV.css';
import { useAlarm } from './hooks';

function TV ({ trains }) {
    useAlarm(10 * 1000);

    return (
        <div className="TV-screen">
            <div className="TV-clockHolder"><span className="TV-clock">{formatTime(new Date())}</span></div>
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

export default React.memo(TV);