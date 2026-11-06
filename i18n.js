/* =========================================================
   Idiomas (PT / EN)

   Como funciona:
   - O texto em PORTUGUÊS fica no próprio index.html.
   - Cada texto traduzível tem um atributo data-i18n="chave".
   - Aqui embaixo fica só a versão em INGLÊS de cada chave.
   - Para mudar um texto em inglês, edite a chave em EN.

   Idioma inicial: ?lang=en no link > escolha salva > idioma
   do navegador (português → PT, qualquer outro → EN).
========================================================= */

const EN = {
    "skip": "Skip to content",

    "nav.label": "Main navigation",
    "nav.inicio": "Home",
    "nav.sobre": "About",
    "nav.experiencia": "Experience",
    "nav.tecnologias": "Skills",
    "nav.projetos": "Projects",
    "nav.contato": "Contact",

    "lang.aria": "Switch language to Portuguese",

    "hero.status": "Open to new opportunities",
    "hero.hello": "Hi! I'm",
    "hero.role": "Software Development Student",
    "hero.desc": `I build solutions focused on data and automation,
        using technologies such as Python, SQL and R.
        I'm currently studying Systems Analysis and Development
        and keep expanding my software development skills.`,
    "hero.cta": "View projects",
    "hero.scroll": "Scroll to the About section",

    "btn.resume": "Download résumé",
    "btn.resumePdf": "Download résumé (PDF)",

    "code.run": "Run in terminal",
    "code.area": `"Technology"`,
    "code.data": `"Data"`,
    "code.learn": `"Always evolving"`,
    "code.learnOut": `'Always evolving'`,

    "about.label": "About me",
    "about.title": "Technology, data and development.",
    "about.text": `
        <p>I'm a Systems Analysis and Development student and I currently
        work in technology and data analysis.</p>
        <p>I have hands-on experience with data analysis and data matching,
        building scripts and automations, web scraping and creating
        reports to present results.</p>
        <p>I also have experience in customer service and legal support,
        document analysis and information management. I'm analytical,
        organized and focused on solving problems.</p>
        <p>My goal is to keep building a solid foundation in programming
        and software engineering, turning technical knowledge into
        real projects.</p>`,
    "about.card1": `<span>Education</span>
        <strong>Systems Analysis and Development</strong>
        <p>Senac — In progress</p>`,
    "about.card2": `<span>Location</span>
        <strong>Brasília — DF</strong>
        <p>Brazil</p>`,
    "about.card3": `<span>Current focus</span>
        <strong>Development & Data</strong>
        <p>Continuous learning and hands-on projects</p>`,

    "exp.label": "Experience",
    "exp.title": "Professional experience",
    "exp.job1.title": "Technology / Data Analysis Intern",
    "exp.job1.p1": `Data analysis and data matching, development of
        Python scripts and automations, including web scraping projects.`,
    "exp.job1.p2": `Building data reports in R (RStudio) to present results
        to clients, and using SQL, Power BI, Excel and PowerPoint to
        process, analyze and present information.`,
    "exp.job2.title": "Customer Service & Legal Assistant",
    "exp.job2.company": "Law Firm",
    "exp.job2.p1": `Client service and screening in labor and social security
        law, document analysis and organization, case summaries and
        client follow-up.`,
    "exp.job2.p2": `Lead management, contract closing and support for legal
        and administrative routines.`,

    "exp.past1.title": "Administrative Assistant",
    "exp.past1.desc": `Customer service, document organization, spreadsheets
        and contracts, reconciliations, financial control, invoicing and
        support for administrative routines.`,
    "exp.past2.title": "Operations Assistant",
    "exp.past2.desc": `Customer service and sales, order processing, document
        organization, inventory control and operational support.`,
    "exp.past3.title": "Young Apprentice",
    "exp.past3.desc": `Checking and organizing documents and contracts,
        timesheet control and support for administrative and internal
        communication routines.`,

    "skills.label": "Skills",
    "skills.title": "Technologies and tools",
    "skills.desc": "Technologies used in my studies, projects and professional experience.",
    "skills.python": "Scripts, automation, data analysis and web scraping.",
    "skills.sql": "Querying, organizing and analyzing data.",
    "skills.r": "Data analysis and report development.",
    "skills.pbi": "Data visualization and presentation.",
    "skills.office": "Spreadsheets, data processing and presenting results.",
    "skills.auto.title": "Process automation",
    "skills.auto": "Scripts that automate repetitive routines and save time.",
    "skills.git": "Version control and project organization.",
    "skills.ai.title": "Artificial Intelligence",
    "skills.ai": "Using AI tools to support programming, analysis and automation.",
    "skills.web.tag": "09 · learning",
    "skills.web.title": "Web Development",
    "skills.web": "Improving my skills in HTML, CSS and application development.",

    "proj.label": "Portfolio",
    "proj.title": "Projects",
    "proj.desc": "This section will grow as new projects are built and documented.",
    "proj.p1.type": "IN PROGRESS",
    "proj.p1.title": "Personal portfolio",
    "proj.p1.desc": `Building this portfolio as a hands-on project to strengthen
        my skills in HTML, CSS, JavaScript, responsive design,
        accessibility and code organization.`,
    "proj.p2.type": "NEXT PROJECT",
    "proj.p2.title": "Coming soon",
    "proj.p2.desc": `New projects will be added with documentation,
        source code and a description of the technical decisions.`,

    "gh.title": "Straight from GitHub",
    "gh.sub": "Public repositories, updated automatically.",
    "gh.profile": "View GitHub profile",

    "contact.label": "Contact",
    "contact.title": `Let's <span class="gradient-text">talk!</span>`,
    "contact.desc": `I'm building my career in technology and I'm open to
        connections, learning and new professional opportunities.`,
    "contact.email": "Send an email",

    "footer.made": "Built by Kêionny Unissys.",
    "footer.hint": "Tip: click the page background or press <kbd>Ctrl</kbd> + <kbd>K</kbd> 😉",

    "term.open": "Open interactive terminal",
    "term.close": "Close terminal",
    "term.title": "visitor@keionny: ~",
    "term.prompt": "visitor@keionny:<span>~</span>$",
    "term.input": "Type a command",
};

