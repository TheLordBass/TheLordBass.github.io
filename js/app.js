/* ==========================================================================
   Ibomeno Basiekanem — portfolio behaviour
   No dependencies. Without JavaScript the page still reads top to bottom and
   every link works; the write-ups, filters, terminal and sandbox need it.
   The theme is set by a small script in <head>, before first paint.
   ========================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var $  = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* ----------------------------------------------------------------------
       1. Theme
       ---------------------------------------------------------------------- */
    (function theme() {
        var root = document.documentElement;
        var btn = $('#theme-toggle');
        var KEY = 'ib-theme';

        var label = $('#theme-label');

        function apply(mode) {
            root.setAttribute('data-theme', mode);
            if (btn) {
                btn.setAttribute('aria-label',
                    mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
            }
            if (label) label.textContent = mode;
            // Both tags, not just the first: each carries a prefers-color-scheme
            // media query, so updating only the dark one left the browser bar
            // on the old colour whenever the system was in light mode.
            $$('meta[name="theme-color"]').forEach(function (meta) {
                meta.setAttribute('content', mode === 'dark' ? '#16130f' : '#faf7f0');
            });
        }

        // The <head> script has already picked the theme; this just syncs the
        // toggle's label and the browser bar colour to it.
        apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

        if (btn) {
            btn.addEventListener('click', function () {
                var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                apply(next);
                try { localStorage.setItem(KEY, next); } catch (e) {}
            });
        }
    }());

    /* ----------------------------------------------------------------------
       1b. Cursor spotlight
       Moves the glow layer with the pointer. One style write per frame at
       most, mouse and trackpad only, and nothing at all with reduced motion.
       ---------------------------------------------------------------------- */
    (function spotlight() {
        var glow = $('.cursor-glow');
        if (!glow || reduceMotion) return;
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var x = 0, y = 0, queued = false;

        function paint() {
            glow.style.setProperty('--gx', x + 'px');
            glow.style.setProperty('--gy', y + 'px');
            queued = false;
        }

        window.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
            x = e.clientX;
            y = e.clientY;
            glow.classList.add('is-on');
            // Text that sits on the open background, not inside a card: the
            // glow dims while the pointer is over it, so reading wins.
            var reading = e.target && e.target.closest &&
                e.target.closest('.hero-copy, .section-head, .prose, .about-side, .timeline, .contact-grid, .grid-more, .filter-row');
            glow.classList.toggle('is-dim', !!reading);
            if (!queued) { queued = true; window.requestAnimationFrame(paint); }
        }, { passive: true });

        // Fade out when the pointer leaves the window, back in when it returns.
        document.documentElement.addEventListener('mouseleave', function () {
            glow.classList.remove('is-on');
        });
        window.addEventListener('blur', function () { glow.classList.remove('is-on'); });
    }());

    /* ----------------------------------------------------------------------
       2. Header: mobile nav, stuck state, scroll spy
       ---------------------------------------------------------------------- */
    (function header() {
        var toggle = $('#menu-toggle');
        var nav = $('#nav');

        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                var open = nav.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', String(open));
                toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            });

            $$('a', nav).forEach(function (a) {
                a.addEventListener('click', function () {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.setAttribute('aria-label', 'Open menu');
                });
            });

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                    nav.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            });
        }

        // Scroll spy — drives both the tab bar and the status line filename
        var links = $$('.tab');
        var slSection = $('#sl-section');
        var sections = links
            .map(function (l) { return $(l.getAttribute('href')); })
            .filter(Boolean);

        // The hero is watched too, so scrolling back to the top clears the
        // active tab and the status line reads "~" instead of "~/about".
        var hero = $('#top');
        if (hero) sections.unshift(hero);

        if (sections.length && 'IntersectionObserver' in window) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    var id = entry.target.id;
                    links.forEach(function (l) {
                        l.classList.toggle('is-active', l.getAttribute('href') === '#' + id);
                    });
                    if (slSection) slSection.textContent = id === 'top' ? '~' : '~/' + id;
                });
            }, { rootMargin: '-45% 0px -50% 0px' });

            sections.forEach(function (s) { spy.observe(s); });
        }

        // Status line scroll percentage, the way a pager reports position
        var slPos = $('#sl-pos');
        if (slPos) {
            var tick = false;
            var update = function () {
                var doc = document.documentElement;
                var max = doc.scrollHeight - doc.clientHeight;
                var pct = max <= 0 ? 100 : Math.round((window.scrollY / max) * 100);
                slPos.textContent = pct <= 0 ? 'Top' : (pct >= 100 ? 'Bot' : pct + '%');
                tick = false;
            };
            window.addEventListener('scroll', function () {
                if (tick) return;
                tick = true;
                window.requestAnimationFrame(update);
            }, { passive: true });
            update();
        }
    }());

    /* ----------------------------------------------------------------------
       2b. Keyboard navigation
       This is the part that makes it a tool rather than a picture of one.
       Every binding is a no-op while focus is in a text field, so typing a
       message in the contact form never triggers a jump.
       ---------------------------------------------------------------------- */
    (function keyboard() {
        var overlay = $('#keys');
        var helpBtn = $('#help-toggle');
        var order = ['about', 'skills', 'projects', 'experience', 'contact'];

        function typing() {
            var el = document.activeElement;
            if (!el) return false;
            var tag = el.tagName;
            return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
        }

        function go(id) {
            var el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }

        function currentIndex() {
            // The last section whose top has reached the header, or -1 while
            // still in the hero. "Nearest header" used to count the hero as
            // About, so j from the top skipped About and went to Skills.
            var current = -1;
            order.forEach(function (id, i) {
                var el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 100) current = i;
            });
            return current;
        }

        function showKeys(on) {
            if (!overlay) return;
            overlay.hidden = !on;
            if (on) {
                // The first [data-close-keys] is the backdrop, a div that cannot
                // take focus, so focus used to stay on the page behind.
                var close = overlay.querySelector('button[data-close-keys]');
                if (close) close.focus();
            } else if (helpBtn) {
                helpBtn.focus();
            }
        }

        if (helpBtn) helpBtn.addEventListener('click', function () { showKeys(overlay.hidden); });
        if (overlay) {
            overlay.addEventListener('click', function (e) {
                if (e.target.closest('[data-close-keys]')) showKeys(false);
            });
        }

        // Single-key shortcuts can be switched off (WCAG 2.1.4): voice control
        // users can set them off by accident. Remembered per browser; the
        // <head> script applies the saved choice before first paint.
        var KEYS = 'ib-keys';
        var switchBox = $('#keys-enabled');
        function shortcutsOn() { return !document.documentElement.classList.contains('keys-off'); }
        if (switchBox) {
            switchBox.checked = shortcutsOn();
            switchBox.addEventListener('change', function () {
                document.documentElement.classList.toggle('keys-off', !switchBox.checked);
                try { localStorage.setItem(KEYS, switchBox.checked ? 'on' : 'off'); } catch (e) {}
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            // Escape always works, even from a field, so nothing traps you.
            if (e.key === 'Escape') {
                if (overlay && !overlay.hidden) { showKeys(false); return; }
                if (typing() && document.activeElement.blur) document.activeElement.blur();
                return;
            }

            // The shortcuts panel is a dialog: keep Tab inside it while open.
            if (e.key === 'Tab' && overlay && !overlay.hidden) {
                var inside = $$('a[href], button:not([disabled]), input:not([disabled])', overlay)
                    .filter(function (el) { return el.offsetParent !== null; });
                if (!inside.length) return;
                var head = inside[0], tail = inside[inside.length - 1];
                if (!overlay.contains(document.activeElement)) {
                    e.preventDefault(); head.focus();
                } else if (e.shiftKey && document.activeElement === head) {
                    e.preventDefault(); tail.focus();
                } else if (!e.shiftKey && document.activeElement === tail) {
                    e.preventDefault(); head.focus();
                }
                return;
            }

            if (typing()) return;
            if (!shortcutsOn()) return;

            // A write-up is open: its own handler owns the keyboard, and
            // jumping the page underneath it just loses your place.
            var modal = $('#modal');
            if (modal && !modal.hidden) return;

            var k = e.key;

            if (k >= '1' && k <= '5') {
                e.preventDefault();
                go(order[Number(k) - 1]);
                return;
            }

            switch (k) {
                case '?':
                    e.preventDefault();
                    showKeys(overlay ? overlay.hidden : false);
                    break;
                case 't':
                    e.preventDefault();
                    if ($('#theme-toggle')) $('#theme-toggle').click();
                    break;
                case 'g':
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
                    break;
                case 'G':
                    e.preventDefault();
                    window.scrollTo({ top: document.body.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
                    break;
                case 'j':
                    e.preventDefault();
                    go(order[Math.min(order.length - 1, currentIndex() + 1)]);
                    break;
                case 'k':
                    e.preventDefault();
                    var at = currentIndex();
                    // From the first section, k goes back up to the hero.
                    if (at <= 0) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
                    else go(order[at - 1]);
                    break;
                case '/':
                    e.preventDefault();
                    go('projects');
                    var first = $('.filter-btn');
                    if (first) setTimeout(function () { first.focus(); }, reduceMotion ? 0 : 420);
                    break;
            }
        });
    }());

    /* ----------------------------------------------------------------------
       3. Hero terminal — an honest intro, typed out
       ---------------------------------------------------------------------- */
    (function terminal() {
        var body = $('#terminal-body');
        if (!body) return;

        // Kept to ~40 columns so the tables stay aligned without sideways scroll.
        var script = [
            { t: 'cmd',  v: 'SELECT * FROM me;' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' role     | Customer Service Advisor' },
            { t: 'out',  v: ' employer | British Airways' },
            { t: 'out',  v: ' likes    | Counter-intuitive results' },
            { t: 'out',  v: ' based    | Manchester, UK' },
            { t: 'out',  v: ' degree   | BSc (Hons), First Class' },
            { t: 'out',  v: ' stack    | SQL, Excel, Power BI' },
            { t: 'dim',  v: '(1 row)' },
            { t: 'dim',  v: '' },
            { t: 'cmd',  v: 'SELECT area, count(*) FROM projects' },
            { t: 'cont', v: '  GROUP BY area ORDER BY 2 DESC;' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' area     | count' },
            { t: 'out',  v: ' SQL      |     4' },
            { t: 'out',  v: ' Power BI |     3' },
            { t: 'out',  v: ' Python   |     1' },
            { t: 'out',  v: ' Excel    |     1' },
            { t: 'dim',  v: '(4 rows)' },
            { t: 'dim',  v: '' },
            { t: 'ok',   v: '-- all public. click through any of it.' }
        ];

        var CLASS = { cmd: 't-cmd', cont: 't-cmd', out: 't-out', dim: 't-dim', ok: 't-ok', head: 't-head' };

        // psql prompts: `=>` starts a statement, `->` continues one.
        var PROMPT = { cmd: '=> ', cont: '-> ' };

        function isTyped(item) { return item.t === 'cmd' || item.t === 'cont'; }

        // Keep the newest line in view; the script is taller than the panel.
        function pin() { body.scrollTop = body.scrollHeight; }

        function line(item, text) {
            var el = document.createElement('div');
            el.className = 't-line ' + (CLASS[item.t] || 't-out');
            el.textContent = (PROMPT[item.t] || '') + text;
            body.appendChild(el);
            pin();
            return el;
        }

        // Reduced motion (or no JS animation wanted): render it all at once.
        if (reduceMotion) {
            script.forEach(function (item) { line(item, item.v); });
            return;
        }

        var i = 0;

        function next() {
            if (i >= script.length) {
                var caret = document.createElement('div');
                caret.className = 't-line t-caret';
                body.appendChild(caret);
                pin();
                return;
            }

            var item = script[i++];

            // Commands type character by character; output appears whole.
            if (isTyped(item)) {
                var el = line(item, '');
                var prompt = PROMPT[item.t];
                var c = 0;
                (function type() {
                    if (c <= item.v.length) {
                        el.textContent = prompt + item.v.slice(0, c++);
                        pin();
                        setTimeout(type, 26);
                    } else {
                        // A continuation line runs straight on; a finished
                        // statement pauses as though it were executing.
                        setTimeout(next, item.t === 'cont' ? 380 : 160);
                    }
                }());
            } else {
                line(item, item.v);
                setTimeout(next, item.v === '' ? 60 : 130);
            }
        }

        // Start once it is on screen — but never leave the panel empty. If the
        // observer hasn't fired by the time the fallback lands (odd rendering
        // conditions, prerendering, a tab that never composites), start anyway.
        var started = false;
        function begin(delay) {
            if (started) return;
            started = true;
            setTimeout(next, delay);
        }

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries, obs) {
                if (entries[0].isIntersecting) { obs.disconnect(); begin(400); }
            }, { threshold: 0.15 });
            io.observe(body);
            setTimeout(function () { begin(0); }, 1600);
        } else {
            begin(400);
        }
    }());

    /* ----------------------------------------------------------------------
       4. Query sandbox
       ---------------------------------------------------------------------- */
    (function sandbox() {
        var out = $('#sandbox-out');
        var chips = $$('.chip');
        if (!out || !chips.length) return;

        var data = {
            skills: {
                sql: 'SELECT * FROM toolkit;',
                cols: ['tool', 'used_for'],
                rows: [
                    ['SQL',       'Joins, CTEs, window functions, subqueries'],
                    ['Excel',     'Power Query, XLOOKUP, pivot tables'],
                    ['Power BI',  'Star schemas, DAX, drill-through'],
                    ['Tableau',   'Dashboards, parameters'],
                    ['Python',    'pandas, still learning'],
                    ['AI tools',  'Drafting SQL and DAX, then checking it']
                ]
            },
            focus: {
                sql: 'SELECT area, focus FROM day_to_day;',
                cols: ['area', 'focus'],
                rows: [
                    ['Framing',      'Checking the question before touching data'],
                    ['Modelling',     'Star schemas and measures that agree'],
                    ['Cleaning',     'Finding what the data quietly gets wrong'],
                    ['Dashboards',   'Building for the decision, not every field'],
                    ['Writing up',   'Saying what I am not confident about too']
                ]
            },
            projects: {
                sql: 'SELECT name, type FROM projects;',
                cols: ['name', 'type'],
                rows: [
                    ['Airline Complaints',      'Power BI'],
                    ['Airline Punctuality',     'Power BI'],
                    ['COVID-19 Analysis',       'SQL'],
                    ['DataBites',               'Python'],
                    ['Driver Incentive Scheme', 'SQL'],
                    ['Mobile Game Revenue',     'Power BI'],
                    ['NBA Trends 1996-2023',    'SQL'],
                    ['Premier League Dashboard','Excel'],
                    ['US EV Adoption',          'SQL']
                ]
            }
        };

        function esc(s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
            });
        }

        var renders = 0;
        var live = $('#sandbox-live');

        function render(key, announce) {
            var d = data[key];
            if (!d) return;

            out.innerHTML =
                '<div class="t-line t-cmd">=> ' + esc(d.sql) + '</div>' +
                '<div class="t-line t-dim">running…</div>';

            var delay = reduceMotion ? 0 : 260;
            var ticket = ++renders;

            setTimeout(function () {
                // Clicking chips quickly queues several results; only the
                // latest click is allowed to paint, or an older query can
                // land last and show the wrong table under the wrong chip.
                if (ticket !== renders) return;
                var html =
                    '<div class="t-line t-cmd">=> ' + esc(d.sql) + '</div>' +
                    '<table class="res-table"><thead><tr>' +
                    d.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
                    '</tr></thead><tbody>' +
                    d.rows.map(function (r) {
                        return '<tr>' + r.map(function (cell) {
                            return '<td>' + esc(cell) + '</td>';
                        }).join('') + '</tr>';
                    }).join('') +
                    '</tbody></table>' +
                    '<div class="t-line t-dim" style="margin-top:.6rem">(' +
                    d.rows.length + ' row' + (d.rows.length === 1 ? '' : 's') + ')</div>';

                out.innerHTML = html;
                // A short line for screen readers, and only after a click: the
                // table itself stays out of the live region.
                if (announce && live) live.textContent = d.sql + ' returned ' + d.rows.length + ' rows.';
            }, delay);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) {
                    c.classList.remove('is-active');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('is-active');
                chip.setAttribute('aria-pressed', 'true');
                render(chip.getAttribute('data-query-key'), true);
            });
        });

        render('skills', false);
    }());

    /* ----------------------------------------------------------------------
       5. Project filter
       ---------------------------------------------------------------------- */
    (function filters() {
        var buttons = $$('.filter-btn');
        var cards = $$('.project-card');
        var empty = $('#grid-empty');
        var grid = $('#project-grid');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(function (b) {
            b.setAttribute('aria-pressed', String(b.classList.contains('is-active')));
        });

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                buttons.forEach(function (b) {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('is-active');
                btn.setAttribute('aria-pressed', 'true');

                var want = btn.getAttribute('data-filter');
                var shown = 0;
                if (grid) grid.classList.toggle('is-filtered', want !== 'all');

                cards.forEach(function (card) {
                    var match = want === 'all' ||
                        (' ' + card.getAttribute('data-category') + ' ').indexOf(' ' + want + ' ') !== -1;
                    card.hidden = !match;
                    if (match) shown++;
                });

                if (empty) empty.hidden = shown !== 0;
            });
        });
    }());

    /* ----------------------------------------------------------------------
       6. Project write-ups (modal)
       ---------------------------------------------------------------------- */
    var PROJECTS = {
        complaints: {
            kind: 'Power BI · DAX · Correlation',
            title: 'Airline customer complaints',
            repo: 'https://github.com/TheLordBass/Airline-Customer-Complaints-Analysis',
            gallery: [
                { src: 'assets/shots/airline-complaints.jpg', cap: 'Four KPIs, complaint volume against payout by category, the channel split, the monthly line, and stations normalised per 1,000 flights.', alt: 'Power BI dashboard: average resolution time 22.37 days, 977 complaints, delay as the most complained-about category, £172.36K total compensation, a combined bar and line chart of complaints and payout by category, a channel pie showing email at 43%, a monthly complaint line, and complaints per 1,000 flights ranked from Newcastle down to Belfast.' }
            ],
            blocks: [
                { h: 'Why I built it', p: [
                    'This is the second half of the punctuality project. Same invented carrier, same synthetic data, same 18 months and same 45,886 flight legs. Having spent that first report working out where delay comes from, the obvious next question was whether fixing delay would actually make passengers any happier.',
                    '977 complaints, £172,360 paid out. Delay is the single most complained-about category, so I went in expecting the two datasets to line up neatly.'
                ]},
                { h: 'They do not line up', p: [
                    'The correlation between monthly complaints and monthly on-time performance is <strong>0.11</strong>. That is nothing. And three-quarters of the complaints came from flights that departed on time.',
                    'So the headline from the first report, that reactionary delay is where the operational leverage sits, is still true for punctuality and simply does not carry across to complaints. If you spent the money on turnaround buffer and expected the complaint line to follow it down, you would be disappointed and you would not know why. Whatever is making people complain is happening somewhere else in the journey, and this dataset cannot tell you where.'
                ]},
                { h: 'The rest of what it found', list: [
                    '<strong>Compensation is a volume story, not a severity one.</strong> Average payout barely moves across the six categories, £172 to £197, and only about half of complaints attract any payment at all. So total compensation tracks complaint count almost proportionally, and delay only dominates the total because it dominates the count.',
                    '<strong>Resolution time is uniformly slow.</strong> 22.4 days on average, 22.5 median, and almost no variation by category. When everything takes the same length of time regardless of how hard it is, that points at a capacity or process ceiling rather than at any particular complaint type.',
                    '<strong>Stations vary more than anything else does.</strong> Newcastle runs at 32 complaints per 1,000 flights against Belfast at 14, a 2.3x spread. Normalising per 1,000 flights is what makes that comparable; raw counts would just rank the busiest airports.',
                    '<strong>Two-thirds of contact is asynchronous.</strong> Email 43%, web form 29%, phone 16%, social 12%. That matters for staffing, because an email queue and a phone queue need completely different resourcing models.'
                ]},
                { h: 'What I would not claim', p: [
                    '23 complaints have no resolution date. I kept them and flagged them rather than dropping them, because if they are open cases rather than bad records then the real resolution time is worse than 22.4 days, not better. It is a small number against 977, but it moves the figure in only one direction and that is worth saying out loud.',
                    'The correlation finding is also a negative result. It tells you delay is not the driver; it does not tell you what is. The honest next step is testing load factor, aircraft age and time of day, and looking for repeat complainants to separate systemic failures from one-off bad days.'
                ]},
                { h: 'Under the hood', p: [
                    'Complaints as the fact table joined to flights on flight_id, which is what makes the punctuality comparison possible at all, plus a generated date table and an airports reference. Complaints per 1,000 flights reuses the same Eligible Flights measure the punctuality report uses, so the two reports cannot disagree with each other about how many flights there were.',
                    'Power Query cleaned 84 rows of channel casing, 90 airport codes, 642 duplicate flight records and 91 sentinel values in the delay columns.'
                ]}
            ]
        },

        game: {
            kind: 'Power BI · DAX · Power Query',
            title: 'Mobile game revenue',
            repo: 'https://github.com/TheLordBass/Mobile-Game-Revenue-Analysis',
            gallery: [
                { src: 'assets/shots/mobile-game.jpg', cap: 'One page. Seven KPIs across the top, revenue by item category, revenue and paying players on one monthly axis, the Pareto curve, revenue by item and the top ten countries.', alt: 'Power BI dashboard for a free-to-play game: total revenue £109.83K, ARPPU £51.93, ARPU £7.76, 14K players, refund rate 2.13% and conversion 14.95%, above a donut of revenue by item category led by packs and currency, a monthly chart of paying players against revenue, a Pareto chart of revenue by player decile, a bar chart of revenue by item led by the Elite Scout Bundle, and the top ten countries by revenue led by the United Kingdom and United States.' }
            ],
            blocks: [
                { h: 'What it is', p: [
                    'Eighteen months of in-app purchases from Tactic Royale, a free-to-play football management game that does not exist. That will not surprise anyone who read the About section. The game and the data are both made up, generated so I could build the whole thing end to end: 14,151 players, 16,296 transactions and £109,834 of gross revenue between January 2025 and June 2026.'
                ]},
                { h: 'Where the growth came from', p: [
                    'Revenue went from £796 in January 2025 to a peak of £9,351 in March 2026, roughly twelve times over. Two things moved. Paying players went from 67 to 383 a month, and the average paying player went from spending £11.88 a month to £24.42. Both matter, but more people paying did most of the work, and that is a different business problem from getting the players you already have to spend more.'
                ]},
                { h: 'What people pay for', p: [
                    'Progression, almost entirely. Packs bring in 43.5% of revenue, in-game currency 37.9% and subscriptions 10.1%, with one-off purchases and boosts at a few per cent each. Cosmetics make under 2%. The four biggest earning items are all progression too: the Elite Scout Bundle at £18,807, 10000 Coins at £16,654, the Gold Scout Pack at £15,467 and 50000 Coins at £14,970.'
                ]},
                { h: 'Refunds', p: [
                    '2.13% of transactions were refunded, which sounds worse than it is once you look at the money. The refunded value comes to £734, 0.67% of gross, leaving £109,100 net. The average refund is roughly a third of an average purchase, so refunds mostly land on the small buys and hardly touch the packs and currency bundles that bring in the revenue.'
                ]},
                { h: 'Who pays', p: [
                    'The top 10% of paying players bring in 64.5% of all revenue, and the top 1% bring in 13.2%. That is about 210 people carrying nearly two-thirds of the income, which looks fine in the averages and turns into a real problem the moment a few of them get bored.',
                    'Power BI has no Pareto chart, so the curve is built from a column-and-line visual with a cumulative revenue measure. The one decision that mattered was fixing the percentage axis at 0 to 100. Left to auto-scale, the curve looks like a gentle slope. Fixed, it shows what is actually there: a near-vertical jump to 64.5% at the first decile, then a long flat tail.'
                ]},
                { h: 'What I would not claim', p: [
                    'The conversion rate is 14.95%, which is not believable. Real free-to-play games usually convert somewhere between 2% and 5% of players. That number is a side effect of the data being synthetic, so the comparisons inside the dataset hold up and the absolute rate means nothing.',
                    'Currency conversion also uses fixed rates, 1 GBP to 1.27 USD and 1.18 EUR. A real version would convert each purchase at the rate on the day it happened.'
                ]},
                { h: 'Getting the data usable', p: [
                    'The biggest catch was the currency column. The supplied GBP amount was blank for 4,308 transactions, 26% of them, all non-GBP purchases. Summing it as given would have understated revenue by roughly a quarter, so the GBP value is rebuilt from the original amount and currency for every row.',
                    'The other decisions: 140 test accounts removed in Power Query, because excluding them inside each measure would leave them counted everywhere else; 209 duplicate transactions removed, which had inflated gross revenue to £111,190; and dates parsed as UK format, since 10,691 of them would otherwise have had the day and month silently swapped.',
                    'Transactions and sessions are two fact tables at different grains. Both relate to players and the date table but not to each other, because flattening them into one table would multiply every purchase by every session.'
                ]}
            ]
        },

        airline: {
            kind: 'Power BI · DAX · Power Query',
            title: 'Airline departure punctuality',
            repo: 'https://github.com/TheLordBass/Airline-Departure-Punctuality-Analysis',
            gallery: [
                { src: 'assets/shots/airline-delay.jpg', cap: 'One page. OTP15 tracked against its 80% goal, five more KPIs across the top, then delay by controllability and the station rankings underneath.', alt: 'Power BI dashboard: OTP15 78.26% against an 80% goal, average delay 26.4 minutes, load factor 82%, cancellation rate 0.59%, delay rate 21.76% and 45,886 flights, above a monthly OTP15 line against an 80% target, a bar chart of delay minutes split into controllable, uncontrollable and reactionary, and two bar charts ranking delay rate and cancellation rate by origin airport.' }
            ],
            blocks: [
                { h: 'What it is', p: [
                    'Eighteen months of short-haul departure performance for Northline Air, which does not exist. The carrier is invented and the data is synthetic, generated so I could build the thing end to end without touching anything I am not allowed to publish. Worth saying that up front.',
                    'The shape of the problem is real enough though. 45,886 flight legs, 25 aircraft, three UK bases at Manchester, Gatwick and Edinburgh, 18 airports in total, running from January 2025 to June 2026.'
                ]},
                { h: 'What I wanted to know', list: [
                    'How does actual punctuality compare against the 80% OTP15 target?',
                    'Which delay category does the most damage: controllable, uncontrollable, or reactionary knock-on from a late inbound aircraft?',
                    'Does a bigger station mean a worse-performing station?',
                    'What do cancellations and load factor look like as a baseline?'
                ]},
                { h: 'What it found', list: [
                    '<strong>OTP15 came out at 78.26% against an 80% target</strong>, missing it in 9 of the 18 months. The miss is seasonal rather than random. February sits around 71% while October and November peak near 81%, so roughly nine percentage points swing between winter and autumn.',
                    '<strong>Reactionary delay is the expensive one.</strong> Controllable and uncontrollable delays both average 24.3 minutes each. Reactionary averages 29.8, so it is the only category that separates from the other two on cost per event rather than on how often it happens. It occurs least of the three, 3,924 events against 6,369 and 6,164, and still accounts for 27.8% of every delay minute in the dataset.',
                    '<strong>It is also the one the airline did not cause that day.</strong> Reactionary delay arrives with an aircraft that was already late from somewhere else, which is what makes it worth chasing. You cannot fix it at the gate where it shows up.',
                    '<strong>Size does not predict performance.</strong> Amsterdam and Rome sit near the top of the delay-rate table at around 27%, while Manchester, the second-largest base, runs closer to 19%. Ranking stations by rate instead of by count is what makes that visible.',
                    '<strong>The baselines:</strong> 0.59% cancellation rate across 270 flights, 82% load factor, and an average delay of 26.4 minutes.'
                ]},
                { h: 'The part I would want to be asked about', p: [
                    '1,106 of the 9,898 delayed flights have no recorded cause. That is 11.2% of delays with nothing attached, which puts an uncertainty band around every controllability number on the page. It is stated on the write-up rather than quietly ignored, because a delay split that claims more precision than the data supports is worse than one that admits the gap.',
                    'The other decisions that mattered: cancelled flights are excluded from OTP but still counted in the cancellation denominator, blank delay values are filtered explicitly so DAX does not coerce them to zero, and OTP15 and Delay Rate share a single denominator measure so the two can never drift apart as the model grows.'
                ]},
                { h: 'Getting the data usable', p: [
                    'Power Query did the cleaning. 642 duplicate rows out via Table.Distinct, whitespace and casing fixed on airport codes, malformed aircraft registrations repaired, free-text delay reasons mapped onto IATA codes, and -999 sentinel values replaced with null rather than filtered out, since a row with a bad sentinel still tells you a flight happened.',
                    'The model is a star schema with flights as the fact table and dimensions for dates, delay codes with their controllability classification, aircraft and airports. Month-year is sorted by an index so the line chart runs in calendar order instead of alphabetically, which is the small thing that makes a time series readable.'
                ]},
                { h: 'Where I would take it next', p: [
                    'The complaints report on this page is the direct follow-on, and the short version is that it did not go the way I expected. Complaints turned out to be almost uncorrelated with punctuality, which means none of the leverage described above would have moved them.',
                    'Two things. Quantifying how a single delay propagates through an aircraft rotation across the rest of its day, which is what would turn the reactionary finding into a number someone can act on. And attaching cost per delay minute, so the argument for buying turnaround buffer stops being about minutes and starts being about money.'
                ]}
            ]
        },

        nba: {
            kind: 'SQL · Window functions · CTEs',
            title: 'NBA trends & performance, 1996–2023',
            repo: 'https://github.com/TheLordBass/NBA-Player-Stats',
            blocks: [
                { h: 'The question', p: [
                    'Basketball punditry is full of things that sound obviously true and have never been checked against anything. I picked three of them and pointed 25 years of player stats at each one, which works out at somewhere over 12,000 player seasons.'
                ]},
                { h: 'What I asked', list: [
                    '<strong>Do high-volume scorers give up efficiency?</strong> Everyone assumes taking more shots means taking worse ones.',
                    '<strong>Are players actually getting smaller?</strong> People talk about the small ball era constantly, but does it turn up in height and weight?',
                    '<strong>Which clubs reliably produce elite scorers?</strong> Reputation against record.'
                ]},
                { h: 'What I found', list: [
                    'Players with a usage rate over 30% had the <strong>highest</strong> true shooting percentages, not the lowest. At the top end that trade-off just is not there. The players taking the most shots are mostly the ones good enough to have earned them.',
                    'Small ball does show up. Since 2015 average weight is down about 5kg and height about 3cm. But some of that height drop turned out to be the league changing how it measured players in 2019, not players getting shorter. That took a while to spot, and it is the sort of thing that would have gone straight into a report as a real finding if I had not gone looking.',
                    'Oklahoma City, the Lakers and Golden State came out as the ones consistently producing elite scoring talent across the whole period.'
                ]},
                { h: 'How it was built', p: [
                    'Window functions to rank and compare players inside each season without losing the individual rows, CTEs so each step stays readable instead of ending up five subqueries deep, and aggregation across usage rate, shooting efficiency and physical attributes.'
                ]},
                { h: 'Sample approach', code:
'WITH usage_tiers AS (\n' +
'    SELECT\n' +
'        player_name,\n' +
'        season,\n' +
'        usage_pct,\n' +
'        ts_pct,\n' +
'        NTILE(4) OVER (PARTITION BY season ORDER BY usage_pct) AS usage_quartile\n' +
'    FROM player_seasons\n' +
'    WHERE games_played >= 40\n' +
')\n' +
'SELECT\n' +
'    usage_quartile,\n' +
'    ROUND(AVG(ts_pct), 4) AS avg_true_shooting,\n' +
'    COUNT(*)              AS player_seasons\n' +
'FROM usage_tiers\n' +
'GROUP BY usage_quartile\n' +
'ORDER BY usage_quartile;'
                }
            ]
        },

        covid: {
            kind: 'SQL · Exploratory analysis',
            title: 'COVID-19 global analysis',
            repo: 'https://github.com/TheLordBass/SqlCovidProject',
            blocks: [
                { h: 'The project', p: [
                    'Two country-level tables, deaths and vaccinations, tracked over time. I wanted to answer the questions people were genuinely asking each other during the pandemic, and answer them in a way that would survive someone checking.'
                ]},
                { h: 'Questions', list: [
                    'If you caught it in a particular country at a particular time, what were your odds? Deaths against cases, tracked over time instead of collapsed into one figure.',
                    'How much of each country had actually had it?',
                    'Which countries carried the highest death tolls, and how much does that change once you adjust for population?',
                    'How did the vaccine rollout go, measured against the number of people there were to vaccinate?'
                ]},
                { h: 'Techniques', list: [
                    'Joining the two tables on location <em>and</em> date. Getting that composite key right is the whole thing. Get it wrong and your vaccination numbers quietly line up against the wrong days.',
                    'Window functions with <strong>PARTITION BY</strong> for running vaccination totals per country, without losing the daily rows underneath.',
                    'Explicit casting, because doing the arithmetic on the raw columns gave me integer division and percentages that were wrong in a way that looked fine.'
                ]},
                { h: 'What it showed', p: [
                    'Mortality moved a lot over time as treatment got better, which is the main reason any single headline death rate was misleading the whole way through. How well countries contained it varied enormously. And vaccination measured against population showed just how uneven the rollout was.'
                ]},
                { h: 'Sample approach', code:
'SELECT\n' +
'    d.location,\n' +
'    d.date,\n' +
'    d.population,\n' +
'    v.new_vaccinations,\n' +
'    SUM(CAST(v.new_vaccinations AS bigint))\n' +
'        OVER (PARTITION BY d.location ORDER BY d.date) AS running_vaccinated\n' +
'FROM CovidDeaths d\n' +
'JOIN CovidVaccinations v\n' +
'  ON d.location = v.location\n' +
' AND d.date     = v.date\n' +
'WHERE d.continent IS NOT NULL\n' +
'ORDER BY d.location, d.date;'
                }
            ]
        },

        uber: {
            kind: 'SQL · Business modelling',
            title: 'Driver incentive scheme modelling',
            repo: 'https://github.com/TheLordBass/Partner-Business-Modeling',
            blocks: [
                { h: 'The decision', p: [
                    'Demand was due to spike on a Saturday and the business needed a lot more drivers online than the week before. Two bonus schemes were on the table and they reward completely different behaviour, so the question was what each one costs and who each one leaves out.'
                ]},
                { h: 'The two options', list: [
                    '<strong>Option 1, a $50 flat bonus.</strong> Needs 8+ supply hours, 90%+ acceptance rate, 10+ trips and a 4.7+ rating. Four conditions and all of them have to hold.',
                    '<strong>Option 2, $4 a trip.</strong> Needs 12+ trips and a 4.7+ rating. Two conditions, and what you get paid scales with what you do.'
                ]},
                { h: 'What they cost', list: [
                    '<strong>Option 1: $1,050.</strong> 21 drivers clear all four conditions, at $50 each.',
                    '<strong>Option 2: $2,696.</strong> 674 qualifying trips at $4 each, about 2.6 times as much.',
                    '<strong>Only 2 drivers</strong> clear Option 1 without clearing Option 2. They are the ones doing 10 or 11 trips while meeting every quality bar, and they were the main fairness argument against Option 2. At 2 people it does not hold up.'
                ]},
                { h: 'What I recommended', p: [
                    'Option 1. It costs $1,646 less, under 40% of what Option 2 would, and the fairness objection only touches those 2 drivers.',
                    'The cost gap is not the whole case either. Option 2 has no condition on acceptance or hours online, and it pays per trip to drivers who were already doing 12 or more, so a good chunk of that $2,696 pays for trips that would have happened anyway. Option 1 pays for hours online and requests accepted, which is what keeps riders from waiting on a surge day.'
                ]},
                { h: 'The bigger opportunity', p: [
                    '10.92% of the drivers online, roughly one in nine, hold a 4.7+ rating but completed fewer than 10 trips and accepted under 90% of requests. Neither scheme is aimed at them. They are the biggest pool of spare supply in the data, and getting even some of them working more would add more cars than either bonus buys.'
                ]},
                { h: 'What this does not tell you', p: [
                    'Both costs come from how drivers behaved before any bonus existed. The real test is how many extra drivers each scheme actually gets online, and a cheaper scheme that moves fewer people is not really the cheaper one. That needs a trial, not a query.'
                ]},
                { h: 'How it was built', p: [
                    'Compound WHERE clauses translating each rule straight into SQL, COUNT and SUM over the filtered drivers to price each scheme, and a subquery for the share. That share needed an explicit CAST to FLOAT, because integer division returns 0 without complaint, and 0% looks like a believable answer.'
                ]}
            ]
        },


        ev: {
            kind: 'SQL Server · Power BI · DAX',
            title: 'US electric vehicle adoption',
            repo: 'https://github.com/TheLordBass/Analyzing-U.S.-Electric-Vehicle-Market-Share',
            gallery: [
                { src: 'assets/shots/ev-market.jpg', cap: 'One page. Six KPIs across the top, alternative fuels split into meaningful and niche, fleet size against EV rate, a map of adoption by state, and the top and bottom five.', alt: 'Power BI dashboard: national EV rate 1.24%, 3.56M EVs, California the state with the most and North Dakota the least, California 35.34% of US EVs and an electrified share of 4.27%, above a bar chart of alternative fuels, a scatter of total vehicles against EV rate with the 1.24% national line, a map of EV rate by state, and top and bottom five state rankings.' }
            ],
            blocks: [
                { h: 'The question', p: [
                    'Where Americans are actually buying electric cars, where they are not, and what that should tell anyone deciding where to put chargers. The data is vehicle registrations by fuel type for all 50 states and DC, about 287 million vehicles, as a single snapshot.'
                ]},
                { h: 'What it showed', list: [
                    '<strong>Petrol still dominates.</strong> 84.6% of registered vehicles run on it. Fully electric is 1.24% nationally, about 3.56 million cars, and even with plug-in and standard hybrids added the electrified share only reaches 4.27%.',
                    '<strong>Adoption is concentrated.</strong> California has 35.3% of every EV in the country with about 13% of the vehicles. Its rate of 3.41% is 2.75 times the national figure, while North Dakota and Mississippi sit at 0.13%, a 26-fold gap inside one country.',
                    '<strong>Count and rate tell different stories.</strong> Texas has 230,100 EVs, almost as many as Florida, but at 0.89% it has the lowest rate of the four biggest fleets, because 25.8 million vehicles swallow them. Ranked by count it looks like an EV state. Ranked by rate it does not. That is why I reported both all the way through.',
                    '<strong>Hydrogen follows the pumps.</strong> All 16,900 hydrogen vehicles in the US are in California, the only state with a public refuelling network. It is the neatest example in the data of adoption following infrastructure.'
                ]},
                { h: 'What I would do with it', p: [
                    'Rural states that lag need fast charging along the highways to deal with range anxiety, not dense city networks they do not need yet. The leading states have the opposite problem, which is grid capacity for charging at home and at work.',
                    'The real prize is the big fleets with low rates. Lifting Texas from 0.89% to the Florida rate of 1.37% would add roughly 124,000 EVs, close to the whole EV fleet of New York State.'
                ]},
                { h: 'What I would not claim', p: [
                    'Why the gap exists stays a hypothesis. Population density, charger coverage and political lean all line up with the pattern, but this dataset has registrations and nothing else, so it cannot separate them, and there are exceptions either way. Florida leans Republican and sits above the national rate, and Nevada is a swing state in the top five.',
                    'It is also one point in time, so there is no growth curve. The obvious next step is joining charger counts from the US Department of Energy to get chargers per EV by state.'
                ]},
                { h: 'A mistake I caught in my own query', p: [
                    'The share column in the large-states query uses a window function, and window functions run after the WHERE clause. So the 67.09% it shows is the share California has of those four states, not of the US. The real national figure is 35.3%. The write-up says so, because a number that is right for the wrong question is the easiest kind to repeat.'
                ]},
                { h: 'How it was built', p: [
                    'SQL Server for the import and the market-share queries: a CTE totalling every fuel type per state, joined back to get the share for each fuel, plus TOP 5 and a window function for the comparisons. Power BI on top with Power Query and DAX, and a 0.5% line to split alternative fuels into the ones with real scale and the rounding errors.'
                ]}
            ]
        },
        epl: {
            kind: 'Excel · Power Query · Dynamic arrays',
            title: 'Premier League season dashboard, 2000/01 to 2021/22',
            repo: 'https://github.com/TheLordBass/Premier-League-Analysis-with-Excel-',
            gallery: [
                { src: 'assets/shots/epl-card.jpg', cap: 'Set to 2021/22. Click the arrows and every number on the page is worked out again for that season: the table, the zones and the summary.', alt: 'Excel dashboard set to the 2021/22 season: a full Premier League table with Man City top on 93 points, zones for the Champions League, Europa League and relegation, and a season summary naming the champions, European qualifiers and relegated clubs.' }
            ],
            blocks: [
                { h: 'What it is', p: [
                    'Twenty-two seasons of Premier League results, 8,360 matches, in one Excel workbook. Pick a season with the spin button and it pulls out that season’s 380 matches, rebuilds the league table from scratch (wins, draws, losses, goals, points, cards, clean sheets, shots and conversion rate), marks the champions, European places and relegated clubs, and writes its own plain-English summary: best defence, most clinical attack, fewest cards.',
                    'Before any of it I checked the data: every season has 380 matches, 20 clubs and 38 games per club, there are no missing values or duplicate fixtures, and every result agrees with its scoreline.'
                ]},
                { h: 'What 22 seasons showed', list: [
                    '<strong>Home advantage is real, until the fans go.</strong> Home teams won 45.9% of all matches. In 2020/21, played almost entirely behind closed doors, away teams won more than home teams, 40.3% to 37.9%, the only time in 22 seasons. The yellow card gap closed too: away sides normally get about 24% more yellows, and that season it was 1.45 a match against 1.42.',
                    '<strong>Titles are won at both ends.</strong> Every champion was top three for goals scored, and 21 of 22 were top three for fewest conceded. Goal difference correlates 0.97 with points. Cards barely register at −0.25.',
                    '<strong>The 40 point rule holds, just.</strong> Forty points would have kept a club up in 21 of 22 seasons. The exception is West Ham, relegated with 42 in 2002/03.',
                    '<strong>More goals, fewer red cards.</strong> Goals per match went from 2.57 (2000/01 to 2008/09) to 2.75 (2009/10 to 2021/22), while red cards fell by about a third.',
                    '<strong>A league of six.</strong> Man United, Chelsea, Arsenal, Liverpool, Man City and Tottenham took 83 of the 88 top-four places and 21 of the 22 titles. Leicester in 2015/16 is the one that got away.'
                ]},
                { h: 'How it was built', p: [
                    'Power Query combines 22 season CSV files from a folder and keeps 16 of their 45 columns. From there everything runs off one cell: the spin button sets a number, that picks a season, and FILTER spills its 380 matches. SORT and UNIQUE give the club list, COUNTIFS and SUMIF build the table, RANK.EQ ranks it on points with goal difference as the tie-break, XLOOKUP finds the season leaders, and text formulas turn them into the summary sentences.'
                ]},
                { h: 'What I would not claim', list: [
                    '<strong>Points deductions are not applied</strong>, because the table is built from results. The only one in this period is Portsmouth in 2009/10, and they finish bottom either way.',
                    '<strong>European places go by league position.</strong> In reality cup winners can take them. In 2012/13 Everton finished 6th and did not qualify.',
                    '<strong>Ties name one club.</strong> When clubs are level on a summary figure the dashboard names the first alphabetically, so the 2021/22 view credits Liverpool alone for the best defence although Man City matched it.',
                    '<strong>Shots on target are not comparable across 2013/14</strong>, where the source seems to have changed how it recorded them. Goals per shot is fine across every season.'
                ]}
            ]
        },

        databites: {
            kind: 'Pyodide · SQLite · JavaScript',
            title: 'DataBites — Python, SQL and DAX in small bites',
            live: 'https://thelordbass.github.io/databites/',
            liveLabel: 'Open DataBites',
            repo: 'https://github.com/TheLordBass/databites',
            gallery: [
                { src: 'assets/shots/databites.jpg', cap: 'On a phone, which is what it was built for. Home leads with the next lesson, each lesson is three bullets and an editor, and the tracks screen lays everything out as a numbered path.', alt: 'Three DataBites phone screens: the home screen with one next lesson and a Begin button, the first SQL lesson with three short bullets above a SQL editor, and the tracks screen showing 15 tracks and 370 lessons as a numbered learning path.' }
            ],
            blocks: [
                { h: 'What it is', p: [
                    'A learning app that runs entirely in the browser. It began as pandas lessons I could do on my phone and kept growing: there are now 370 lessons across 15 tracks: 285 in Python (an 80-lesson course for complete beginners, plus pandas, messy data, statistics, AI and algorithms), 35 in SQL, 35 in DAX (10 of those on Power BI modelling) and 15 across three projects, laid out as a numbered path in the order to take them. On top of that are 139 practice problems and a PL-300 prep section with 107 exam-style questions for the Power BI Data Analyst exam.',
                    'Nothing gets installed and nothing leaves the device. Your code and your progress stay in the browser, and after the first load it works with no connection. That first load pulls down about 25MB of Python runtime, so it is worth doing on wifi once.'
                ]},
                { h: 'Why I built it', p: [
                    'Most data tutorials are built as long sessions that assume you can hold an hour of context in your head at once. That does not match how a lot of people learn, me included. So the home screen leads with one thing, the next lesson. Each concept gets three bullets at most before you type something, and getting stuck is one tap away from the answer with no penalty for taking it. A five minute session is still worth doing, and you are far more likely to come back tomorrow.'
                ]},
                { h: 'How it was built', p: [
                    'With Claude, Anthropic\u2019s AI model. It was co-written with Claude from the first commit, and a lot of the code came out of that back and forth, the DAX engine included. It would feel wrong to put it on a portfolio without saying so.',
                    'What was mine was the reason for it and the direction: what it should teach, what to leave out, and how a lesson should feel on a phone. All of that came from the specific ways I kept bouncing off other tutorials.'
                ]},
                { h: 'The DAX engine', p: [
                    'You cannot run Microsoft\u2019s DAX engine in a browser, so we built one: about 2,400 lines of Python that handles measures, filter and row context, context transition, CALCULATE with ALL, ALLEXCEPT and KEEPFILTERS, the X iterators, RELATED, RANKX, calculated columns and time intelligence on a marked calendar table. Relationships filter one way from lookup to data, as they do in a default Power BI model.',
                    'Every DAX lesson\u2019s answer was checked against the same numbers worked out separately in pandas. This page used to flag one gap: a whole table used as a CALCULATE filter did not reach the lookup tables behind it. It does now, the way Power BI\u2019s expanded tables do, and it stops at a blank key where Power BI would use the blank row.'
                ]},
                { h: 'One workspace, three languages', p: [
                    'SQL runs in SQLite through Python\u2019s own sqlite3, and every DataFrame becomes a table of the same name. So the SQL lessons query the very same cafe table the pandas lessons use, and nothing needs keeping in sync. The sandbox has a Python, SQL and DAX switch over one shared workspace. Make a DataFrame in Python mode and it is a table in SQL mode.',
                    'Where SQLite does something differently from PostgreSQL, BigQuery or SQL Server, the lesson says so underneath: LIMIT against TOP, integer division, date functions and the rest, so what you learn carries over to whatever database a job uses.'
                ]},
                { h: 'Practice that tests honestly', p: [
                    'The practice problems work like LeetCode. There is no starter code, and your answer is judged against hidden inputs that include the edge cases the problem is really about: ties, missing values, empty results. When it fails it shows you exactly which case broke, what was expected and what you returned.',
                    'Each problem also carries tempting wrong answers that the tests must reject, like a >= where it should be >, or an inner join that quietly drops the customers who never ordered. If a wrong answer ever passed, the hidden cases would not be testing the trap, so this proves they do. Alternative correct answers go in the other direction and must pass, which catches tests that only allow one way of writing it.'
                ]}
            ]
        }
    };

    (function modal() {
        var root = $('#modal');
        var body = $('#modal-body');
        if (!root || !body) return;

        var lastFocus = null;

        // Gallery text, links and labels are plain text, so they are escaped:
        // one double quote in an alt would otherwise end the attribute and
        // break the image. Write-up blocks are left as HTML on purpose, since
        // they use <strong> and <a>.
        function esc(s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
            });
        }

        function build(key) {
            var p = PROJECTS[key];
            if (!p) return '';

            var html = '<p class="m-kind">' + esc(p.kind) + '</p>' +
                       '<h2 class="m-title" id="modal-title">' + esc(p.title) + '</h2>';

            if (p.gallery) {
                html += '<div class="m-gallery">' + p.gallery.map(function (g) {
                    return '<figure class="m-shot">' +
                           '<img src="' + esc(g.src) + '" alt="' + esc(g.alt) + '" loading="lazy" decoding="async">' +
                           '<figcaption>' + esc(g.cap) + '</figcaption>' +
                           '</figure>';
                }).join('') + '</div>';
            }

            p.blocks.forEach(function (b) {
                html += '<div class="m-block"><h3 class="m-h">' + b.h + '</h3>';
                if (b.p)    html += b.p.map(function (t) { return '<p>' + t + '</p>'; }).join('');
                if (b.list) html += '<ul class="m-list">' + b.list.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>';
                if (b.code) html += '<pre class="m-code">' + b.code.replace(/</g, '&lt;') + '</pre>';
                html += '</div>';
            });

            html += '<div class="m-foot">';

            // Where a project is both runnable and readable, the running version
            // leads and the source follows.
            if (p.live) {
                html += '<a class="btn btn-primary" href="' + esc(p.live) + '" target="_blank" rel="noopener noreferrer">' +
                        esc(p.liveLabel || 'Open it') + '</a>' +
                        '<a class="btn btn-ghost" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' +
                        esc(p.repoLabel || 'View on GitHub') + '</a>';
            } else {
                html += '<a class="btn btn-primary" href="' + esc(p.repo) + '" target="_blank" rel="noopener noreferrer">' +
                        esc(p.repoLabel || 'View on GitHub') + '</a>';
            }

            html += '<button type="button" class="btn btn-ghost" data-close-modal>Close</button></div>';

            return html;
        }

        function open(key) {
            var html = build(key);
            if (!html) return;

            lastFocus = document.activeElement;
            body.innerHTML = html;
            root.hidden = false;
            document.body.style.overflow = 'hidden';

            var panel = $('.modal-panel', root);
            panel.scrollTop = 0;
            var close = $('.modal-close', root);
            if (close) close.focus();
        }

        function close() {
            root.hidden = true;
            document.body.style.overflow = '';
            body.innerHTML = '';
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        // Open triggers
        $$('[data-project]').forEach(function (el) {
            if (el.classList.contains('project-card')) return; // the card itself is not a trigger
            el.addEventListener('click', function (e) {
                e.preventDefault();
                open(el.getAttribute('data-project'));
            });
        });

        // Close triggers
        root.addEventListener('click', function (e) {
            if (e.target.closest('[data-close-modal]')) close();
        });

        document.addEventListener('keydown', function (e) {
            if (root.hidden) return;

            if (e.key === 'Escape') { close(); return; }

            // Focus trap
            if (e.key !== 'Tab') return;

            var focusable = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
                .filter(function (el) { return el.offsetParent !== null; });
            if (!focusable.length) return;

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }());

    /* ----------------------------------------------------------------------
       7. Contact form → opens the visitor's mail client
       ---------------------------------------------------------------------- */
    (function contact() {
        var form = $('#contact-form');
        var status = $('#form-status');
        if (!form || !status) return;

        var ADDRESS = 'ibomenobasiekanem@gmail.com';

        var fields = [
            { input: $('#f-name'),    error: $('#err-name'),    test: function (v) { return v.length > 0; } },
            { input: $('#f-email'),   error: $('#err-email'),   test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
            { input: $('#f-message'), error: $('#err-message'), test: function (v) { return v.length > 0; } }
        ];

        function validate(field) {
            var ok = field.test(field.input.value.trim());
            field.error.hidden = ok;
            field.input.setAttribute('aria-invalid', String(!ok));
            return ok;
        }

        fields.forEach(function (f) {
            f.input.addEventListener('blur', function () {
                if (f.input.value.trim()) validate(f);
            });
            f.input.addEventListener('input', function () {
                if (f.error.hidden === false) validate(f);
            });
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var allOk = fields.map(validate).every(Boolean);

            if (!allOk) {
                status.className = 'form-status is-err';
                status.textContent = 'Please fill in the highlighted fields.';
                var firstBad = fields.filter(function (f) { return !f.error.hidden; })[0];
                if (firstBad) firstBad.input.focus();
                return;
            }

            var name = fields[0].input.value.trim();
            var email = fields[1].input.value.trim();
            var message = fields[2].input.value.trim();

            var subject = 'Portfolio enquiry from ' + name;
            var lines = message + '\n\n—\n' + name + '\n' + email;

            var href = 'mailto:' + ADDRESS +
                       '?subject=' + encodeURIComponent(subject) +
                       '&body=' + encodeURIComponent(lines);

            window.location.href = href;

            status.className = 'form-status is-ok';
            status.textContent = 'Opening your email client. If nothing happens, email ' + ADDRESS + ' directly.';
        });
    }());

    /* ----------------------------------------------------------------------
       8. Copy email
       ---------------------------------------------------------------------- */
    (function copyEmail() {
        var btn = $('#copy-email');
        if (!btn) return;

        var original = btn.textContent;
        var timer = null;

        // If the clipboard is refused, select the address on the page so a
        // normal copy works. "Press Ctrl+C" on its own had nothing selected
        // to copy, and is the wrong key on a Mac anyway.
        function selectAddress() {
            var link = $('.contact-card a[href^="mailto:"]');
            if (!link || !window.getSelection) return false;
            var range = document.createRange();
            range.selectNodeContents(link);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
        }

        btn.addEventListener('click', function () {
            var value = btn.getAttribute('data-email');

            function done(ok) {
                btn.textContent = ok ? 'Copied' : (selectAddress() ? 'Selected, now copy it' : 'Copy it from above');
                clearTimeout(timer);
                timer = setTimeout(function () { btn.textContent = original; }, ok ? 1800 : 4000);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(value).then(function () { done(true); },
                                                         function () { done(false); });
            } else {
                done(false);
            }
        });
    }());

    /* ----------------------------------------------------------------------
       9. Footer year
       ---------------------------------------------------------------------- */
    (function year() {
        var el = $('#year');
        if (el) el.textContent = String(new Date().getFullYear());
    }());

}());
