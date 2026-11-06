/* =========================================================
   Portfólio — Kêionny Unissys
   Interações: fundo de partículas, digitação, tilt 3D,
   luz nos cartões, botões magnéticos e animações ao rolar.
========================================================= */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const mouse = { x: -9999, y: -9999, active: false };


/* =========================
   0. Temas de cor
   Usados pelo comando "tema" do terminal. O CSS e o fundo
   de partículas leem estas cores.
========================= */

const THEMES = {
    azul:    { primary: "#38bdf8", primaryRgb: "56, 189, 248",  accent: "#a78bfa", accentRgb: "167, 139, 250" },
    verde:   { primary: "#22c55e", primaryRgb: "34, 197, 94",   accent: "#a3e635", accentRgb: "163, 230, 53" },
    roxo:    { primary: "#a78bfa", primaryRgb: "167, 139, 250", accent: "#f472b6", accentRgb: "244, 114, 182" },
    laranja: { primary: "#fb923c", primaryRgb: "251, 146, 60",  accent: "#facc15", accentRgb: "250, 204, 21" },
    rosa:    { primary: "#f472b6", primaryRgb: "244, 114, 182", accent: "#a78bfa", accentRgb: "167, 139, 250" },
};

const DEFAULT_THEME = "roxo"; // cor padrão do site
const theme = { name: DEFAULT_THEME, primary: THEMES[DEFAULT_THEME].primaryRgb, accent: THEMES[DEFAULT_THEME].accentRgb };

function applyTheme(name) {
    const t = THEMES[name];
    if (!t) return false;

    const root = document.documentElement.style;
    root.setProperty("--primary", t.primary);
    root.setProperty("--primary-rgb", t.primaryRgb);
    root.setProperty("--accent", t.accent);
    root.setProperty("--accent-rgb", t.accentRgb);

    theme.name = name;
    theme.primary = t.primaryRgb;
    theme.accent = t.accentRgb;

    try { localStorage.setItem("tema", name); } catch { /* sem armazenamento: tudo bem */ }
    return true;
}

try {
    const saved = localStorage.getItem("tema");
    if (saved && saved !== DEFAULT_THEME) applyTheme(saved);
} catch { /* ignora */ }


/* =========================
   Aviso rápido (toast)
========================= */

let toastTimer;

