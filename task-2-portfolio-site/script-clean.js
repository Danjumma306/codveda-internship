/**
 * Mohammed Osman Portfolio — Script
 * 1. Typewriter effect on hero heading
 * 2. Section scroll reveal + active nav
 * 3. Project carousel (click, keyboard, swipe)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─────────────────────────────────────────
       1. TYPEWRITER
    ───────────────────────────────────────── */
    const typewriter   = document.getElementById('typewriter');
    const textWrapper  = typewriter?.querySelector('.text-wrapper');

    if (textWrapper) {
        const text  = "Hi, I'm Mohammed Osman";
        let i       = 0;

        function type() {
            if (i < text.length) {
                textWrapper.textContent += text[i];
                i++;
                setTimeout(type, 100);
            }
        }

        /* Small delay so the page has settled before typing starts */
        setTimeout(type, 600);
    }


    /* ─────────────────────────────────────────
       2. SCROLL REVEAL + ACTIVE NAV
    ───────────────────────────────────────── */
    const sections = document.querySelectorAll('.section-wrapper');
    const navLinks = document.querySelectorAll('header nav a');

    /* Start sections invisible */
    sections.forEach(s => s.classList.add('section-hidden'));

    /* Reveal section when it enters the viewport */
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target); /* stop watching once visible */
                setActiveNav(entry.target.id);
            }
        });
    }, { threshold: 0.15 });

    sections.forEach(s => revealObserver.observe(s));

    /* Active nav highlight */
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActiveNav(entry.target.id);
        });
    }, { threshold: 0.35 });

    sections.forEach(s => navObserver.observe(s));

    function setActiveNav(id) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    }

    /* Smooth scroll with header offset */
    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            const offset = document.querySelector('header')?.offsetHeight + 20 || 80;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        });
    });

    /* Hero is always visible immediately */
    const hero = document.querySelector('#home');
    if (hero) {
        hero.classList.add('is-visible');
        hero.classList.remove('section-hidden');
    }


    /* ─────────────────────────────────────────
       3. PROJECT CAROUSEL
    ───────────────────────────────────────── */
    const carousel = document.querySelector('.projects-carousel');
    if (!carousel) return;

    const track      = carousel.querySelector('.carousel-track');
    const cards      = carousel.querySelectorAll('.project-card');
    const prevBtn    = carousel.querySelector('.nav-btn.prev');
    const nextBtn    = carousel.querySelector('.nav-btn.next');
    const indicators = carousel.querySelectorAll('.indicator');
    const total      = cards.length;
    let   current    = 0;

    /* Accessibility live region */
    const live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;left:-9999px;';
    carousel.appendChild(live);

    function goTo(index) {
        current = Math.max(0, Math.min(index, total - 1));
        track.style.transform = `translateX(${-current * 100}%)`;
        indicators.forEach((dot, i) => dot.classList.toggle('active', i === current));
        live.textContent = `Project ${current + 1} of ${total}`;
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    indicators.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    /* Keyboard navigation */
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
    });

    /* Touch / mouse swipe — uses px not % */
    let dragStart = null;

    function onDragStart(e) {
        dragStart = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        track.style.transition = 'none'; /* disable transition during drag */
    }

    function onDragEnd(e) {
        if (dragStart === null) return;
        const dragEnd = e.type === 'touchend'
            ? e.changedTouches[0].clientX
            : e.clientX;
        const diff = dragStart - dragEnd;

        /* Re-enable transition before snapping */
        track.style.transition = '';

        if (Math.abs(diff) > 60) {
            goTo(diff > 0 ? current + 1 : current - 1);
        } else {
            goTo(current); /* snap back */
        }
        dragStart = null;
    }

    track.addEventListener('mousedown',  onDragStart);
    track.addEventListener('touchstart', onDragStart, { passive: true });
    track.addEventListener('mouseup',    onDragEnd);
    track.addEventListener('mouseleave', onDragEnd);
    track.addEventListener('touchend',   onDragEnd);

    /* Cursor style while dragging */
    track.addEventListener('mousedown', () => track.style.cursor = 'grabbing');
    track.addEventListener('mouseup',   () => track.style.cursor = 'grab');

    goTo(0); /* initialise */
});