const META = {
    pt: {
        htmlLang: "pt-BR",
        title: "Kêionny Unissys | Portfólio",
        description: "Portfólio de Kêionny Unissys, estudante de Análise e Desenvolvimento de Sistemas com experiência em dados, Python, SQL e automação.",
    },
    en: {
        htmlLang: "en",
        title: "Kêionny Unissys | Portfolio",
        description: "Portfolio of Kêionny Unissys, a Systems Analysis and Development student with experience in data, Python, SQL and automation.",
    },
};

let LANG = "pt";

// atalho para textos escritos no JavaScript: tr("Olá", "Hello")
const tr = (pt, en) => (LANG === "en" ? en : pt);

// guarda o português original de cada elemento, para poder voltar
const originalText = new WeakMap();
const originalAria = new WeakMap();

function setLang(lang, { save = true } = {}) {
    LANG = lang === "en" ? "en" : "pt";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        if (!originalText.has(el)) originalText.set(el, el.innerHTML);
        const value = LANG === "en" ? EN[el.dataset.i18n] : originalText.get(el);
        if (value !== undefined && el.innerHTML !== value) el.innerHTML = value;
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
        if (!originalAria.has(el)) originalAria.set(el, el.getAttribute("aria-label"));
        const value = LANG === "en" ? EN[el.dataset.i18nAria] : originalAria.get(el);
        if (value) el.setAttribute("aria-label", value);
    });

    const meta = META[LANG];
    document.documentElement.lang = meta.htmlLang;
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);

    document.querySelectorAll(".lang-toggle [data-lang]").forEach((s) => {
        s.classList.toggle("active", s.dataset.lang === LANG);
    });

    applyLinks();

    if (save) {
        try { localStorage.setItem("lang", LANG); } catch { /* ignora */ }
    }

    document.dispatchEvent(new CustomEvent("langchange", { detail: LANG }));
}


/* =========================
   Links vindos do config.js
   (botão some se o campo estiver vazio)
========================= */

function siteLink(kind) {
    switch (kind) {
        case "email":
            return SITE.email ? `mailto:${SITE.email}` : "";
        case "linkedin":
            return SITE.linkedin;
        case "github":
            return SITE.github ? `https://github.com/${SITE.github}` : "";
        case "whatsapp": {
            const number = String(SITE.whatsapp || "").replace(/\D/g, "");
            if (!number) return "";
            const text = encodeURIComponent(SITE.whatsappMessage[LANG] || SITE.whatsappMessage.pt);
            return `https://wa.me/${number}?text=${text}`;
        }
        case "resume":
            return (LANG === "en" && SITE.resume.en) || SITE.resume.pt || "";
        default:
            return "";
    }
}

function applyLinks() {
    document.querySelectorAll("[data-link]").forEach((el) => {
        const href = siteLink(el.dataset.link);
        el.hidden = !href;
        if (href) el.setAttribute("href", href);
    });
}


/* =========================
   Idioma inicial + botão PT/EN
========================= */

(function initLang() {
    let lang = new URLSearchParams(location.search).get("lang");

    if (!lang) {
        try { lang = localStorage.getItem("lang"); } catch { /* ignora */ }
    }

    if (!lang) {
        lang = (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "en";
    }

    setLang(lang, { save: false });

    document.querySelector(".lang-toggle")?.addEventListener("click", () => {
        setLang(LANG === "pt" ? "en" : "pt");
    });
})();
