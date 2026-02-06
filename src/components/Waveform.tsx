import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
    url?: string;
    isRecording?: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ url, isRecording }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurfer = useRef<WaveSurfer | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            wavesurfer.current = WaveSurfer.create({
                container: containerRef.current,
                waveColor: '#ef4444',
                progressColor: '#f97316',
                cursorColor: '#ffffff',
                barWidth: 2,
                barRadius: 3,
                height: 120,
            });

            if (url) {
                wavesurfer.current.load(url);
            }

            return () => wavesurfer.current?.destroy();
        }
    }, [url]);

    return (
        <div className="w-full h-full relative">
            <div ref={containerRef} />
            {isRecording && (
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Live</span>
                </div>
            )}
        </div>
    );
};

export default Waveform;
