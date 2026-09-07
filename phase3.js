/* Phase 3 — interactive About capability lens. No original content is rewritten. */
(() => {
    'use strict';

    const initCapabilityLens = () => {
        const about = document.querySelector('#about');
        const summary = about ? about.querySelector('.tech-summary') : null;
        if (!about || !summary || about.dataset.phase3Ready === 'true') return;

        const sourceItems = [...summary.querySelectorAll('.tech-pill')];
        if (!sourceItems.length) return;

        about.dataset.phase3Ready = 'true';
        about.classList.add('phase3-about');

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const lens = document.createElement('div');
        lens.className = 'phase3-capability-lens';
        lens.setAttribute('aria-label', 'Core engineering capabilities');
        lens.innerHTML = `
            <div class="phase3-capability-head">
                <span>CAPABILITY INDEX / 01</span>
                <span class="phase3-capability-state" aria-live="polite">${sourceItems.length} CORE CAPABILITIES</span>
            </div>
            <div class="phase3-capability-list"></div>`;

        const list = lens.querySelector('.phase3-capability-list');
        const state = lens.querySelector('.phase3-capability-state');

        sourceItems.forEach((source, index) => {
            const item = document.createElement('div');
            item.className = 'phase3-capability-item';
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.setAttribute('aria-label', `Focus capability ${index + 1}: ${source.textContent.trim()}`);
            item.innerHTML = `
                <span class="phase3-capability-index">${String(index + 1).padStart(2, '0')}</span>
                <span class="phase3-capability-name"></span>
                <span class="phase3-capability-mark" aria-hidden="true">+</span>`;
            item.querySelector('.phase3-capability-name').textContent = source.textContent.trim();
            list.appendChild(item);

            const activate = () => {
                list.querySelectorAll('.phase3-capability-item.is-active').forEach(active => {
                    if (active !== item) active.classList.remove('is-active');
                });
                item.classList.add('is-active');
                state.textContent = `${String(index + 1).padStart(2, '0')} / ${source.textContent.trim().toUpperCase()}`;
            };

            const deactivate = () => {
                item.classList.remove('is-active');
                if (!list.querySelector('.phase3-capability-item.is-active')) {
                    state.textContent = `${sourceItems.length} CORE CAPABILITIES`;
                }
            };

            item.addEventListener('pointerenter', activate);
            item.addEventListener('pointerleave', deactivate);
            item.addEventListener('focus', activate);
            item.addEventListener('blur', deactivate);
            item.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    activate();
                }
            });
        });

        summary.insertAdjacentElement('afterend', lens);
        summary.setAttribute('aria-hidden', 'true');
        summary.style.display = 'none';

        if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
            about.addEventListener('pointermove', event => {
                const rect = about.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                about.style.setProperty('--phase3-mx', (x * 28).toFixed(2));
                about.style.setProperty('--phase3-my', (y * 20).toFixed(2));
            });

            about.addEventListener('pointerleave', () => {
                about.style.setProperty('--phase3-mx', '0');
                about.style.setProperty('--phase3-my', '0');
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCapabilityLens, { once: true });
    } else {
        initCapabilityLens();
    }
})();
