import React, { useEffect, useRef } from 'react';

export default function ParticleGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let mouse = { x: width / 2, y: height / 2 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      angle: number;
      distance: number;
      color: string;
      size: number;
      vx: number = 0;
      vy: number = 0;

      constructor(originX: number, originY: number, angle: number, distance: number, color: string) {
        this.originX = originX;
        this.originY = originY;
        this.x = originX;
        this.y = originY;
        this.angle = angle;
        this.distance = distance;
        this.color = color;
        this.size = 3 + Math.random() * 2;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        
        // Mouse repulsion
        const maxDist = 150;
        const force = Math.max(0, maxDist - distToMouse) / maxDist;
        
        if (force > 0) {
          const angleToMouse = Math.atan2(dy, dx);
          const pushX = Math.cos(angleToMouse) * force * -5;
          const pushY = Math.sin(angleToMouse) * force * -5;
          this.vx += pushX;
          this.vy += pushY;
        }

        // Spring back to origin
        this.vx += (this.originX - this.x) * 0.05;
        this.vy += (this.originY - this.y) * 0.05;

        // Friction
        this.vx *= 0.85;
        this.vy *= 0.85;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        // The angle is tangent to the circle
        ctx.rotate(this.angle + Math.PI / 2);
        
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        
        ctx.restore();
      }
    }

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const centerX = width * 0.8;
      const centerY = height * 0.5;
      const maxRadius = Math.max(width, height) * 1.2;
      
      const rings = 35;
      
      for (let r = 1; r <= rings; r++) {
        const radius = r * 30;
        if (radius > maxRadius) continue;
        
        const circumference = 2 * Math.PI * radius;
        // The distance between particles on a ring
        const dotSpacing = 30; 
        const dotCount = Math.floor(circumference / dotSpacing);
        
        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2 + (r * 0.1); // Add a slight spiral offset
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          // Determine color based on distance
          let color = '#FFC107'; // yellow
          const distRatio = radius / maxRadius;
          if (distRatio > 0.6) {
            color = '#3B82F6'; // blue
          } else if (distRatio > 0.45) {
            color = '#8B5CF6'; // purple
          } else if (distRatio > 0.3) {
            color = '#EC4899'; // pink/red
          } else if (distRatio > 0.15) {
            color = '#F97316'; // orange
          }
          
          particles.push(new Particle(x, y, angle, radius, color));
        }
      }
    };

    initParticles();

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.6
      }}
    />
  );
}
