/* =========================================================
   Terminal interativo do portfólio (PT / EN)
   - Abre pelo botão flutuante, pelo "Executar" da janela de
     código ou com Ctrl + K.
   - Os comandos funcionam em português e em inglês
     (ex.: "sobre" e "about" fazem a mesma coisa).
   - Para criar um comando novo, acrescente um item em COMMANDS.
   - Textos: tr("português", "english").
========================================================= */

(function terminal() {
    const root = document.getElementById("terminal");
    const body = document.getElementById("terminal-body");
    const output = document.getElementById("terminal-output");
    const form = document.getElementById("terminal-form");
    const input = document.getElementById("terminal-input");
    const chips = document.getElementById("terminal-chips");

    const canHover = window.matchMedia("(pointer: fine)").matches;

    const history = [];
    let historyIndex = 0;
    let booted = false;
    let lastFocus = null;
    let busy = false;

    // seção do site -> nomes aceitos no "cd"
    const SECTIONS = {
        inicio: ["inicio", "home"],
        sobre: ["sobre", "about"],
        experiencia: ["experiencia", "experience"],
        tecnologias: ["tecnologias", "skills"],
        projetos: ["projetos", "projects"],
        contato: ["contato", "contact"],
    };

    const sectionName = (id) => SECTIONS[id][LANG === "en" ? 1 : 0];

    // "arquivos" do comando ls/cat
    const FILES = () => LANG === "en"
        ? { "about.txt": "sobre", "experience.md": "experiencia", "skills.json": "skills-json", "contact.vcf": "contato", "projects/": "projetos" }
        : { "sobre.txt": "sobre", "experiencia.md": "experiencia", "skills.json": "skills-json", "contato.vcf": "contato", "projetos/": "projetos" };

    // nome que aparece para cada comando, por idioma
    const DISPLAY = {
        sobre: ["sobre", "about"],
        experiencia: ["experiencia", "experience"],
        projetos: ["projetos", "projects"],
        contato: ["contato", "contact"],
        curriculo: ["curriculo", "resume"],
        tema: ["tema", "theme"],
    };

    const nameOf = (command) => (DISPLAY[command] ? DISPLAY[command][LANG === "en" ? 1 : 0] : command);


    /* ---------- utilidades ---------- */

    const escapeHtml = (text) =>
        String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    // tira acentos e deixa minúsculo: "Experiência" -> "experiencia"
    const normalize = (text) =>
        text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

    // comando clicável dentro das respostas
    const cmd = (command, label = command) =>
        `<button type="button" class="t-cmd" data-cmd="${escapeHtml(command)}">${label}</button>`;

    const span = (cls, text) => `<span class="${cls}">${text}</span>`;

    const link = (href, label) =>
        `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;

    function print(lines, { stagger = 0 } = {}) {
        [].concat(lines).forEach((html, i) => {
            const line = document.createElement("div");
            line.innerHTML = html === "" ? "&nbsp;" : html;
            if (stagger) line.style.animationDelay = `${i * stagger}ms`;
            output.appendChild(line);
        });
        body.scrollTop = body.scrollHeight;
    }

    const promptHtml = () =>
        `<span class="t-prompt">${tr("visitante", "visitor")}@keionny:<span>~</span>$</span>`;

    // distância entre palavras (para sugerir "você quis dizer...")
    function distance(a, b) {
        const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
        for (let j = 1; j <= b.length; j++) dp[0][j] = j;
        for (let i = 1; i <= a.length; i++) {
            for (let j = 1; j <= b.length; j++) {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
                );
            }
        }
        return dp[a.length][b.length];
    }

    function celebrate() {
        if (typeof window.spawnWave !== "function") return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        [0, 250, 500].forEach((delay, i) => {
            setTimeout(() => window.spawnWave(w * (0.25 + i * 0.25), h * 0.5), delay);
        });
    }


    /* ---------- comandos ---------- */

    const COMMANDS = {

        help: {
            run() {
                const rows = [
                    ["sobre", "quem sou eu", "who I am"],
                    ["skills", "tecnologias que uso", "technologies I use"],
                    ["experiencia", "onde trabalho", "where I work"],
                    ["projetos", "o que estou construindo", "what I'm building"],
                    ["contato", "como falar comigo", "how to reach me"],
                    ["whatsapp", "conversa comigo no WhatsApp", "chat with me on WhatsApp"],
                    ["email", "copia meu e-mail", "copies my email"],
                    ["linkedin", "abre meu LinkedIn", "opens my LinkedIn"],
                    ["github", "abre meu GitHub", "opens my GitHub"],
                    ["curriculo", "baixa meu currículo", "downloads my résumé"],
                    ["cd", "vai até uma seção  (ex.: cd projetos)", "goes to a section  (e.g. cd projects)"],
                    ["ls", "lista os \"arquivos\"", "lists the \"files\""],
                    ["cat", "lê um arquivo  (ex.: cat skills.json)", "reads a file  (e.g. cat skills.json)"],
                    ["tema", "muda a cor do site inteiro", "changes the whole site's color"],
                    ["clear", "limpa a tela", "clears the screen"],
                    ["exit", "fecha o terminal", "closes the terminal"],
                ].filter(([c]) => !COMMANDS[c].available || COMMANDS[c].available());

                print([
                    span("t-bold", tr("Comandos disponíveis:", "Available commands:")),
                    ...rows.map(([command, pt, en]) => {
                        const name = nameOf(command);
                        return `  ${cmd(name)}${" ".repeat(Math.max(1, 13 - name.length))}${span("t-muted", tr(pt, en))}`;
                    }),
                    "",
                    span("t-muted", tr("Dica: Tab completa o comando, ↑ ↓ navegam no histórico.", "Tip: Tab completes commands, ↑ ↓ browse history.")),
                    span("t-muted", tr("Existem alguns comandos secretos... 👀", "There are a few secret commands... 👀")),
                ], { stagger: 18 });
            },
        },

        sobre: {
            run() {
                print([
                    span("t-bold", "Kêionny Unissys"),
                    span("t-primary", tr("Estudante de Análise e Desenvolvimento de Sistemas", "Systems Analysis and Development student")) + span("t-muted", " · Senac · Brasília — DF"),
                    "",
                    tr("Atuo com tecnologia e análise de dados: cruzamento de dados,", "I work with technology and data analysis: data matching,"),
                    tr("scripts e automações em Python, web scraping e relatórios.", "Python scripts and automation, web scraping and reports."),
                    "",
                    tr("Objetivo: construir uma base sólida em programação e engenharia", "Goal: build a solid foundation in programming and software"),
                    tr("de software, transformando conhecimento técnico em projetos reais.", "engineering, turning technical knowledge into real projects."),
                    "",
                    span("t-muted", tr("Próximo passo sugerido: ", "Suggested next step: ")) + cmd("skills") + span("t-muted", tr(" ou ", " or ")) + cmd(nameOf("experiencia")),
                ], { stagger: 18 });
            },
        },

        skills: {
            run() {
                const items = [
                    ["Python", tr("scripts, automações, análise de dados, web scraping", "scripts, automation, data analysis, web scraping")],
                    ["SQL", tr("consulta, organização e análise de dados", "querying, organizing and analyzing data")],
                    ["R & RStudio", tr("análise de dados e relatórios para clientes", "data analysis and client reports")],
                    ["Power BI", tr("visualização e apresentação de informações", "data visualization and presentation")],
                    ["Excel & PowerPoint", tr("planilhas e apresentação de resultados", "spreadsheets and presenting results")],
                    [tr("Automação", "Automation"), tr("rotinas repetitivas viram scripts", "repetitive routines become scripts")],
                    ["Git & GitHub", tr("versionamento e organização de projetos", "version control and project organization")],
                    [tr("IA", "AI"), tr("ferramentas de IA no dia a dia", "AI tools in everyday work")],
                    ["Web", "HTML, CSS & JavaScript " + span("t-yellow", tr("(aprendendo)", "(learning)"))],
                ];

                print([
                    span("t-primary", "skills/"),
                    ...items.map(([name, desc], i) => {
                        const branch = i === items.length - 1 ? "└──" : "├──";
                        return `${span("t-muted", branch)} ${span("t-bold", name.padEnd(20))}${span("t-muted", desc)}`;
                    }),
                    "",
                    span("t-muted", tr("Também uso: PostgreSQL.", "Also: PostgreSQL.")),
                ], { stagger: 30 });
            },
        },

        experiencia: {
            run() {
                const now = tr("2026 — atual", "2026 — present");
                print([
                    `${span("t-green", "●")} ${span("t-bold", tr("Estagiária de Tecnologia / Análise de Dados", "Technology / Data Analysis Intern"))}`,
                    `  ${span("t-primary", "Brasil 61")}  ${span("t-muted", "· " + now)}`,
                    "  " + tr("Análise e cruzamento de dados, automações em Python,", "Data analysis and matching, Python automation,"),
                    "  " + tr("web scraping e relatórios em R para clientes.", "web scraping and R reports for clients."),
                    `  ${span("t-accent", "Python · R · RStudio · SQL · Power BI · Excel")}`,
                    "",
                    `${span("t-green", "●")} ${span("t-bold", tr("Assistente de Atendimento e Jurídico", "Customer Service & Legal Assistant"))}`,
                    `  ${span("t-primary", tr("Escritório de Advocacia", "Law Firm"))}  ${span("t-muted", "· " + now)}`,
                    "  " + tr("Triagem de clientes (trabalhista e previdenciário),", "Client screening (labor and social security law),"),
                    "  " + tr("sínteses de casos, gestão de leads e contratos.", "case summaries, lead management and contracts."),
                    "",
                    span("t-muted", tr("Experiências anteriores:", "Previous experience:")),
                    `${span("t-muted", "○")} ${tr("Assistente Administrativa", "Administrative Assistant")} ${span("t-muted", "— Arina Estela Advocacia · " + tr("8 meses", "8 months"))}`,
                    `${span("t-muted", "○")} ${tr("Assistente Operacional", "Operations Assistant")} ${span("t-muted", "— Espaço Bedrock Garden · " + tr("10 meses", "10 months"))}`,
                    `${span("t-muted", "○")} ${tr("Jovem Aprendiz", "Young Apprentice")} ${span("t-muted", "— Casa de Ismael · " + tr("2 anos", "2 years"))}`,
                ], { stagger: 25 });
            },
        },

        projetos: {
            run() {
                print([
                    `${span("t-primary", "01")}  ${span("t-bold", tr("Portfólio pessoal", "Personal portfolio"))}  ${span("t-yellow", tr("[em desenvolvimento]", "[in progress]"))}`,
                    `    ${span("t-muted", "HTML · CSS · JavaScript · Canvas")}`,
                    "    " + tr("Você está dentro dele agora. 😄", "You're inside it right now. 😄"),
                    "",
                    `${span("t-primary", "02")}  ${span("t-bold", tr("Em breve", "Coming soon"))}`,
                    `    ${span("t-muted", tr("Novos projetos com código-fonte e decisões técnicas.", "New projects with source code and technical decisions."))}`,
                    "",
                    span("t-muted", tr("Repositórios: ", "Repositories: ")) + cmd("github") +
                        span("t-muted", tr(" · ver na página: ", " · see on the page: ")) + cmd(`cd ${sectionName("projetos")}`),
                ], { stagger: 25 });
            },
        },

        contato: {
            run() {
                const lines = [span("t-bold", tr("Vamos conversar?", "Let's talk!")), ""];

                const whatsapp = siteLink("whatsapp");
                if (whatsapp) lines.push(`  whatsapp  ${link(whatsapp, tr("abrir conversa", "open chat") + " ↗")}`);

                lines.push(
                    `  e-mail    <a href="mailto:${SITE.email}">${SITE.email}</a>`,
                    `  linkedin  ${link(SITE.linkedin, SITE.linkedin.replace(/^https?:\/\/(www\.)?/, ""))}`,
                    `  github    ${link(siteLink("github"), "github.com/" + SITE.github)}`,
                    "",
                    span("t-muted", tr("Atalhos: ", "Shortcuts: ")) +
                        [whatsapp && "whatsapp", "email", "linkedin", "github", siteLink("resume") && nameOf("curriculo")]
                            .filter(Boolean).map((c) => cmd(c)).join("  "),
                );

                print(lines, { stagger: 25 });
            },
        },

        whatsapp: {
            available: () => Boolean(siteLink("whatsapp")),
            run() {
                const href = siteLink("whatsapp");
                if (!href) {
                    print(span("t-muted", tr("WhatsApp ainda não disponível. Use ", "WhatsApp not available yet. Try ")) + cmd("email"));
                    return;
                }
                print(span("t-green", tr("Abrindo o WhatsApp com uma mensagem pronta... 💬", "Opening WhatsApp with a ready-made message... 💬")));
                window.open(href, "_blank", "noopener");
            },
        },

        email: {
            async run() {
                try {
                    await navigator.clipboard.writeText(SITE.email);
                    print(span("t-green", tr("✓ E-mail copiado: ", "✓ Email copied: ")) + SITE.email);
                    showToast(tr("✓ E-mail copiado: ", "✓ Email copied: ") + SITE.email);
                } catch {
                    print(`${tr("Meu e-mail", "My email")}: <a href="mailto:${SITE.email}">${SITE.email}</a>`);
                }
            },
        },

        linkedin: {
            run() {
                print(span("t-muted", tr("Abrindo o LinkedIn em uma nova aba...", "Opening LinkedIn in a new tab...")));
                window.open(SITE.linkedin, "_blank", "noopener");
            },
        },

        github: {
            run() {
                print(span("t-muted", tr("Abrindo o GitHub em uma nova aba...", "Opening GitHub in a new tab...")) + " " + link(siteLink("github"), "@" + SITE.github));
                window.open(siteLink("github"), "_blank", "noopener");
            },
        },

        curriculo: {
            available: () => Boolean(siteLink("resume")),
            run() {
                const href = siteLink("resume");
                if (!href) {
                    print(span("t-muted", tr("O currículo estará disponível em breve. Enquanto isso: ", "My résumé will be available soon. Meanwhile: ")) + cmd("linkedin"));
                    return;
                }
                print(span("t-green", tr("⬇ Baixando o currículo...", "⬇ Downloading résumé...")));
                const a = document.createElement("a");
                a.href = href;
                a.download = "";
                document.body.appendChild(a);
                a.click();
                a.remove();
            },
        },

        cd: {
            run(args) {
                const target = normalize(args[0] || "").replace(/^#|\/$/g, "");

                if (!target || target === "~") {
                    print([
                        tr("Para onde? Uso: ", "Where to? Usage: ") + span("t-primary", tr("cd <seção>", "cd <section>")),
                        tr("Seções: ", "Sections: ") + Object.keys(SECTIONS).map((id) => cmd(`cd ${sectionName(id)}`, sectionName(id))).join("  "),
                    ]);
                    return;
                }

                const id = Object.keys(SECTIONS).find((key) => SECTIONS[key].some((n) => n.startsWith(target)));

                if (!id) {
                    print(span("t-red", tr("cd: seção não encontrada: ", "cd: section not found: ") + escapeHtml(args[0])));
                    return;
                }

                print(span("t-muted", `${tr("Indo para", "Going to")} #${sectionName(id)}...`));
                setTimeout(() => {
                    close();
                    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }, 450);
            },
        },

        ls: {
            run() {
                print(Object.keys(FILES()).map((f) =>
                    cmd(`cat ${f}`, f.endsWith("/") ? span("t-accent", f) : f)
                ).join("   "));
            },
        },

        cat: {
            run(args) {
                const file = (args[0] || "").toLowerCase();

                if (!file) {
                    print(tr("Uso: ", "Usage: ") + span("t-primary", tr("cat <arquivo>", "cat <file>")) +
                        span("t-muted", tr("  (veja os arquivos com ", "  (list files with ")) + cmd("ls") + span("t-muted", ")"));
                    return;
                }

                // aceita os nomes dos dois idiomas
                const all = {
                    "sobre.txt": "sobre", "about.txt": "sobre",
                    "experiencia.md": "experiencia", "experience.md": "experiencia",
                    "skills.json": "skills-json",
                    "contato.vcf": "contato", "contact.vcf": "contato",
                    "projetos/": "projetos", "projects/": "projetos",
                };

                const key = Object.keys(all).find((f) => f === file || f === file + "/");

                if (!key) {
                    print(span("t-red", `cat: ${escapeHtml(args[0])}: ${tr("arquivo não encontrado", "no such file")}`));
                    return;
                }

                COMMANDS[all[key]].run([]);
            },
        },

        "skills-json": {
            hidden: true,
            run() {
                const json = LANG === "en"
                    ? {
                        languages: ["Python", "SQL", "R"],
                        tools: ["RStudio", "Power BI", "Excel", "PowerPoint", "Git", "GitHub"],
                        areas: ["data analysis", "process automation", "web scraping", "reports", "AI"],
                        learning: ["HTML", "CSS", "JavaScript"],
                    }
                    : {
                        linguagens: ["Python", "SQL", "R"],
                        ferramentas: ["RStudio", "Power BI", "Excel", "PowerPoint", "Git", "GitHub"],
                        areas: ["análise de dados", "automação de processos", "web scraping", "relatórios", "IA"],
                        aprendendo: ["HTML", "CSS", "JavaScript"],
                    };

                // cada lista numa linha só, para ficar compacto
                const compact = JSON.stringify(json, null, 2)
                    .replace(/\[\s+([^\]]+?)\s+\]/g, (_, inner) => `[${inner.split(/,\s+/).join(", ")}]`);

                const html = escapeHtml(compact)
                    .replace(/&quot;(\w+)&quot;:/g, `<span class="t-primary">"$1"</span>:`)
                    .replace(/&quot;([^&]+)&quot;/g, `<span class="t-green">"$1"</span>`);

                print(html.split("\n"), { stagger: 15 });
            },
        },

        tema: {
            run(args) {
                const name = normalize(args[0] || "");
                const word = tr("tema", "theme");

                if (!name) {
                    print([
                        tr("Tema atual: ", "Current theme: ") + span("t-primary", theme.name),
                        tr("Escolha um: ", "Pick one: ") + Object.entries(THEMES).map(([key, t]) =>
                            cmd(`${word} ${key}`, `<span class="t-swatch" style="background:${t.primary}"></span> ${key}`)
                        ).join("   "),
                    ]);
                    return;
                }

                if (!applyTheme(name)) {
                    print(span("t-red", `${word}: "${escapeHtml(args[0])}" ${tr("não existe.", "doesn't exist.")}`) +
                        tr(" Opções: ", " Options: ") + Object.keys(THEMES).join(", "));
                    return;
                }

                print(span("t-green", "✓ ") + tr(
                    `Tema ${span("t-primary", name)} aplicado ao site inteiro. Feche o terminal para ver.`,
                    `Theme ${span("t-primary", name)} applied to the whole site. Close the terminal to see it.`
                ));
            },
        },

        clear: {
            run() {
                output.innerHTML = "";
            },
        },

        date: {
            run() {
                const now = new Date().toLocaleString(tr("pt-BR", "en-US"), { dateStyle: "full", timeStyle: "short" });
                print(now.charAt(0).toUpperCase() + now.slice(1));
            },
        },

        echo: {
            run(args) {
                print(escapeHtml(args.join(" ")));
            },
        },

        history: {
            run() {
                if (!history.length) return print(span("t-muted", tr("Histórico vazio.", "History is empty.")));
                print(history.map((h, i) => `${span("t-muted", String(i + 1).padStart(3))}  ${escapeHtml(h)}`));
            },
        },

        pwd: {
            run() {
                print(tr("/home/visitante/portfolio", "/home/visitor/portfolio"));
            },
        },

        whoami: {
            run() {
                print([
                    tr("visitante", "visitor"),
                    span("t-muted", tr("Quer saber quem fez este site? Digite ", "Want to know who built this site? Type ")) + cmd(nameOf("sobre")),
                ]);
            },
        },

        exit: {
            run() {
                print(span("t-muted", tr("Até logo! 👋", "See you! 👋")));
                setTimeout(close, 350);
            },
        },


        /* ---------- comandos secretos (não aparecem no help) ---------- */

        sudo: {
            hidden: true,
            run(args) {
                const rest = normalize(args.join(" "));
                if (rest.includes("contratar") || rest.includes("hire")) {
                    COMMANDS.contratar.run();
                    return;
                }
                print([
                    span("t-muted", tr("[sudo] senha para visitante: ********", "[sudo] password for visitor: ********")),
                    span("t-red", tr(
                        "visitante não está no arquivo sudoers. Este incidente será reportado. 😄",
                        "visitor is not in the sudoers file. This incident will be reported. 😄"
                    )),
                    span("t-muted", tr("Dica: tente ", "Tip: try ")) + cmd(tr("sudo contratar", "sudo hire")),
                ], { stagger: 300 });
            },
        },

        contratar: {
            hidden: true,
            run() {
                celebrate();
                print([
                    span("t-green", tr("🎉 Excelente decisão!", "🎉 Excellent choice!")),
                    "",
                    tr("Estou aberta a oportunidades de estágio e projetos", "I'm open to internships and projects"),
                    tr("em tecnologia e dados.", "in technology and data."),
                ], { stagger: 60 });
                COMMANDS.contato.run();
            },
        },

        python: {
            hidden: true,
            run(args) {
                if (normalize(args[0] || "") === "developer.py") {
                    const skills = ["Python", "SQL", "R", tr("Dados", "Data")];
                    print([
                        span("t-muted", tr("Executando developer.py...", "Running developer.py...")),
                        "",
                        `${span("t-accent", "Developer")}(name=${span("t-green", "'Kêionny'")}, area=${span("t-green", tr("'Tecnologia'", "'Technology'"))})`,
                        `skills  → ${skills.map((s) => span("t-green", `'${s}'`)).join(", ")}`,
                        `learn() → ${span("t-green", tr("'Sempre evoluindo'", "'Always evolving'"))}`,
                        "",
                        span("t-muted", tr("Processo finalizado com código 0 ✓", "Process finished with exit code 0 ✓")),
                        "",
                        tr("Quer saber mais? ", "Want to know more? ") + cmd(nameOf("sobre")) + "  " + cmd("skills") + "  " + cmd("help"),
                    ], { stagger: 120 });
                    return;
                }

                print([
                    span("t-muted", tr("Python 3 · modo portfólio 🐍", "Python 3 · portfolio mode 🐍")),
                    `${span("t-primary", ">>>")} import this`,
                    tr("Bonito é melhor que feio.", "Beautiful is better than ugly."),
                    tr("Explícito é melhor que implícito.", "Explicit is better than implicit."),
                    tr("Simples é melhor que complexo.", "Simple is better than complex."),
                    tr("Legibilidade conta.", "Readability counts."),
                ], { stagger: 150 });
            },
        },

        matrix: {
            hidden: true,
            run() {
                applyTheme("verde");
                celebrate();
                print([
                    span("t-green", tr("Siga o coelho branco... 🐇", "Follow the white rabbit... 🐇")),
                    span("t-muted", tr("Tema verde ativado. Para voltar: ", "Green theme on. To go back: ")) + cmd(tr("tema roxo", "theme roxo")),
                ], { stagger: 400 });
            },
        },

        cafe: {
            hidden: true,
            run() {
                print([
                    "    ( (",
                    "     ) )",
                    "  ........",
                    "  |      |]",
                    "  \\      /",
                    "   `----'",
                    "",
                    span("t-yellow", tr("☕ Café servido. Combustível oficial de quem programa.", "☕ Coffee's ready. The official fuel of programmers.")),
                ], { stagger: 60 });
            },
        },

        rm: {
            hidden: true,
            run() {
                print(span("t-yellow", tr("Boa tentativa 😅 Nada foi apagado por aqui.", "Nice try 😅 Nothing was deleted.")));
            },
        },

        oi: {
            hidden: true,
            run() {
                print(tr("Olá! 👋 Que bom ter você por aqui. Digite ", "Hi! 👋 Glad you're here. Type ") + cmd("help") + tr(" para começar.", " to get started."));
            },
        },
    };

    // outros nomes que levam ao mesmo comando (inclui as versões em inglês)
    const ALIASES = {
        ajuda: "help", "?": "help", comandos: "help",
        about: "sobre",
        tecnologias: "skills", stack: "skills",
        experience: "experiencia", experiencias: "experiencia", trabalho: "experiencia", work: "experiencia",
        projects: "projetos", projeto: "projetos", project: "projetos",
        contact: "contato",
        zap: "whatsapp", wpp: "whatsapp",
        mail: "email",
        cv: "curriculo", resume: "curriculo",
        limpar: "clear", cls: "clear",
        sair: "exit", quit: "exit", fechar: "exit",
        data: "date", hora: "date", time: "date",
        dir: "ls",
        hire: "contratar",
        coffee: "cafe",
        ola: "oi", hello: "oi", hi: "oi",
        python3: "python", py: "python",
        theme: "tema", cor: "tema", color: "tema",
    };


    /* ---------- execução ---------- */

    function run(raw) {
        const text = raw.trim();

        print(`${promptHtml()} ${escapeHtml(text)}`);
        if (!text) return;

        history.push(text);
        historyIndex = history.length;

        const [first, ...args] = text.split(/\s+/);
        let name = normalize(first);
        name = ALIASES[name] || name;

        const command = COMMANDS[name];

        if (command && name !== "skills-json") {
            command.run(args);
            return;
        }

        const visible = Object.keys(COMMANDS)
            .filter((c) => !COMMANDS[c].hidden)
            .map(nameOf);

        const guess = visible
            .map((c) => [c, distance(name, c)])
            .sort((a, b) => a[1] - b[1])[0];

        print(span("t-red", `${tr("comando não encontrado", "command not found")}: ${escapeHtml(first)}`));

        if (guess && guess[1] <= 2) {
            print(tr("Você quis dizer ", "Did you mean ") + cmd(guess[0]) + "?");
        } else {
            print(span("t-muted", tr("Digite ", "Type ")) + cmd("help") + span("t-muted", tr(" para ver o que dá para fazer.", " to see what you can do.")));
        }
    }

    // digita o comando no campo antes de executar (efeito ao clicar)
    function typeAndRun(text) {
        if (busy) return;
        busy = true;
        input.value = "";
        let i = 0;

        (function next() {
            if (i < text.length) {
                input.value += text[i++];
                setTimeout(next, 28);
                return;
            }
            setTimeout(() => {
                input.value = "";
                busy = false;
                run(text);
            }, 120);
        })();
    }

    function complete() {
        const value = input.value;
        const parts = value.split(/\s+/);

        let options;
        let prefix;

        if (parts.length <= 1) {
            prefix = normalize(parts[0] || "");
            options = Object.keys(COMMANDS)
                .filter((c) => !COMMANDS[c].hidden && (!COMMANDS[c].available || COMMANDS[c].available()))
                .map(nameOf);
        } else {
            prefix = normalize(parts[parts.length - 1]);
            const base = ALIASES[normalize(parts[0])] || normalize(parts[0]);
            options =
                base === "cd" ? Object.keys(SECTIONS).map(sectionName) :
                base === "cat" ? Object.keys(FILES()) :
                base === "tema" ? Object.keys(THEMES) : [];
        }

        const matches = options.filter((o) => o.startsWith(prefix));

        if (matches.length === 1) {
            parts[parts.length - 1] = matches[0];
            input.value = parts.join(" ") + (parts.length === 1 ? " " : "");
        } else if (matches.length > 1) {
            print(`${promptHtml()} ${escapeHtml(value)}`);
            print(matches.map((m) => span("t-primary", m)).join("   "));
        }
    }

    // atalhos clicáveis embaixo da janela
    function renderChips() {
        const list = ["help", "sobre", "skills", "experiencia", "contato", "tema"];
        chips.innerHTML =
            `<span>${tr("Experimente:", "Try:")}</span>` +
            list.map((c) => `<button type="button" data-cmd="${nameOf(c)}">${nameOf(c)}</button>`).join("");
        chips.setAttribute("aria-label", tr("Comandos rápidos", "Quick commands"));
    }

    function boot() {
        booted = true;
        const ok = span("t-muted", "[") + span("t-green", " ok ") + span("t-muted", "]");
        print([
            `${ok} ${tr("carregando perfil", "loading profile")}`,
            `${ok} ${tr("conectando dados", "connecting data")}`,
            `${ok} ${tr("pronto", "ready")}`,
            "",
            span("t-bold", "KU-OS 1.0") + span("t-muted", tr(" · terminal do portfólio de Kêionny Unissys", " · Kêionny Unissys' portfolio terminal")),
            tr("Digite ", "Type ") + cmd("help") + tr(" para ver os comandos, ou clique nos atalhos abaixo.", " to see the commands, or click the shortcuts below."),
            "",
        ], { stagger: 140 });
    }


    /* ---------- abrir e fechar ---------- */

    function open(commandToRun) {
        if (!root.hidden) {
            if (commandToRun) typeAndRun(commandToRun);
            return;
        }

        lastFocus = document.activeElement;
        root.hidden = false;
        document.body.style.overflow = "hidden";

        if (!booted) boot();
        if (canHover || !commandToRun) input.focus({ preventScroll: true });

        if (commandToRun) setTimeout(() => typeAndRun(commandToRun), booted ? 300 : 1100);
    }

    function close() {
        if (root.hidden || root.classList.contains("closing")) return;

        root.classList.add("closing");
        setTimeout(() => {
            root.hidden = true;
            root.classList.remove("closing");
            document.body.style.overflow = "";
            lastFocus?.focus?.({ preventScroll: true });
        }, 200);
    }


    /* ---------- eventos ---------- */

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (busy) return;
        const value = input.value;
        input.value = "";
        run(value);
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowUp") {
            event.preventDefault();
            if (historyIndex > 0) input.value = history[--historyIndex];
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            historyIndex = Math.min(history.length, historyIndex + 1);
            input.value = history[historyIndex] || "";
        } else if (event.key === "Tab") {
            event.preventDefault();
            complete();
        } else if (event.key === "l" && event.ctrlKey) {
            event.preventDefault();
            output.innerHTML = "";
        }
    });

    // cliques: comandos clicáveis, fechar, abrir
    document.addEventListener("click", (event) => {
        const opener = event.target.closest("[data-open-terminal]");
        if (opener) {
            open(opener.dataset.run);
            return;
        }

        if (root.hidden) return;

        if (event.target.closest("[data-close-terminal]")) {
            close();
            return;
        }

        const command = event.target.closest("[data-cmd]");
        if (command) {
            typeAndRun(command.dataset.cmd);
            if (canHover) input.focus({ preventScroll: true });
        }
    });

    // clicar na área de texto foca o campo (sem atrapalhar quem quer selecionar texto)
    body.addEventListener("mouseup", (event) => {
        if (event.target.closest("a, button")) return;
        if (window.getSelection().toString()) return;
        input.focus({ preventScroll: true });
    });

    // atalhos de teclado
    document.addEventListener("keydown", (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            root.hidden ? open() : close();
        } else if (event.key === "Escape" && !root.hidden) {
            close();
        }
    });

    renderChips();
    document.addEventListener("langchange", renderChips);
})();
