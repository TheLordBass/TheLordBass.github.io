/* ==========================================================================
   Ibomeno Basiekanem — portfolio behaviour
   No dependencies. Everything degrades to readable HTML if this fails.
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
            var meta = $('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', mode === 'dark' ? '#1d2021' : '#f9f5d7');
        }

        var stored = null;
        try { stored = localStorage.getItem(KEY); } catch (e) {}

        if (stored) {
            apply(stored);
        } else {
            apply(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        }

        if (btn) {
            btn.addEventListener('click', function () {
                var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                apply(next);
                try { localStorage.setItem(KEY, next); } catch (e) {}
            });
        }
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

        if (sections.length && 'IntersectionObserver' in window) {
            var spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    links.forEach(function (l) {
                        l.classList.toggle('is-active',
                            l.getAttribute('href') === '#' + entry.target.id);
                    });
                    if (slSection) slSection.textContent = '~/' + entry.target.id;
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
            // Whichever section header is nearest the top of the viewport.
            var best = 0, bestDist = Infinity;
            order.forEach(function (id, i) {
                var el = document.getElementById(id);
                if (!el) return;
                var d = Math.abs(el.getBoundingClientRect().top - 80);
                if (d < bestDist) { bestDist = d; best = i; }
            });
            return best;
        }

        function showKeys(on) {
            if (!overlay) return;
            overlay.hidden = !on;
            if (on) {
                var close = overlay.querySelector('[data-close-keys]');
                if (close && close.focus) close.focus();
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

        document.addEventListener('keydown', function (e) {
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            // Escape always works, even from a field, so nothing traps you.
            if (e.key === 'Escape') {
                if (overlay && !overlay.hidden) { showKeys(false); return; }
                if (typing() && document.activeElement.blur) document.activeElement.blur();
                return;
            }

            if (typing()) return;

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
                    go(order[Math.max(0, currentIndex() - 1)]);
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
            { t: 'cmd',  v: 'SELECT * FROM analyst;' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' role     | Customer Service Analyst' },
            { t: 'out',  v: ' employer | British Airways' },
            { t: 'out',  v: ' team     | MI function, 4 people' },
            { t: 'out',  v: ' supports | 100+ agent contact centre' },
            { t: 'out',  v: ' focus    | Forecasting, capacity' },
            { t: 'out',  v: ' based    | Manchester, UK' },
            { t: 'out',  v: ' degree   | BSc (Hons), First Class' },
            { t: 'out',  v: ' stack    | SQL, Excel, Power BI' },
            { t: 'dim',  v: '(1 row)' },
            { t: 'dim',  v: '' },
            { t: 'cmd',  v: 'SELECT area, count(*) FROM projects' },
            { t: 'cont', v: '  GROUP BY area ORDER BY 2 DESC;' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' area     | count' },
            { t: 'out',  v: ' SQL      |     6' },
            { t: 'out',  v: ' Tableau  |     3' },
            { t: 'out',  v: ' Power BI |     2' },
            { t: 'out',  v: ' Python   |     1' },
            { t: 'out',  v: ' Excel    |     1' },
            { t: 'dim',  v: '(5 rows)' },
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
                    ['SQL',       'Production queries, CTEs, window functions'],
                    ['Excel',     'Forecast models, Power Query, pivots'],
                    ['Power BI',  'Executive reporting, DAX, drill-through'],
                    ['Tableau',   'Operational dashboards, parameters'],
                    ['Python',    'Cleaning, ETL, reporting automation']
                ]
            },
            focus: {
                sql: 'SELECT area, focus FROM day_to_day;',
                cols: ['area', 'focus'],
                rows: [
                    ['Forecasting', 'Monthly agent requirement from contact flow'],
                    ['Capacity',    'Modelling volume, shrinkage and occupancy'],
                    ['Reporting',   'Replacing manual prep with scheduled queries'],
                    ['Dashboards',  'Building for the decision, not for every field'],
                    ['Stakeholders','Turning a vague ask into a defined requirement']
                ]
            },
            projects: {
                sql: 'SELECT name, type, published_on FROM projects ORDER BY name;',
                cols: ['name', 'type', 'published_on'],
                rows: [
                    ['AdventureWorks Report',   'Power BI', 'GitHub'],
                    ['Call Centre Manager',     'Tableau',  'Tableau Public'],
                    ['Contact Centre Agent',    'Tableau',  'Tableau Public'],
                    ['COVID-19 Analysis',       'SQL',      'GitHub'],
                    ['DVD Rental Analysis',     'SQL',      'GitHub'],
                    ['Maven Market Dashboard',  'Power BI', 'GitHub'],
                    ['NBA Trends 1996-2023',    'SQL',      'GitHub'],
                    ['Telecom Churn',           'Tableau',  'Tableau Public']
                ]
            }
        };

        function esc(s) {
            return String(s).replace(/[&<>"]/g, function (c) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
            });
        }

        function render(key) {
            var d = data[key];
            if (!d) return;

            out.innerHTML =
                '<div class="t-line t-cmd">=> ' + esc(d.sql) + '</div>' +
                '<div class="t-line t-dim">running…</div>';

            var delay = reduceMotion ? 0 : 260;

            setTimeout(function () {
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
            }, delay);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (c) { c.classList.remove('is-active'); });
                chip.classList.add('is-active');
                render(chip.getAttribute('data-query-key'));
            });
        });

        render('skills');
    }());

    /* ----------------------------------------------------------------------
       5. Project filter
       ---------------------------------------------------------------------- */
    (function filters() {
        var buttons = $$('.filter-btn');
        var cards = $$('.project-card');
        var empty = $('#grid-empty');
        if (!buttons.length || !cards.length) return;

        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                buttons.forEach(function (b) { b.classList.remove('is-active'); });
                btn.classList.add('is-active');

                var want = btn.getAttribute('data-filter');
                var shown = 0;

                cards.forEach(function (card) {
                    var match = want === 'all' || card.getAttribute('data-category') === want;
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
        'contact-agent': {
            kind: 'Tableau · Contact centre analytics',
            title: 'Contact centre — agent view',
            repo: 'https://public.tableau.com/app/profile/ibomeno.basiekanem/viz/ContactCentreDataAgentView/Dashboard1',
            repoLabel: 'Open the live dashboard',
            gallery: [
                { src: 'assets/shots/tab-contact-agent.jpg', cap: 'One agent at a time. Handle time, satisfaction and resolution rate, with the distribution sitting underneath them.', alt: 'Tableau agent view showing average handle time, average satisfaction, resolution rate, a satisfaction rating bar chart and a call answer ratio donut.' }
            ],
            blocks: [
                { h: 'Why this exists', p: [
                    'I own reporting like this in my day job at British Airways, but the production version stays inside the business. So I rebuilt the same thinking on data I am allowed to publish. It is the closest I can get to showing you what I actually do all day.',
                    'Picture a team leader with two minutes before a one-to-one. They do not need a report about the contact centre. They need everything about one person, on one screen, before they walk into the room.'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Average handle time</strong>, which is the efficiency number everyone looks at first, so it goes at the top.',
                    '<strong>Satisfaction and resolution rate</strong> sat right next to it. Handle time on its own quietly rewards getting people off the phone, and these two are what stop that happening.',
                    '<strong>The whole satisfaction distribution</strong>, not just the average. Someone on 3.4 made up of 4s and 5s with a couple of 1s needs a completely different conversation to someone sat on 3.4 the whole way through.',
                    '<strong>Call answer ratio</strong> as a donut, answered against missed.',
                    '<strong>An agent picker</strong>, so one layout covers the whole team.'
                ]},
                { h: 'Why it is built this way', p: [
                    'The thing I actually care about here is that the efficiency numbers and the experience numbers sit side by side. Contact centre reporting has a long history of squeezing handle time until service quality quietly falls over, and you only notice months later. Putting them together means the trade-off is on screen instead of buried.',
                    'The test I hold my own dashboards to is whether people use them when I am not around. The four I look after at work get opened before one-to-ones by agents and team leaders who have never once asked me how to read them, and I do not think there is a better measure than that.'
                ]}
            ]
        },

        'call-manager': {
            kind: 'Tableau',
            title: 'Call centre — manager dashboard',
            repo: 'https://public.tableau.com/app/profile/ibomeno.basiekanem/viz/CallCentreManagerDashboard/Dashboard2',
            repoLabel: 'Open the live dashboard',
            gallery: [
                { src: 'assets/shots/tab-call-manager.jpg', cap: 'The team-level view. Volume against a rolling average, with every agent lined up on the same measures.', alt: 'Tableau manager dashboard with satisfaction distribution, KPI tiles, call volume over time against an average reference line, and per-agent comparison bars.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'This is the other half of the agent view. Same data underneath, but the question has changed from "how is Becky getting on" to "where should I be looking this morning".'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Call volume over time with an average line through it</strong>, so a spike reads as a spike straight away instead of you having to work it out off the axis.',
                    '<strong>Satisfaction distribution</strong> across the whole team.',
                    '<strong>KPI tiles</strong> for the numbers a manager gets asked about.',
                    '<strong>Every agent side by side</strong> on three measures at once, using diverging bars so you can see who is above and below average without reading a single figure.'
                ]},
                { h: 'The design thinking', p: [
                    'A ranked list of agents is easy to build and very easy to misuse. Diverging bars against an average keep the attention on who is unusual instead of who is top, and unusual is the useful question when you are working out where your time goes today.',
                    'The two dashboards are meant to answer each other. This one points you at a name. The agent view tells you what is going on with them.'
                ]}
            ]
        },

        churn: {
            kind: 'Tableau · Customer analytics',
            title: 'Telecom churn analysis',
            repo: 'https://public.tableau.com/app/profile/ibomeno.basiekanem/viz/TelecomChurn_17516636066270/ChurnRateDashboard',
            repoLabel: 'Open the live dashboard',
            gallery: [
                { src: 'assets/shots/tab-telecom-churn.jpg', cap: 'Churn broken down four ways. Spend, contract type, tenure and internet service.', alt: 'Tableau churn dashboard with a total versus monthly charges scatter coloured by churn, contract type churn bars, churn by tenure bins and internet service by churn.' }
            ],
            blocks: [
                { h: 'The question', p: [
                    'Who leaves, and what have they got in common? Nobody can do much with a churn rate on its own. What you need is a description of who is at risk that is specific enough for somebody to go and do something about it.'
                ]},
                { h: 'What it found', list: [
                    '<strong>Contract type is the big one.</strong> Month-to-month customers churn at a much higher rate than anyone on a one or two year term. It jumps straight out of the contract breakdown and it is the finding you could actually build a retention plan on.',
                    '<strong>The risk sits early.</strong> Churn piles up in the lowest tenure bins. Get someone past the first stretch and they are far more likely to stay.',
                    '<strong>Spend goes the opposite way to what you would guess.</strong> Plot total against monthly charges and churn thins out as total charges climb. People who have spent more with you leave less, which is the reverse of the usual assumption that the expensive customers are the flighty ones.',
                    '<strong>Internet service type splits the base</strong> into clearly different churn profiles.'
                ]},
                { h: 'How it is built', p: [
                    'A scatter for the continuous relationship, stacked bars for the categorical splits, and a binned tenure view with a parameter on the bin size so you can change the granularity without rebuilding the sheet.',
                    'I put the conclusion in writing on the canvas instead of leaving people to work it out. A chart somebody has to explain is only half done.'
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

        'maven-market': {
            kind: 'Power BI · DAX · KPI design',
            title: 'Maven Market retail dashboard',
            repo: 'https://github.com/TheLordBass/Maven-market-PowerBI',
            gallery: [
                { src: 'assets/shots/maven-topline.jpg', cap: 'Topline. The three headline numbers against goal, weekly revenue trending, and a gauge against target.', alt: 'Maven Market topline page: transactions, profit and returns against goal, a North America map, weekly revenue trend and a revenue gauge.' },
                { src: 'assets/shots/maven-store.jpg',   cap: 'Store performance. Same measures, broken out by location.', alt: 'Maven Market store performance page breaking metrics down by store location.' },
                { src: 'assets/shots/maven-product.jpg', cap: 'Product effect. Which brands and products are moving the headline numbers.', alt: 'Maven Market product effect page showing brand and product level contribution.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'A retail chain running across the USA, Canada and Mexico wanted one place to see whether the current month was on track. Not a report anyone sits down and reads. A screen you glance at.'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Three headline numbers.</strong> Transactions, profit and returns, each against its goal with the variance worked out, so you get "+5.69% against target" instead of "18,325" and no idea whether that is good.',
                    '<strong>Returns treated as a warning.</strong> Sitting 2.9% under goal gets coloured differently from the two measures that are ahead, because what you do about it is a different job.',
                    '<strong>Brand-level detail</strong> with conditional formatting across transactions, profit, margin and return rate, so a 1.64% return rate on one brand stands out without anybody having to go looking for it.',
                    '<strong>Geography and trend.</strong> A map of activity across North America, weekly revenue trending, and a gauge running against the $240K target.'
                ]},
                { h: 'What I was designing for', p: [
                    'With a dataset this wide the temptation is to put all of it on the page. I built the top row so the three numbers that decide whether anyone needs to act are readable from across a desk, and pushed the brand table to the left where it backs up the headline instead of fighting it.',
                    'The other two pages follow the same idea. Store performance and product effect, each one answering the question the topline page makes you ask next.'
                ]}
            ]
        },

        adventureworks: {
            kind: 'Power BI · Drill-through · Data modelling',
            title: 'AdventureWorks executive report',
            repo: 'https://github.com/TheLordBass/AdventureWorks-Power-BI-',
            gallery: [
                { src: 'assets/shots/aw-exec.jpg',     cap: 'Executive summary. Revenue, orders and returns against goal, with category and region for context.', alt: 'AdventureWorks executive summary: $1.83M revenue against goal, monthly orders and returns, a category treemap, subcategory bars, a product table with return rates and a world map.' },
                { src: 'assets/shots/aw-product.jpg',  cap: 'Product detail. The drill-through sitting behind any product in the summary table.', alt: 'AdventureWorks product detail drill-through page.' },
                { src: 'assets/shots/aw-customer.jpg', cap: 'Customer detail. Who is buying and how that splits by segment.', alt: 'AdventureWorks customer detail page showing customer segments and orders.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'A cycling retailer with a big catalogue and sales all over the world. The report had to work for an exec who is giving it ten seconds and for an analyst who needs to know exactly which product is dragging the return rate up.'
                ]},
                { h: 'How it is structured', list: [
                    '<strong>Executive summary page.</strong> $1.83M revenue against a $1.77M goal, monthly orders and returns each against target, with enough sparkline context that one bad month does not read as a trend.',
                    '<strong>Category breakdown</strong> through a treemap and subcategory bars, which makes it obvious straight away that accessories bring the volume and bikes bring the money.',
                    '<strong>Product table with return rates</strong>, so your best seller and your most returned product are on the same screen.',
                    '<strong>Drill-through pages</strong> for product and customer. Keeps the summary clean and the detail one click away.',
                    '<strong>Date slicer and regional filters</strong> for Europe, North America and Pacific, so the same page works for different teams.'
                ]},
                { h: 'The modelling underneath', p: [
                    'None of the visible stuff works unless the model is right first. Proper relationships between the fact and dimension tables, a date table that can carry the time intelligence, and measures written once and reused instead of recalculated in every visual. Most of the work in a report like this never shows up on the page.'
                ]}
            ]
        },

        'maven-movies': {
            kind: 'SQL · Due diligence',
            title: 'DVD rental acquisition analysis',
            repo: 'https://github.com/TheLordBass/Maven-Movies-Project',
            blocks: [
                { h: 'The scenario', p: [
                    'Investors were thinking about buying a DVD rental chain and wanted due diligence before they committed to anything. I had the company database and a list of the things that were making them nervous.'
                ]},
                { h: 'What they needed to know', list: [
                    '<strong>Who runs what.</strong> Managers mapped to store locations, which meant joining across staff, address, city and country.',
                    '<strong>What the inventory is worth.</strong> A full count and valuation, not a sample.',
                    '<strong>Where the risk sits.</strong> Replacement cost broken down by film category, so they knew which bit of the catalogue would actually hurt if it went missing.',
                    '<strong>Who is paying for all this.</strong> Customer lifetime value ranked, to see how much of the revenue rested on how few people.'
                ]},
                { h: 'Techniques', p: [
                    'Joins across three or more tables, SUM and AVG and COUNT for the financial summaries, CASE for the categorising, and explicit NULL handling. That last one mattered more than it sounds. A missing address quietly dropping a store out of a count is exactly the kind of mistake that makes it all the way into a valuation without anyone noticing.'
                ]},
                { h: 'Sample approach', code:
'SELECT\n' +
'    c.name                       AS category,\n' +
'    COUNT(f.film_id)             AS films,\n' +
'    SUM(f.replacement_cost)      AS total_exposure,\n' +
'    ROUND(AVG(f.replacement_cost), 2) AS avg_cost\n' +
'FROM film f\n' +
'JOIN film_category fc ON f.film_id  = fc.film_id\n' +
'JOIN category      c  ON fc.category_id = c.category_id\n' +
'GROUP BY c.name\n' +
'ORDER BY total_exposure DESC;'
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
                    'Two bonus schemes, both meant to get more drivers out on a busy Saturday. Somebody had to pick one, and a decent answer needed more than just which one costs less.'
                ]},
                { h: 'The two options', list: [
                    '<strong>Option 1, a $50 flat bonus.</strong> Needs 8+ supply hours, 90%+ acceptance rate, 10+ trips and a 4.7+ rating. Four conditions and all of them have to hold.',
                    '<strong>Option 2, $4 a trip.</strong> Needs 12+ trips and a 4.7+ rating. Two conditions, and what you get paid scales with what you do.'
                ]},
                { h: 'How I approached it', p: [
                    'Ran every driver in the data against both sets of rules to get qualification rates and total payout under each. That part is straightforward.',
                    'The interesting part is what each scheme is quietly encouraging. Option 1 has an acceptance rate condition, so it goes after availability and reliability, but it is all or nothing. Miss one of the four and you get nothing, and a driver who works out halfway through their shift that they have already failed has no reason to keep going. Option 2 keeps paying right to the end of the day, but it does nothing at all about acceptance rate.'
                ]},
                { h: 'Why it matters', p: [
                    'The SQL here is not hard. The analysis is in how you frame the answer. If I had come back with just the cheaper total I would have answered the question I was asked and completely missed the decision being made.'
                ]}
            ]
        },

        lol: {
            kind: 'SQL',
            title: 'League of Legends matchmaking analysis',
            repo: 'https://github.com/TheLordBass/League-of-legends-analysis',
            blocks: [
                { h: 'The project', p: [
                    'Match data pulled apart in SQL to see what actually correlates with winning, as opposed to what everyone in the client assumes correlates with winning.'
                ]},
                { h: 'What I looked at', list: [
                    '<strong>Pick rate.</strong> What gets chosen and how that moves.',
                    '<strong>Win rate.</strong> And more usefully, the gap between how popular something is and how well it does, because that gap is where the interesting cases live.',
                    '<strong>Per-champion breakdown</strong> for the ones worth a closer look.'
                ]},
                { h: 'Why this one', p: [
                    'Working on something you actually care about is where you learn the difference between a query that runs and a query that answers something. Games data is also messy in genuinely useful ways. Patch versions, role assignments and rank tiers all change what counts as a fair comparison, and you have to decide what to do about that before any of the numbers mean anything.'
                ]}
            ]
        },

        epl: {
            kind: 'Excel',
            title: 'Premier League analysis',
            repo: 'https://github.com/TheLordBass/Premier-League-Analysis-with-Excel-',
            blocks: [
                { h: 'The project', p: [
                    'A Premier League season worked through in Excel. Pivot tables, lookups, derived measures.'
                ]},
                { h: 'The point of it', p: [
                    'Excel is still where most business analysis really happens, and building a workbook someone else can pick up is a different skill from writing a query. Consistent structure, formulas that do not fall over when a row gets added, and calculations you can trace back to where the number came from instead of finding it hard-coded in a cell.',
                    'It is on here because a portfolio that only shows the impressive tools is not an honest picture of the job.'
                ]}
            ]
        },

        databites: {
            kind: 'Python · Pyodide · PWA',
            title: 'DataBites — learn pandas in tiny bites',
            repo: 'https://github.com/TheLordBass/adhd-data-learning',
            blocks: [
                { h: 'What it is', p: [
                    'A browser app that teaches pandas, seaborn and matplotlib in short lessons that each stand on their own. Real Python runs in the browser through Pyodide, so there is nothing to install and no notebook server to get running before you can learn anything.'
                ]},
                { h: 'Why I built it', p: [
                    'Most data tutorials are built as long sessions that assume you can hold an hour of context in your head at once. That does not match how a lot of people learn, me included. If the material comes in pieces that each make sense alone, a five minute session is still worth doing, and you are far more likely to come back tomorrow.'
                ]},
                { h: 'What it demonstrates', list: [
                    'Working well outside the analyst comfort zone. This is a front-end build, not a query.',
                    'Running an actual Python runtime client-side with Pyodide, along with all the loading and caching problems that brings with it.',
                    'Installable as a PWA and works offline once it has cached.'
                ]}
            ]
        },

        practice: {
            kind: 'SQL · Practice',
            title: 'SQL challenge sets',
            repo: 'https://github.com/TheLordBass?tab=repositories',
            blocks: [
                { h: 'What these are', p: [
                    'Worked solutions to business-scenario SQL problems, left public. There are two collections. An eight-part challenge built around real business situations, and a set of solutions from the Analyst Builder platform covering the scenarios that come up over and over in analyst work.'
                ]},
                { h: 'Why they are on here', p: [
                    'The finished projects further up this page are the output. This is the practice. It felt more honest to show both than to present the polished stuff as though it turned up fully formed.'
                ]},
                { h: 'Repositories', list: [
                    '<a href="https://github.com/TheLordBass/8_SQL_Challenge" target="_blank" rel="noopener noreferrer">8_SQL_Challenge</a>, built around business problems.',
                    '<a href="https://github.com/TheLordBass/Analyst-Builder-SQL-question-Solutions" target="_blank" rel="noopener noreferrer">Analyst-Builder-SQL-question-Solutions</a>, analyst scenario solutions.',
                    '<a href="https://github.com/TheLordBass/Learning-Pandas" target="_blank" rel="noopener noreferrer">Learning-Pandas</a>, notebooks tracking how the pandas learning is going.'
                ]}
            ]
        }
    };

    (function modal() {
        var root = $('#modal');
        var body = $('#modal-body');
        if (!root || !body) return;

        var lastFocus = null;

        function build(key) {
            var p = PROJECTS[key];
            if (!p) return '';

            var html = '<p class="m-kind">' + p.kind + '</p>' +
                       '<h2 class="m-title" id="modal-title">' + p.title + '</h2>';

            if (p.gallery) {
                html += '<div class="m-gallery">' + p.gallery.map(function (g) {
                    return '<figure class="m-shot">' +
                           '<img src="' + g.src + '" alt="' + g.alt + '" loading="lazy" decoding="async">' +
                           '<figcaption>' + g.cap + '</figcaption>' +
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

            html += '<div class="m-foot">' +
                    '<a class="btn btn-primary" href="' + p.repo + '" target="_blank" rel="noopener noreferrer">' +
                    (p.repoLabel || 'View on GitHub') + '</a>' +
                    '<button type="button" class="btn btn-ghost" data-close-modal>Close</button>' +
                    '</div>';

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

        btn.addEventListener('click', function () {
            var value = btn.getAttribute('data-email');
            var original = 'Copy address';

            function done(ok) {
                btn.textContent = ok ? 'Copied' : 'Press Ctrl+C';
                setTimeout(function () { btn.textContent = original; }, 1800);
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
