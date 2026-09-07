/* Phase 2 — editorial hero entrance. Loaded as a separate enhancement layer. */
(() => {
    'use strict';

    const initPhase2Hero = () => {
        const hero = document.querySelector('#home.hero');
        if (!hero || hero.dataset.phase2Ready === 'true') return;
        hero.dataset.phase2Ready = 'true';
        hero.classList.add('phase2-hero');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const title = hero.querySelector('.hero-title');
        const desc = hero.querySelector('.hero-desc');
        const actions = hero.querySelector('.hero-actions');
        const visual = hero.querySelector('.hero-visual');

        if (title) {
            const text = title.textContent.trim();
            title.setAttribute('aria-label', text);
            title.setAttribute('aria-live', 'polite');
            if (!reduceMotion) {
                title.innerHTML = text.split(/(\s+)/).map((part, index) => {
                    if (/\s+/.test(part)) return part;
                    const delay = (index * 0.08).toFixed(2);
                    return `<span class="phase2-title-word" style="--phase2-delay:${delay}s" aria-hidden="true">${part}</span>`;
                }).join('');
            }
        }

        if (desc && !reduceMotion) {
            const text = desc.textContent.replace(/\s+/g, ' ').trim();
            desc.setAttribute('aria-label', text);
            desc.textContent = '';
            const line = document.createElement('span');
            line.className = 'phase2-desc-line';
            line.style.setProperty('--phase2-delay', '.55s');
            line.textContent = text;
            desc.appendChild(line);
        }

        if (actions) {
            actions.classList.add('phase2-action');
            actions.style.setProperty('--phase2-delay', '.78s');
        }

        if (visual) visual.classList.add('phase2-visual');

        if (reduceMotion) hero.classList.add('phase2-reduced-motion');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhase2Hero, { once: true });
    } else {
        initPhase2Hero();
    }
})();
