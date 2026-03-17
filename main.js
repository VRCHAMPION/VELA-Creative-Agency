/* ══════════════════════════════════════════
   VELA — main.js
   ══════════════════════════════════════════ */
'use strict';

var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 0. LOADER ─────────────────────────── */
(function () {
    var loader = document.getElementById('loader');
    var wm = document.querySelector('.loader-wordmark');
    if (!loader) return;

    if (isReduced) {
        loader.style.display = 'none';
        return;
    }

    setTimeout(function() { wm && wm.classList.add('in'); }, 100);
    setTimeout(function() { loader.classList.add('done'); }, 1200);
    setTimeout(function() { loader.style.display = 'none'; }, 2400);
})();

/* ── 1. CUSTOM CURSOR & THUMBNAIL ──────── */
(function () {
    var cur = document.getElementById('cursor');
    var thumb = document.getElementById('cursor-thumb');
    if (!cur) return;

    var tgX = 0, tgY = 0, thumbX = 0, thumbY = 0;

    document.addEventListener('mousemove', function (e) {
        if (!isReduced) {
            cur.style.left = e.clientX + 'px';
            cur.style.top = e.clientY + 'px';
        }
        tgX = e.clientX;
        tgY = e.clientY;
    });

    if (thumb && !isReduced) {
        function animThumb() {
            thumbX += (tgX - thumbX) * 0.15;
            thumbY += (tgY - thumbY) * 0.15;
            thumb.style.left = thumbX + 'px';
            thumb.style.top = Math.max(0, thumbY) + 'px';
            requestAnimationFrame(animThumb);
        }
        requestAnimationFrame(animThumb);

        document.querySelectorAll('.case-card').forEach(function(card) {
            card.addEventListener('mouseenter', function() {
                thumb.src = card.getAttribute('data-img');
                thumb.classList.add('visible');
                document.body.classList.add('hide-cursor');
            });
            card.addEventListener('mouseleave', function() {
                thumb.classList.remove('visible');
                document.body.classList.remove('hide-cursor');
            });
        });
    }
})();


/* ── 2. NAV SCROLL ─────────────────────── */
(function () {
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
})();


/* ── 3. HERO STAGGER & REDUCED MOTION ──── */
(function () {
    var tag = document.getElementById('ha-tag');
    var copy = document.getElementById('ha-copy');
    var foot = document.getElementById('ha-foot');
    var vid = document.getElementById('hero-video');

    if (isReduced) {
        tag && tag.classList.add('in');
        copy && copy.classList.add('in');
        foot && foot.classList.add('in');
        if (vid) vid.pause();
        return;
    }

    var delay = document.getElementById('loader') ? 1800 : 0;
    setTimeout(function () { tag && tag.classList.add('in'); }, delay + 200);
    setTimeout(function () { copy && copy.classList.add('in'); }, delay + 350);
    setTimeout(function () { foot && foot.classList.add('in'); }, delay + 700);
})();


