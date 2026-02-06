import React, { useEffect, useRef } from 'react';

interface LiveVisualizerProps {
    analyser: AnalyserNode | null;
}

const LiveVisualizer: React.FC<LiveVisualizerProps> = ({ analyser }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#ef4444');
                gradient.addColorStop(0.5, '#f97316');
                gradient.addColorStop(1, '#facc15');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [analyser]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full rounded-2xl opacity-80"
            width={300}
            height={100}
        />
    );
};

export default LiveVisualizer;
