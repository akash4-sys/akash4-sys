/* ════════════════════════════════════════════════════════
       CONFIG
    ════════════════════════════════════════════════════════ */
const CFG = {
    github: 'akash4-sys',
    linkedin: 'akash-mishra-045aa5244',
    leetcode: 'codex47',
    email: 'a25cs08002@iitbbs.ac.in',
    resume: 'resume.pdf',
    // Manually override pinned repos (optional – leave empty to auto-fetch)
    manualRepos: []
};

/* ─── apply config ─── */
(function applyConfig() {
    document.querySelectorAll('a[href*="YOUR_GITHUB_USERNAME"]').forEach(el => {
        el.href = el.href.replace('YOUR_GITHUB_USERNAME', CFG.github);
    });
    document.querySelectorAll('a[href*="YOUR_LINKEDIN"]').forEach(el => {
        el.href = el.href.replace('YOUR_LINKEDIN', CFG.linkedin);
    });
    document.querySelectorAll('a[href*="YOUR_LEETCODE"]').forEach(el => {
        el.href = el.href.replace('YOUR_LEETCODE', CFG.leetcode);
    });
    document.querySelectorAll('[href="mailto:you@example.com"]').forEach(el => el.href =
        `mailto:${CFG.email}`);
    document.querySelectorAll('[download]').forEach(el => el.href = CFG.resume);
    document.querySelectorAll('.soc-handle').forEach(el => {
        if (el.textContent.trim() === 'YOUR_GITHUB_USERNAME') el.textContent = CFG.github;
        if (el.textContent.trim() === 'YOUR_LINKEDIN') el.textContent = CFG.linkedin;
        if (el.textContent.trim() === 'YOUR_LEETCODE') el.textContent = CFG.leetcode;
    });
    document.querySelector('.nav-logo span').textContent = `// Akash Mishra`;
    document.getElementById('yr').textContent = new Date().getFullYear();
})();

/* ─── nav scroll ─── */
window.addEventListener('scroll', () => {
    document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
});

/* ─── mobile nav toggle ─── */
(function initMobileNav() {
    const toggleBtn = document.getElementById('nav-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const mobileLinks = mobileNav.querySelectorAll('a');

    function openMenu() {
        mobileNav.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        mobileNav.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', () => {
        if (mobileNav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
            closeMenu();
        }
    });
})();

