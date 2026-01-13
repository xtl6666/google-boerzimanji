
import React, { useEffect, useRef } from 'react';

interface LandscapeProps {
  biases: number[];        // Only first 8 biases (Row 1)
  rowState: number[];      // State of first 8 pixels
  isDay: boolean;
  learningStep: number;    
  temperature: number;
  lastAction: 'dig' | 'fill' | null;
}

const Landscape: React.FC<LandscapeProps> = ({ 
  biases, 
  rowState, 
  isDay, 
  learningStep, 
  temperature,
  lastAction
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // LOGICAL RESOLUTION
  const WIDTH = 400;
  const HEIGHT = 300;
  
  const SEGMENT_WIDTH = WIDTH / 8;
  
  const BASE_GROUND = 160; 
  const BIAS_SCALE = 20; 

  // --- PHYSICS STATE ---
  const balls = useRef(Array(14).fill(0).map((_, i) => ({
    x: WIDTH / 2,
    y: HEIGHT / 2, 
    vx: (Math.random() - 0.5) * 25,
    vy: (Math.random() - 0.5) * 25,
    radius: 8,
    color: '#ccc',
    target: i % 2 === 0 ? 0 : 7 
  })));

  useEffect(() => {
    if (!isDay) {
        balls.current.forEach(ball => {
            const distFromCenter = ball.x - WIDTH / 2;
            ball.vy -= 12 + Math.random() * 8; 
            const kickDirection = distFromCenter < 0 ? 1 : -1;
            ball.vx = kickDirection * (8 + Math.random() * 8);
        });
    }
  }, [isDay]);

  // Helper: Get Terrain Height
  // CHANGED: Use a Trapezoidal/Plateau shape instead of global cosine smoothing.
  // This visually isolates each index so changes in one don't look like changes in neighbors.
  const getGroundY = (x: number, currentBiases: number[]) => {
    const safeX = Math.max(0, Math.min(WIDTH - 0.1, x));
    
    // Which bin are we in?
    const idx = Math.floor(safeX / SEGMENT_WIDTH);
    const safeIdx = Math.max(0, Math.min(7, idx));
    
    // Position within the bin (0.0 to 1.0)
    const localRatio = (safeX % SEGMENT_WIDTH) / SEGMENT_WIDTH;
    
    const currentHeight = BASE_GROUND + (currentBiases[safeIdx] * BIAS_SCALE);
    
    // EDGE BLENDING
    // Only blend in the last 20% of the segment to the next neighbor
    // This creates flat "buckets" with steep walls
    const BLEND_ZONE = 0.25; 
    
    if (localRatio > (1 - BLEND_ZONE)) {
        const nextIdx = Math.min(7, safeIdx + 1);
        const nextHeight = BASE_GROUND + (currentBiases[nextIdx] * BIAS_SCALE);
        
        // Normalize ratio to 0..1 within the blend zone
        const blendProgress = (localRatio - (1 - BLEND_ZONE)) / BLEND_ZONE;
        
        // Smoothstep for nice corners
        const smooth = blendProgress * blendProgress * (3 - 2 * blendProgress);
        
        return currentHeight + (nextHeight - currentHeight) * smooth;
    } else if (localRatio < BLEND_ZONE) {
         // Blend from previous? No, the previous logic handles the right-side blend.
         // However, to make it symmetric, we can rely on the fact that 
         // getGroundY is continuous.
         // BUT, for simple plateau logic, checking the right side is sufficient 
         // as long as we iterate x continuously.
         // Wait, if we are at the START of a cell, we might be in the blend zone of the PREVIOUS cell.
         // But idx calculation handles that. 
         // Let's stick to: Cell is mostly flat, blends to NEXT at the end.
         return currentHeight;
    }

    return currentHeight;
  };

  // Helper: Slope Normal (Points UP)
  const getNormal = (x: number, currentBiases: number[]) => {
      // Sample slightly wider for normal calculation to smooth out the sharp corners physically
      const hL = getGroundY(x - 3, currentBiases);
      const hR = getGroundY(x + 3, currentBiases);
      const angle = Math.atan2(hR - hL, 6); 
      return { nx: Math.sin(angle), ny: -Math.cos(angle) };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // CLEAR
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // 1. Sky & Background
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, isDay ? '#eff6ff' : '#020617');
      grad.addColorStop(1, isDay ? '#bfdbfe' : '#1e1b4b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // Draw Neutral Line (Dotted)
      ctx.beginPath();
      ctx.strokeStyle = isDay ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(0, BASE_GROUND);
      ctx.lineTo(WIDTH, BASE_GROUND);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Terrain
      ctx.beginPath();
      ctx.moveTo(0, HEIGHT);
      // Finer step for smoother curves
      for (let x = 0; x <= WIDTH; x += 2) {
        if (x === 0) ctx.moveTo(x, getGroundY(x, biases));
        else ctx.lineTo(x, getGroundY(x, biases));
      }
      ctx.lineTo(WIDTH, HEIGHT);
      ctx.lineTo(0, HEIGHT);
      ctx.closePath();
      
      const terrainGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      terrainGrad.addColorStop(0, isDay ? '#60a5fa' : '#4c1d95');
      terrainGrad.addColorStop(1, isDay ? '#2563eb' : '#312e81');
      ctx.fillStyle = terrainGrad;
      ctx.fill();
      
      ctx.strokeStyle = isDay ? '#2563eb' : '#6366f1';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Grid lines & Text
      ctx.textAlign = 'center';
      for(let i=0; i<8; i++) {
          const x = i * SEGMENT_WIDTH;
          // Vertical Line
          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
          
          // Label
          ctx.fillStyle = isDay ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(i.toString(), x + SEGMENT_WIDTH/2, HEIGHT - 10);
      }

      // 3. PHYSICS ENGINE
      const GRAVITY = 0.5;
      let restitution = 0.5 + (temperature / 6.0); 
      if (restitution > 0.95) restitution = 0.95;

      balls.current.forEach((ball, i) => {
          // A. Forces
          ball.vy += GRAVITY;

          if (isDay) {
              const targetIdx = ball.target;
              const targetX = targetIdx * SEGMENT_WIDTH + SEGMENT_WIDTH/2;
              const dx = targetX - ball.x;
              ball.vx += dx * 0.04;
              ball.vx *= 0.92;
          } else {
              if (Math.random() < 0.15) {
                  ball.vx += (Math.random() - 0.5) * temperature * 1.5;
                  ball.vy += (Math.random() - 0.5) * temperature;
              }
              // Wall Repulsion
              if (ball.x < 30) ball.vx += 0.3;
              if (ball.x > WIDTH - 30) ball.vx -= 0.3;
          }

          // B. Update Position
          ball.x += ball.vx;
          ball.y += ball.vy;

          // C. STRICT BOUNDARIES
          if (ball.x < ball.radius) {
              ball.x = ball.radius; 
              ball.vx = Math.abs(ball.vx) * 0.6; 
          }
          if (ball.x > WIDTH - ball.radius) {
              ball.x = WIDTH - ball.radius;
              ball.vx = -Math.abs(ball.vx) * 0.6; 
          }
          if (ball.y < ball.radius) {
              ball.y = ball.radius;
              ball.vy = Math.abs(ball.vy) * 0.5; 
          }

          // D. Terrain Collision
          const groundY = getGroundY(ball.x, biases);
          
          if (ball.y + ball.radius > groundY) {
              ball.y = groundY - ball.radius;
              const { nx, ny } = getNormal(ball.x, biases);
              
              const vDotN = ball.vx * nx + ball.vy * ny;
              if (vDotN < 0) {
                  const j = -(1 + restitution) * vDotN;
                  ball.vx += j * nx;
                  ball.vy += j * ny;
              }

              const friction = isDay ? 0.8 : 0.98; 
              ball.vx *= friction;
              ball.vy *= friction;
          }

          // E. Emergency Respawn
          if (ball.y > HEIGHT + 100) {
             ball.x = WIDTH / 2;
             ball.y = HEIGHT / 2;
             ball.vx = 0;
             ball.vy = 0;
          }

          // 4. DRAW BALLS
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
          
          if (isDay) {
              ctx.fillStyle = '#f59e0b'; 
              ctx.strokeStyle = '#78350f'; 
          } else {
              const speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
              ctx.fillStyle = speed > 8 ? '#ffffff' : '#ec4899'; 
              ctx.strokeStyle = '#831843';
          }
          ctx.lineWidth = 1;
          ctx.fill();
          ctx.stroke();

          // 5. ACTION ICONS
          if (learningStep > 0) {
              // Only show action icon if ball interacts with ground
              if (ball.y + ball.radius >= groundY - 20) {
                  const binIdx = Math.floor(ball.x / SEGMENT_WIDTH);
                  const safeBinIdx = Math.max(0, Math.min(7, binIdx));
                  
                  // SYNC ICON WITH APP LOGIC
                  // Day Mode: Always allow Digging on targets
                  // Night Mode: Show Brick (Fill) whenever a ball is physically here.
                  // We do NOT check biases anymore, because the user can fill ANYWHERE a ball exists.
                  
                  let showIcon = false;
                  if (isDay) {
                      if (rowState[safeBinIdx] === 1) { // Normal day logic
                           if (binIdx === 0 || binIdx === 7) showIcon = true;
                      }
                  } else {
                      // Night Mode:
                      // If the physics ball is here, we show the icon.
                      // Logic in App.tsx will handle the rest (Force 1 for pits, probabilistic for mountains)
                      showIcon = true;
                  }

                  if (showIcon) {
                      const icon = isDay ? "🔨" : "🧱";
                      ctx.font = "24px sans-serif";
                      ctx.textAlign = "center";
                      ctx.fillText(icon, ball.x, ball.y - 25);
                  }
              }
          }
      });

      // DRAW VISIBLE BORDER
      ctx.strokeStyle = isDay ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, WIDTH, HEIGHT);
      
      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(requestRef.current);
  }, [biases, rowState, isDay, temperature, learningStep]);

  return (
    <div className="relative w-full h-full select-none rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-600 shadow-2xl">
      <div className="absolute left-2 top-2 z-10 pointer-events-none">
          <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider bg-black/30 px-2 py-1 rounded">
            {isDay ? 'Day: Guided Gravity' : 'Night: Free Roam'}
          </span>
      </div>
      <canvas 
        ref={canvasRef} 
        width={WIDTH} 
        height={HEIGHT} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
};

export default Landscape;
