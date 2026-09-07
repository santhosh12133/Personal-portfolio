/* Hero reference redesign — rebuilds only the hero presentation using existing content/assets. */
(() => {
    'use strict';

    const initHeroReference = () => {
        const hero = document.querySelector('#home.hero');
        if (!hero || hero.dataset.heroReferenceReady === 'true') return;

        const title = hero.querySelector('.hero-title');
        const desc = hero.querySelector('.hero-desc');
        const actions = hero.querySelector('.hero-actions');
        if (!title || !desc || !actions) return;

        hero.dataset.heroReferenceReady = 'true';
        hero.classList.add('hero-reference');

        const tagline = document.createElement('div');
        tagline.className = 'hero-reference-tagline';
        tagline.textContent = 'BUILD · LEARN · IMPACT';
        tagline.setAttribute('aria-hidden', 'true');
        title.insertAdjacentElement('beforebegin', tagline);

        title.innerHTML = '';
        const greeting = document.createElement('span');
        greeting.className = 'hero-greeting';
        greeting.textContent = 'Hi, I’m';

        const name = document.createElement('span');
        name.className = 'hero-name';
        name.textContent = 'Santhosh';

        title.append(greeting, name);
        title.setAttribute('aria-label', 'Hi, I’m Santhosh');

        const brand = document.querySelector('.nav-brand');
        if (brand) brand.textContent = 'Santhosh Kumar.';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroReference, { once: true });
    } else {
        initHeroReference();
    }
})();