/* ── 4. SCROLL REVEAL & NEW SECTIONS ───── */
(function () {
    // Manifesto word split
    var man = document.getElementById('manifesto-text');
    if (man) {
        var words = man.textContent.trim().split(' ');
        man.innerHTML = '';
        words.forEach(function(w) {
            var span = document.createElement('span');
            span.innerHTML = w + '&nbsp;';
            span.className = 'man-word';
            man.appendChild(span);
        });
    }

    var els = document.querySelectorAll('[data-sr], .eyebrow, .svc-item, #manifesto-text');
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            if (el.id === 'manifesto-text') {
                var words = el.querySelectorAll('.man-word');
                words.forEach(function(w, i) {
                    setTimeout(function() { w.classList.add('in'); }, !isReduced ? i * 40 : 0);
                });
            } else {
                var d = !isReduced ? parseInt(el.getAttribute('data-d') || el.getAttribute('data-delay') || '0', 10) : 0;
                setTimeout(function () { el.classList.add('in'); }, d);
            }
            io.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });

    // Draggable Case Studies
    var reel = document.getElementById('cs-reel');
    if (reel) {
        var isDown = false, startX, scrollLeft;
        reel.addEventListener('mousedown', function(e) {
            isDown = true;
            reel.style.cursor = 'grabbing';
            startX = e.pageX - reel.offsetLeft;
            scrollLeft = reel.scrollLeft;
        });
        reel.addEventListener('mouseleave', function() {
            isDown = false;
            reel.style.cursor = 'grab';
        });
        reel.addEventListener('mouseup', function() {
            isDown = false;
            reel.style.cursor = 'grab';
        });
        reel.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - reel.offsetLeft;
            var walk = (x - startX) * 2; // scroll-fast
            reel.scrollLeft = scrollLeft - walk;
        });
    }

    // Magnetic Buttons
    if (!isReduced) {
        var mags = document.querySelectorAll('.nav-cta, .footer-book');
        mags.forEach(function(mag) {
            mag.addEventListener('mousemove', function(e) {
                var rect = mag.getBoundingClientRect();
                var cx = rect.left + rect.width / 2;
                var cy = rect.top + rect.height / 2;
                var dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
                if (dist < 70) {
                    var tx = (e.clientX - cx) * 0.3;
                    var ty = (e.clientY - cy) * 0.3;
                    mag.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
                } else {
                    mag.style.transform = '';
                }
            });
            mag.addEventListener('mouseleave', function() {
                mag.style.transform = '';
            });
        });
    }

    // Studio Status
    var sStat = document.getElementById('studio-status');
    if (sStat) {
        var dot = sStat.querySelector('.status-dot');
        var txt = sStat.querySelector('.status-txt');
        function updateTime() {
            var utc = new Date();
            var istMillis = utc.getTime() + (utc.getTimezoneOffset() * 60000) + (5.5 * 3600000);
            var ist = new Date(istMillis);
            var hr = ist.getHours();
            var day = ist.getDay();
            var isWknd = (day === 0 || day === 6);
            if (!isWknd && hr >= 9 && hr < 19) {
                dot.classList.add('open');
                txt.textContent = 'Studio open';
            } else {
                dot.classList.remove('open');
                txt.textContent = 'Back at 9am IST';
            }
        }
        updateTime();
        setInterval(updateTime, 60000);
    }
})();


/* ── 5. TYPEWRITER ─────────────────────── */
(function () {
    var display = document.getElementById('typewriter-display');
    var searchBtn = document.getElementById('search-trigger');
    var resultsEl = document.getElementById('search-results');
    if (!display) return;

    var phrases = [
        "How long does a brand identity project take?",
        "Do you work with D2C brands in India?",
        "Can you help us launch in Tier 2 cities?",
        "What does a typical project budget look like?",
        "Do you work in Hindi and regional languages?",
        "How do you handle projects across Mumbai and Bengaluru?"
    ];

    var answers = [
        [
            { t: "Brand Identity Timeline", b: "Usually 6-8 weeks. Enough time to go deep, but fast enough to maintain momentum for a launch." }
        ],
        [
            { t: "D2C Focus", b: "Yes. From packaging to digital storefronts, we understand the unit economics and the visual language needed to win in an over-crowded market." }
        ],
        [
            { t: "Tier 2 Launch", b: "We design for the next billion users, which means keeping things highly accessible without looking cheap. It's about building trust, not just aesthetics." }
        ],
        [
            { t: "Budgets", b: "It depends completely on the scope and timeline, but our core brand engagements typically begin around ₹8L–₹12L for an established D2C stack." }
        ],
        [
            { t: "Regional Context", b: "Absolutely. We routinely develop multilingual brand systems, specifically ensuring typography scales beautifully across Devanagari and Latin scripts." }
        ],
        [
            { t: "Multi-city Projects", b: "Seamlessly. We operate as a single distributed team and travel consistently for vital kickoff and strategy sessions." }
        ]
    ];

    var idx = 0, char = 0, del = false, paused = false;

    function tick() {
        if (paused) return;
        var phrase = phrases[idx];
        if (!del) {
            char++;
            display.textContent = phrase.slice(0, char);
            if (char === phrase.length) {
                paused = true;
                setTimeout(function () { paused = false; del = true; tick(); }, 2400);
                return;
            }
        } else {
            char--;
            display.textContent = phrase.slice(0, char);
            if (char === 0) {
                del = false;
                idx = (idx + 1) % phrases.length;
            }
        }
        setTimeout(tick, del ? 24 : 54);
    }

    if (!isReduced) {
        setTimeout(tick, 1800);
    } else {
        display.textContent = phrases[0];
        document.querySelector('.tw-cur').style.display = 'none';
        idx = 0;
    }

    searchBtn.addEventListener('click', function () {
        var set = answers[idx % answers.length] || [{ t: "Good question", b: "Send us an email and we will get back to you within one business day." }];
        resultsEl.innerHTML = '';
        set.forEach(function (item, i) {
            var card = document.createElement('div');
            card.className = 'res-card';
            card.style.animationDelay = (i * 90) + 'ms';
            card.innerHTML = '<strong>' + item.t + '</strong>' + item.b;
            resultsEl.appendChild(card);
        });
        idx = (idx + 1) % phrases.length;
        char = 0; del = false; paused = false;
        display.textContent = '';
        setTimeout(tick, 400);
    });
})();


