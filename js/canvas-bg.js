/* ==========================================================================
   Ambient background — a slow drifting constellation.
   Deliberately restrained: it should read as texture, not as an effect.
   Skips entirely for reduced-motion users and pauses when the tab is hidden.
   ========================================================================== */
(function () {
    'use strict';

    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.remove();
        return;
    }

    var ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var nodes = [];
    var raf = null;
    var running = true;

    var LINK_DIST = 130;
    var SPEED = 0.16;

    function accent() {
        var light = document.documentElement.getAttribute('data-theme') === 'light';
        return light ? '3, 105, 161' : '56, 189, 248';
    }

    function density() {
        // Roughly one node per 18k device-independent pixels, clamped at both ends.
        return Math.max(24, Math.min(80, Math.round((w * h) / 18000)));
    }

    function seed() {
        var count = density();
        nodes = [];
        for (var i = 0; i < count; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * SPEED,
                vy: (Math.random() - 0.5) * SPEED,
                r: Math.random() * 1.3 + 0.6
            });
        }
    }

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        seed();
    }

    function frame() {
        if (!running) return;

        ctx.clearRect(0, 0, w, h);
        var rgb = accent();

        for (var i = 0; i < nodes.length; i++) {
            var a = nodes[i];

            // Links first, so the dots sit on top of them.
            for (var j = i + 1; j < nodes.length; j++) {
                var b = nodes[j];
                var dx = a.x - b.x;
                var dy = a.y - b.y;
                var dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < LINK_DIST) {
                    ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.13 * (1 - dist / LINK_DIST)).toFixed(3) + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            a.x += a.vx;
            a.y += a.vy;

            // Wrap rather than bounce — bouncing makes the viewport edges obvious.
            if (a.x < -10) a.x = w + 10;
            if (a.x > w + 10) a.x = -10;
            if (a.y < -10) a.y = h + 10;
            if (a.y > h + 10) a.y = -10;

            ctx.fillStyle = 'rgba(' + rgb + ',0.4)';
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
            ctx.fill();
        }

        raf = requestAnimationFrame(frame);
    }

    function start() {
        if (raf) return;
        running = true;
        raf = requestAnimationFrame(frame);
    }

    function stop() {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });

    // Don't burn cycles on a tab nobody is looking at.
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) { stop(); } else { start(); }
    });

    resize();
    start();
}());