/* ─── scroll reveal ─── */
(function initReveal() {
    const io = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => e.target.classList.add('vis'), i * 70);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ════════════════════════════════════════════════════════
       THREE.JS CONSTELLATION BACKGROUND (FULL SCREEN)
    ════════════════════════════════════════════════════════ */
(function initThree() {
    const canvas = document.getElementById('three-bg');
    const hero = document.getElementById('hero');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 5;

    function resize() {
        // Always cover the full hero section dimensions
        const rect = hero.getBoundingClientRect();
        const W = rect.width || window.innerWidth;
        const H = rect.height || window.innerHeight;
        renderer.setSize(W, H, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        camera.aspect = W / Math.max(H, 1);
        camera.updateProjectionMatrix();
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', resize, { passive: true });

    const NCOUNT = window.innerWidth < 600 ? 50 : 110;
    const CONNECT_DIST = 1.8;
    const AMBER = new THREE.Color('#F0A500');
    const ORANGE = new THREE.Color('#FF6B35');

    // Nodes
    const nodeGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: AMBER });
    const nodes = [];
    const nodeGroup = new THREE.Group();

    for (let i = 0; i < NCOUNT; i++) {
        const mesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
        const x = (Math.random() - 0.5) * 10;
        const y = (Math.random() - 0.5) * 6;
        const z = (Math.random() - 0.5) * 2;
        mesh.position.set(x, y, z);
        mesh.userData = {
            ox: x,
            oy: y,
            oz: z,
            vx: (Math.random() - 0.5) * 0.003,
            vy: (Math.random() - 0.5) * 0.003,
            phase: Math.random() * Math.PI * 2
        };
        nodeGroup.add(mesh);
        nodes.push(mesh);
    }
    scene.add(nodeGroup);

    // Lines buffer
    const MAX_LINES = NCOUNT * 6;
    const linePositions = new Float32Array(MAX_LINES * 6);
    const lineColors = new Float32Array(MAX_LINES * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5
    });
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegments);

    // Mouse
    const mouse = { x: 0, y: 0, nx: 0, ny: 0 };
    window.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.nx = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        mouse.ny = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    });

    let frame = 0;

    function animate() {
        requestAnimationFrame(animate);
        frame++;
        mouse.x += (mouse.nx - mouse.x) * 0.05;
        mouse.y += (mouse.ny - mouse.y) * 0.05;

        const mx = mouse.x * 5;
        const my = mouse.y * 3;

        nodes.forEach((n) => {
            const u = n.userData;
            u.phase += 0.008;
            n.position.x = u.ox + Math.sin(u.phase) * 0.08 + u.vx * frame;
            n.position.y = u.oy + Math.cos(u.phase * 0.7) * 0.06 + u.vy * frame;

            if (n.position.x > 5.2) u.ox -= 10.4;
            if (n.position.x < -5.2) u.ox += 10.4;
            if (n.position.y > 3.2) u.oy -= 6.4;
            if (n.position.y < -3.2) u.oy += 6.4;

            const dx = mx - n.position.x;
            const dy = my - n.position.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 2.0) {
                const f = (1 - d / 2.0) * 0.006;
                n.position.x += dx * f;
                n.position.y += dy * f;
            }

            const bright = 0.6 + Math.sin(u.phase) * 0.4;
            n.material.color.setRGB(
                AMBER.r * bright + ORANGE.r * (1 - bright) * 0.3,
                AMBER.g * bright,
                AMBER.b
            );
        });

        let li = 0;
        const pos = lineGeo.attributes.position.array;
        const col = lineGeo.attributes.color.array;

        for (let i = 0; i < nodes.length && li < MAX_LINES; i++) {
            for (let j = i + 1; j < nodes.length && li < MAX_LINES; j++) {
                const a = nodes[i].position,
                    b = nodes[j].position;
                const dx = a.x - b.x,
                    dy = a.y - b.y,
                    dz = a.z - b.z;
                const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (d < CONNECT_DIST) {
                    const alpha = (1 - d / CONNECT_DIST);
                    pos[li * 6] = a.x;
                    pos[li * 6 + 1] = a.y;
                    pos[li * 6 + 2] = a.z;
                    pos[li * 6 + 3] = b.x;
                    pos[li * 6 + 4] = b.y;
                    pos[li * 6 + 5] = b.z;
                    col[li * 6] = AMBER.r * alpha;
                    col[li * 6 + 1] = AMBER.g * alpha;
                    col[li * 6 + 2] = 0;
                    col[li * 6 + 3] = AMBER.r * alpha;
                    col[li * 6 + 4] = AMBER.g * alpha;
                    col[li * 6 + 5] = 0;
                    li++;
                }
            }
        }

        lineGeo.setDrawRange(0, li * 2);
        lineGeo.attributes.position.needsUpdate = true;
        lineGeo.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animate();
    } else {
        renderer.render(scene, camera);
    }
})();

/* ════════════════════════════════════════════════════════
       LANGUAGE COLOURS
    ════════════════════════════════════════════════════════ */
const LANG_COLORS = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'C++': '#f34b7d',
    'C': '#555555',
    'Java': '#b07219',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
};

/* ════════════════════════════════════════════════════════
       BUILD PROJECT CARD (no inline listeners)
    ════════════════════════════════════════════════════════ */
function buildCard(r) {
    const color = LANG_COLORS[r.lang] || '#8892b0';
    const card = document.createElement('div');
    card.className = 'proj-card';
    // Store repo data as dataset attributes for the delegated handler
    card.dataset.repoName = escH(r.name);
    card.dataset.repoDesc = escH(r.desc || 'No description provided.');
    card.dataset.repoLang = escH(r.lang);
    card.dataset.repoStars = escH(r.stars);
    card.dataset.repoUrl = escH(r.url);

    card.innerHTML = `
    <div class="proj-top">
      <div class="proj-row">
        <div class="proj-icon-wrap">
          <svg width="18" height="18" fill="none" stroke="#F0A500" stroke-width="1.8" viewBox="0 0 24 24">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
          </svg>
        </div>
        <div class="proj-actions">
          <a href="${escH(r.url)}" target="_blank" rel="noopener"
             class="proj-gh-link" title="Open on GitHub"
             data-action="github">
            <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
          <button class="proj-expand-btn" title="Expand details" data-action="expand">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="proj-name">${escH(r.name)}</div>
      <div class="proj-desc">${escH(r.desc || 'No description provided.')}</div>
    </div>
    <div class="proj-meta">
      ${r.lang ? `<span class="proj-lang"><span class="lang-dot" style="background:${color}"></span>${escH(r.lang)}</span>` : ''}
      <span class="proj-stars">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ${escH(r.stars)}
      </span>
    </div>
    <div class="proj-drawer">
      <div class="proj-drawer-inner">
        <div class="drawer-section-title">About this project</div>
        <div class="drawer-summary">
          <div class="ld-dots"><span></span><span></span><span></span></div>
        </div>
        <div class="drawer-tags"></div>
        <a href="${escH(r.url)}" target="_blank" rel="noopener" class="drawer-link" data-action="github">
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0 1 12 5.8c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.83.57C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>
          Open on GitHub
        </a>
      </div>
    </div>`;

    return card;
}

