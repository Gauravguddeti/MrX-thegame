import { generatePuneMap } from './generatePuneMap';

export function generateAndSaveMap() {
    const canvas = document.createElement('canvas');
    generatePuneMap(canvas);
    
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
} 