/* Portfolio behaviour — a single script, loaded once at the end of <body>.
   Sections: 1 background video · 2 scroll reveals · 3 navigation · 4 dialogs
   · 5 pointer effects · 6 contact · 7 scroll chrome */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    /* ---------------------------------------------------------------- 1. Background video */
    const canvas = $('#scroll-canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const homeSection = $('#home');
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;

    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
    video.preload = isMobile ? 'metadata' : 'auto';

    const VIDEO_DURATION = 10;
    let targetTime = 0;
    let renderedTime = 0;
    let frameRequest = null;
    let scrollTicking = false;
    let resizeTimeout = null;

    // Cap DPR on mobile to keep the canvas cheap.
    const getDPR = () => {
        if (reduceMotion) return 1;
        const dpr = window.devicePixelRatio || 1;
        return isMobile ? Math.min(dpr, 1.5) : dpr;
    };

    const drawVideoFrame = () => {
        const cw = canvas.clientWidth;
        const ch = canvas.clientHeight;
        const vw = video.videoWidth;
        const vh = video.videoHeight;
        if (!vw || !vh) return;
        const scale = Math.max(cw / vw, ch / vh);
        context.drawImage(video, (cw - vw * scale) / 2, (ch - vh * scale) / 2, vw * scale, vh * scale);
    };

    const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = getDPR();
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawVideoFrame();
    };

    const animateBackground = () => {
        frameRequest = null;
        if (canvas.style.visibility === 'hidden' || reduceMotion) return;

        renderedTime += (targetTime - renderedTime) * 0.12;
        if (Math.abs(targetTime - renderedTime) < 0.015) renderedTime = targetTime;

        // Seeking is expensive on phones, so require a bigger jump there.
        const seekThreshold = isMobile ? 0.1 : 0.025;
        if (video.readyState >= 1 && !video.seeking && Math.abs(video.currentTime - renderedTime) > seekThreshold) {
            video.currentTime = renderedTime;
        }

        if (Math.abs(targetTime - renderedTime) > 0.001 || video.seeking) {
            frameRequest = requestAnimationFrame(animateBackground);
        }
    };

    const updateBackground = () => {
        const top = homeSection.offsetTop;
        const height = homeSection.offsetHeight;
        const inHome = window.scrollY >= top && window.scrollY < top + height;

        canvas.style.visibility = inHome ? 'visible' : 'hidden';

        if (!inHome) {
            if (frameRequest) cancelAnimationFrame(frameRequest);
            frameRequest = null;
            return;
        }

        const fraction = height > 0 ? (window.scrollY - top) / height : 0;
        targetTime = Math.min(VIDEO_DURATION, Math.max(0, fraction * VIDEO_DURATION));
        if (!frameRequest && !reduceMotion) frameRequest = requestAnimationFrame(animateBackground);
    };

    resizeCanvas();
    updateBackground();

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => { resizeCanvas(); updateBackground(); }, 150);
    });
    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => { updateBackground(); scrollTicking = false; });
    }, { passive: true });

    video.addEventListener('loadedmetadata', () => {
        updateBackground();
        // With preload="metadata" (phones) no frame is decoded until a seek happens,
        // which left the hero empty. Seeking to the first frame paints the portrait.
        if (video.currentTime === 0) video.currentTime = 0.001;
    });
    video.addEventListener('loadeddata', drawVideoFrame);
    video.addEventListener('seeked', drawVideoFrame);
    video.pause();

    // Assigning src is what starts the download, so do it once the page is idle.
    // (The old code set src immediately and then called load() again, which
    // restarted the request and threw away the first frame.)
    const startVideo = () => { video.src = './background-animation.webm'; };
    if ('requestIdleCallback' in window) requestIdleCallback(startVideo, { timeout: 2000 });
    else setTimeout(startVideo, 0);

    /* ---------------------------------------------------------------- 2. Scroll reveals */
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    $$('.fade-in-section').forEach(section => revealObserver.observe(section));

    // The project covers get a clip-path reveal; the project in view gets a red number.
    const projects = $$('#projects .project-showcase');
    if (projects.length) {
        const currentObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('project-current', entry.isIntersecting));
        }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
        projects.forEach(project => currentObserver.observe(project));

        if (!reduceMotion) {
            const enterObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) entry.target.classList.add('is-premium-entered');
                });
            }, { rootMargin: '-12% 0px -38% 0px', threshold: 0.05 });
            projects.forEach(project => {
                project.classList.add('premium-project-choreography');
                enterObserver.observe(project);
            });
        }
    }

    /* ---------------------------------------------------------------- 3. Navigation */
    const navbar = $('#navbar');
    const menuButton = $('.mobile-menu-btn');
    const navList = $('#nav-links');
    const transition = $('.section-transition');
    const sectionLinks = $$('a[href^="#"]', navList);

    const setMenu = open => {
        navbar.classList.toggle('nav-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    menuButton.addEventListener('click', () => setMenu(!navbar.classList.contains('nav-open')));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navbar.classList.contains('nav-open')) { setMenu(false); menuButton.focus(); }
    });

    const goToSection = (hash, trigger) => {
        const target = $(hash);
        if (!target) return false;
        if (transition && !reduceMotion) {
            transition.classList.remove('is-running');
            void transition.offsetWidth; // restart the animation
            transition.classList.add('is-running');
        }
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (location.hash !== hash) history.pushState(null, '', hash);
        if (trigger) trigger();
        return true;
    };

    // One handler for every in-page link (nav, footer, hero CTA, back to top).
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || link.getAttribute('href') === '#') return;
        if (goToSection(link.getAttribute('href'), () => setMenu(false))) event.preventDefault();
    });

    const sections = sectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
    const activeObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(link => {
                const active = link.getAttribute('href') === `#${entry.target.id}`;
                link.classList.toggle('is-active', active);
                if (active) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(section => activeObserver.observe(section));

    /* ---------------------------------------------------------------- 4. Dialogs */
    const quickNav = $('#quick-nav');
    const quickNavInput = $('#quick-nav-input');
    const quickNavResults = $('#quick-nav-results');
    const quickNavLinks = sectionLinks.map(link => link.cloneNode(true));

    quickNavLinks.forEach(link => {
        link.addEventListener('click', () => quickNav.close());
        quickNavResults.append(link);
    });

    const filterQuickNav = () => {
        const query = quickNavInput.value.trim().toLowerCase();
        quickNavLinks.forEach(link => { link.hidden = Boolean(query) && !link.textContent.toLowerCase().includes(query); });
    };
    quickNavInput.addEventListener('input', filterQuickNav);
    quickNavInput.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault(); // otherwise the form closes the dialog without going anywhere
        const first = quickNavLinks.find(link => !link.hidden);
        if (first) first.click();
    });

    document.addEventListener('keydown', event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            quickNav.showModal();
            quickNavInput.value = '';
            filterQuickNav();
            quickNavInput.focus();
        }
    });

    const detailsDialog = $('#architecture-details');
    const detailsTitle = $('#architecture-details-title');
    const detailsCopy = $('#architecture-details-copy');

    $$('.architecture-node').forEach(node => {
        node.setAttribute('role', 'button');
        node.setAttribute('tabindex', '0');
        const open = () => {
            const title = $('strong', node);
            const details = $('span', node);
            detailsTitle.textContent = title ? title.textContent : 'Architecture node';
            // <br> separators in the markup become line breaks in the dialog.
            detailsCopy.textContent = details
                ? details.innerHTML.split(/<br\s*\/?>/i).map(part => part.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim()).filter(Boolean).join(' · ')
                : 'Technical component in the system flow.';
            detailsDialog.showModal();
        };
        node.addEventListener('click', open);
        node.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
        });
    });

    $('#architecture-details-close').addEventListener('click', () => detailsDialog.close());
    // Clicking the dimmed backdrop closes either dialog.
    [detailsDialog, quickNav].forEach(dialog => {
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    });

    /* ---------------------------------------------------------------- 5. Pointer effects */
    const cursor = $('#custom-cursor');
    if (finePointer) {
        const cursorText = $('.cursor-text', cursor);

        document.addEventListener('mousemove', event => {
            cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
        });

        const cursorLabel = element => {
            if (element.classList.contains('project-visual')) return ['project', 'EXPLORE'];
            if (element.dataset.cursor === 'project') return ['project', 'VIEW'];
            if (element.matches('.btn-primary, .nav-cta')) return ['link', 'OPEN'];
            return ['link', 'LINK'];
        };
        const clearCursor = () => {
            cursor.classList.remove('cursor-active', 'cursor-explore', 'premium-cursor-context', 'cursor-context-link', 'cursor-context-project');
            cursorText.textContent = '';
        };

        const targets = $$('.project-visual, .nav-links a, .btn, .footer-links a, .footer-socials a, .footer-top-link, .copy-contact');
        targets.forEach(element => {
            element.addEventListener('pointerenter', () => {
                const [kind, label] = cursorLabel(element);
                clearCursor();
                cursor.classList.add('cursor-active', 'premium-cursor-context', `cursor-context-${kind}`);
                if (kind === 'project') cursor.classList.add('cursor-explore');
                cursorText.textContent = label;
            });
            element.addEventListener('pointerleave', clearCursor);
        });
    } else {
        cursor.style.display = 'none';
    }

    if (!reduceMotion && finePointer) {
        // Spotlight + very slight tilt on the project covers.
        $$('.project-visual').forEach(card => {
            card.classList.add('premium-tilt', 'premium-spotlight');
            card.addEventListener('pointermove', event => {
                const rect = card.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;
                card.style.setProperty('--spotlight-x', `${(x * 100).toFixed(1)}%`);
                card.style.setProperty('--spotlight-y', `${(y * 100).toFixed(1)}%`);
                card.style.transform = `perspective(1100px) rotateX(${(-(y - 0.5) * 2.2).toFixed(2)}deg) rotateY(${((x - 0.5) * 2.2).toFixed(2)}deg) translateY(-3px)`;
            });
            card.addEventListener('pointerleave', () => {
                card.style.transform = '';
                card.style.removeProperty('--spotlight-x');
                card.style.removeProperty('--spotlight-y');
            });
        });

        // Magnetic buttons stay subtle so they are never hard to click.
        $$('.btn-primary, .btn-secondary, .btn-outline, .nav-cta').forEach(element => {
            element.classList.add('premium-magnetic');
            const strength = element.classList.contains('nav-cta') ? 7 : 9;
            element.addEventListener('pointermove', event => {
                const rect = element.getBoundingClientRect();
                const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
                const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
                element.classList.add('is-magnetic-active');
                element.style.transform = `translate3d(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px, 0)`;
            });
            element.addEventListener('pointerleave', () => {
                element.classList.remove('is-magnetic-active');
                element.style.transform = '';
            });
        });
    }

    /* ---------------------------------------------------------------- 6. Contact */
    $$('.copy-contact').forEach(button => {
        button.addEventListener('click', async () => {
            const label = button.textContent;
            try {
                await navigator.clipboard.writeText(button.dataset.copy);
                button.textContent = 'Copied';
            } catch {
                button.textContent = 'Unavailable';
            }
            setTimeout(() => { button.textContent = label; }, 1400);
        });
    });

    const form = $('#contact-form');
    if (form) {
        const status = $('#contact-status');
        const setStatus = (text, state) => { status.textContent = `● ${text}`; status.dataset.state = state || ''; };

        form.addEventListener('submit', event => {
            event.preventDefault();
            const name = form.elements.name.value.trim();
            const email = form.elements.email.value.trim();
            const message = form.elements.message.value.trim();

            if (!name || !email || !message) return setStatus('Please complete all fields', 'error');
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStatus('Please enter a valid email', 'error');

            const subject = encodeURIComponent(`Portfolio message from ${name}`);
            const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
            setStatus('Opening your email client…', 'ok');
            window.location.href = `mailto:${form.dataset.to}?subject=${subject}&body=${body}`;
        });
    }

    /* ---------------------------------------------------------------- 7. Scroll chrome */
    const progress = $('#scroll-progress');
    const topButton = $('.scroll-top-control');
    let previousY = window.scrollY;
    let chromeTicking = false;

    const updateChrome = () => {
        const y = window.scrollY;
        const range = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${range > 0 ? y / range : 0})`;

        const scrollingDown = y > previousY;
        // Never hide the bar while the mobile menu is open.
        navbar.classList.toggle('nav-hidden', scrollingDown && y > 100 && !navbar.classList.contains('nav-open'));
        navbar.classList.toggle('nav-scrolled', y > 50);
        topButton.classList.toggle('is-visible', y > window.innerHeight * 0.65);

        previousY = y;
        chromeTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (chromeTicking) return;
        chromeTicking = true;
        requestAnimationFrame(updateChrome);
    }, { passive: true });
    updateChrome();
})();
