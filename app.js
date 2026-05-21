/* ==========================================================================
   Cyberpunk-Corporate Portfolio Core Controller (app.js)
   Integrates Theme customization, Terminal simulation, SVG charts, and interactive systems.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Customizer & Theme Engine ---
    const customizerToggle = document.querySelector('.customizer-toggle');
    const customizerPanel = document.querySelector('.customizer-panel');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const themeCheckbox = document.getElementById('theme-toggle-checkbox');
    const canvasToggle = document.getElementById('canvas-toggle-checkbox');
    const canvasContainer = document.getElementById('canvas-container');

    // Toggle customizer floating glass panel
    if (customizerToggle && customizerPanel) {
        customizerToggle.addEventListener('click', () => {
            customizerPanel.classList.toggle('active');
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!customizerToggle.contains(e.target) && !customizerPanel.contains(e.target)) {
                customizerPanel.classList.remove('active');
            }
        });
    }

    // Set dynamic HSL primary and secondary hues
    const setThemeHue = (themeName) => {
        const root = document.documentElement;
        switch (themeName) {
            case 'cyan':
                root.style.setProperty('--hue-primary', '180');
                root.style.setProperty('--hue-secondary', '295');
                break;
            case 'emerald':
                root.style.setProperty('--hue-primary', '140');
                root.style.setProperty('--hue-secondary', '190');
                break;
            case 'magenta':
                root.style.setProperty('--hue-primary', '320');
                root.style.setProperty('--hue-secondary', '205');
                break;
            case 'electric':
                root.style.setProperty('--hue-primary', '215');
                root.style.setProperty('--hue-secondary', '180');
                break;
        }
        localStorage.setItem('cyber-hue-theme', themeName);
    };

    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const themeClass = btn.classList[1]; // Get theme name from second class
            setThemeHue(themeClass);
        });
    });

    // Dark/Light Theme Switcher
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', () => {
            if (themeCheckbox.checked) {
                document.documentElement.classList.add('light-theme');
                localStorage.setItem('cyber-mode', 'light');
            } else {
                document.documentElement.classList.remove('light-theme');
                localStorage.setItem('cyber-mode', 'dark');
            }
        });
    }

    // Interactive canvas toggle
    if (canvasToggle && canvasContainer) {
        canvasToggle.addEventListener('change', () => {
            if (canvasToggle.checked) {
                canvasContainer.style.display = 'block';
                localStorage.setItem('cyber-canvas', 'on');
            } else {
                canvasContainer.style.display = 'none';
                localStorage.setItem('cyber-canvas', 'off');
            }
        });
    }

    // Restore cached styling configs
    const cachedHue = localStorage.getItem('cyber-hue-theme');
    if (cachedHue) setThemeHue(cachedHue);

    const cachedMode = localStorage.getItem('cyber-mode');
    if (cachedMode === 'light' && themeCheckbox) {
        themeCheckbox.checked = true;
        document.documentElement.classList.add('light-theme');
    }

    const cachedCanvas = localStorage.getItem('cyber-canvas');
    if (cachedCanvas === 'off' && canvasToggle && canvasContainer) {
        canvasToggle.checked = false;
        canvasContainer.style.display = 'none';
    }

    // --- 2. Hero Interactive Command Prompt typing effect ---
    const terminalBody = document.getElementById('terminal-body');
    const heroCommands = [
        "SELECT * FROM expertise WHERE analyst = 'Data';",
        "python etl_cleaner.py --input=sales_report.csv",
        "SELECT department, SUM(revenue) FROM sales GROUP BY department;",
        "SELECT insights FROM raw_data GROUP BY high_impact ORDER BY value DESC;"
    ];
    let currentCommandIndex = 0;
    let currentCommandCharIndex = 0;
    let terminalLineElement = null;

    const runHeroTerminalSimulator = () => {
        if (!terminalBody) return;
        
        // Print welcome text on load
        if (terminalBody.children.length === 0) {
            appendTerminalLine("SYSTEM BOOT: ACCESS GRANTED. Initialising Secure Data Pipeline...", "output");
            appendTerminalLine("Connected to remote cluster db_node_42...", "output");
            startNextCommand();
        }
    };

    const appendTerminalLine = (text, type = "output") => {
        const line = document.createElement("div");
        line.className = `terminal-line ${type}`;
        line.innerText = type === "command" ? "> " + text : text;
        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        return line;
    };

    const startNextCommand = () => {
        if (currentCommandIndex >= heroCommands.length) {
            currentCommandIndex = 0; // Loop queries
        }
        
        appendTerminalLine("", "command"); // Blank command line
        terminalLineElement = terminalBody.lastChild;
        
        currentCommandCharIndex = 0;
        typeCommandChar();
    };

    const typeCommandChar = () => {
        const fullCommand = heroCommands[currentCommandIndex];
        if (currentCommandCharIndex < fullCommand.length) {
            terminalLineElement.innerText = "> " + fullCommand.substring(0, currentCommandCharIndex + 1);
            currentCommandCharIndex++;
            setTimeout(typeCommandChar, Math.random() * 50 + 30);
        } else {
            // Typing complete, simulate processing latency
            setTimeout(simulateQueryExecution, 600);
        }
    };

    const simulateQueryExecution = () => {
        const command = heroCommands[currentCommandIndex];
        
        if (command.includes("SELECT * FROM expertise")) {
            appendTerminalLine("Running database query...", "output");
            setTimeout(() => {
                appendTerminalLine("Skills loaded successfully (3 rows found):", "output");
                appendTerminalLine("| core_category | expertise_level | focus_tech |", "output");
                appendTerminalLine("| Relational_DB | 95.8% (Expert)  | SQL, PostgreSQL, MySQL |", "output");
                appendTerminalLine("| Data_Cleaning | 92.4% (Advanced)| Python, Pandas, Excel |", "output");
                appendTerminalLine("| BI_Dashboards | 96.5% (Expert)  | Tableau, PowerBI |", "output");
                completeCommandCycle();
            }, 500);
        } 
        else if (command.includes("python etl_cleaner.py")) {
            appendTerminalLine("Loading sales_report.csv (45,820 observations)...", "output");
            setTimeout(() => {
                appendTerminalLine("[INFO] Parsing dates and casting data types...", "output");
                appendTerminalLine("[INFO] Removing 142 rows containing NULL values...", "output");
                appendTerminalLine("[SUCCESS] Cleaned records exported to sanitized_sales.csv.", "output");
                completeCommandCycle();
            }, 800);
        } 
        else if (command.includes("SELECT department")) {
            appendTerminalLine("Aggregating sales revenue grouped by operational division...", "output");
            setTimeout(() => {
                appendTerminalLine("| department  | total_revenue |", "output");
                appendTerminalLine("| Logistics   | £450,210      |", "output");
                appendTerminalLine("| Marketing   | £280,140      |", "output");
                completeCommandCycle();
            }, 700);
        } 
        else {
            appendTerminalLine("Executing SELECT query on high_impact insights...", "output");
            setTimeout(() => {
                appendTerminalLine("| insight_description        | impact_coefficient |", "output");
                appendTerminalLine("| Customer_Churn_Prevention  | 0.84 (Critical)     |", "output");
                appendTerminalLine("| Inventory_Cost_Reduction   | 0.72 (Substantial)  |", "output");
                completeCommandCycle();
            }, 600);
        }
    };

    const completeCommandCycle = () => {
        currentCommandIndex++;
        // Clear terminal after a few lines to avoid infinite scroll length
        setTimeout(() => {
            if (terminalBody.children.length > 12) {
                terminalBody.innerHTML = "";
                appendTerminalLine("[INFO] Clear screen log buffer flush.", "output");
            }
            startNextCommand();
        }, 3000);
    };

    runHeroTerminalSimulator();

    // --- 3. Interactive SQL Sandbox emulator ---
    const queryChips = document.querySelectorAll('.query-chip');
    const sandboxTerminal = document.getElementById('sandbox-terminal');

    const sandboxDb = {
        skills: `
            <table class="terminal-table">
                <thead>
                    <tr><th>Skill Class</th><th>Tool / Engine</th><th>Competency Coefficient</th></tr>
                </thead>
                <tbody>
                    <tr><td>SQL Database</td><td>PostgreSQL, MySQL, SQL Server</td><td>95%</td></tr>
                    <tr><td>Python Analysis</td><td>Python, Pandas, NumPy, ETL</td><td>92%</td></tr>
                    <tr><td>BI & Dashboards</td><td>Tableau, PowerBI, Excel</td><td>96%</td></tr>
                    <tr><td>Data Modeling</td><td>Relational Schemas, Excel Modeling</td><td>90%</td></tr>
                </tbody>
            </table>`,
        optimizations: `
            <table class="terminal-table">
                <thead>
                    <tr><th>Data Cluster</th><th>Refactoring Measure</th><th>Performance Yield</th></tr>
                </thead>
                <tbody>
                    <tr><td>Sales Ingestion DB</td><td>SQL Index & Query Optimisation</td><td>+240% Speedup</td></tr>
                    <tr><td>Marketing Reports</td><td>Automated ETL pipeline script</td><td>-15 hours/week manual work</td></tr>
                    <tr><td>Warehouse Database</td><td>Schema Redesign (Star Schema)</td><td>+180% faster report loads</td></tr>
                </tbody>
            </table>`,
        highlights: `
            <table class="terminal-table">
                <thead>
                    <tr><th>Telemetry Project</th><th>Analytic Value</th><th>Impact Factor</th></tr>
                </thead>
                <tbody>
                    <tr><td>Revenue Leakage Audit</td><td>$340K Discovered Leakage</td><td>High Impact</td></tr>
                    <tr><td>Marketing ROI Analyst</td><td>22% CPA Reduction yield</td><td>Critical Priority</td></tr>
                    <tr><td>Operations KPI Dashboard</td><td>15 Hours/week manual labor saved</td><td>High Impact</td></tr>
                </tbody>
            </table>`
    };

    const runSandboxQuery = (queryType, clickedChip) => {
        if (!sandboxTerminal) return;

        // Toggle chip active state
        queryChips.forEach(chip => chip.classList.remove('active'));
        clickedChip.classList.add('active');

        // Extract SQL query command from button text
        const sqlQuery = clickedChip.getAttribute('data-query');

        // Clear output and print interactive execution steps
        sandboxTerminal.innerHTML = `<div class="terminal-line command">> ${sqlQuery}</div>`;
        sandboxTerminal.innerHTML += `<div class="terminal-line output">Scanning local memory buffers...</div>`;

        setTimeout(() => {
            // Append formatted output table
            sandboxTerminal.innerHTML += `<div class="terminal-line output">Query resolved in 0.042 seconds. Result dataset:</div>`;
            sandboxTerminal.innerHTML += sandboxDb[queryType] || '<div class="terminal-line error">Error: Table not found.</div>';
            sandboxTerminal.scrollTop = sandboxTerminal.scrollHeight;
        }, 400);
    };

    queryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const queryType = chip.getAttribute('data-type');
            runSandboxQuery(queryType, chip);
        });
    });

    // Run first sandbox query automatically to populate
    if (queryChips.length > 0) {
        queryChips[0].click();
    }

    // --- 4. Interactive SVG Chart Tooltips & Dots ---
    const chartPoints = document.querySelectorAll('.chart-point');
    const chartTooltip = document.getElementById('chart-tooltip');

    if (chartPoints.length > 0 && chartTooltip) {
        chartPoints.forEach(point => {
            point.addEventListener('mouseenter', (e) => {
                const label = point.getAttribute('data-label');
                const val = point.getAttribute('data-value');
                
                chartTooltip.innerHTML = `<strong>${label}</strong><br/>Pipeline efficiency: ${val}`;
                chartTooltip.style.display = 'block';
                
                // Track positions to render floating tooltip accurately
                const rect = point.getBoundingClientRect();
                const containerRect = point.closest('.svg-chart-container').getBoundingClientRect();
                
                chartTooltip.style.left = `${rect.left - containerRect.left + 15}px`;
                chartTooltip.style.top = `${rect.top - containerRect.top - 45}px`;
                
                // Add soft active glow on point hover
                point.setAttribute('r', '8');
            });
            
            point.addEventListener('mouseleave', () => {
                chartTooltip.style.display = 'none';
                point.setAttribute('r', '5');
            });
        });
    }

    // --- 5. Project Card Filter System ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterButtons.length > 0 && projectCards.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Clear active
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                projectCards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (filterValue === 'all' || cardCategory === filterValue) {
                        card.parentElement.style.display = 'block';
                        // Add fade-in transition
                        card.style.opacity = '0';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.parentElement.style.display = 'none';
                    }
                });
            });
        });
    }

    // --- 6. Cybernetic Project Modals Manager ---
    const projectTriggers = document.querySelectorAll('.project-modal-trigger');
    const cyberModal = document.getElementById('project-modal');
    const modalInner = document.getElementById('modal-inner-content');
    const modalClose = document.querySelector('.modal-close');

    // Rich dossier content mapping
    const projectDossiers = {
        revenue: `
            <div class="cyber-tag">SQL & Excel Analytics</div>
            <h2 class="section-title" style="margin-bottom:1.5rem">Revenue Leakage Audit</h2>
            <div style="display:grid; grid-template-columns:1fr; gap:1.5rem; margin-bottom:2rem">
                <div>
                    <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Executive Summary</h3>
                    <p style="color:var(--color-text-muted)">Conducted a comprehensive revenue leak audit across historical customer invoicing databanks. Identified discrepancies between service usage logging and actual financial drafts using advanced multi-table SQL queries and Excel forecasting.</p>
                </div>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem">
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">+$340K</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Discovered Leakage</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">120+ Hrs</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Audit Log Time</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">99.8%</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Billing Accuracy</div>
                    </div>
                </div>
            </div>
            <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Methodology & Tech Stack</h3>
            <p style="color:var(--color-text-muted); margin-bottom:1.5rem">Queried billing databases using recursive Common Table Expressions (CTEs) in **SQL (PostgreSQL)**, cross-compared records using **Excel VLOOKUP/INDEX-MATCH**, and created dynamic, interactive summaries in **Tableau** to present the discrepancies to stakeholders.</p>
            <h4 style="color:var(--color-text-white); font-family:var(--font-mono); font-size:0.85rem; margin-bottom:0.5rem">> Discrepancy Matching SQL Query:</h4>
            <pre style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:1rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:var(--color-text-muted); overflow-x:auto">
WITH billed_amounts AS (
    SELECT customer_id, DATE_TRUNC('month', invoice_date) as billing_month, SUM(amount) as total_billed
    FROM invoices GROUP BY 1, 2
),
actual_usage AS (
    SELECT customer_id, DATE_TRUNC('month', session_start) as billing_month, SUM(duration_minutes * 0.12) as actual_cost
    FROM service_sessions GROUP BY 1, 2
)
SELECT b.customer_id, b.billing_month, b.total_billed, u.actual_cost, (u.actual_cost - b.total_billed) as leakage
FROM billed_amounts b JOIN actual_usage u ON b.customer_id = u.customer_id AND b.billing_month = u.billing_month
WHERE (u.actual_cost - b.total_billed) > 50 ORDER BY leakage DESC;
            </pre>`,
        marketing: `
            <div class="cyber-tag">Python & BI Analytics</div>
            <h2 class="section-title" style="margin-bottom:1.5rem">Marketing ROI Analytics</h2>
            <div style="display:grid; grid-template-columns:1fr; gap:1.5rem; margin-bottom:2rem">
                <div>
                    <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Executive Summary</h3>
                    <p style="color:var(--color-text-muted)">Engineered an automated data pipeline using Python scripts to clean and unify disparate ad spend reports across platforms (Google Ads, Meta, LinkedIn). Built a responsive metrics dashboard mapping exact Cost Per Acquisition (CPA) and customer lifetime yields.</p>
                </div>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem">
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">-22%</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">CPA Reduction</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">+14.5%</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Campaign ROI</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">3 Platforms</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Unified Streams</div>
                    </div>
                </div>
            </div>
            <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Methodology & Tech Stack</h3>
            <p style="color:var(--color-text-muted); margin-bottom:1.5rem">Developed data loaders and parsers using **Python (Pandas, NumPy, OS)** to automatically consume ad channel CSV/JSON extracts, perform anomaly checks, merge user identifiers, and push aggregate structures into **SQL Server** for ingestion by **PowerBI** dashboards.</p>
            <h4 style="color:var(--color-text-white); font-family:var(--font-mono); font-size:0.85rem; margin-bottom:0.5rem">> Pandas Data Integration Snippet:</h4>
            <pre style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:1rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:var(--color-text-muted); overflow-x:auto">
import pandas as pd

# Load and standardise ad cost frames
google_df = pd.read_csv('google_ads.csv').rename(columns={'Cost': 'ad_spend', 'Date': 'campaign_date'})
meta_df = pd.read_csv('meta_ads.csv').rename(columns={'AmountSpent': 'ad_spend', 'ReportingDate': 'campaign_date'})

# Add channel markers and concat
google_df['channel'] = 'Google'
meta_df['channel'] = 'Meta'
unified_spend = pd.concat([google_df, meta_df], ignore_index=True)
unified_spend['campaign_date'] = pd.to_datetime(unified_spend['campaign_date'])
            </pre>`,
        dashboard: `
            <div class="cyber-tag">Business Intelligence</div>
            <h2 class="section-title" style="margin-bottom:1.5rem">Operations KPI Console</h2>
            <div style="display:grid; grid-template-columns:1fr; gap:1.5rem; margin-bottom:2rem">
                <div>
                    <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Executive Summary</h3>
                    <p style="color:var(--color-text-muted)">Created a robust warehouse metrics operational console designed for logistics managers. Automated historical inventory audit streams, replacing weekly manual reports with a live dashboard showing shipment delays and volume peaks.</p>
                </div>
                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem">
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">-15 Hours</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Weekly Labor Saved</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">-14%</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Shipment Delays</div>
                    </div>
                    <div style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:0.75rem; border-radius:6px; text-align:center">
                        <div style="color:var(--color-primary); font-size:1.5rem; font-weight:700; font-family:var(--font-heading)">18+ Units</div>
                        <div style="color:var(--color-text-muted); font-size:0.7rem; text-transform:uppercase">Warehouses Unified</div>
                    </div>
                </div>
            </div>
            <h3 style="color:var(--color-primary); font-family:var(--font-heading); font-size:1rem; margin-bottom:0.5rem">Methodology & Tech Stack</h3>
            <p style="color:var(--color-text-muted); margin-bottom:1.5rem">Parsed logistic pipeline datasets via **SQL** queries into a **PostgreSQL** schema. Modeled parameters in **Excel** for verification. Visualized live KPIs, warehouse inventory levels, and geographic shipment routes inside **Tableau**.</p>
            <h4 style="color:var(--color-text-white); font-family:var(--font-mono); font-size:0.85rem; margin-bottom:0.5rem">> Warehouse Inventory Status SQL Query:</h4>
            <pre style="background:var(--color-bg-terminal); border:1px solid var(--color-border); padding:1rem; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; color:var(--color-text-muted); overflow-x:auto">
SELECT 
    w.warehouse_name,
    w.region,
    COUNT(i.item_id) as total_items_in_stock,
    SUM(CASE WHEN i.status = 'Delayed' THEN 1 ELSE 0 END) as delayed_shipments,
    ROUND(SUM(CASE WHEN i.status = 'Delayed' THEN 1.0 ELSE 0.0 END) / COUNT(i.item_id) * 100, 2) as delay_ratio
FROM warehouses w
LEFT JOIN inventory_items i ON w.warehouse_id = i.warehouse_id
GROUP BY w.warehouse_name, w.region
ORDER BY delay_ratio DESC;
            </pre>`
    };

    if (projectTriggers && cyberModal && modalInner && modalClose) {
        projectTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const key = trigger.getAttribute('data-project-key');
                const content = projectDossiers[key];
                
                if (content) {
                    modalInner.innerHTML = content;
                    cyberModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // Stop background scroll
                }
            });
        });

        const closeModalFunc = () => {
            cyberModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scroll
        };

        modalClose.addEventListener('click', closeModalFunc);
        cyberModal.addEventListener('click', (e) => {
            if (e.target === cyberModal) closeModalFunc();
        });
    }

    // --- 7. Ingestion Data Pipeline Form (Contact) Handler ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Extract values
            const name = document.getElementById('name-field').value;
            const email = document.getElementById('email-field').value;
            const msg = document.getElementById('message-field').value;

            if (!name || !email || !msg) return;

            // Trigger visual progress state
            formStatus.className = 'form-status sending';
            formStatus.innerHTML = `<div>[INFO] Initialising secure channel connection...</div>`;

            setTimeout(() => {
                formStatus.innerHTML += `<div>[INFO] Mapping structural message schema payload...</div>`;
                setTimeout(() => {
                    formStatus.innerHTML += `<div>[INFO] Transmitting payload to local server database...</div>`;
                    setTimeout(() => {
                        // Success state
                        formStatus.className = 'form-status success';
                        formStatus.innerHTML = `<strong>[SUCCESS] Message ingestion completed!</strong><br/>Payload processed successfully. Your message has been routed to the analyst's terminal. Expect response output shortly.`;
                        
                        // Clear form input fields
                        contactForm.reset();
                    }, 800);
                }, 600);
            }, 600);
        });
    }

    // --- 8. Responsive Mobile Navigation menu toggler ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('mobile-active');
            
            // Animate hamburger lines slightly
            const spans = menuToggle.querySelectorAll('span');
            spans.forEach((span, idx) => {
                if (navLinks.classList.contains('mobile-active')) {
                    if (idx === 0) span.style.transform = 'translateY(8px) rotate(45deg)';
                    if (idx === 1) span.style.opacity = '0';
                    if (idx === 2) span.style.transform = 'translateY(-8px) rotate(-45deg)';
                } else {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                }
            });
        });

        // Close when a mobile nav link is clicked
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('mobile-active');
                const spans = menuToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = 'none';
                    span.style.opacity = '1';
                });
            });
        });
    }
});