/* ════════════════════════════════════════════════════════
       DELEGATED CLICK HANDLER — ONE CARD AT A TIME
    ════════════════════════════════════════════════════════ */
function initProjectGridDelegation() {
    const grid = document.getElementById('proj-grid');
    if (!grid) return;

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.proj-card')) {
            document.querySelectorAll('.proj-card.expanded').forEach(c => {
                c.classList.remove('expanded');
            });
        }
    });

    grid.addEventListener('click', function(e) {
        // If the click was on a link/button with data-action, handle specially
        const actionElement = e.target.closest('[data-action]');
        if (actionElement && actionElement.getAttribute('data-action') === 'github') {
            // Let the default link behavior happen (opens GitHub)
            return;
        }

        // Otherwise, find the card that was clicked and toggle it
        const card = e.target.closest('.proj-card');
        if (!card) return;

        toggleSingleCard(card);
    });
}

function toggleSingleCard(card) {
    const wasExpanded = card.classList.contains('expanded');

    // Close all other expanded cards (and also close this one if it was open)
    document.querySelectorAll('.proj-card.expanded').forEach(c => {
        c.classList.remove('expanded');
    });

    // If the clicked card was NOT expanded before, expand it now
    if (!wasExpanded) {
        card.classList.add('expanded');
        // Load AI summary only once
        if (!card.dataset.summaryLoaded) {
            card.dataset.summaryLoaded = '1';
            const repoData = {
                name: card.dataset.repoName,
                desc: card.dataset.repoDesc,
                lang: card.dataset.repoLang,
                stars: card.dataset.repoStars,
                url: card.dataset.repoUrl,
            };
            loadCardSummary(card, repoData);
        }
    }
}

async function loadCardSummary(card, r) {
    const summaryEl = card.querySelector('.drawer-summary');
    const tagsEl = card.querySelector('.drawer-tags');

    if (summaryEl) {
        summaryEl.innerHTML = '<div class="ld-dots"><span></span><span></span><span></span></div>';
    }

    try {
        const ai = await fetchAISummary(r.name, r.desc, r.lang);
        if (summaryEl) summaryEl.textContent = ai.summary;
        if (tagsEl && ai.tags) {
            tagsEl.innerHTML = ai.tags.map(t => `<span class="drawer-tag">${escH(t)}</span>`).join('');
        }
    } catch (e) {
        if (summaryEl) summaryEl.textContent = r.desc || 'A project by this developer. Visit the repository for full details.';
        if (tagsEl) {
            tagsEl.innerHTML = [r.lang, 'Open Source'].filter(Boolean)
                .map(t => `<span class="drawer-tag">${escH(t)}</span>`).join('');
        }
    }
}

function escH(s) {
    return String(s || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

/* ════════════════════════════════════════════════════════
       AI SUMMARY — proxied through our own server
    ════════════════════════════════════════════════════════ */
async function fetchAISummary(repoName, repoDesc, repoLang) {
    const resp = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoName, repoDesc, repoLang })
    });
    if (!resp.ok) throw new Error(`Server error: ${resp.status}`);
    return await resp.json();
}

/* ════════════════════════════════════════════════════════
       LOAD GITHUB PINNED REPOS
    ════════════════════════════════════════════════════════ */
