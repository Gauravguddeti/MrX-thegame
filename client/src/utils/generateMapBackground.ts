export function generateMapBackground(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  canvas.width = 1000;
  canvas.height = 800;

  // Background
  ctx.fillStyle = '#e8f4e4'; // Light green background
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw trees pattern
  const drawTree = (x: number, y: number, size: number) => {
    ctx.fillStyle = '#2d5a27'; // Dark green
    ctx.beginPath();
    ctx.arc(x, y - size/2, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a3317'; // Darker green for trunk
    ctx.fillRect(x - size/6, y, size/3, size);
  };

  // Scatter trees
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 10 + Math.random() * 10;
    drawTree(x, y, size);
  }

  // Water bodies (Mula-Mutha Rivers)
  ctx.beginPath();
  ctx.fillStyle = '#a5d5f7';
  
  // Mula River
  ctx.moveTo(300, 200);
  ctx.quadraticCurveTo(400, 250, 500, 300);
  ctx.quadraticCurveTo(600, 350, 700, 400);
  ctx.lineTo(710, 410);
  ctx.quadraticCurveTo(600, 360, 500, 310);
  ctx.quadraticCurveTo(400, 260, 290, 210);
  ctx.closePath();
  ctx.fill();

  // Mutha River
  ctx.beginPath();
  ctx.moveTo(400, 500);
  ctx.quadraticCurveTo(500, 450, 600, 400);
  ctx.lineTo(610, 410);
  ctx.quadraticCurveTo(510, 460, 410, 510);
  ctx.closePath();
  ctx.fill();

  // Pashan Lake
  ctx.beginPath();
  ctx.arc(300, 100, 40, 0, Math.PI * 2);
  ctx.fill();

  // Buildings
  const drawBuilding = (x: number, y: number, width: number, height: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    
    // Windows
    ctx.fillStyle = '#ffffff';
    const windowSize = 4;
    const windowGap = 8;
    for (let i = 0; i < Math.floor((height-10)/windowGap); i++) {
      for (let j = 0; j < Math.floor((width-10)/windowGap); j++) {
        ctx.fillRect(x + 5 + j*windowGap, y + 5 + i*windowGap, windowSize, windowSize);
      }
    }
  };

  // Draw major landmarks
  // Shaniwar Wada
  ctx.fillStyle = '#8b7355';
  ctx.beginPath();
  ctx.moveTo(400, 180);
  ctx.lineTo(450, 180);
  ctx.lineTo(425, 150);
  ctx.closePath();
  ctx.fill();
  drawBuilding(390, 180, 70, 50, '#8b7355');

  // Aga Khan Palace
  ctx.fillStyle = '#d4c5a8';
  ctx.beginPath();
  ctx.arc(850, 200, 30, 0, Math.PI * 2);
  ctx.fill();
  drawBuilding(830, 200, 60, 80, '#d4c5a8');

  // Sinhagad Fort
  ctx.fillStyle = '#8b7355';
  ctx.beginPath();
  ctx.moveTo(150, 230);
  ctx.lineTo(200, 230);
  ctx.lineTo(175, 200);
  ctx.closePath();
  ctx.fill();
  drawBuilding(140, 230, 70, 40, '#8b7355');

  // Scatter smaller buildings
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const width = 20 + Math.random() * 20;
    const height = 15 + Math.random() * 15;
    const color = `rgb(${200 + Math.random()*55}, ${180 + Math.random()*75}, ${160 + Math.random()*95})`;
    drawBuilding(x, y, width, height, color);
  }

  // Roads (will be overlaid by the game nodes and connections)
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 8;
  
  // Major roads
  const roads = [
    [[200, 100], [800, 100]],
    [[200, 300], [800, 300]],
    [[200, 500], [800, 500]],
    [[100, 200], [100, 600]],
    [[300, 200], [300, 600]],
    [[500, 200], [500, 600]],
    [[700, 200], [700, 600]]
  ];

  roads.forEach(([[x1, y1], [x2, y2]]) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
} 