function showToast(message) {
    const toast = document.querySelector(".toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}


/* =========================
   1. Fundo: rede de dados
   Pontos que se movem devagar, se ligam quando estão perto
   e reagem ao mouse (afastam e criam linhas até o cursor).
   Clique no fundo cria uma "onda" que empurra os pontos.
========================= */

(function backgroundNetwork() {
    const canvas = document.getElementById("background");
    const ctx = canvas.getContext("2d");

    const LINK_DISTANCE = 130;
    const MOUSE_RADIUS = 180;

    let width, height, dpr;
    let particles = [];
    const waves = [];

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.min(140, Math.floor((width * height) / 11000));

        particles = Array.from({ length: count }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            r: Math.random() * 1.4 + 0.6,
        }));
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        // ondas de clique
        for (let i = waves.length - 1; i >= 0; i--) {
            const w = waves[i];
            w.radius += 7;
            w.alpha *= 0.955;

            ctx.beginPath();
            ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${theme.primary}, ${w.alpha * 0.5})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            if (w.alpha < 0.02) waves.splice(i, 1);
        }

        for (const p of particles) {
            // reação ao mouse: afasta suavemente
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.hypot(dx, dy);

            if (dist < MOUSE_RADIUS && dist > 0) {
                const force = (1 - dist / MOUSE_RADIUS) * 0.6;
                p.vx += (dx / dist) * force * 0.15;
                p.vy += (dy / dist) * force * 0.15;
            }

            // reação às ondas de clique
            for (const w of waves) {
                const wx = p.x - w.x;
                const wy = p.y - w.y;
                const wd = Math.hypot(wx, wy);

                if (Math.abs(wd - w.radius) < 25 && wd > 0) {
                    p.vx += (wx / wd) * w.alpha * 1.2;
                    p.vy += (wy / wd) * w.alpha * 1.2;
                }
            }

            // atrito + velocidade mínima de "deriva"
            p.vx *= 0.96;
            p.vy *= 0.96;

            if (Math.abs(p.vx) < 0.05) p.vx += (Math.random() - 0.5) * 0.04;
            if (Math.abs(p.vy) < 0.05) p.vy += (Math.random() - 0.5) * 0.04;

            p.x += p.vx;
            p.y += p.vy;

            // dá a volta nas bordas
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;
            if (p.y < -20) p.y = height + 20;
            if (p.y > height + 20) p.y = -20;
        }

        // linhas entre pontos próximos
        for (let i = 0; i < particles.length; i++) {
            const a = particles[i];

            for (let j = i + 1; j < particles.length; j++) {
                const b = particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < LINK_DISTANCE * LINK_DISTANCE) {
                    const dist = Math.sqrt(distSq);
                    let alpha = (1 - dist / LINK_DISTANCE) * 0.18;

                    // linhas ficam mais fortes perto do mouse
                    const mx = (a.x + b.x) / 2 - mouse.x;
                    const my = (a.y + b.y) / 2 - mouse.y;
                    const md = Math.hypot(mx, my);
                    if (md < MOUSE_RADIUS * 1.3) {
                        alpha += (1 - md / (MOUSE_RADIUS * 1.3)) * 0.35;
                    }

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(${theme.primary}, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // pontos + ligação até o cursor
        for (const p of particles) {
            const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            const near = dist < MOUSE_RADIUS;

            if (near && mouse.active) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${theme.accent}, ${(1 - dist / MOUSE_RADIUS) * 0.45})`;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, near ? p.r + 1 : p.r, 0, Math.PI * 2);
            ctx.fillStyle = near ? `rgba(${theme.primary}, 0.95)` : "rgba(148, 163, 184, 0.5)";
            ctx.fill();
        }

        if (!reduceMotion) requestAnimationFrame(step);
    }

    // permite que o terminal crie ondas (comandos "contratar" e "matrix")
    window.spawnWave = (x, y) => {
        if (!reduceMotion) waves.push({ x, y, radius: 0, alpha: 1 });
    };

    window.addEventListener("resize", resize);

    window.addEventListener("pointerdown", (event) => {
        // só cria a onda se o clique não foi num link, botão ou texto de cartão
        if (event.target.closest("a, button, input, textarea, .code-window, article")) return;
        if (reduceMotion) return;
        waves.push({ x: event.clientX, y: event.clientY, radius: 0, alpha: 1 });
    });

    resize();
    step();
})();


/* =========================
   2. Brilho que segue o cursor
========================= */

(function cursorGlow() {
    const glow = document.querySelector(".cursor-glow");
    let targetX = 0, targetY = 0, x = 0, y = 0;

    window.addEventListener("pointermove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
        mouse.active = true;

        targetX = event.clientX;
        targetY = event.clientY;
        glow.classList.add("active");
    });

    document.addEventListener("pointerleave", () => {
        mouse.x = mouse.y = -9999;
        mouse.active = false;
        glow.classList.remove("active");
    });

    if (!finePointer || reduceMotion) return;

    // movimento com "atraso" suave
    (function follow() {
        x += (targetX - x) * 0.12;
        y += (targetY - y) * 0.12;
        glow.style.transform = `translate(${x - 300}px, ${y - 300}px)`;
        requestAnimationFrame(follow);
    })();
})();


/* =========================
   3. Texto digitando no título
========================= */

(function typedWords() {
    const el = document.querySelector(".typed");
    if (!el) return;

    // palavras no idioma atual (data-words = PT, data-words-en = EN)
    let words = [];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = true;

    function loadWords() {
        words = (LANG === "en" ? el.dataset.wordsEn : el.dataset.words).split("|");
        wordIndex = 0;
        charIndex = words[0].length;
        deleting = true;
        el.textContent = words[0];
    }

    loadWords();
    document.addEventListener("langchange", loadWords);

    if (reduceMotion) return;

    function tick() {
        const word = words[wordIndex];

        if (deleting) {
            charIndex--;
            el.textContent = word.slice(0, charIndex);

            if (charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
            setTimeout(tick, 40);
        } else {
            const next = words[wordIndex];
            charIndex++;
            el.textContent = next.slice(0, charIndex);

            if (charIndex === next.length) {
                deleting = true;
                setTimeout(tick, 2200);
            } else {
                setTimeout(tick, 70 + Math.random() * 60);
            }
        }
    }

    setTimeout(tick, 2600);
})();


/* =========================
   4. Código sendo digitado na janela
========================= */

(function codeTyping() {
    const code = document.getElementById("code-typing");
    const output = document.querySelector(".code-output");
    if (!code) return;

    if (reduceMotion) {
        output.classList.add("visible");
        return;
    }

    // guarda todos os pedaços de texto e esvazia
    const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
        nodes.push({ node: walker.currentNode, text: walker.currentNode.textContent });
        walker.currentNode.textContent = "";
    }

    const caret = document.createElement("span");
    caret.className = "code-caret";
    code.appendChild(caret);

    let n = 0;
    let c = 0;

    function type() {
        if (n >= nodes.length) {
            setTimeout(() => {
                output.classList.add("visible");
                output.querySelector(".code-output-inner").appendChild(caret);
            }, 400);
            return;
        }

        const { node, text } = nodes[n];

        // se o idioma mudou no meio da digitação, esse trecho já foi trocado
        if (!node.isConnected) {
            n++;
            c = 0;
            setTimeout(type, 0);
            return;
        }

        // pula espaços de indentação de uma vez
        do {
            c++;
        } while (c < text.length && text[c - 1] === " " && text[c] === " ");

        node.textContent = text.slice(0, c);
        node.parentNode.insertBefore(caret, node.nextSibling);

        if (c >= text.length) {
            n++;
            c = 0;
        }

        const char = text[c - 1];
        setTimeout(type, char === "\n" ? 120 : 22 + Math.random() * 30);
    }

    setTimeout(type, 900);
})();


/* =========================
   5. Inclinação 3D (tilt) que acompanha o mouse
========================= */

(function tilt() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll(".tilt").forEach((el) => {
        const max = el.classList.contains("code-window") ? 7 : 9;

        el.addEventListener("pointermove", (event) => {
            if (el.classList.contains("reveal")) return; // espera a animação de entrada

            const rect = el.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width - 0.5;
            const py = (event.clientY - rect.top) / rect.height - 0.5;

            el.style.transform =
                `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg) translateY(-4px)`;
        });

        el.addEventListener("pointerleave", () => {
            el.style.transform = "";
        });
    });
})();


/* =========================
   6. Luz nos cartões (posição do mouse dentro do cartão)
========================= */

// um único "ouvinte" na página: funciona também para cartões criados depois
// (como os repositórios do GitHub)
document.addEventListener("pointermove", (event) => {
    const card = event.target.closest?.(".spotlight");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
});


/* =========================
   7. Botões magnéticos
========================= */

(function magnetic() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll(".magnetic").forEach((button) => {
        button.addEventListener("pointermove", (event) => {
            const rect = button.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            button.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
        });

        button.addEventListener("pointerleave", () => {
            button.style.transform = "";
        });
    });
})();


/* =========================
   8. Elementos aparecem ao rolar
========================= */

(function reveal() {
    const items = document.querySelectorAll(".reveal");

    // atraso em cascata para itens irmãos (ex.: cartões em grade)
    items.forEach((el) => {
        const siblings = [...el.parentElement.children].filter((s) => s.classList.contains("reveal"));
        const index = siblings.indexOf(el);
        el.style.setProperty("--delay", `${Math.min(index, 6) * 0.08}s`);
    });

    const finish = (el) => {
        el.classList.remove("reveal", "visible");
        el.style.removeProperty("--delay");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach(finish);
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const el = entry.target;
            el.classList.add("visible");
            observer.unobserve(el);

            // depois da animação, libera o elemento para os efeitos de hover
            const delay = parseFloat(getComputedStyle(el).getPropertyValue("--delay")) || 0;
            setTimeout(() => finish(el), 900 + delay * 1000);
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    items.forEach((el) => observer.observe(el));
})();


/* =========================
   9. Cabeçalho: barra de progresso, link ativo,
      linha do tempo que se preenche
========================= */

(function scrollEffects() {
    const header = document.querySelector(".header");
    const progress = document.querySelector(".scroll-progress");
    const timeline = document.querySelector(".timeline");
    const fill = document.querySelector(".timeline-fill");
    const links = document.querySelectorAll(".navigation a");

    let ticking = false;

    function update() {
        const scrollTop = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        progress.style.transform = `scaleX(${max > 0 ? scrollTop / max : 0})`;
        header.classList.toggle("scrolled", scrollTop > 10);

        if (timeline && fill) {
            const rect = timeline.getBoundingClientRect();
            const start = window.innerHeight * 0.75;
            const amount = (start - rect.top) / rect.height;
            fill.style.transform = `scaleY(${Math.max(0, Math.min(1, amount))})`;
        }

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();

    // link do menu correspondente à seção visível
    const sections = [...links].map((a) => document.querySelector(a.getAttribute("href")));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => {
                a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach((s) => s && observer.observe(s));
})();


/* =========================
   10. Menu no celular
========================= */

(function mobileMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const nav = document.getElementById("menu");

    function setOpen(open) {
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? tr("Fechar menu", "Close menu") : tr("Abrir menu", "Open menu"));
        nav.classList.toggle("open", open);
        document.body.style.overflow = open ? "hidden" : "";
    }

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && nav.classList.contains("open")) setOpen(false);
    });

    document.addEventListener("langchange", () => {
        setOpen(nav.classList.contains("open"));
    });
})();


/* =========================
   11. Repositórios do GitHub
   Busca os repositórios públicos pela API do GitHub
   (sem login, direto do navegador de quem visita).
========================= */

(function githubRepos() {
    const grid = document.getElementById("repo-grid");
    if (!grid || !SITE.github) {
        grid?.closest(".github-block")?.remove();
        return;
    }

    const CACHE_KEY = "gh-repos-" + SITE.github;
    const LANG_COLORS = {
        HTML: "#e34c26", CSS: "#663399", JavaScript: "#f1e05a", TypeScript: "#3178c6",
        Python: "#3572A5", R: "#198CE7", Jupyter: "#DA5B0B", "Jupyter Notebook": "#DA5B0B",
        SQL: "#e38c00", PLpgSQL: "#336790", Shell: "#89e051",
    };

    let repos = null;
    let failed = false;

    const escapeHtml = (text) =>
        String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // "minha-primeira-entrega" -> "Minha primeira entrega"
    const prettyName = (name) => {
        const text = name.replace(/[-_]+/g, " ").trim();
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    function render() {
        if (failed) {
            grid.innerHTML = `
                <p class="repo-message">
                    ${tr("Não foi possível carregar os repositórios agora.", "Couldn't load the repositories right now.")}
                    <a href="https://github.com/${SITE.github}" target="_blank" rel="noopener noreferrer">
                        ${tr("Ver direto no GitHub", "View them on GitHub")} ↗
                    </a>
                </p>`;
            return;
        }

        if (!repos) return; // ainda carregando (mostra os "esqueletos")

        if (!repos.length) {
            grid.innerHTML = `<p class="repo-message">${tr("Em breve, novos repositórios por aqui.", "New repositories coming soon.")}</p>`;
            return;
        }

        const dateFormat = new Intl.DateTimeFormat(LANG === "en" ? "en-US" : "pt-BR", { day: "2-digit", month: "short", year: "numeric" });

        grid.innerHTML = repos.map((repo) => {
            const color = LANG_COLORS[repo.language] || "var(--primary)";
            const site = repo.homepage
                ? `<a href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">${tr("Ver site", "Live site")} ↗</a>`
                : "";

            return `
                <article class="repo-card spotlight">
                    <div class="repo-top">
                        <svg class="icon repo-folder" aria-hidden="true"><use href="#i-folder"/></svg>
                        ${repo.language ? `<span class="repo-lang"><i style="background:${color}"></i>${escapeHtml(repo.language)}</span>` : ""}
                    </div>
                    <h4>${escapeHtml(prettyName(repo.name))}</h4>
                    <p>${repo.description ? escapeHtml(repo.description) : tr("Sem descrição ainda.", "No description yet.")}</p>
                    <div class="repo-footer">
                        <span class="repo-date">${tr("Atualizado em", "Updated")} ${dateFormat.format(new Date(repo.pushed_at))}</span>
                        <span class="repo-links">
                            <a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">${tr("Código", "Code")} ↗</a>
                            ${site}
                        </span>
                    </div>
                </article>`;
        }).join("");
    }

    async function load() {
        // guarda por 1 hora para não consultar o GitHub toda hora
        try {
            const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
            if (cached && Date.now() - cached.time < 3600000) {
                repos = cached.repos;
                render();
                return;
            }
        } catch { /* ignora */ }

        try {
            const response = await fetch(`https://api.github.com/users/${SITE.github}/repos?per_page=100&sort=pushed`);
            if (!response.ok) throw new Error(response.status);
            const data = await response.json();

            repos = data
                .filter((r) => !r.fork && !r.archived)
                .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
                .slice(0, 6)
                .map(({ name, description, language, html_url, homepage, pushed_at }) =>
                    ({ name, description, language, html_url, homepage, pushed_at }));

            try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), repos })); } catch { /* ignora */ }
        } catch {
            failed = true;
        }

        render();
    }

    document.addEventListener("langchange", render);
    load();
})();


/* =========================
   12. Detalhes
========================= */

document.getElementById("year").textContent = new Date().getFullYear();

// mensagem para quem abrir o console do navegador (F12)
console.log(
    "%cOlá! 👋 Curiosidade de dev, é?",
    "color:#a78bfa;font-size:18px;font-weight:700"
);
console.log(
    "%cEste site foi feito com HTML, CSS e JavaScript puro. Aperte Ctrl + K para abrir o terminal. Vamos conversar? keionnyunissys@hotmail.com",
    "color:#94a3b8;font-size:12px"
);
