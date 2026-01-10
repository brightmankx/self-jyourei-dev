class LightParticles {
    constructor() {
        this.canvas = document.getElementById("particles");
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");

        this.particles = [];
        this.particleCount = 40;

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const size = Math.random() * 10 + 4;  // 4〜14px

        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,

            vx: (Math.random() - 0.5) * 0.6,
            vy: Math.random() * 0.6 + 0.15,

            size: size,
            baseSize: size,
            sizeSpeed: (Math.random() - 0.5) * 0.02,

            alpha: Math.random() * 0.15 + 0.05,  // 0.05〜0.20 に弱める
            alphaSpeed: (Math.random() - 0.5) * 0.005,

            color: Math.random() < 0.5 ? "255,255,255" : "255,215,0"
        };
    }

    resetParticle(p) {
        p.x = Math.random() * this.canvas.width;
        p.y = this.canvas.height + 20;
        p.vx = (Math.random() - 0.5) * 0.6;
        p.vy = Math.random() * 0.6 + 0.15;
        p.alpha = Math.random() * 0.7 + 0.3;
        p.size = p.baseSize;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let p of this.particles) {
            p.x += p.vx;
            p.y -= p.vy;

            p.alpha += p.alphaSpeed;
            if (p.alpha < 0.1 || p.alpha > 1) {
                p.alphaSpeed *= -1;
                p.alpha = Math.max(0.1, Math.min(1, p.alpha));
            }

            p.size += p.sizeSpeed;
            if (p.size < p.baseSize * 0.7 || p.size > p.baseSize * 1.3) {
                p.sizeSpeed *= -1;
                p.size = Math.max(p.baseSize * 0.7, Math.min(p.baseSize * 1.3, p.size));
            }

            if (p.y < -50 || p.x < -50 || p.x > this.canvas.width + 50) {
                this.resetParticle(p);
            }

            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            this.ctx.shadowBlur = 15;  // 50 → 15
            this.ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

window.addEventListener("DOMContentLoaded", () => {
    new LightParticles();
});