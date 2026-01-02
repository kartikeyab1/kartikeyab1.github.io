/*
 * ANIMATIONS.JS
 * 
 * INDEX:
 * 1. Utilities
 * 2. Decrypted Text
 * 3. Magnet Lines
 * 4. Liquid Glass Nav
 * 5. [Add next animation here]
 */

// ========== 1. UTILITIES ==========

function debounce(func, wait = 20) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function throttle(func, limit = 100) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


// ========== 2. DECRYPTED TEXT ==========
// Source: ReactBits - https://reactbits.dev/text-animations/decrypted-text

class DecryptedText {
    constructor(el, options = {}) {
        this.el = el;
        this.originalText = el.innerText || el.textContent;

        this.options = {
            text: options.text || this.originalText,
            speed: options.speed || 50,
            maxIterations: options.maxIterations || 10,
            sequential: options.sequential || false,
            revealDirection: options.revealDirection || 'start',
            useOriginalCharsOnly: options.useOriginalCharsOnly || false,
            characters: options.characters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
            className: options.className || '',
            encryptedClassName: options.encryptedClassName || 'decrypted-char',
            animateOn: options.animateOn || 'view',
            onComplete: options.onComplete || null,
        };

        this.displayText = this.options.text;
        this.isHovering = false;
        this.isScrambling = false;
        this.revealedIndices = new Set();
        this.hasAnimated = false;
        this.interval = null;

        this.init();
    }

    init() {
        this.render();

        if (this.options.animateOn === 'hover' || this.options.animateOn === 'both') {
            this.setupHoverTrigger();
        }

        if (this.options.animateOn === 'view' || this.options.animateOn === 'both') {
            this.setupScrollTrigger();
        }
    }

