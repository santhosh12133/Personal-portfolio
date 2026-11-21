/* Portfolio behaviour — one script, loaded once at the end of <body>.
   1 background video · 2 reveal on scroll · 3 navigation · 4 dialogs
   5 project architecture panels · 6 cursor · 7 contact · 8 scroll chrome
   9 extras (hero roles, count-up, project filters, card spotlight, section rail, terminal) */
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    /* ---------------------------------------------------------------- 1. Background video
       The portrait is a video scrubbed by scroll position inside the hero. It fades out as the
       hero leaves the screen instead of disappearing in one frame. */
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

        // Seeking is expensive on phones, so require a larger jump there.
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
        const progress = height > 0 ? (window.scrollY - top) / height : 0;

        // Fully visible for the first half of the hero, then a smooth fade to black.
        const opacity = progress < 0.45 ? 1 : Math.max(0, 1 - (progress - 0.45) / 0.5);
        canvas.style.opacity = opacity.toFixed(3);
        canvas.style.visibility = opacity <= 0 || progress >= 1 ? 'hidden' : 'visible';

        if (canvas.style.visibility === 'hidden') {
            if (frameRequest) cancelAnimationFrame(frameRequest);
            frameRequest = null;
            return;
        }

        targetTime = Math.min(VIDEO_DURATION, Math.max(0, progress * VIDEO_DURATION));
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
        // preload="metadata" (phones) decodes no frame until a seek, which left the hero empty.
        if (video.currentTime === 0) video.currentTime = 0.001;
    });
    video.addEventListener('loadeddata', drawVideoFrame);
    video.addEventListener('seeked', drawVideoFrame);
    video.pause();

    // Setting src starts the download; wait until the page is idle so it never blocks first paint.
    const startVideo = () => { video.src = './background-animation.webm'; };
    if ('requestIdleCallback' in window) requestIdleCallback(startVideo, { timeout: 2000 });
    else setTimeout(startVideo, 0);

    /* ---------------------------------------------------------------- 2. Reveal on scroll
       Every block reveals on its own as it approaches the viewport (not whole sections), so tall
       blocks on phones cannot get stuck hidden. Blocks already scrolled past reveal at once. */
    const revealSelectors = [
        '.section-number', '.section-title', '.section-lead', '.huge-title', '.contact-desc',
        '.about-narrative', '.tech-summary', '.stat-grid', '.credential-stats',
        '.timeline-item', '.edu-card', '.project-showcase', '.skill-row', '.process-step',
        '.credentials-subtitle', '.pub-card', '.cert-card', '.contact-links', '.premium-contact-form'
    ].join(',');
    const staggerGroups = '.timeline-item, .edu-card, .skill-row, .process-step, .pub-card, .cert-card';

    const revealTargets = $$(revealSelectors).filter(el => !el.closest('.hero'));
    revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

    // Stagger siblings that appear together (cards in a row, rows in a list).
    $$(staggerGroups).forEach(el => {
        const siblings = [...el.parentElement.children].filter(child => child.matches(staggerGroups));
        el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 4) * 0.08}s`);
    });

    if ('IntersectionObserver' in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
                    entry.target.classList.add('is-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
        revealTargets.forEach(el => revealObserver.observe(el));
    } else {
        revealTargets.forEach(el => el.classList.add('is-in'));
    }

    // The project number turns red for the project currently being read.
    const projects = $$('#projects .project-showcase');
    if ('IntersectionObserver' in window) {
        const currentObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => entry.target.classList.toggle('project-current', entry.isIntersecting));
        }, { rootMargin: '-35% 0px -45% 0px', threshold: 0 });
        projects.forEach(project => currentObserver.observe(project));
    }

    /* ---------------------------------------------------------------- 3. Navigation */
    const navbar = $('#navbar');
    const menuButton = $('.mobile-menu-btn');
    const navList = $('#nav-links');
    const sectionLinks = $$('a[href^="#"]:not(.btn)', navList);

    const setMenu = open => {
        navbar.classList.toggle('nav-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };
    menuButton.addEventListener('click', () => setMenu(!navbar.classList.contains('nav-open')));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navbar.classList.contains('nav-open')) { setMenu(false); menuButton.focus(); }
    });
    // Tapping anywhere outside the open menu closes it.
    document.addEventListener('click', event => {
        if (navbar.classList.contains('nav-open') && !navbar.contains(event.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 1081px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

    // One handler for every in-page link (nav, footer, hero buttons).
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || link.getAttribute('href') === '#') return;
        const hash = link.getAttribute('href');
        const target = $(hash);
        if (!target) return;
        event.preventDefault();
        setMenu(false);
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (location.hash !== hash) history.pushState(null, '', hash);
    });

    const sections = sectionLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
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
    }

    /* ---------------------------------------------------------------- 4. Dialogs */
    const quickNav = $('#quick-nav');
    const quickNavInput = $('#quick-nav-input');
    const quickNavResults = $('#quick-nav-results');
    const quickNavLinks = sectionLinks.map(link => {
        const clone = link.cloneNode(true);
        clone.classList.remove('is-active');
        clone.removeAttribute('aria-current');
        return clone;
    });
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
        event.preventDefault();
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
            detailsCopy.textContent = details
                ? details.innerHTML.split(/<br\s*\/?>/i).map(part => part.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim()).filter(Boolean).join(' · ')
                : 'Technical component in the system flow.';
            detailsDialog.showModal();
        };
        node.addEventListener('click', open);
        node.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
        });
    });
    $('#architecture-details-close').addEventListener('click', () => detailsDialog.close());
    [detailsDialog, quickNav].forEach(dialog => {
        dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    });

    /* ---------------------------------------------------------------- 5. Architecture panels
       On phones each diagram is folded away behind a button, so the Projects section is a
       readable list rather than 11,000px of scrolling. On wider screens nothing is folded. */
    const compact = window.matchMedia('(max-width: 900px)');
    const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

    const panels = $$('.project-visual').map((visual, index) => {
        visual.id = `architecture-${index + 1}`;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'arch-toggle';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', visual.id);
        button.innerHTML = `<span>View system architecture</span>${chevron}`;
        visual.before(button);

        const setOpen = open => {
            visual.classList.toggle('is-open', open);
            button.setAttribute('aria-expanded', String(open));
            $('span', button).textContent = open ? 'Hide system architecture' : 'View system architecture';
            visual.style.maxHeight = open ? `${visual.scrollHeight}px` : '';
        };
        button.addEventListener('click', () => setOpen(!visual.classList.contains('is-open')));
        return { visual, setOpen };
    });

    const syncPanels = () => {
        panels.forEach(({ visual, setOpen }) => {
            if (!compact.matches) { visual.style.maxHeight = ''; return; }
            if (visual.classList.contains('is-open')) setOpen(true); // re-measure after a resize
        });
    };
    compact.addEventListener('change', syncPanels);
    window.addEventListener('resize', () => { clearTimeout(syncPanels.t); syncPanels.t = setTimeout(syncPanels, 150); });

    /* ---------------------------------------------------------------- 6. Cursor (fine pointers) */
    const cursor = $('#custom-cursor');
    if (finePointer) {
        document.addEventListener('mousemove', event => {
            cursor.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
        }, { passive: true });
        const interactive = 'a, button, .architecture-node, input, textarea';
        document.addEventListener('mouseover', event => { if (event.target.closest(interactive)) cursor.classList.add('cursor-active'); });
        document.addEventListener('mouseout', event => { if (event.target.closest(interactive)) cursor.classList.remove('cursor-active'); });
    } else {
        cursor.style.display = 'none';
    }

    /* ---------------------------------------------------------------- 7. Contact */
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

    /* ---------------------------------------------------------------- 8. Scroll chrome */
    const progress = $('#scroll-progress');
    const topButton = $('.scroll-top-control');
    let previousY = window.scrollY;
    let chromeTicking = false;

    topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

    const updateChrome = () => {
        const y = Math.max(0, window.scrollY); // iOS rubber-banding reports negative values
        const range = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${range > 0 ? Math.min(1, y / range) : 0})`;

        const delta = y - previousY;
        // Small jitters never toggle the bar; it stays put while the menu is open.
        if (Math.abs(delta) > 6) {
            navbar.classList.toggle('nav-hidden', delta > 0 && y > 140 && !navbar.classList.contains('nav-open'));
            previousY = y;
        }
        navbar.classList.toggle('nav-scrolled', y > 40);
        topButton.classList.toggle('is-visible', y > window.innerHeight * 0.65);
        chromeTicking = false;
    };
    window.addEventListener('scroll', () => {
        if (chromeTicking) return;
        chromeTicking = true;
        requestAnimationFrame(updateChrome);
    }, { passive: true });
    updateChrome();

    /* ---------------------------------------------------------------- 9. Extras */

    // 9a. Rotating focus-area line in the hero (types, holds, deletes).
    const rolesEl = $('#hero-roles');
    if (rolesEl && !reduceMotion) {
        const roles = rolesEl.dataset.roles.split('|');
        let roleIndex = 0;
        let heroVisible = true;
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; }, { threshold: 0 }).observe(homeSection);
        }
        const idle = async () => { while (document.hidden || !heroVisible) await wait(400); };
        (async () => {
            await wait(2400);
            for (;;) {
                await idle();
                while (rolesEl.textContent.length) { rolesEl.textContent = rolesEl.textContent.slice(0, -1); await wait(26); }
                roleIndex = (roleIndex + 1) % roles.length;
                for (const char of roles[roleIndex]) { rolesEl.textContent += char; await wait(52); }
                await wait(2000);
            }
        })();
    }

    // 9b. Count-up numbers when the stat rows scroll into view.
    const counters = $$('[data-count]');
    if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
        const format = (el, value) => { el.textContent = `${Math.round(value)}${el.dataset.suffix || ''}`; };
        const run = el => {
            const target = Number(el.dataset.count);
            const start = performance.now();
            const duration = 1300;
            const tick = now => {
                const t = Math.min(1, (now - start) / duration);
                format(el, target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };
        const countObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                run(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.8 });
        counters.forEach(el => { format(el, 0); countObserver.observe(el); });
    }

    // 9c. Project filters.
    const filterButtons = $$('.filter-btn');
    const filterStatus = $('#filter-status');
    const projectCards = $$('#projects .project-showcase');
    if (filterButtons.length) {
        const hasTag = (card, key) => key === 'all' || card.dataset.tags.split(' ').includes(key);
        filterButtons.forEach(button => {
            $('span', button).textContent = projectCards.filter(card => hasTag(card, button.dataset.filter)).length;
        });
        const applyFilter = key => {
            let shown = 0;
            projectCards.forEach(card => {
                const match = hasTag(card, key);
                card.hidden = !match;
                if (!match) return;
                card.classList.add('is-in');
                card.classList.toggle('reverse', shown % 2 === 1);
                if (!reduceMotion) {
                    card.classList.remove('filter-in');
                    void card.offsetWidth; // restart the animation
                    card.classList.add('filter-in');
                }
                shown += 1;
            });
            filterButtons.forEach(button => {
                const active = button.dataset.filter === key;
                button.classList.toggle('is-active', active);
                button.setAttribute('aria-pressed', String(active));
            });
            filterStatus.textContent = key === 'all' ? '' : `Showing ${shown} of ${projectCards.length} projects`;
            const bar = $('.project-filters');
            if (bar.getBoundingClientRect().top < 0) bar.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        };
        filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
    }

    // 9d. Cursor spotlight on cards (fine pointers only).
    if (finePointer && !reduceMotion) {
        $$('.pub-card, .edu-card, .cert-card, .process-step, .stat-grid li, .credential-stats li').forEach(el => el.classList.add('spot'));
        document.addEventListener('pointermove', event => {
            const el = event.target.closest && event.target.closest('.spot');
            if (!el) return;
            const box = el.getBoundingClientRect();
            el.style.setProperty('--mx', `${event.clientX - box.left}px`);
            el.style.setProperty('--my', `${event.clientY - box.top}px`);
        }, { passive: true });
    }

    // 9e. Section rail: a dot per section on wide screens.
    const railSections = [['home', 'Home'], ['about', 'About'], ['experience', 'Experience'], ['education', 'Education'],
        ['projects', 'Projects'], ['skills', 'Skills'], ['research', 'Research'], ['contact', 'Contact']]
        .filter(([id]) => $(`#${id}`));
    const rail = document.createElement('nav');
    rail.className = 'side-rail';
    rail.setAttribute('aria-label', 'Section progress');
    railSections.forEach(([id, label]) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.dataset.label = label;
        dot.dataset.target = id;
        dot.setAttribute('aria-label', `Go to ${label}`);
        dot.addEventListener('click', () => {
            $(`#${id}`).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', `#${id}`);
        });
        rail.append(dot);
    });
    document.body.append(rail);
    if ('IntersectionObserver' in window) {
        const railObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                $$('button', rail).forEach(dot => dot.classList.toggle('is-active', dot.dataset.target === entry.target.id));
            });
        }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
        railSections.forEach(([id]) => railObserver.observe($(`#${id}`)));
    }

    // 9f. Terminal: press ` (or use the footer button) and type "help".
    const terminal = $('#terminal');
    const termBody = $('#terminal-body');
    const termForm = $('#terminal-form');
    const termInput = $('#terminal-input');
    const clean = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
    const history_ = [];
    let historyIndex = 0;
    let booted = false;

    const print = (text = '', className = '') => {
        const line = document.createElement('p');
        line.className = `t-line ${className}`.trim();
        line.textContent = text;
        termBody.append(line);
        termBody.scrollTop = termBody.scrollHeight;
        return line;
    };
    const printLink = (label, href) => {
        const line = print('  ');
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.textContent = label;
        if (/^https?:/.test(href)) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
        line.append(anchor);
        termBody.scrollTop = termBody.scrollHeight;
    };
    const goTo = id => {
        const target = $(`#${id}`);
        if (!target) return false;
        terminal.close();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        history.pushState(null, '', `#${id}`);
        return true;
    };

    const links = {
        github: 'https://github.com/santhosh12133',
        linkedin: 'https://www.linkedin.com/in/santhosh-kumar-n-4b4b84310',
        whatsapp: 'https://wa.me/918495900723',
        email: 'mailto:santhoshkumar12133@gmail.com'
    };
    const sectionNames = ['home', 'about', 'experience', 'education', 'projects', 'skills', 'workflow', 'research', 'contact'].filter(id => $(`#${id}`));

    const commands = {
        help: () => {
            print('Available commands', 't-head');
            [['about', 'who I am'], ['experience', 'internships and roles'], ['education', 'degrees'], ['skills', 'tech stack by area'],
                ['projects', 'list all projects'], ['project <n>', 'details for one project, e.g. project 2'], ['research', 'publications'],
                ['certs', 'certifications'], ['contact', 'ways to reach me'], ['goto <section>', 'jump to a section, e.g. goto projects'],
                ['open <name>', 'github | linkedin | whatsapp | email'], ['ls', 'list sections'], ['clear', 'clear the screen'], ['exit', 'close the terminal']]
                .forEach(([name, text]) => print(`  ${name.padEnd(16)}${text}`));
            print('Tip: Tab completes, ↑ / ↓ browse history.', 't-dim');
        },
        about: () => { print(clean($('.about-narrative'))); print('Focus: ' + $$('.tech-pill').map(clean).join(' · '), 't-dim'); },
        whoami: () => print('santhosh: software engineer, backend & AI'),
        experience: () => $$('.timeline-item').forEach(item => {
            print(`${clean($('.timeline-meta h3', item))} — ${clean($('.timeline-role', item))}`, 't-head');
            print(`  ${clean($('.timeline-date', item))}`, 't-dim');
        }),
        education: () => $$('.edu-card').forEach(card => {
            print(`${clean($('.edu-title', card))} (${clean($('.edu-years', card))})`, 't-head');
            print(`  ${clean($('.edu-institution', card))}`, 't-dim');
        }),
        skills: () => $$('.skill-row').forEach(row => print(`${clean($('.skill-title', row)).padEnd(16)}${$$('.chips li', row).map(clean).join(', ')}`)),
        projects: () => {
            projectCards.forEach((card, index) => print(`${String(index + 1).padStart(2, '0')}  ${clean($('.project-title', card))} — ${clean($('.project-subtitle', card))}`));
            print('Type "project <n>" for details.', 't-dim');
        },
        project: arg => {
            const card = projectCards[Number(arg) - 1];
            if (!card) return print('Usage: project <1-' + projectCards.length + '>', 't-err');
            print(clean($('.project-title', card)), 't-head');
            print(clean($('.project-subtitle', card)), 't-dim');
            print(clean($('.project-desc', card)));
            print('Stack: ' + $$('.tech-tags span', card).map(clean).join(', '), 't-dim');
            const repo = $('.project-links a', card);
            if (repo) printLink(repo.href, repo.href);
        },
        research: () => $$('.pub-card').forEach(card => {
            print(clean($('.pub-title', card)), 't-head');
            print(`  ${clean($('.pub-meta', card))}`, 't-dim');
        }),
        certs: () => $$('.cert-card').forEach(card => print(`${clean($('.cert-name', card))} — ${clean($('.cert-org', card))}`)),
        contact: () => {
            printLink('santhoshkumar12133@gmail.com', links.email);
            printLink(links.github, links.github);
            printLink(links.linkedin, links.linkedin);
        },
        goto: arg => { if (!arg || !goTo(arg)) print(`Unknown section. Try: ${sectionNames.join(', ')}`, 't-err'); },
        open: arg => {
            if (!links[arg]) return print('Usage: open github | linkedin | whatsapp | email', 't-err');
            print(`Opening ${arg}…`, 't-dim');
            if (arg === 'email') location.href = links.email;
            else window.open(links[arg], '_blank', 'noopener');
        },
        ls: () => print(sectionNames.join('  ')),
        clear: () => { termBody.textContent = ''; },
        exit: () => terminal.close(),
        sudo: arg => {
            if (arg !== 'hire-me') return print('sudo: nice try.', 't-err');
            print('[sudo] password for recruiter: ********', 't-dim');
            print('Access granted. Taking you to the contact form…');
            setTimeout(() => goTo('contact'), 700);
        }
    };
    commands.quit = commands.exit;
    commands.cls = commands.clear;

    const runCommand = raw => {
        const [name, ...rest] = raw.trim().split(/\s+/);
        if (!name) return;
        print(raw.trim(), 't-line t-cmd');
        const handler = Object.prototype.hasOwnProperty.call(commands, name.toLowerCase()) ? commands[name.toLowerCase()] : null;
        if (handler) handler(rest.join(' ').toLowerCase());
        else print(`command not found: ${name}. Type "help".`, 't-err');
    };

    const openTerminal = () => {
        if (terminal.open || $('dialog[open]')) return;
        terminal.showModal();
        if (!booted) {
            booted = true;
            print('Santhosh Kumar N — portfolio shell', 't-head');
            print('Type "help" to see what you can do.', 't-dim');
        }
        termInput.focus();
    };
    document.addEventListener('keydown', event => {
        const typing = /^(input|textarea|select)$/i.test(event.target.tagName) || event.target.isContentEditable;
        if (event.key === '`' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
            event.preventDefault();
            openTerminal();
        }
    });
    $$('[data-open-terminal]').forEach(button => button.addEventListener('click', openTerminal));
    $('#terminal-close').addEventListener('click', () => terminal.close());
    terminal.addEventListener('click', event => {
        if (event.target === terminal) terminal.close();
        else if (!window.getSelection().toString()) termInput.focus();
    });
    termForm.addEventListener('submit', event => {
        event.preventDefault();
        const value = termInput.value;
        if (value.trim()) { history_.push(value); historyIndex = history_.length; }
        termInput.value = '';
        runCommand(value);
    });
    termInput.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp' && history_.length) {
            event.preventDefault();
            historyIndex = Math.max(0, historyIndex - 1);
            termInput.value = history_[historyIndex];
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            historyIndex = Math.min(history_.length, historyIndex + 1);
            termInput.value = history_[historyIndex] || '';
        } else if (event.key === 'Tab') {
            event.preventDefault();
            const typed = termInput.value.trim().toLowerCase();
            const match = Object.keys(commands).filter(name => name.startsWith(typed))[0];
            if (typed && match) termInput.value = match;
        }
    });
})();
