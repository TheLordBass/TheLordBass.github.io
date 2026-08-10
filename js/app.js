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

        function apply(mode) {
            root.setAttribute('data-theme', mode);
            if (btn) {
                btn.setAttribute('aria-label',
                    mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
            }
            var meta = $('meta[name="theme-color"]');
            if (meta) meta.setAttribute('content', mode === 'dark' ? '#0a0e14' : '#f7f8fa');
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
        var head = $('#site-header');

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

        if (head) {
            var onScroll = function () {
                head.classList.toggle('is-stuck', window.scrollY > 8);
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            onScroll();
        }

        // Scroll spy
        var links = $$('.nav-link');
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
                });
            }, { rootMargin: '-45% 0px -50% 0px' });

            sections.forEach(function (s) { spy.observe(s); });
        }
    }());

    /* ----------------------------------------------------------------------
       3. Hero terminal — an honest intro, typed out
       ---------------------------------------------------------------------- */
    (function terminal() {
        var body = $('#terminal-body');
        if (!body) return;

        var script = [
            { t: 'cmd',  v: 'SELECT * FROM analyst WHERE name = \'Ibomeno\';' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' role          | Customer Service Analyst' },
            { t: 'out',  v: ' employer      | British Airways (since Apr 2023)' },
            { t: 'out',  v: ' function      | MI team of 4' },
            { t: 'out',  v: ' supports      | 100+ agent contact centre' },
            { t: 'out',  v: ' focus         | Forecasting, capacity planning' },
            { t: 'out',  v: ' location      | Manchester, UK' },
            { t: 'out',  v: ' education     | BSc (Hons), First Class' },
            { t: 'out',  v: ' stack         | SQL, Excel, Power BI, Tableau' },
            { t: 'dim',  v: '(1 row)' },
            { t: 'dim',  v: '' },
            { t: 'cmd',  v: 'SELECT area, count(*) FROM projects GROUP BY area;' },
            { t: 'dim',  v: '' },
            { t: 'head', v: ' area        | count' },
            { t: 'out',  v: ' SQL         |     6' },
            { t: 'out',  v: ' Tableau     |     3' },
            { t: 'out',  v: ' Power BI    |     2' },
            { t: 'out',  v: ' Python      |     1' },
            { t: 'out',  v: ' Excel       |     1' },
            { t: 'dim',  v: '' },
            { t: 'ok',   v: '-- all public. code on GitHub, dashboards live. scroll down.' }
        ];

        var CLASS = { cmd: 't-cmd', out: 't-out', dim: 't-dim', ok: 't-ok', head: 't-head' };

        // Keep the newest line in view; the script is taller than the panel.
        function pin() { body.scrollTop = body.scrollHeight; }

        function line(item, text) {
            var el = document.createElement('div');
            el.className = 't-line ' + (CLASS[item.t] || 't-out');
            el.textContent = (item.t === 'cmd' ? '=> ' : '') + text;
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
            if (item.t === 'cmd') {
                var el = line(item, '');
                var c = 0;
                (function type() {
                    if (c <= item.v.length) {
                        el.textContent = '=> ' + item.v.slice(0, c++);
                        pin();
                        setTimeout(type, 26);
                    } else {
                        setTimeout(next, 420);
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
                { src: 'assets/shots/tab-contact-agent.jpg', cap: 'One agent at a time — handle time, satisfaction and resolution rate alongside the distribution behind them.', alt: 'Tableau agent view showing average handle time, average satisfaction, resolution rate, a satisfaction rating bar chart and a call answer ratio donut.' }
            ],
            blocks: [
                { h: 'Why this exists', p: [
                    'This is a public-data rebuild of contact centre reporting I own in my day job at British Airways. The production version cannot be shared, so I rebuilt the same thinking on data I can publish — which means what you can click through here is the closest honest demonstration of what I actually do.',
                    'The scenario is a team leader preparing for a one-to-one. They do not want a report about the contact centre — they want everything about one person, on one screen, in the thirty seconds before the conversation starts.'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Average handle time</strong>, the core efficiency measure, front and centre.',
                    '<strong>Average satisfaction and resolution rate</strong> next to it — because handle time on its own rewards rushing people off the phone, and these are the two measures that keep it honest.',
                    '<strong>The full satisfaction distribution</strong>, not just the mean. An agent averaging 3.4 from mostly 4s and 5s with a few 1s is a completely different coaching conversation from one averaging 3.4 across the board.',
                    '<strong>Call answer ratio</strong> as a donut, showing answered against missed.',
                    '<strong>An agent selector</strong>, so the same layout serves the whole team.'
                ]},
                { h: 'Why it is built this way', p: [
                    'The design decision I care about here is putting efficiency and experience measures side by side. Contact centre reporting has a long history of optimising handle time until service quality quietly degrades. Showing them together makes the trade-off visible rather than letting one metric win by default.',
                    'The test I hold my dashboards to is whether people use them unaided. The four I maintain at work are opened by agents and team leaders ahead of one-to-ones without anyone asking me how to read them — which is the only measure of a dashboard that actually matters.'
                ]}
            ]
        },

        'call-manager': {
            kind: 'Tableau',
            title: 'Call centre — manager dashboard',
            repo: 'https://public.tableau.com/app/profile/ibomeno.basiekanem/viz/CallCentreManagerDashboard/Dashboard2',
            repoLabel: 'Open the live dashboard',
            gallery: [
                { src: 'assets/shots/tab-call-manager.jpg', cap: 'The team-level view — volume against a rolling average, with every agent ranked on the same measures.', alt: 'Tableau manager dashboard with satisfaction distribution, KPI tiles, call volume over time against an average reference line, and per-agent comparison bars.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'The counterpart to the agent view. Same data, different question: not "how is Becky doing" but "where should I be looking today".'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Call volume over time with an average reference line</strong>, so a spike is immediately readable as a spike rather than needing to be worked out from the axis.',
                    '<strong>Satisfaction rating distribution</strong> across the whole team.',
                    '<strong>Headline KPI tiles</strong> for the measures a manager is accountable for.',
                    '<strong>Agent-by-agent comparison</strong> across three measures at once, with diverging bars so above and below average are distinguishable at a glance without reading a single number.'
                ]},
                { h: 'The design thinking', p: [
                    'A ranked list of agents is easy to build and easy to misuse. Using diverging bars against an average, rather than a straight leaderboard, keeps the emphasis on who is unusual rather than who is top — which is the useful question when you are deciding where to spend your time.',
                    'Pairing this with the agent view means the two dashboards answer each other: this one tells you who to look at, that one tells you what is going on with them.'
                ]}
            ]
        },

        churn: {
            kind: 'Tableau · Customer analytics',
            title: 'Telecom churn analysis',
            repo: 'https://public.tableau.com/app/profile/ibomeno.basiekanem/viz/TelecomChurn_17516636066270/ChurnRateDashboard',
            repoLabel: 'Open the live dashboard',
            gallery: [
                { src: 'assets/shots/tab-telecom-churn.jpg', cap: 'Churn broken down four ways — spend, contract type, tenure and internet service.', alt: 'Tableau churn dashboard with a total versus monthly charges scatter coloured by churn, contract type churn bars, churn by tenure bins and internet service by churn.' }
            ],
            blocks: [
                { h: 'The question', p: [
                    'Which customers leave, and what do they have in common? The useful output of a churn analysis is not a churn rate — it is a description of who is at risk, specific enough to act on.'
                ]},
                { h: 'What it found', list: [
                    '<strong>Contract type is the clearest signal.</strong> Month-to-month customers churn at a strikingly higher rate than customers on one or two year terms — visible immediately in the contract breakdown, and the most actionable finding on the dashboard.',
                    '<strong>Tenure concentrates the risk early.</strong> Churn clusters heavily in the lowest tenure bins; customers who make it past the early period are substantially more likely to stay.',
                    '<strong>Spend behaves counter-intuitively.</strong> The scatter of total against monthly charges shows churn thinning out as total charges rise — higher lifetime spend goes with lower churn, which is the opposite of the "expensive customers leave" assumption.',
                    '<strong>Internet service type separates the population</strong> into visibly different churn profiles.'
                ]},
                { h: 'How it is built', p: [
                    'A scatter for the continuous relationship, stacked bars for the categorical splits, and a binned tenure view with an adjustable bin-size parameter so the granularity can be changed without rebuilding the sheet.',
                    'The dashboard carries a written conclusion directly on the canvas rather than leaving the reader to infer it. A chart that needs someone to explain it is only half finished.'
                ]}
            ]
        },

        nba: {
            kind: 'SQL · Window functions · CTEs',
            title: 'NBA trends & performance, 1996–2023',
            repo: 'https://github.com/TheLordBass/NBA-Player-Stats',
            blocks: [
                { h: 'The question', p: [
                    'Basketball commentary is full of claims that sound obviously true and have never been checked against the data. I picked three of them and pointed 25 years of player statistics — over 12,000 player seasons — at each one.'
                ]},
                { h: 'What I asked', list: [
                    '<strong>Do high-volume scorers sacrifice efficiency?</strong> The received wisdom says taking more shots means taking worse ones.',
                    '<strong>Are players actually getting smaller?</strong> The "small ball" era is talked about constantly — is it visible in height and weight?',
                    '<strong>Which franchises reliably develop elite scorers?</strong> Reputation versus record.'
                ]},
                { h: 'What I found', list: [
                    'Players with a usage rate above 30% held the <strong>highest</strong> true shooting percentages, not the lowest. The volume–efficiency trade-off is not there at the top end — the players taking the most shots are the ones good enough to earn them.',
                    'Small ball shows up in the data: since 2015, average player weight is down roughly 5kg and height about 3cm. But part of the apparent height drop turned out to be a 2019 change in how the league measured players, not players actually getting shorter — a data artefact sitting inside a real trend. Separating the two is the whole job; reporting the raw number would have been wrong in a way nobody would have caught.',
                    'Oklahoma City, the Lakers and Golden State came out as the consistent producers of elite scoring talent across the period.'
                ]},
                { h: 'How it was built', p: [
                    'Window functions to rank and compare players within each season without collapsing the detail, CTEs to keep each analytical step readable rather than nesting subqueries five deep, and aggregation across usage rate, shooting efficiency and physical attributes.'
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
                { src: 'assets/shots/maven-topline.jpg', cap: 'Topline performance — the three headline KPIs against goal, weekly revenue trending and a gauge against target.', alt: 'Maven Market topline page: transactions, profit and returns against goal, a North America map, weekly revenue trend and a revenue gauge.' },
                { src: 'assets/shots/maven-store.jpg',   cap: 'Store performance — the same measures broken out by location.', alt: 'Maven Market store performance page breaking metrics down by store location.' },
                { src: 'assets/shots/maven-product.jpg', cap: 'Product effect — which brands and products move the headline numbers.', alt: 'Maven Market product effect page showing brand and product level contribution.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'A retail chain operating across the USA, Canada and Mexico needed one place to see whether the current month was on track — not a report to read, a screen to glance at.'
                ]},
                { h: 'What it shows', list: [
                    '<strong>Three headline KPIs</strong> — transactions, profit and returns — each stated against its goal with the variance calculated, so "18,325" arrives as "+5.69% against target" rather than a number with no reference point.',
                    '<strong>Returns treated as a warning, not a metric.</strong> Returns running 2.9% under goal is coloured differently from the two measures that are ahead, because it needs a different response.',
                    '<strong>Brand-level detail</strong> with conditional formatting across transactions, profit, margin and return rate — so an outlier like a 1.64% return rate on one brand is visible without hunting.',
                    '<strong>Geographic and trend context</strong> — a map of activity across North America, weekly revenue trending, and a gauge against the $240K target.'
                ]},
                { h: 'What I was designing for', p: [
                    'The temptation with a dataset this wide is to put everything on the page. I built the top row so the three numbers that decide whether anyone needs to act are readable from across a desk, and pushed the brand-by-brand table to the left where it supports the headline rather than competing with it.',
                    'The rest of the report follows the same logic across two more pages: store performance and product effect, each answering the follow-up question the topline page provokes.'
                ]}
            ]
        },

        adventureworks: {
            kind: 'Power BI · Drill-through · Data modelling',
            title: 'AdventureWorks executive report',
            repo: 'https://github.com/TheLordBass/AdventureWorks-Power-BI-',
            gallery: [
                { src: 'assets/shots/aw-exec.jpg',     cap: 'Executive summary — revenue, orders and returns against goal, with category and regional context.', alt: 'AdventureWorks executive summary: $1.83M revenue against goal, monthly orders and returns, a category treemap, subcategory bars, a product table with return rates and a world map.' },
                { src: 'assets/shots/aw-product.jpg',  cap: 'Product detail — the drill-through page behind any product in the summary table.', alt: 'AdventureWorks product detail drill-through page.' },
                { src: 'assets/shots/aw-customer.jpg', cap: 'Customer detail — who is buying, and how that splits by segment.', alt: 'AdventureWorks customer detail page showing customer segments and orders.' }
            ],
            blocks: [
                { h: 'The brief', p: [
                    'A cycling retailer with a wide product catalogue and global sales. The report needed to work for an executive who has ten seconds, and for an analyst who needs to know which specific product is dragging the return rate up.'
                ]},
                { h: 'How it is structured', list: [
                    '<strong>Executive summary page</strong> — $1.83M revenue against a $1.77M goal, monthly orders and returns each against target, with sparkline context so a single bad month is distinguishable from a trend.',
                    '<strong>Category breakdown</strong> via treemap and subcategory bars, immediately showing that accessories carry the order volume while bikes carry the value.',
                    '<strong>Product table with return rates</strong>, so the highest-selling product and the most-returned product are visible on the same screen.',
                    '<strong>Drill-through to detail pages</strong> for product and customer, keeping the summary uncluttered while the depth stays one click away.',
                    '<strong>Date-range slicer and regional filters</strong> (Europe / North America / Pacific) so the same page answers questions for different teams.'
                ]},
                { h: 'The modelling underneath', p: [
                    'The visible report depends on getting the model right first — proper relationships between fact and dimension tables, a date table that supports the time intelligence, and measures written once and reused rather than recalculated per visual. Most of the work in a report like this is invisible on the final page.'
                ]}
            ]
        },

        'maven-movies': {
            kind: 'SQL · Due diligence',
            title: 'DVD rental acquisition analysis',
            repo: 'https://github.com/TheLordBass/Maven-Movies-Project',
            blocks: [
                { h: 'The scenario', p: [
                    'Investors were considering buying a DVD rental chain and needed due diligence before committing. I had access to the company database and a list of the things they were nervous about.'
                ]},
                { h: 'What they needed to know', list: [
                    '<strong>Who runs what</strong> — managers mapped to store locations, joining across staff, address, city and country tables.',
                    '<strong>What the inventory is worth</strong> — a full count with asset valuation, not a sample.',
                    '<strong>Where the risk sits</strong> — replacement cost exposure broken down by film category, so the buyers knew which part of the catalogue would hurt if it walked out the door.',
                    '<strong>Who actually pays</strong> — customer lifetime value ranked, to see how concentrated the revenue was.'
                ]},
                { h: 'Techniques', p: [
                    'Multi-table joins across three or more tables, aggregation with SUM, AVG and COUNT for the financial summaries, CASE statements for categorising, and explicit NULL handling — which mattered here, because a missing address silently dropping a store from a count is exactly the kind of error that survives into a valuation.'
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
                    'Exploratory analysis across two country-level tables — deaths and vaccinations — tracked over time. The aim was to answer the questions people were actually asking during the pandemic, in a way that held up.'
                ]},
                { h: 'Questions', list: [
                    'If you caught it in a given country at a given time, what was the likelihood of dying? (deaths-to-cases, tracked over time rather than as a single figure)',
                    'What share of each country\'s population had been infected?',
                    'Which countries carried the highest absolute death tolls, and how does that change when adjusted for population?',
                    'How did vaccination rollout progress against population size?'
                ]},
                { h: 'Techniques', list: [
                    'Joins across the two tables on location <em>and</em> date — getting that composite key right is what keeps the vaccination numbers aligned with the right day.',
                    'Window functions with <strong>PARTITION BY</strong> to build running vaccination totals per country without losing the daily grain.',
                    'Explicit type casting, because aggregate arithmetic on the raw columns produced integer division and quietly wrong percentages.'
                ]},
                { h: 'What it showed', p: [
                    'Mortality rates moved substantially over time as treatment improved, which is the main reason a single headline "death rate" figure was misleading throughout. Containment effectiveness varied widely between countries, and vaccination rates measured against population exposed a very uneven rollout.'
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
                    'Two proposed bonus schemes intended to get more drivers on the road during a busy Saturday. Someone had to say which one to run, and the honest answer needed both a cost and a behavioural argument.'
                ]},
                { h: 'The two options', list: [
                    '<strong>Option 1 — $50 flat bonus.</strong> Requires 8+ supply hours, a 90%+ acceptance rate, 10+ trips and a 4.7+ rating. Four conditions, all of which must hold.',
                    '<strong>Option 2 — $4 per completed trip.</strong> Requires 12+ trips and a 4.7+ rating. Two conditions, and the payout scales with output.'
                ]},
                { h: 'How I approached it', p: [
                    'Ran each driver in the dataset against both rule sets to get qualification rates and total payout under each scheme. The cost comparison is the easy half.',
                    'The more useful half is what each scheme rewards. Option 1\'s acceptance-rate condition targets availability and reliability, but it is all-or-nothing — a driver who misses one of four conditions gets nothing, which is a weak motivator if they realise mid-shift that they have already failed it. Option 2 pays proportionally and stays motivating right up to the end of the day, but it does nothing about acceptance rate.'
                ]},
                { h: 'Why it matters', p: [
                    'This is the kind of question where the SQL is straightforward and the analysis is in framing the answer. Reporting only the cheaper total would have answered the question asked and missed the decision being made.'
                ]}
            ]
        },

        lol: {
            kind: 'SQL',
            title: 'League of Legends matchmaking analysis',
            repo: 'https://github.com/TheLordBass/League-of-legends-analysis',
            blocks: [
                { h: 'The project', p: [
                    'Match data pulled apart in SQL to look at what actually correlates with winning, rather than what the community assumes does.'
                ]},
                { h: 'What I looked at', list: [
                    '<strong>Champion pick rate</strong> — what gets selected, and how that shifts.',
                    '<strong>Champion win rate</strong> — and the gap between popularity and effectiveness, which is usually where the interesting cases sit.',
                    '<strong>Individual champion deep-dive</strong> — a per-champion statistical breakdown.'
                ]},
                { h: 'Why this one', p: [
                    'Analysis on a domain you actually care about is where you learn the difference between a query that runs and a query that answers something. Games data is also genuinely messy in useful ways — patch versions, role assignments and rank tiers all change what a fair comparison looks like.'
                ]}
            ]
        },

        epl: {
            kind: 'Excel',
            title: 'Premier League analysis',
            repo: 'https://github.com/TheLordBass/Premier-League-Analysis-with-Excel-',
            blocks: [
                { h: 'The project', p: [
                    'Premier League season data worked through in Excel — pivot tables, lookups and derived measures.'
                ]},
                { h: 'The point of it', p: [
                    'Excel is still where most business analysis actually happens, and building a workbook someone else can pick up is a distinct skill from writing a query. That means consistent structure, formulas that survive a new row of data, and calculations traceable back to source rather than hard-coded.',
                    'Included here because a portfolio that only shows the impressive tools is not an honest picture of the job.'
                ]}
            ]
        },

        databites: {
            kind: 'Python · Pyodide · PWA',
            title: 'DataBites — learn pandas in tiny bites',
            repo: 'https://github.com/TheLordBass/adhd-data-learning',
            blocks: [
                { h: 'What it is', p: [
                    'A browser app that teaches pandas, seaborn and matplotlib in short, self-contained lessons. Real Python runs in the browser via Pyodide — no install, no notebook server, no environment to set up before you can learn anything.'
                ]},
                { h: 'Why I built it', p: [
                    'Most data tutorials are structured as long sessions that assume you can hold an hour of context at once. That is a bad fit for how a lot of people actually learn, including me. Breaking the material into bites that each stand alone means a session can be five minutes and still be worth something.'
                ]},
                { h: 'What it demonstrates', list: [
                    'Working outside the analyst comfort zone — this is a front-end build, not a query.',
                    'Running a real Python runtime client-side with Pyodide, including the loading and caching problems that come with it.',
                    'Installable as a PWA, working offline once cached.'
                ]}
            ]
        },

        practice: {
            kind: 'SQL · Practice',
            title: 'SQL challenge sets',
            repo: 'https://github.com/TheLordBass?tab=repositories',
            blocks: [
                { h: 'What these are', p: [
                    'Worked solutions to business-scenario SQL challenges, kept public. Two collections: an eight-part SQL challenge built around real-world business problems, and a set of solutions from the Analyst Builder platform covering common data analyst scenarios.'
                ]},
                { h: 'Why they are on here', p: [
                    'The finished projects on this page are the output. These are the reps. I would rather show both than present the polished work as though it appeared without the practice behind it.'
                ]},
                { h: 'Repositories', list: [
                    '<a href="https://github.com/TheLordBass/8_SQL_Challenge" target="_blank" rel="noopener noreferrer">8_SQL_Challenge</a> — business-problem SQL challenges.',
                    '<a href="https://github.com/TheLordBass/Analyst-Builder-SQL-question-Solutions" target="_blank" rel="noopener noreferrer">Analyst-Builder-SQL-question-Solutions</a> — data analyst scenario solutions.',
                    '<a href="https://github.com/TheLordBass/Learning-Pandas" target="_blank" rel="noopener noreferrer">Learning-Pandas</a> — notebooks tracking pandas progress.'
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
