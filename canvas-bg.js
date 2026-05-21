/* ==========================================================================
   Cyber-Data Node Network Canvas Background (canvas-bg.js)
   Optimised particle system reflecting active theme tokens with energy saving.
   ========================================================================== */

class DataNodeNetwork {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.particleCount = 65;
        this.connectionDistance = 110;
        this.baseSpeed = 0.4;
        
        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resizeCanvas();
        this.particles = [];
        
        // Dynamically scale particle count based on screen size
        if (window.innerWidth < 768) {
            this.particleCount = 25;
            this.connectionDistance = 80;
        } else {
            this.particleCount = 75;
            this.connectionDistance = 120;
        }

        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.baseSpeed,
                vy: (Math.random() - 0.5) * this.baseSpeed,
                radius: Math.random() * 2 + 1.5,
                pulseSpeed: Math.random() * 0.05 + 0.01,
                pulseVal: Math.random() * Math.PI
            });
        }
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    // Helper to get raw HSL tokens from CSS variables
    getThemeColors() {
        const rootStyles = getComputedStyle(document.documentElement);
        const huePrimary = rootStyles.getPropertyValue('--hue-primary').trim();
        const isLightTheme = document.documentElement.classList.contains('light-theme');
        
        // Return standard representation
        return {
            particleColor: `hsla(${huePrimary}, 100%, ${isLightTheme ? '45%' : '60%'}, `,
            lineColor: `hsla(${huePrimary}, 100%, ${isLightTheme ? '40%' : '50%'}, `
        };
    }

    animate() {
        // Power-saving mode: Pause canvas calculations when tab is hidden or minimized
        if (document.hidden) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const colors = this.getThemeColors();
        const length = this.particles.length;

        for (let i = 0; i < length; i++) {
            const p = this.particles[i];
            
            // Adjust position
            p.x += p.vx;
            p.y += p.vy;
            
            // Pulse radius slightly to simulate data pulsing
            p.pulseVal += p.pulseSpeed;
            const radiusOffset = Math.sin(p.pulseVal) * 0.5;
            const currentRadius = Math.max(1, p.radius + radiusOffset);

            // Screen boundary bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Draw Node
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = colors.particleColor + '0.7)';
            this.ctx.fill();

            // Handle mouse interactions (subtle gravitational pull towards cursor)
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    // Move slightly towards/away from mouse (cyber gravity)
                    p.x -= dx * force * 0.02;
                    p.y -= dy * force * 0.02;
                }
            }

            // Connection checks
            for (let j = i + 1; j < length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const alpha = (1 - distance / this.connectionDistance) * 0.18;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = colors.lineColor + `${alpha})`;
                    this.ctx.lineWidth = 0.8;
                    this.ctx.stroke();
                }
            }

            // Interactive connection to mouse
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const alpha = (1 - distance / this.mouse.radius) * 0.25;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = colors.lineColor + `${alpha})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Initialise when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    new DataNodeNetwork('cyber-bg-canvas');
});