    setupHoverTrigger() {
        this.el.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.startScramble();
        });

        this.el.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.stopScramble();
        });
    }

    setupScrollTrigger() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.isHovering = true;
                    this.hasAnimated = true;
                    this.startScramble();
                }
            });
        }, { root: null, rootMargin: '0px', threshold: 0.1 });

        observer.observe(this.el);
    }

    getNextIndex() {
        const len = this.options.text.length;

        switch (this.options.revealDirection) {
            case 'start':
                return this.revealedIndices.size;
            case 'end':
                return len - 1 - this.revealedIndices.size;
            case 'center': {
                const mid = Math.floor(len / 2);
                const off = Math.floor(this.revealedIndices.size / 2);
                const next = this.revealedIndices.size % 2 === 0 ? mid + off : mid - off - 1;

                if (next >= 0 && next < len && !this.revealedIndices.has(next)) return next;
                for (let i = 0; i < len; i++) {
                    if (!this.revealedIndices.has(i)) return i;
                }
                return 0;
            }
            default:
                return this.revealedIndices.size;
        }
    }

    shuffleText() {
        const text = this.options.text;
        const chars = this.options.useOriginalCharsOnly
            ? [...new Set(text.split(''))].filter(c => c !== ' ')
            : this.options.characters.split('');

        if (this.options.useOriginalCharsOnly) {
            const positions = text.split('').map((char, i) => ({
                char, isSpace: char === ' ', index: i, isRevealed: this.revealedIndices.has(i)
            }));

            const pool = positions.filter(p => !p.isSpace && !p.isRevealed).map(p => p.char);

            // Fisher-Yates shuffle
            for (let i = pool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [pool[i], pool[j]] = [pool[j], pool[i]];
            }

            let idx = 0;
            return positions.map(p => {
                if (p.isSpace) return ' ';
                if (p.isRevealed) return text[p.index];
                return pool[idx++];
            }).join('');
        } else {
            return text.split('').map((char, i) => {
                if (char === ' ') return ' ';
                if (this.revealedIndices.has(i)) return text[i];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join('');
        }
    }

    startScramble() {
        if (this.interval) clearInterval(this.interval);
        this.isScrambling = true;
        let iter = 0;

        this.interval = setInterval(() => {
            if (this.options.sequential) {
                if (this.revealedIndices.size < this.options.text.length) {
                    this.revealedIndices.add(this.getNextIndex());
                    this.displayText = this.shuffleText();
                    this.render();
                } else {
                    this.stopScramble();
                }
            } else {
                this.displayText = this.shuffleText();
                this.render();
                iter++;
                if (iter >= this.options.maxIterations) {
                    this.stopScramble();
                    this.displayText = this.options.text;
                    this.render();
                }
            }
        }, this.options.speed);
    }

    stopScramble() {
        if (this.interval) clearInterval(this.interval);
        this.interval = null;
        this.isScrambling = false;

        if (!this.isHovering) {
            this.displayText = this.options.text;
            this.revealedIndices = new Set();
            this.render();
        }

        if (this.options.onComplete) this.options.onComplete();
    }

    render() {
        this.el.innerHTML = this.displayText.split('').map((char, i) => {
            const done = this.revealedIndices.has(i) || !this.isScrambling || !this.isHovering;
            const cls = done ? this.options.className : this.options.encryptedClassName;
            return `<span class="${cls}">${char}</span>`;
        }).join('');
    }

    trigger() {
        this.isHovering = true;
        this.revealedIndices = new Set();
        this.startScramble();
    }

    reset() {
        this.stopScramble();
        this.isHovering = false;
        this.hasAnimated = false;
        this.revealedIndices = new Set();
        this.displayText = this.options.text;
        this.el.innerText = this.options.text;
    }
}

function initDecryptedText() {
    document.querySelectorAll('[data-decrypt]').forEach(el => {
        new DecryptedText(el, {
            speed: parseInt(el.dataset.decryptSpeed) || 50,
            maxIterations: parseInt(el.dataset.decryptIterations) || 10,
            sequential: el.dataset.decryptSequential === 'true',
            revealDirection: el.dataset.decryptDirection || 'start',
            useOriginalCharsOnly: el.dataset.decryptOriginalChars === 'true',
            characters: el.dataset.decryptChars,
            encryptedClassName: el.dataset.decryptClass || 'decrypted-char',
            animateOn: el.dataset.decryptOn || 'view',
        });
    });
}

window.DecryptedText = DecryptedText;


// ========== 3. MAGNET LINES ==========
// Source: ReactBits - https://reactbits.dev

class MagnetLines {
    constructor(container, options = {}) {
        this.container = container;

        this.options = {
            rows: options.rows || 9,
            columns: options.columns || 9,
            lineColor: options.lineColor || 'rgba(107, 155, 209, 0.6)',
            lineWidth: options.lineWidth || '2px',
            lineHeight: options.lineHeight || '24px',
            baseAngle: options.baseAngle || -10,
            arrows: options.arrows || false,
        };

        this.items = [];
        this.onPointerMove = this.onPointerMove.bind(this);

        this.init();
    }

    init() {
        this.container.classList.add('magnet-lines');
        if (this.options.arrows) {
            this.container.classList.add('magnet-arrows');
        }
        this.container.style.gridTemplateColumns = `repeat(${this.options.columns}, 1fr)`;
        this.container.style.gridTemplateRows = `repeat(${this.options.rows}, 1fr)`;

        const total = this.options.rows * this.options.columns;

        for (let i = 0; i < total; i++) {
            const span = document.createElement('span');
            span.style.setProperty('--rotate', `${this.options.baseAngle}deg`);
            span.style.setProperty('--line-color', this.options.lineColor);
            span.style.width = this.options.lineWidth;
            span.style.height = this.options.lineHeight;

            if (!this.options.arrows) {
                span.style.backgroundColor = this.options.lineColor;
            }

            this.container.appendChild(span);
            this.items.push(span);
        }

        window.addEventListener('pointermove', this.onPointerMove);

        // Set initial position to center
        if (this.items.length) {
            const midIndex = Math.floor(this.items.length / 2);
            const rect = this.items[midIndex].getBoundingClientRect();
            this.onPointerMove({ clientX: rect.x, clientY: rect.y });
        }
    }

    onPointerMove(e) {
        const pointer = { x: e.clientX, y: e.clientY };

        this.items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerX = rect.x + rect.width / 2;
            const centerY = rect.y + rect.height / 2;

            const b = pointer.x - centerX;
            const a = pointer.y - centerY;
            const c = Math.sqrt(a * a + b * b) || 1;

            const r = ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1);
            item.style.setProperty('--rotate', `${r}deg`);
        });
    }

    destroy() {
        window.removeEventListener('pointermove', this.onPointerMove);
        this.container.innerHTML = '';
    }
}

function initMagnetLines() {
    document.querySelectorAll('[data-magnet-lines]').forEach(el => {
        new MagnetLines(el, {
            rows: parseInt(el.dataset.magnetRows) || 9,
            columns: parseInt(el.dataset.magnetColumns) || 9,
            lineColor: el.dataset.magnetColor || 'rgba(107, 155, 209, 0.6)',
            lineWidth: el.dataset.magnetWidth || '2px',
            lineHeight: el.dataset.magnetHeight || '24px',
            baseAngle: parseInt(el.dataset.magnetAngle) || -10,
            arrows: el.dataset.magnetArrows === 'true',
        });
    });
}