(async function loadRepos() {
    const grid = document.getElementById('proj-grid');
    const uname = CFG.github;

    if (CFG.manualRepos && CFG.manualRepos.length > 0) {
        renderCards(grid, CFG.manualRepos);
        return;
    }

    if (!uname || uname === 'YOUR_GITHUB_USERNAME') {
        showPlaceholders(grid, false);
        return;
    }

    let repos = null;

    // Try scraping pinned repos via proxy
    const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://github.com/${uname}`)}`,
        `https://corsproxy.io/?${encodeURIComponent(`https://github.com/${uname}`)}`,
    ];

    for (const proxyUrl of proxyUrls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (!res.ok) continue;
            const html = await res.text();
            repos = parsePinnedRepos(html, uname);
            if (repos && repos.length > 0) break;
        } catch (e) {
            continue;
        }
    }

    if (repos && repos.length > 0) {
        renderCards(grid, repos);
        return;
    }

    // Fallback: GitHub REST API (top starred repos)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(
            `https://api.github.com/users/${uname}/repos?sort=stars&per_page=6`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                repos = data.slice(0, 6).map(r => ({
                    name: r.name,
                    desc: r.description || '',
                    lang: r.language || '',
                    stars: String(r.stargazers_count),
                    forks: String(r.forks_count),
                    url: r.html_url
                }));
                renderCards(grid, repos);
                return;
            }
        }
    } catch (e) {}

    showPlaceholders(grid, true);
})();

function parsePinnedRepos(html, uname) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const pins = doc.querySelectorAll('.pinned-item-list-item, [data-hovercard-type="repository"]');
    if (!pins.length) return null;

    const repos = [];
    const seenNames = new Set();

    Array.from(pins).forEach(p => {
        let nameEl = p.querySelector('[itemprop="name"], .repo, .repo-name');
        if (!nameEl) nameEl = p;
        let nm = (nameEl.textContent || '').trim().replace(/\s+/g, ' ');
        if (!nm || seenNames.has(nm)) return;
        seenNames.add(nm);

        const desc = p.querySelector('.pinned-item-desc, [itemprop="description"]')?.textContent?.trim() || '';
        const lang = p.querySelector('[itemprop="programmingLanguage"]')?.textContent?.trim() || '';
        const stars = p.querySelector('[href*="stargazers"]')?.textContent?.trim() || '0';

        repos.push({
            name: nm,
            desc,
            lang,
            stars,
            forks: '0',
            url: `https://github.com/${uname}/${nm}`,
        });
    });

    return repos.length ? repos.slice(0, 6) : null;
}

function renderCards(grid, repos) {
    grid.innerHTML = '';
    repos.forEach((r, i) => {
        const card = buildCard(r);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        grid.appendChild(card);
        setTimeout(() => {
            card.style.transition = 'opacity .5s ease, transform .5s ease';
            card.style.opacity = '1';
            card.style.transform = '';
        }, i * 80);
    });
    // Attach the delegated listener after cards are added
    initProjectGridDelegation();
}

function showPlaceholders(grid, failed) {
    if (failed) {
        grid.innerHTML = `<div class="proj-loading">
            <p style="font-family:var(--mono);font-size:13px;color:var(--muted)">Could not load repositories.</p>
            <p style="font-family:var(--mono);font-size:12px;color:var(--dim);margin-top:8px">
              Set your GitHub username in CFG or add manualRepos.
            </p></div>`;
        return;
    }
    const samples = [
        { name: 'sdn-controller', desc: 'Lightweight SDN controller implementing custom flow rules over OpenFlow switches.', lang: 'Python', stars: '24', forks: '6', url: '#' },
        { name: 'protocol-suite', desc: 'Custom binary protocol parser for high-throughput packet capture environments.', lang: 'C++', stars: '18', forks: '3', url: '#' },
        { name: 'topology-sim', desc: 'Network topology simulation on Mininet for testing distributed routing algorithms.', lang: 'Python', stars: '12', forks: '2', url: '#' },
        { name: 'mern-dashboard', desc: 'Full-stack MERN app with real-time visualisation and JWT authentication flows.', lang: 'JavaScript', stars: '31', forks: '8', url: '#' },
        { name: 'cp-templates', desc: 'Competitive programming template library — graphs, segment trees, number theory.', lang: 'C++', stars: '41', forks: '14', url: '#' },
        { name: 'flow-manager', desc: 'REST-based API for dynamic flow table management in SDN deployment scenarios.', lang: 'JavaScript', stars: '9', forks: '1', url: '#' },
    ];
    grid.innerHTML = `<div style="grid-column:1/-1;font-family:var(--mono);font-size:11px;color:var(--dim);padding-bottom:20px">
        ⚠ Set CFG.github to load your real pinned repos · showing preview cards</div>`;
    renderCards(grid, samples);
}
