(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ready = () => {
        document.body.classList.add('premium-ready');

        document.querySelectorAll('.theme-toggle').forEach(element => element.remove());

        const transition = document.createElement('div');
        transition.className = 'section-transition';
        transition.setAttribute('aria-hidden', 'true');
        document.body.appendChild(transition);

        const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
        const sections = navLinks
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        navLinks.forEach(link => {
            link.addEventListener('click', event => {
                const target = document.querySelector(link.getAttribute('href'));
                if (!target) return;
                event.preventDefault();

                if (!reduceMotion) {
                    transition.classList.remove('is-running');
                    void transition.offsetWidth;
                    transition.classList.add('is-running');
                }

                target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
                history.replaceState(null, '', link.getAttribute('href'));
            });
        });

        if (sections.length) {
            const sectionObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
                });
            }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
            sections.forEach(section => sectionObserver.observe(section));
        }

        // Highlight only the project currently being viewed.
        const projects = [...document.querySelectorAll('#projects .project-showcase')];
        if (projects.length) {
            const projectObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('project-current');
                    else entry.target.classList.remove('project-current');
                });
            }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
            projects.forEach(project => projectObserver.observe(project));

            // Isolated project-cover choreography: a restrained editorial reveal as each project enters view.
            if (!reduceMotion) {
                const choreographyStyle = document.createElement('style');
                choreographyStyle.textContent = `
                    #projects .project-showcase.premium-project-choreography .project-visual {
                        clip-path: inset(0 0 0 9% round 2px);
                        transform: translate3d(26px, 0, 0) scale(.985);
                        transition: clip-path .9s var(--premium-ease), transform .9s var(--premium-ease), filter .9s ease;
                        filter: saturate(.82) brightness(.88);
                    }
                    #projects .project-showcase.premium-project-choreography.reverse .project-visual {
                        clip-path: inset(0 9% 0 0 round 2px);
                        transform: translate3d(-26px, 0, 0) scale(.985);
                    }
                    #projects .project-showcase.premium-project-choreography.is-premium-entered .project-visual,
                    #projects .project-showcase.premium-project-choreography.reverse.is-premium-entered .project-visual {
                        clip-path: inset(0 0 0 0 round 2px);
                        transform: translate3d(0, 0, 0) scale(1);
                        filter: saturate(1) brightness(1);
                    }
                    #projects .project-showcase.premium-project-choreography::after {
                        content:'';
                        position:absolute;
                        left:0;
                        top:10%;
                        bottom:10%;
                        width:1px;
                        background:linear-gradient(180deg, transparent, rgba(204,0,0,.7), transparent);
                        opacity:0;
                        transform:scaleY(.25);
                        transform-origin:center;
                        transition:opacity .7s ease .12s, transform .8s var(--premium-ease) .12s;
                        pointer-events:none;
                    }
                    #projects .project-showcase.premium-project-choreography.is-premium-entered::after {
                        opacity:1;
                        transform:scaleY(1);
                    }
                    @media (max-width: 700px) {
                        #projects .project-showcase.premium-project-choreography .project-visual,
                        #projects .project-showcase.premium-project-choreography.reverse .project-visual {
                            clip-path: inset(0 0 0 0 round 2px);
                            transform: translate3d(0, 18px, 0) scale(.99);
                        }
                        #projects .project-showcase.premium-project-choreography.is-premium-entered .project-visual,
                        #projects .project-showcase.premium-project-choreography.reverse.is-premium-entered .project-visual {
                            transform: translate3d(0, 0, 0) scale(1);
                        }
                    }
                `;
                document.head.appendChild(choreographyStyle);

                projects.forEach(project => project.classList.add('premium-project-choreography'));

                const choreographyObserver = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) entry.target.classList.add('is-premium-entered');
                    });
                }, { rootMargin: '-12% 0px -38% 0px', threshold: 0.05 });
                projects.forEach(project => choreographyObserver.observe(project));
            }
        }

        const topButton = document.createElement('button');
        topButton.className = 'scroll-top-control';
        topButton.type = 'button';
        topButton.setAttribute('aria-label', 'Back to top');
        topButton.innerHTML = '&uarr;';
        document.body.appendChild(topButton);

        const syncTopButton = () => topButton.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.65);
        window.addEventListener('scroll', syncTopButton, { passive: true });
        syncTopButton();
        topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

        if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
            document.querySelectorAll('.project-visual').forEach(card => {
                card.classList.add('premium-tilt', 'premium-spotlight');
                card.addEventListener('pointermove', event => {
                    const rect = card.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width;
                    const y = (event.clientY - rect.top) / rect.height;
                    card.style.setProperty('--spotlight-x', `${(x * 100).toFixed(1)}%`);
                    card.style.setProperty('--spotlight-y', `${(y * 100).toFixed(1)}%`);
                    const tiltX = y - 0.5;
                    const tiltY = x - 0.5;
                    card.style.transform = `perspective(1100px) rotateX(${(-tiltX * 2.2).toFixed(2)}deg) rotateY(${(tiltY * 2.2).toFixed(2)}deg) translateY(-3px)`;
                });
                card.addEventListener('pointerleave', () => {
                    card.style.transform = '';
                    card.style.removeProperty('--spotlight-x');
                    card.style.removeProperty('--spotlight-y');
                });
            });
        }

        const contact = document.querySelector('#contact');
        if (contact && !document.querySelector('#contact-form')) {
            const form = document.createElement('form');
            form.className = 'premium-contact-form';
            form.id = 'contact-form';
            form.noValidate = true;
            form.innerHTML = `
                <div class="premium-contact-grid">
                    <div class="premium-contact-field">
                        <label for="premium-name">Name</label>
                        <input id="premium-name" name="name" type="text" autocomplete="name" required>
                    </div>
                    <div class="premium-contact-field">
                        <label for="premium-email">Email</label>
                        <input id="premium-email" name="email" type="email" autocomplete="email" required>
                    </div>
                    <div class="premium-contact-field full">
                        <label for="premium-message">Message</label>
                        <textarea id="premium-message" name="message" rows="6" required></textarea>
                    </div>
                </div>
                <div class="premium-contact-actions">
                    <button class="btn btn-primary" type="submit">SEND MESSAGE &rarr;</button>
                    <span class="premium-contact-status" id="premium-contact-status">● Ready to connect</span>
                </div>`;
            contact.appendChild(form);

            const status = form.querySelector('#premium-contact-status');
            form.addEventListener('submit', event => {
                event.preventDefault();
                const name = form.elements.name.value.trim();
                const email = form.elements.email.value.trim();
                const message = form.elements.message.value.trim();
                if (!name || !email || !message) {
                    status.textContent = '● Please complete all fields';
                    return;
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    status.textContent = '● Please enter a valid email';
                    return;
                }
                const subject = encodeURIComponent(`Portfolio message from ${name}`);
                const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                status.textContent = '● Opening your email client...';
                window.location.href = `mailto:santhoshkumarn1999@gmail.com?subject=${subject}&body=${body}`;
            });
        }
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
    else ready();
})();
