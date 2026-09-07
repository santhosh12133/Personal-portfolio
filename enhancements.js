(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ready = () => {
        document.body.classList.add('premium-ready');

        // Remove any legacy theme toggle from previously deployed versions.
        document.querySelectorAll('.theme-toggle').forEach(element => element.remove());

        const transition = document.createElement('div');
        transition.className = 'section-transition';
        transition.setAttribute('aria-hidden', 'true');
        document.body.appendChild(transition);

        const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
        const sections = navLinks
            .map(link => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        // Smooth section-to-section navigation with a lightweight transition layer.
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

        // Keep the navigation state synchronized with the section currently in view.
        if (sections.length) {
            const sectionObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
                });
            }, { rootMargin: '-30% 0px -55% 0px', threshold: 0 });
            sections.forEach(section => sectionObserver.observe(section));
        }

        // Cinematic project-by-project scroll experience.
        const projectSection = document.querySelector('#projects');
        const projectItems = projectSection ? [...projectSection.querySelectorAll('.project-showcase')] : [];
        if (projectItems.length) {
            const rail = document.createElement('div');
            rail.className = 'project-scroll-rail';
            rail.setAttribute('aria-hidden', 'true');

            const counter = document.createElement('span');
            counter.className = 'project-scroll-counter';
            rail.appendChild(counter);

            const dots = projectItems.map((item, index) => {
                const dot = document.createElement('span');
                dot.className = 'project-scroll-dot';
                dot.dataset.projectIndex = index;
                rail.appendChild(dot);
                return dot;
            });
            projectSection.appendChild(rail);

            const setActiveProject = index => {
                projectItems.forEach((item, itemIndex) => {
                    item.classList.toggle('project-scroll-active', itemIndex === index);
                    item.classList.toggle('project-scroll-muted', !reduceMotion && itemIndex !== index);
                });
                dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
                const number = String(index + 1).padStart(2, '0');
                const total = String(projectItems.length).padStart(2, '0');
                counter.innerHTML = `<strong>${number}</strong> / ${total}`;
            };

            if (!reduceMotion) {
                const projectObserver = new IntersectionObserver(entries => {
                    const visible = entries
                        .filter(entry => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                    if (visible) setActiveProject(projectItems.indexOf(visible.target));
                }, { rootMargin: '-24% 0px -44% 0px', threshold: [0.1, 0.3, 0.55, 0.75] });
                projectItems.forEach(item => projectObserver.observe(item));

                // Add a restrained depth shift while each project travels through the viewport.
                let ticking = false;
                const updateProjectDepth = () => {
                    const viewportCenter = window.innerHeight * 0.5;
                    projectItems.forEach(item => {
                        const rect = item.getBoundingClientRect();
                        const center = rect.top + rect.height * 0.5;
                        const distance = (center - viewportCenter) / Math.max(window.innerHeight, 1);
                        const clamped = Math.max(-1, Math.min(1, distance));
                        const lift = Math.abs(clamped) < 0.7 ? (1 - Math.abs(clamped) / 0.7) * 7 : 0;
                        item.style.setProperty('--project-depth', `${lift.toFixed(2)}px`);
                        item.style.setProperty('--project-progress', `${(1 - Math.min(1, Math.abs(clamped))).toFixed(2)}`);
                    });
                    ticking = false;
                };
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateProjectDepth);
                        ticking = true;
                    }
                }, { passive: true });
                updateProjectDepth();
            } else {
                setActiveProject(0);
            }
        }

        // Premium back-to-top control.
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

        // Subtle 3D depth on project visuals; disabled for touch/reduced-motion users.
        if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
            document.querySelectorAll('.project-visual').forEach(card => {
                card.classList.add('premium-tilt');
                card.addEventListener('pointermove', event => {
                    const rect = card.getBoundingClientRect();
                    const x = (event.clientX - rect.left) / rect.width - 0.5;
                    const y = (event.clientY - rect.top) / rect.height - 0.5;
                    card.style.transform = `perspective(1100px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-3px)`;
                });
                card.addEventListener('pointerleave', () => { card.style.transform = ''; });
            });
        }

        // Add the professional contact form without changing the existing portfolio markup.
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
