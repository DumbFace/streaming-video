'use client'
import MuxPlayer from '@mux/mux-player-react';
import React, { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

export default function WatchVideo() {
    const videoUrl = "http://localhost:3005/public/videos/processed/medium-video/master.m3u8";
    return (
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2>Watching via Mux Player</h2>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <MuxPlayer
                    src={videoUrl}
                    streamType="on-demand"
                    autoPlay="muted"
                />
            </div>
        </div>
    );
}