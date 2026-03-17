/* ══════════════════════════════════════════
   VELA — main.js
   ══════════════════════════════════════════ */
'use strict';

/* ── 1. CUSTOM CURSOR ──────────────────── */
(function () {
    var cur = document.getElementById('cursor');
    if (!cur) return;
    document.addEventListener('mousemove', function (e) {
        cur.style.left = e.clientX + 'px';
        cur.style.top = e.clientY + 'px';
    });
})();


/* ── 2. NAV SCROLL ─────────────────────── */
(function () {
    var nav = document.getElementById('main-nav');
    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
})();


/* ── 3. HERO STAGGER ───────────────────── */
(function () {
    var tag = document.getElementById('ha-tag');
    var copy = document.getElementById('ha-copy');
    var foot = document.getElementById('ha-foot');
    setTimeout(function () { tag && tag.classList.add('in'); }, 200);
    setTimeout(function () { copy && copy.classList.add('in'); }, 350);
    setTimeout(function () { foot && foot.classList.add('in'); }, 700);
})();


/* ── 4. SCROLL REVEAL ──────────────────── */
(function () {
    var els = document.querySelectorAll('[data-sr], .eyebrow, .svc-item');
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var d = parseInt(el.getAttribute('data-d') || el.getAttribute('data-delay') || '0', 10);
            setTimeout(function () { el.classList.add('in'); }, d);
            io.unobserve(el);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
})();


/* ── 5. TYPEWRITER ─────────────────────── */
(function () {
    var display = document.getElementById('typewriter-display');
    var searchBtn = document.getElementById('search-trigger');
    var resultsEl = document.getElementById('search-results');
    if (!display) return;

    var phrases = [
        "How long does a brand identity project take?",
        "What industries do you work with?",
        "Can you redesign an existing website?",
        "Do you offer ongoing retainer services?",
        "What does your onboarding process look like?",
        "How do you handle revisions and feedback?"
    ];

    var answers = [
        [
            { t: "Brand Identity Timeline", b: "A full brand identity project typically spans 6-10 weeks, depending on scope. This covers discovery, concepting, refinement, and final asset delivery." },
            { t: "Rush timeline?", b: "We can accommodate accelerated timelines for an additional fee. Just ask during your discovery call." }
        ],
        [
            { t: "Our client mix", b: "We work across tech, fintech, wellness, fashion, and consumer goods. Industry matters less than ambition." }
        ],
        [
            { t: "Website redesigns", b: "Yes, and it is some of our favourite work. We audit what exists, identify what is working, and rebuild from a clear brief." },
            { t: "What we need from you", b: "Access to analytics, existing brand assets, and 30 minutes with your team." }
        ],
        [
            { t: "On retainers", b: "We offer them on a case-by-case basis for clients we have already worked with. They cover ongoing design, copy, and strategy support." }
        ],
        [
            { t: "The onboarding process", b: "It starts with a free 30-minute discovery call, then a tailored proposal. Once aligned, we kick off with a full briefing session and shared timeline." }
        ],
        [
            { t: "Revision policy", b: "Each phase includes two rounds of revisions. This keeps things moving without endless loops. Additional rounds can be scoped in if needed." }
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

    setTimeout(tick, 1800);

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
    var TIMES = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

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