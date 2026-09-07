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
        const question = document.createElement('span');
        question.className = 'hero-question';
        question.textContent = 'What happens when real-world problems become too complex for manual work?';

        title.appendChild(question);
        title.setAttribute('aria-label', question.textContent);

        desc.innerHTML = '';
        const solution = document.createElement('span');
        solution.className = 'hero-solution';
        solution.textContent = 'I build software that can understand them, process them, and turn them into action.';
        desc.appendChild(solution);

        const focus = document.createElement('div');
        focus.className = 'hero-reference-focus';
        focus.textContent = 'Backend systems · AI · APIs · RAG · Automation';
        desc.insertAdjacentElement('afterend', focus);

        const brand = document.querySelector('.nav-brand');
        if (brand) brand.textContent = 'Santhosh Kumar.';
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeroReference, { once: true });
    } else {
        initHeroReference();
    }
})();