window.MagnetLines = MagnetLines;


// ========== 4. LIQUID GLASS NAV - iOS 26 ==========
// Refractive glass navigation with chromatic aberration

class LiquidGlassNav {
    constructor(container, options = {}) {
        this.container = container;

        this.options = {
            blurAmount: options.blurAmount || '20px',
            tint: options.tint || 'rgba(255, 255, 255, 0.1)',
            borderColor: options.borderColor || 'rgba(255, 255, 255, 0.2)',
            activeColor: options.activeColor || 'var(--accent)',
        };

        this.items = [];
        this.hoverBlob = null;

        this.init();
    }

    init() {
        this.container.classList.add('liquid-glass-nav');
        this.container.style.setProperty('--lg-blur', this.options.blurAmount);
        this.container.style.setProperty('--lg-tint', this.options.tint);
        this.container.style.setProperty('--lg-border', this.options.borderColor);
        this.container.style.setProperty('--lg-active', this.options.activeColor);

        // Get or create nav items wrapper
        let navWrapper = this.container.querySelector('.lg-nav-items');
        if (!navWrapper) {
            navWrapper = document.createElement('div');
            navWrapper.className = 'lg-nav-items';

            const links = Array.from(this.container.querySelectorAll('a'));
            links.forEach(link => navWrapper.appendChild(link));
            this.container.appendChild(navWrapper);
        }

        // Create hover blob with glass layers for chromatic aberration
        this.hoverBlob = document.createElement('div');
        this.hoverBlob.className = 'lg-hover-blob';
        this.hoverBlob.innerHTML = `
            <div class="lg-glass-layer lg-glass-r"></div>
            <div class="lg-glass-layer lg-glass-g"></div>
            <div class="lg-glass-layer lg-glass-b"></div>
            <div class="lg-glass-shine"></div>
        `;
        navWrapper.appendChild(this.hoverBlob);

        // Setup each nav item
        const links = navWrapper.querySelectorAll('a:not(.lg-hover-blob)');
        links.forEach((link, i) => {
            link.classList.add('lg-item');

            this.items.push({
                el: link,
                index: i
            });

            link.addEventListener('mouseenter', (e) => this.onEnter(e, i));
            link.addEventListener('mouseleave', (e) => this.onLeave(e, i));
            link.addEventListener('mousemove', (e) => this.onMove(e, i));
        });
    }

    onEnter(e, index) {
        const item = this.items[index];
        const rect = item.el.getBoundingClientRect();
        const navRect = this.container.querySelector('.lg-nav-items').getBoundingClientRect();

        this.hoverBlob.style.width = `${rect.width}px`;
        this.hoverBlob.style.height = `${rect.height}px`;
        this.hoverBlob.style.left = `${rect.left - navRect.left}px`;
        this.hoverBlob.style.top = `${rect.top - navRect.top}px`;
        this.hoverBlob.style.opacity = '1';
        this.hoverBlob.style.transform = 'scale(1)';

        item.el.classList.add('lg-hovered');
    }

    onLeave(e, index) {
        const item = this.items[index];

        this.hoverBlob.style.opacity = '0';
        this.hoverBlob.style.transform = 'scale(0.95)';

        item.el.classList.remove('lg-hovered');
    }

    onMove(e, index) {
        const rect = this.items[index].el.getBoundingClientRect();

        // Mouse position 0-1
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        // Chromatic aberration offset based on mouse
        const offsetX = (x - 0.5) * 6;
        const offsetY = (y - 0.5) * 6;

        this.hoverBlob.style.setProperty('--ca-x', `${offsetX}px`);
        this.hoverBlob.style.setProperty('--ca-y', `${offsetY}px`);

        // Shine position
        this.hoverBlob.style.setProperty('--shine-x', `${x * 100}%`);
        this.hoverBlob.style.setProperty('--shine-y', `${y * 100}%`);
    }

    setActive(index) {
        this.items.forEach((item, i) => {
            item.el.classList.toggle('lg-active', i === index);
        });
    }
}

function initLiquidGlassNav() {
    document.querySelectorAll('[data-liquid-glass-nav]').forEach(el => {
        new LiquidGlassNav(el, {
            blurAmount: el.dataset.lgBlur,
            tint: el.dataset.lgTint,
            borderColor: el.dataset.lgBorder,
            activeColor: el.dataset.lgActive,
        });
    });
}

window.LiquidGlassNav = LiquidGlassNav;


// ========== 5. [NEXT ANIMATION] ==========




// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
    initDecryptedText();
    initMagnetLines();
    initLiquidGlassNav();
});