/* ── 6. BOOKING MODAL ──────────────────── */
(function () {

    var state = { service: null, date: null, time: null, step: 1, yr: 0, mo: 0 };
    var now = new Date();
    state.yr = now.getFullYear();
    state.mo = now.getMonth();

    var overlay = document.getElementById('modal-overlay');
    var closeBtn = document.getElementById('modal-close');

    var STEPS = [null,
        document.getElementById('step-1'),
        document.getElementById('step-2'),
        document.getElementById('step-3'),
        document.getElementById('step-success')
    ];
    var MS_ITEMS = document.querySelectorAll('.ms-item');

    /* open/close */
    function open() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
    function close() { overlay.classList.remove('open'); document.body.style.overflow = ''; }

    ['open-booking-nav', 'open-booking-about', 'open-booking-footer'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', open);
    });
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

    /* step navigation */
    function goStep(n) {
        state.step = n;
        STEPS.forEach(function (s, i) { if (i) s.classList.toggle('hidden', i !== n); });
        MS_ITEMS.forEach(function (dot, i) {
            var sn = i + 1;
            dot.classList.remove('active', 'done');
            if (sn === n) dot.classList.add('active');
            else if (sn < n) dot.classList.add('done');
        });
        if (n === 3) fillSummary();
    }

    /* STEP 1 */
    var opts = document.querySelectorAll('.sp-opt');
    var s1btn = document.getElementById('step1-next');

    opts.forEach(function (opt) {
        opt.addEventListener('click', function () {
            opts.forEach(function (o) { o.classList.remove('sel'); });
            opt.classList.add('sel');
            state.service = opt.getAttribute('data-service');
            s1btn.disabled = false;
        });
    });
    s1btn.addEventListener('click', function () { if (state.service) { goStep(2); buildCal(); } });

    /* STEP 2 — calendar */
    var calGrid = document.getElementById('cal-grid');
    var calLabel = document.getElementById('cal-month-label');
    var calPrev = document.getElementById('cal-prev');
    var calNext = document.getElementById('cal-next');
    var timeCol = document.getElementById('time-slots');
    var s2next = document.getElementById('step2-next');
    var s2back = document.getElementById('step2-back');

    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    var TIMES = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'];

    function unavailable(ds) {
        var seed = ds.split('-').reduce(function (a, b) { return a + parseInt(b, 10); }, 0);
        return TIMES.filter(function (_, i) { return ((seed + i * 3) % 7) === 0; });
    }

    function buildCal() {
        var yr = state.yr, mo = state.mo;
        calLabel.textContent = MONTHS[mo] + ' ' + yr;
        var today = new Date(); today.setHours(0, 0, 0, 0);
        var first = new Date(yr, mo, 1).getDay();
        var days = new Date(yr, mo + 1, 0).getDate();
        calGrid.innerHTML = '';

        for (var i = 0; i < first; i++) {
            var e = document.createElement('div');
            e.className = 'cal-day empty';
            calGrid.appendChild(e);
        }
        for (var d = 1; d <= days; d++) {
            var cell = new Date(yr, mo, d);
            var el = document.createElement('div');
            el.className = 'cal-day';
            el.textContent = d;
            var ds = yr + '-' + String(mo + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var past = cell < today;
            var wknd = cell.getDay() === 0 || cell.getDay() === 6;
            if (past || wknd) {
                el.classList.add('past');
            } else {
                if (cell.toDateString() === today.toDateString()) el.classList.add('today');
                if (state.date === ds) el.classList.add('selected');
                (function (dateStr, elem) {
                    elem.addEventListener('click', function () {
                        state.date = dateStr;
                        state.time = null;
                        s2next.disabled = true;
                        document.querySelectorAll('.cal-day.selected').forEach(function (x) { x.classList.remove('selected'); });
                        elem.classList.add('selected');
                        buildSlots(dateStr);
                    });
                })(ds, el);
            }
            calGrid.appendChild(el);
        }
    }

    function buildSlots(ds) {
        timeCol.innerHTML = '';
        var off = unavailable(ds);
        TIMES.forEach(function (t) {
            var sl = document.createElement('div');
            sl.className = 't-slot';
            sl.textContent = t;
            if (off.indexOf(t) > -1) {
                sl.classList.add('off');
            } else {
                sl.addEventListener('click', function () {
                    document.querySelectorAll('.t-slot.sel').forEach(function (x) { x.classList.remove('sel'); });
                    sl.classList.add('sel');
                    state.time = t;
                    s2next.disabled = false;
                });
            }
            timeCol.appendChild(sl);
        });
    }

    calPrev.addEventListener('click', function () {
        state.mo--; if (state.mo < 0) { state.mo = 11; state.yr--; } buildCal();
    });
    calNext.addEventListener('click', function () {
        state.mo++; if (state.mo > 11) { state.mo = 0; state.yr++; } buildCal();
    });
    s2next.addEventListener('click', function () { goStep(3); });
    s2back.addEventListener('click', function () { goStep(1); });

    /* STEP 3 */
    var s3back = document.getElementById('step3-back');
    var s3submit = document.getElementById('step3-submit');
    var summaryEl = document.getElementById('booking-summary');

    s3back.addEventListener('click', function () { goStep(2); });

    function fillSummary() {
        var parts = state.date.split('-');
        var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        var formatted = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        summaryEl.innerHTML =
            'SERVICE  \u2192  ' + state.service + '<br>' +
            'DATE     \u2192  ' + formatted + '<br>' +
            'TIME     \u2192  ' + state.time;
    }

    s3submit.addEventListener('click', function () {
        var name = document.getElementById('f-name').value.trim();
        var email = document.getElementById('f-email').value.trim();
        if (!name || !email) {
            ['f-name', 'f-email'].forEach(function (id) {
                var el = document.getElementById(id);
                if (!el.value.trim()) {
                    el.style.borderColor = 'rgba(255,80,80,.5)';
                    el.addEventListener('input', function () { el.style.borderColor = ''; }, { once: true });
                }
            });
            return;
        }
        document.querySelector('.modal-top').style.opacity = '0';
        goStep(4);
    });

    document.getElementById('success-close').addEventListener('click', function () {
        close();
        setTimeout(function () {
            opts.forEach(function (o) { o.classList.remove('sel'); });
            s1btn.disabled = true;
            s2next.disabled = true;
            state.service = state.date = state.time = null;
            ['f-name', 'f-email', 'f-company', 'f-message'].forEach(function (id) {
                document.getElementById(id).value = '';
            });
            document.querySelector('.modal-top').style.opacity = '';
            goStep(1);
        }, 400);
    });

})();


/* ── 7. SMOOTH SCROLL ──────────────────── */
(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var t = document.querySelector(a.getAttribute('href'));
            if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
        });
    });
})();