import React, { useEffect, useRef } from 'react';
import { generateMapBackground } from '../utils/generateMapBackground';

const MapGenerator: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        generateMapBackground(canvas);
    }, []);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Convert canvas to blob
        canvas.toBlob((blob) => {
            if (!blob) return;
            
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pune-map-bg.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/jpeg', 0.9);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Pune Map Background Generator</h1>
            <div className="mb-4">
                <button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Download Map Background
                </button>
            </div>
            <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded"
                style={{ maxWidth: '100%' }}
            />
        </div>
    );
};

export default MapGenerator; 