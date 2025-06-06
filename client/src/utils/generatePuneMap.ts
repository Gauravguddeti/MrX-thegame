export function generatePuneMap(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 900;

    // Background
    ctx.fillStyle = '#f5f3e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw major water bodies (Mula-Mutha Rivers)
    ctx.beginPath();
    ctx.strokeStyle = '#a5d5f7';
    ctx.lineWidth = 8;
    // Mula River
    ctx.moveTo(200, 300);
    ctx.bezierCurveTo(400, 280, 600, 320, 800, 400);
    // Mutha River
    ctx.moveTo(400, 600);
    ctx.bezierCurveTo(500, 500, 600, 450, 800, 400);
    ctx.stroke();

    // Major Roads
    const drawRoad = (x1: number, y1: number, x2: number, y2: number, name: string) => {
        ctx.beginPath();
        ctx.strokeStyle = '#d4d4d4';
        ctx.lineWidth = 15;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Road names
        ctx.fillStyle = '#666666';
        ctx.font = '12px Arial';
        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.save();
        ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
        ctx.rotate(angle);
        ctx.fillText(name, 0, -10);
        ctx.restore();
    };

    // Major roads
    drawRoad(300, 200, 900, 200, 'Pune-Mumbai Highway');
    drawRoad(600, 100, 600, 800, 'Pune-Satara Road');
    drawRoad(200, 400, 1000, 400, 'Karve Road');
    drawRoad(400, 200, 400, 700, 'Fergusson College Road');
    drawRoad(300, 300, 900, 300, 'JM Road');
    drawRoad(200, 500, 1000, 500, 'Solapur Road');
    drawRoad(700, 200, 700, 700, 'Nagar Road');

    // Landmarks
    const drawLandmark = (x: number, y: number, name: string) => {
        ctx.beginPath();
        ctx.fillStyle = '#e8d8c3';
        ctx.arc(x, y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#333333';
        ctx.font = '14px Arial';
        ctx.fillText(name, x + 20, y);
    };

    // Draw major landmarks
    drawLandmark(400, 350, 'Shaniwar Wada');
    drawLandmark(450, 380, 'Dagdusheth Temple');
    drawLandmark(200, 600, 'Sinhagad Fort');
    drawLandmark(600, 400, 'Pune Station');
    drawLandmark(800, 200, 'Airport');
    drawLandmark(700, 500, 'Phoenix Mall');
    drawLandmark(550, 450, 'Koregaon Park');
    drawLandmark(500, 300, 'Aga Khan Palace');
    drawLandmark(200, 200, 'Hinjewadi');
    drawLandmark(300, 400, 'Kothrud');
    drawLandmark(800, 600, 'Hadapsar');
    drawLandmark(400, 600, 'Katraj');
    drawLandmark(700, 300, 'Vishrantwadi');
    drawLandmark(300, 300, 'Baner');
    drawLandmark(500, 500, 'Camp Area');

    // Add a legend
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(950, 20, 220, 150);
    ctx.strokeStyle = '#666666';
    ctx.strokeRect(950, 20, 220, 150);
    
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Transport Types:', 970, 45);
    
    const transportTypes = [
        { color: '#ffa500', name: 'Rickshaw' },
        { color: '#4CAF50', name: 'PMPML Bus' },
        { color: '#ff69b4', name: 'Metro' },
        { color: '#4169e1', name: 'Local Train' }
    ];

    transportTypes.forEach((type, index) => {
        ctx.beginPath();
        ctx.strokeStyle = type.color;
        ctx.lineWidth = 3;
        ctx.moveTo(970, 65 + index * 25);
        ctx.lineTo(1020, 65 + index * 25);
        ctx.stroke();
        
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.fillText(type.name, 1030, 70 + index * 25);
    });
} 