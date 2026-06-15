// ════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(b => b.addEventListener('click', () => {
    openPage(b.dataset.page);
}));
function openPage(page) {

    // hide all pages
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    // update nav buttons
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === page);
    });

    // database pages list
    const databasePages = [
        'topics',
        'formulas',
        'mathematicians',
        'constants'
    ];

    // if it's a database page
    if (databasePages.includes(page)) {

        const dbPage = document.getElementById('databasePage');
        if (dbPage) {
            dbPage.style.display = 'block';
            dbPage.classList.add('active');
        }

        openDatabasePage(page);
        return;
    }

    // otherwise it's a normal static page
    const el = document.getElementById(page);
    if (el) {
        el.style.display = 'block';
        el.classList.add('active');
    }
}
async function openDatabasePage(folderName) {

    const page =
        await fetch(
            `data/${folderName}/page.json`
        );

    const data =
        await page.json();

    document.getElementById(
        'pageTitle'
    ).textContent =
        data.title;

    document.getElementById(
        'pageDescription'
    ).textContent =
        data.description;

    const grid =
        document.getElementById(
            'pageGrid'
        );

    grid.innerHTML = '';

    for (const file of data.cards) {

        const concept =
            await fetch(
                `data/${folderName}/${file}.json`
            );

        const cardData =
            await concept.json();

        createCard(
            folderName,
            file,
            cardData
        );
    }

    renderMath(grid);
}
function createCard(
    folderName,
    file,
    data
) {

    const grid =
        document.getElementById(
            'pageGrid'
        );

    const card =
        document.createElement(
            'div'
        );

    card.className =
        'card searchable';

    card.dataset.title =
        data.title;

    card.innerHTML = `
        <h2>${data.title}</h2>

        <p>
            ${data.summary || ''}
        </p>
    `;

    card.addEventListener(
        'click',
        () => openConcept(
            folderName,
            file
        )
    );

    grid.appendChild(card);
}
async function openConcept(
    folderName,
    file
) {

    const response =
        await fetch(
            `data/${folderName}/${file}.json`
        );

    const data =
        await response.json();

    document.getElementById(
        'pageDetailContent'
    ).innerHTML = `
        <h1>${data.title}</h1>

        <p>
            ${data.subtitle || ''}
        </p>

        ${data.detail}
    `;

    document.getElementById(
        'pageDetail'
    ).style.display =
        'block';

    renderMath(
        document.getElementById(
            'pageDetailContent'
        )
    );
}
function closeDetail(id) {
    const el = document.getElementById(id || 'pageDetail');
    if (el) el.style.display = 'none';
}

// ════════════════════════════════════════════════
// GRAPHING PANEL TABS
// ════════════════════════════════════════════════
document.querySelectorAll('.etab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.etab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.ebody').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    const b = document.getElementById('ebody-' + t.dataset.etab);
    if (b) b.classList.add('active');
    if (t.dataset.etab === 'contour') scheduleContour();
    if (t.dataset.etab === 'complex') scheduleComplex();
    if (t.dataset.etab === 'mattf') scheduleMatTf();
}));

// ════════════════════════════════════════════════
// SCI CALC MODE PILLS
// ════════════════════════════════════════════════
document.querySelectorAll('.mpill').forEach(p => p.addEventListener('click', () => {
    document.querySelectorAll('.mpill').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.mpanel').forEach(x => x.classList.remove('active'));
    p.classList.add('active');
    document.getElementById('mp-' + p.dataset.m).classList.add('active');
    const hideShared = p.dataset.m === 'matrix' || p.dataset.m === 'vector';
    document.getElementById('sharedArea').style.display = hideShared ? 'none' : '';
    document.getElementById('opBar').style.display = hideShared ? 'none' : '';
}));

// ════════════════════════════════════════════════
// OPERATOR BAR INSERT
// ════════════════════════════════════════════════
function ins(s) {
    const ta = document.getElementById('sciIn');
    const pos = ta.selectionStart;
    ta.value = ta.value.slice(0, pos) + s + ta.value.slice(ta.selectionEnd);
    ta.selectionStart = ta.selectionEnd = pos + s.length;
    ta.focus(); liveLatex();
}

// ════════════════════════════════════════════════
// LIVE LATEX PREVIEW (Desmos-style)
// Transforms text as you type into rendered LaTeX
// ════════════════════════════════════════════════
const LATEX_MAP = [
    [/\\bpi\\b/g, '\\pi'],
    [/\\binfinity\\b/gi, '\\infty'],
    [/\\bInf\\b/g, '\\infty'],
    [/\\btheta\\b/g, '\\theta'],
    [/\\balpha\\b/g, '\\alpha'],
    [/\\bbeta\\b/g, '\\beta'],
    [/\\bgamma\\b(?!_em)/g, '\\Gamma'],
    [/\\bsigma\\b/g, '\\sigma'],
    [/\\bomega\\b/g, '\\omega'],
    [/\\blambda\\b/g, '\\lambda'],
    [/\\bmu\\b/g, '\\mu'],
    [/\\bnu\\b/g, '\\nu'],
    [/\\bdelta\\b/g, '\\delta'],
    [/\\bepsilon\\b/g, '\\epsilon'],
    [/sqrt\\(([^)]+)\\)/g, '\\sqrt{$1}'],
    [/\\bsin\\b/g, '\\sin'],
    [/\\bcos\\b/g, '\\cos'],
    [/\\btan\\b/g, '\\tan'],
    [/\\bcsc\\b/g, '\\csc'],
    [/\\bsec\\b/g, '\\sec'],
    [/\\bcot\\b/g, '\\cot'],
    [/\\bsinh\\b/g, '\\sinh'],
    [/\\bcosh\\b/g, '\\cosh'],
    [/\\btanh\\b/g, '\\tanh'],
    [/\\bln\\b/g, '\\ln'],
    [/\\blog\\b/g, '\\log'],
    [/\\bexp\\b/g, '\\exp'],
    [/\\blim\\b/g, '\\lim'],
    [/\\bsup\\b/g, '\\sup'],
    [/\\binf\\b/g, '\\inf'],
    [/\\barcsin\\b/g, '\\arcsin'],
    [/\\barccos\\b/g, '\\arccos'],
    [/\\barctan\\b/g, '\\arctan'],
    [/\\bsech\\b/g, '\\operatorname{sech}'],
    [/\\bcsch\\b/g, '\\operatorname{csch}'],
    [/\\bcoth\\b/g, '\\operatorname{coth}'],
    [/\\basech\\b|\\barsech\\b/g, '\\operatorname{arsech}'],
    [/\\bacsch\\b|\\barcsch\\b/g, '\\operatorname{arcsch}'],
    [/\\bacoth\\b|\\barcoth\\b/g, '\\operatorname{arcoth}'],
    [/\\basinh\\b|\\barsinh\\b/g, '\\operatorname{arsinh}'],
    [/\\bacosh\\b|\\barcosh\\b/g, '\\operatorname{arcosh}'],
    [/\\batanh\\b|\\bartanh\\b/g, '\\operatorname{artanh}'],
    [/\\bGamma\\b/g, '\\Gamma'],
    [/\\berf\\b/g, '\\operatorname{erf}'],
    [/\\bsinc\\b/g, '\\operatorname{sinc}'],
    [/\\bsgn\\b|\\bsign\\b/g, '\\operatorname{sgn}'],
    [/\\bgcd\\b/g, '\\gcd'],
    [/\\blcm\\b/g, '\\operatorname{lcm}'],
    [/\\bmod\\b/g, '\\bmod'],
    [/\\bfloor\\(([^)]+)\\)/g, '\\lfloor $1 \\rfloor'],
    [/\\bceil\\(([^)]+)\\)/g, '\\lceil $1 \\rceil'],
    [/([a-zA-Z0-9])\^([^\s]+)/g, '$1^{$2}'],
    [/\\*/g, '\\cdot '],
    [/\\/g, '\\div ']
];

function textToLatex(raw) {
    if (!raw.trim()) return '';
    let s = raw;
    LATEX_MAP.forEach(([re, rep]) => { s = s.replace(re, rep); });
    return '\\displaystyle ' + s;
}

function liveLatex() {
    const raw = document.getElementById('sciIn').value;
    const prev = document.getElementById('sciPrev');
    if (!raw.trim()) { prev.innerHTML = ''; return; }
    try {
        katex.render(textToLatex(raw), prev, { throwOnError: false, displayMode: true });
    } catch { prev.textContent = raw; }
}

document.addEventListener('DOMContentLoaded', () => {
    const ta = document.getElementById('sciIn');
    if (ta) ta.addEventListener('input', liveLatex);
    ta.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.shiftKey) && e.key === 'Enter') { e.preventDefault(); doCalc(); }
    });
    setTimeout(autoStats, 300);
});

// ════════════════════════════════════════════════
// MATH SCOPE — complete function library
// ════════════════════════════════════════════════
const _customFns = {};

function gamma(z) {
    if (z <= 0 && Number.isInteger(z)) return Infinity;
    if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
    z -= 1;
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    let x = c[0]; for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}
function erf_fn(x) {
    const s = x < 0 ? -1 : 1; x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
}
function lambertW(x) {
    if (x < -1 / Math.E) return NaN;
    if (Math.abs(x) < 1e-15) return 0;
    let w = x < 1 ? x : Math.log(x);
    for (let i = 0; i < 100; i++) { const ew = Math.exp(w), f = w * ew - x, fp = ew * (w + 1); const d = f / fp; w -= d; if (Math.abs(d) < 1e-15) break; }
    return w;
}
function zetaFn(s) {
    if (s === 1) return Infinity;
    if (s >= 1) {
        const N = 20; let sum = 0;
        for (let n = 1; n <= N; n++) sum += 1 / Math.pow(n, s);
        sum += 1 / ((s - 1) * Math.pow(N, s - 1)) + 1 / (2 * Math.pow(N, s));
        return sum;
    }
    return Math.pow(2, s) * Math.pow(Math.PI, s - 1) * Math.sin(Math.PI * s / 2) * gamma(1 - s) * zetaFn(1 - s);
}
function digammaFn(x) {
    if (x <= 0 && Number.isInteger(x)) return Infinity;
    if (x < 0) return digammaFn(1 - x) - Math.PI / Math.tan(Math.PI * x);
    let r = 0; while (x < 6) { r -= 1 / x; x++; }
    return r + Math.log(x) - 1 / (2 * x) - 1 / (12 * x * x) + 1 / (120 * Math.pow(x, 4));
}
// Sine integral Si(x) via series
function Si(x) {
    let s = 0, term = x, n = 1;
    for (let k = 1; k <= 50; k++) { s += term; n++; term *= -x * x / ((2 * k) * (2 * k + 1)); if (Math.abs(term) < 1e-15) break; }
    return s;
}
// Cosine integral Ci(x) — for x>0
function Ci(x) {
    if (x <= 0) return NaN;
    return 0.5772156649 + Math.log(x) + Si_cos(x);
}
function Si_cos(x) { let s = 0, term = -x * x / 4, n = 2; for (let k = 1; k <= 50; k++) { s += term / n; n += 2; term *= -x * x / (n * (n - 1)); if (Math.abs(term / n) < 1e-15) break; } return s; }

function mathScope(extra) {
    const PI = Math.PI, E = Math.E;
    const tanSafe = x => { const c = Math.cos(x); if (Math.abs(c) < 1e-10) return c >= 0 ? Infinity : -Infinity; return Math.sin(x) / c; };
    const cotSafe = x => { const s = Math.sin(x); if (Math.abs(s) < 1e-10) return s >= 0 ? Infinity : -Infinity; return Math.cos(x) / s; };
    const secSafe = x => { const c = Math.cos(x); if (Math.abs(c) < 1e-10) return c >= 0 ? Infinity : -Infinity; return 1 / c; };
    const cscSafe = x => { const s = Math.sin(x); if (Math.abs(s) < 1e-10) return s >= 0 ? Infinity : -Infinity; return 1 / s; };
    // True floor/ceil: snap only within 1e-10 of integers
    const floorSafe = x => { const r = Math.round(x); return Math.abs(x - r) < 1e-10 ? r : Math.floor(x); };
    const ceilSafe = x => { const r = Math.round(x); return Math.abs(x - r) < 1e-10 ? r : Math.ceil(x); };
    const modSafe = (a, b) => { if (b === 0) return NaN; return ((a % b) + b) % b; };
    const base = {
        pi: PI, e: E, phi: (1 + Math.sqrt(5)) / 2, gamma_em: 0.5772156649015329, Inf: Infinity, Infinity: Infinity,
        // Trig
        sin: x => Math.sin(x), cos: x => Math.cos(x), tan: tanSafe, csc: cscSafe, sec: secSafe, cot: cotSafe,
        asin: x => Math.abs(x) > 1 ? NaN : Math.asin(x), acos: x => Math.abs(x) > 1 ? NaN : Math.acos(x),
        atan: x => Math.atan(x), atan2: (y, x) => Math.atan2(y, x),
        acot: x => PI / 2 - Math.atan(x),
        asec: x => Math.abs(x) < 1 ? NaN : Math.acos(1 / x),
        acsc: x => Math.abs(x) < 1 ? NaN : Math.asin(1 / x),
        arcsin: x => Math.abs(x) > 1 ? NaN : Math.asin(x), arccos: x => Math.abs(x) > 1 ? NaN : Math.acos(x),
        arctan: x => Math.atan(x), arccot: x => PI / 2 - Math.atan(x),
        arcsec: x => Math.abs(x) < 1 ? NaN : Math.acos(1 / x), arccsc: x => Math.abs(x) < 1 ? NaN : Math.asin(1 / x),
        versin: x => 1 - Math.cos(x), coversin: x => 1 - Math.sin(x),
        hav: x => Math.sin(x / 2) ** 2, exsec: x => secSafe(x) - 1, excsc: x => cscSafe(x) - 1,
        chord: x => 2 * Math.sin(x / 2), gd: x => 2 * Math.atan(Math.tanh(x / 2)),
        // Hyperbolic
        sinh: x => Math.sinh(x), cosh: x => Math.cosh(x), tanh: x => Math.tanh(x),
        sech: x => 1 / Math.cosh(x), csch: x => x === 0 ? Infinity : 1 / Math.sinh(x),
        coth: x => x === 0 ? Infinity : Math.cosh(x) / Math.sinh(x),
        asinh: x => Math.asinh(x), acosh: x => x < 1 ? NaN : Math.acosh(x),
        atanh: x => Math.abs(x) >= 1 ? NaN : Math.atanh(x),
        asech: x => (x <= 0 || x > 1) ? NaN : Math.acosh(1 / x),
        acsch: x => x === 0 ? Infinity : Math.asinh(1 / x),
        acoth: x => Math.abs(x) <= 1 ? NaN : Math.atanh(1 / x),
        arcsinh: x => Math.asinh(x), arccosh: x => x < 1 ? NaN : Math.acosh(x),
        arctanh: x => Math.abs(x) >= 1 ? NaN : Math.atanh(x),
        // Log/Exp
        ln: x => x <= 0 ? NaN : Math.log(x), log: x => x <= 0 ? NaN : Math.log(x),
        log10: x => x <= 0 ? NaN : Math.log10(x), log2: x => x <= 0 ? NaN : Math.log2(x),
        exp: x => Math.exp(x),
        // Special
        sqrt: x => x < 0 ? NaN : Math.sqrt(x), cbrt: x => Math.cbrt(x), abs: x => Math.abs(x),
        sign: x => Math.sign(x), floor: floorSafe, ceil: ceilSafe, round: x => Math.round(x),
        mod: modSafe,
        gcd: (a, b) => { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { [a, b] = [b, a % b]; } return a; },
        lcm: (a, b) => { const g = (function gc(a, b) { return b ? gc(b, a % b) : a; })(Math.abs(Math.round(a)), Math.abs(Math.round(b))); return g ? Math.abs(Math.round(a)) * Math.abs(Math.round(b)) / g : 0; },
        max: (...a) => Math.max(...a), min: (...a) => Math.min(...a),
        pow: (a, b) => Math.pow(a, b),
        // Gamma-based factorials
        gamma: gamma, 'n!': x => gamma(x + 1), factorial: x => x < 0 && Number.isInteger(x) ? Infinity : gamma(x + 1),
        beta: (a, b) => gamma(a) * gamma(b) / gamma(a + b),
        erf: erf_fn, erfc: x => 1 - erf_fn(x),
        zeta: zetaFn, digamma: digammaFn,
        W: lambertW, lambertw: lambertW,
        sinc: x => Math.abs(x) < 1e-15 ? 1 : Math.sin(PI * x) / (PI * x),
        sincu: x => Math.abs(x) < 1e-15 ? 1 : Math.sin(x) / x,
        nsinc: x => Math.abs(x) < 1e-15 ? 1 : Math.sin(PI * x) / (PI * x),
        cis: x => ({ re: Math.cos(x), im: Math.sin(x) }),
        arg: z => (z && 're' in z) ? Math.atan2(z.im, z.re) : (z >= 0 ? 0 : PI),
        Si, Ci,
        // Variables
        x: 0, y: 0, z: 0, t: 0, n: 0, i: 0, j: 0, k: 0, r: 0, theta: 0,
        ..._customFns
    };
    return extra ? Object.assign({}, base, extra) : base;
}

// ════════════════════════════════════════════════
// NORMALIZER
// ════════════════════════════════════════════════
function normalizeExpr(expr) {
    return expr
        .replace(/\bln\s*\(/g, 'log(')
        .replace(/\bNsinc\s*\(/gi, 'sinc(')
        .replace(/\bn!\s*\(/g, 'factorial(')
        .replace(/(\d)\s*([a-zA-Z(])/g, '$1*$2')
        .replace(/\)\s*\(/g, ')*(')
        .replace(/\u00f7/g, '/').replace(/\u00d7/g, '*').replace(/\u2212/g, '-');
}

// ════════════════════════════════════════════════
// SYMBOLIC FORMATTER
// ════════════════════════════════════════════════
function gcd_n(a, b) { return b === 0 ? a : gcd_n(b, a % b); }
function toFrac(x, eps) {
    if (x === 0) return { n: 0, d: 1 };
    for (let d = 1; d <= 10000; d++) { const n = Math.round(x * d); if (Math.abs(n / d - x) < eps) { const g = gcd_n(Math.abs(n), d); return { n: Math.abs(n) / g, d: d / g }; } }
    return null;
}
function sqrtSimp(n) { if (!Number.isInteger(n) || n <= 0) return { o: 1, i: n }; let o = 1, i = n; for (let f = 2; f * f <= i; f++)while (i % (f * f) === 0) { o *= f; i /= f * f; } return { o, i }; }

// Exact value lookup table
const EXACT = (() => {
    const PI = Math.PI, S2 = Math.sqrt(2), S3 = Math.sqrt(3), S5 = Math.sqrt(5);
    const m = new Map();
    const a = (v, s) => m.set(parseFloat(v.toFixed(14)), s);
    a(0, '0'); a(1, '1'); a(-1, '-1');
    a(PI, '\u03c0'); a(-PI, '-\u03c0');
    a(PI / 2, '\u03c0/2'); a(-PI / 2, '-\u03c0/2');
    a(PI / 3, '\u03c0/3'); a(-PI / 3, '-\u03c0/3');
    a(PI / 4, '\u03c0/4'); a(-PI / 4, '-\u03c0/4');
    a(PI / 6, '\u03c0/6'); a(-PI / 6, '-\u03c0/6');
    a(2 * PI, '2\u03c0'); a(-2 * PI, '-2\u03c0');
    a(3 * PI / 2, '3\u03c0/2'); a(3 * PI / 4, '3\u03c0/4');
    a(S2, 'sqrt(2)'); a(-S2, '-sqrt(2)');
    a(S3, 'sqrt(3)'); a(-S3, '-sqrt(3)');
    a(S5, 'sqrt(5)'); a(-S5, '-sqrt(5)');
    a(S2 / 2, 'sqrt(2)/2'); a(-S2 / 2, '-sqrt(2)/2');
    a(S3 / 2, 'sqrt(3)/2'); a(-S3 / 2, '-sqrt(3)/2');
    a(S3 / 3, 'sqrt(3)/3'); a(-S3 / 3, '-sqrt(3)/3');
    a(1 / S2, 'sqrt(2)/2');
    a((1 + S5) / 2, '\u03c6'); a((1 - S5) / 2, '-1/\u03c6');
    a(Math.log(2), 'ln(2)'); a(Math.log(10), 'ln(10)');
    a(Math.E, 'e'); a(1 / Math.E, '1/e');
    a(Math.log(Math.E), '1'); // ln(e)=1
    // Trig exact values
    [[0, 1], [PI / 6, S3 / 2], [PI / 4, S2 / 2], [PI / 3, 1 / 2], [PI / 2, 0],
    [2 * PI / 3, -1 / 2], [3 * PI / 4, -S2 / 2], [5 * PI / 6, -S3 / 2], [PI, -1]].forEach(([ang, cv]) => {
        a(cv, 'cos(' + ang.toFixed(5) + ')');
    });
    [[0, 0], [PI / 6, 1 / 2], [PI / 4, S2 / 2], [PI / 3, S3 / 2], [PI / 2, 1],
    [2 * PI / 3, S3 / 2], [3 * PI / 4, S2 / 2], [5 * PI / 6, 1 / 2], [PI, 0]].forEach(([ang, sv]) => {
        a(sv, 'sin(' + ang.toFixed(5) + ')');
    });
    return m;
})();

function toSymbolic(v, depth) {
    depth = depth || 0; if (depth > 5) return String(v);
    if (v && typeof v === 'object' && typeof v.toArray === 'function') return toSymbolic(v.toArray(), depth);
    if (Array.isArray(v)) {
        if (Array.isArray(v[0])) return v.map(r => '[ ' + r.map(x => toSymbolic(x, depth + 1)).join('  ') + ' ]').join('\n');
        return '[' + v.map(x => toSymbolic(x, depth + 1)).join(', ') + ']';
    }
    if (v && typeof v === 'object' && 're' in v && 'im' in v) {
        if (Math.abs(v.im) < 1e-11) return toSymbolic(v.re, depth + 1);
        if (Math.abs(v.re) < 1e-11) return (Math.abs(v.im) === 1 ? '' : toSymbolic(Math.abs(v.im), depth + 1)) + 'i';
        return toSymbolic(v.re, depth + 1) + (v.im < 0 ? ' - ' : ' + ') + (Math.abs(v.im) === 1 ? '' : toSymbolic(Math.abs(v.im), depth + 1)) + 'i';
    }
    const x = Number(v);
    if (isNaN(x)) return 'indeterminate';
    if (!isFinite(x)) return x > 0 ? '\u221e' : '-\u221e';
    const rounded = Math.round(x);
    if (Math.abs(x - rounded) < 1e-10) return String(rounded);
    if (Number.isInteger(x)) return String(x);
    const key = parseFloat(x.toFixed(14));
    if (EXACT.has(key)) return EXACT.get(key);
    const sign = x < 0 ? '-' : '', abs = Math.abs(x);
    // Pi multiple
    const piF = toFrac(abs / Math.PI, 1e-9);
    if (piF && piF.d <= 1000) {
        if (piF.n === 1 && piF.d === 1) return sign + '\u03c0';
        if (piF.d === 1) return sign + piF.n + '\u03c0';
        if (piF.n === 1) return sign + '\u03c0/' + piF.d;
        return sign + piF.n + '\u03c0/' + piF.d;
    }
    // E multiple
    const eF = toFrac(abs / Math.E, 1e-9);
    if (eF && eF.d <= 100 && eF.n <= 20) {
        if (eF.n === 1 && eF.d === 1) return sign + 'e';
        if (eF.d === 1) return sign + eF.n + 'e';
    }
    // sqrt rational
    const x2F = toFrac(abs * abs, 1e-9);
    if (x2F) {
        const { o: oN, i: iN } = sqrtSimp(x2F.n), { o: oD, i: iD } = sqrtSimp(x2F.d);
        if (!(iN === 1 && iD === 1)) {
            const { o: fO, i: fI } = sqrtSimp(iN * iD), nc = oN * fO, dc = oD * iD, g = gcd_n(nc, dc);
            if (fI !== 1) { const cs = (nc / g) === 1 ? '' : String(nc / g); return sign + (cs + 'sqrt(' + fI + ')') + ((dc / g) === 1 ? '' : '/' + (dc / g)); }
        }
    }
    const fr = toFrac(abs, 1e-9);
    if (fr && fr.d <= 1000) return sign + fr.n + (fr.d !== 1 ? '/' + fr.d : '');
    return x.toPrecision(10).replace(/\.?0+$/, '');
}

// ════════════════════════════════════════════════
// OUTPUT HELPERS
// ════════════════════════════════════════════════
function setResult(sym, num, steps) {
    document.getElementById('outSym').textContent = sym; document.getElementById('outSym').className = 'rv sym';
    document.getElementById('outNum').textContent = num; document.getElementById('outNum').className = 'rv num';
    document.getElementById('outSteps').textContent = steps || '—'; document.getElementById('outSteps').className = 'rv steps';
}
function setError(msg) {
    document.getElementById('outSym').textContent = 'Error: ' + msg; document.getElementById('outSym').className = 'rv err';
    document.getElementById('outNum').textContent = ''; document.getElementById('outSteps').textContent = '';
}

// ════════════════════════════════════════════════
// BASIC CALCULATE — variable definitions, multi-line
// ════════════════════════════════════════════════
const _varStore = {};
function doCalc() {
    const raw = document.getElementById('sciIn').value.trim();
    if (!raw) { setResult('\u2014', '\u2014'); return; }
    const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
    const scope = Object.assign({}, mathScope(), _varStore);
    const steps = [];
    let lastSym = '', lastNum = '';
    for (const line of lines) {
        const assign = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
        if (assign) {
            const vn = assign[1], ex = assign[2];
            try {
                const val = math.evaluate(normalizeExpr(ex), scope);
                scope[vn] = val; _varStore[vn] = val;
                steps.push(vn + ' = ' + toSymbolic(val));
                lastSym = vn + ' = ' + toSymbolic(val);
                lastNum = vn + ' \u2248 ' + (typeof val === 'number' ? val.toPrecision(10).replace(/\.?0+$/, '') : String(val));
            } catch (e) { setError('In "' + line + '": ' + e.message); return; }
        } else {
            try {
                const val = math.evaluate(normalizeExpr(line), scope);
                lastSym = toSymbolic(val);
                lastNum = math.format(val, { notation: 'auto', precision: 14 });
                steps.push(line + ' = ' + lastSym);
            } catch (e) { setError(e.message); return; }
        }
    }
    setResult(lastSym, lastNum, steps.join('\n'));
}

// ════════════════════════════════════════════════
// CALCULUS UI
// ════════════════════════════════════════════════
const CALC_HINTS = {
    deriv: 'Expression in box above, e.g. sin(x)*x^2. Result: d/dx [expr].',
    partial: 'Expression in box above e.g. x^2+y^2. Specify variable below.',
    nderiv: 'Expression in box. Specify variable and order n.',
    mixed: 'Expression in box. Specify variables as x,y for ∂²f/∂x∂y.',
    integral: 'Expression in box. Set lower a and upper b bounds.',
    improper: 'Expression in box. Computes ∫₋₁₀₀₀^₁₀₀₀ as approximation.',
    limit: 'Expression in box. Set x → value.',
    sum: 'Expression in box using n. Set from and to.',
    product: 'Expression in box using n. Set from and to.',
};
function updateCalcUI() {
    const m = document.getElementById('calcMode').value;
    document.getElementById('calcSyntaxHint').textContent = CALC_HINTS[m] || '';
    document.getElementById('ui-nderiv').style.display = m === 'nderiv' ? '' : 'none';
    document.getElementById('ui-mixed').style.display = m === 'mixed' ? '' : 'none';
    document.getElementById('ui-bounds').style.display = (m === 'integral' || m === 'improper') ? '' : 'none';
    document.getElementById('ui-limit').style.display = m === 'limit' ? '' : 'none';
    document.getElementById('ui-sum').style.display = m === 'sum' ? '' : 'none';
    document.getElementById('ui-product').style.display = m === 'product' ? '' : 'none';
}

function numDeriv(f, x, h) { h = h || 1e-5; return (-f(x + 2 * h) + 8 * f(x + h) - 8 * f(x - h) + f(x - 2 * h)) / (12 * h); }
function adaptSimpson(f, a, b, tol, maxD) {
    tol = tol || 1e-8; maxD = maxD || 50;
    const s = (a, b) => { const c = (a + b) / 2; return (b - a) / 6 * (f(a) + 4 * f(c) + f(b)); };
    const r = (a, b, tol, w, d) => { const c = (a + b) / 2, L = s(a, c), R = s(c, b); if (d >= maxD) return L + R; if (Math.abs(L + R - w) <= 15 * tol) return L + R + (L + R - w) / 15; return r(a, c, tol / 2, L, d + 1) + r(c, b, tol / 2, R, d + 1); };
    return r(a, b, tol, s(a, b), 0);
}
function makeF(expr, v) { return val => { const sc = mathScope({ [v]: val, ..._varStore }); return math.evaluate(normalizeExpr(expr), sc); }; }

function doCalculus() {
    const mode = document.getElementById('calcMode').value;
    const raw = document.getElementById('sciIn').value.trim();
    const varN = (document.getElementById('calcVar').value || 'x').trim();
    if (!raw) { setError('Enter an expression in the input box above.'); return; }
    const steps = [];
    try {
        if (mode === 'deriv') {
            const node = math.parse(normalizeExpr(raw));
            const d = math.derivative(node, varN);
            let simp; try { simp = math.simplify(d).toString(); } catch { simp = d.toString(); }
            steps.push('d/d' + varN + ' [' + raw + ']');
            steps.push('= ' + simp);
            let numStr = ''; try { numStr = 'at ' + varN + '=1: \u2248' + toSymbolic(numDeriv(makeF(raw, varN), 1)); } catch { }
            setResult('d/d' + varN + ' [' + raw + '] = ' + simp, numStr, steps.join('\n'));
        } else if (mode === 'partial') {
            const node = math.parse(normalizeExpr(raw));
            const d = math.derivative(node, varN);
            let simp; try { simp = math.simplify(d).toString(); } catch { simp = d.toString(); }
            steps.push('\u2202/\u2202' + varN + ' [' + raw + '] = ' + simp);
            setResult('\u2202/\u2202' + varN + ' [' + raw + '] = ' + simp, '(symbolic)', steps.join('\n'));
        } else if (mode === 'nderiv') {
            const n = parseInt(document.getElementById('calcN').value) || 2;
            let node = math.parse(normalizeExpr(raw));
            steps.push('f(x) = ' + raw);
            for (let k = 1; k <= n; k++) { node = math.derivative(node, varN); steps.push('f^(' + k + ') = ' + node.toString()); }
            let simp; try { simp = math.simplify(node).toString(); } catch { simp = node.toString(); }
            setResult('d^' + n + '/d' + varN + '^' + n + ' [' + raw + '] = ' + simp, '(symbolic)', steps.join('\n'));
        } else if (mode === 'mixed') {
            const vars = (document.getElementById('calcMixedVars').value || 'x,y').split(',').map(s => s.trim());
            let node = math.parse(normalizeExpr(raw));
            steps.push('f = ' + raw);
            for (const v of vars) { node = math.derivative(node, v); steps.push('\u2202/\u2202' + v + ' = ' + node.toString()); }
            let simp; try { simp = math.simplify(node).toString(); } catch { simp = node.toString(); }
            setResult('\u2202^' + vars.length + 'f/\u2202' + vars.join('\u2202') + ' = ' + simp, '(symbolic)', steps.join('\n'));
        } else if (mode === 'integral') {
            const a = parseFloat(document.getElementById('calcA').value), b = parseFloat(document.getElementById('calcB').value);
            steps.push('\u222b[' + a + ',' + b + '] ' + raw + ' d' + varN);
            const result = adaptSimpson(makeF(raw, varN), a, b);
            steps.push('\u2248 ' + result);
            setResult('\u222b[' + a + ',' + b + '] ' + raw + ' d' + varN, '\u2248 ' + toSymbolic(result), steps.join('\n'));
        } else if (mode === 'improper') {
            const a = parseFloat(document.getElementById('calcA').value || '-1000');
            const b = parseFloat(document.getElementById('calcB').value || '1000');
            const result = adaptSimpson(makeF(raw, varN), a, b);
            setResult('\u222b[\u2212\u221e,\u221e] ' + raw + ' d' + varN, ' \u2248 ' + toSymbolic(result), 'Numerically integrated over [' + a + ',' + b + ']');
        } else if (mode === 'limit') {
            const pt = document.getElementById('calcLim').value.trim();
            const ptVal = pt === 'Inf' || pt === '\u221e' ? 1e10 : (pt === '-Inf' || pt === '-\u221e' ? -1e10 : parseFloat(pt));
            const f = makeF(raw, varN), h = 1e-4;
            const L = (4 * ((f(ptVal + h / 2) + f(ptVal - h / 2)) / 2) - ((f(ptVal + h) + f(ptVal - h)) / 2)) / 3;
            steps.push('lim[' + varN + '\u2192' + pt + '] ' + raw);
            steps.push('\u2248 ' + L);
            setResult('lim[' + varN + '\u2192' + pt + '] ' + raw, '\u2248 ' + toSymbolic(L), steps.join('\n'));
        } else if (mode === 'sum') {
            const from = parseInt(document.getElementById('sumFrom').value), to = parseInt(document.getElementById('sumTo').value);
            let total = 0;
            steps.push('\u03a3[n=' + from + '..' + to + '] ' + raw);
            for (let nn = from; nn <= to; nn++) {
                const sc = mathScope({ n: nn, ..._varStore });
                const v = math.evaluate(normalizeExpr(raw), sc);
                total += v; steps.push('n=' + nn + ': ' + toSymbolic(v));
            }
            steps.push('Total = ' + toSymbolic(total));
            setResult('\u03a3[n=' + from + '..' + to + '] ' + raw + ' = ' + toSymbolic(total), String(total), steps.join('\n'));
        } else if (mode === 'product') {
            const from = parseInt(document.getElementById('prodFrom').value), to = parseInt(document.getElementById('prodTo').value);
            let total = 1;
            steps.push('\u03a0[n=' + from + '..' + to + '] ' + raw);
            for (let nn = from; nn <= to; nn++) {
                const sc = mathScope({ n: nn, ..._varStore });
                const v = math.evaluate(normalizeExpr(raw), sc);
                total *= v; steps.push('n=' + nn + ': ' + toSymbolic(v));
            }
            steps.push('Product = ' + toSymbolic(total));
            setResult('\u03a0[n=' + from + '..' + to + '] ' + raw + ' = ' + toSymbolic(total), String(total), steps.join('\n'));
        }
    } catch (e) { setError(e.message); }
}

// ════════════════════════════════════════════════
// MATRIX
// ════════════════════════════════════════════════
function updateMatUI() {
    const op = document.getElementById('matOp').value;
    document.getElementById('matBG').style.display = op === 'mul' ? '' : 'none';
    document.getElementById('matPowG').style.display = op === 'pow' ? '' : 'none';
}
function parseMat(s) { return s.split(';').map(r => r.split(',').map(v => math.evaluate(v.trim(), mathScope()))); }
function matStr(m) {
    if (m && typeof m.toArray === 'function') m = m.toArray();
    if (!Array.isArray(m)) return toSymbolic(m);
    if (!Array.isArray(m[0])) return '[' + m.map(toSymbolic).join(', ') + ']';
    return m.map(r => '[ ' + r.map(toSymbolic).join('  ') + ' ]').join('\n');
}
function doMatrix() {
    const op = document.getElementById('matOp').value;
    try {
        const A = math.matrix(parseMat(document.getElementById('matA').value));
        let sym = '', num = '', steps = [];
        if (op === 'det') { const d = math.det(A); sym = 'det(A) = ' + toSymbolic(d); num = String(d); steps = ['Computing determinant via cofactor expansion', 'det(A) = ' + d]; }
        else if (op === 'inv') { const inv = math.inv(A); sym = 'A\u207b\u00b9 =\n' + matStr(inv); num = matStr(math.round(inv, 8)); steps = ['Computing inverse via adjugate/det', 'A\u207b\u00b9 =\n' + matStr(inv)]; }
        else if (op === 'trans') { const T = math.transpose(A); sym = 'A\u1d40 =\n' + matStr(T); num = sym; steps = ['Transposing: row i col j \u2194 row j col i']; }
        else if (op === 'mul') { const B = math.matrix(parseMat(document.getElementById('matB').value)); const P = math.multiply(A, B); sym = 'A\u00d7B =\n' + matStr(P); num = sym; steps = ['(AB)\u1d62\u2c7c = \u03a3\u2096 A\u1d62\u2c7c B\u2c7c\u2c7c']; }
        else if (op === 'eig') {
            const ev = math.eigs(A);
            const vals = ev.values.toArray ? ev.values.toArray() : ev.values;
            const vecs = ev.eigenvectors;
            sym = 'eigenvalues = [' + vals.map(toSymbolic).join(', ') + ']';
            if (vecs && vecs.length) { sym += '\n\neigenvectors:\n' + vecs.map((v, i) => 'v' + i + ' = ' + matStr(v.vector)).join('\n'); }
            num = '\u2248 [' + vals.map(v => Number(v).toPrecision(6)).join(', ') + ']';
            steps = ['Solving det(A - \u03bbI) = 0 for eigenvalues'];
        }
        else if (op === 'rank') {
            let m = A.toArray().map(r => [...r]), rank = 0, rows = m.length, cols = m[0].length, ri = 0;
            steps.push('Row reducing A to echelon form:');
            for (let c = 0; c < cols && ri < rows; c++) { let piv = -1; for (let i = ri; i < rows; i++)if (Math.abs(m[i][c]) > 1e-10) { piv = i; break; } if (piv === -1) continue;[m[ri], m[piv]] = [m[piv], m[ri]]; const f = m[ri][c]; for (let j = 0; j < cols; j++)m[ri][j] /= f; for (let i = 0; i < rows; i++)if (i !== ri) { const g = m[i][c]; for (let j = 0; j < cols; j++)m[i][j] -= g * m[ri][j]; } steps.push('Row ' + ri + ': ' + m[ri].map(x => x.toFixed(3)).join(', ')); rank++; ri++; }
            sym = 'rank(A) = ' + rank; num = String(rank); steps.push('Rank = number of non-zero rows = ' + rank);
        }
        else if (op === 'trace') { let tr = 0; const arr = A.toArray(); for (let i = 0; i < Math.min(arr.length, arr[0].length); i++) { tr += arr[i][i]; steps.push('a[' + i + '][' + i + '] = ' + arr[i][i]); } sym = 'tr(A) = ' + toSymbolic(tr); num = String(tr); }
        else if (op === 'norm') { const n = math.norm(A, 'fro'); sym = '\u2016A\u2016_F = ' + toSymbolic(n); num = String(n); steps = ['Frobenius norm = sqrt(\u03a3|a_ij|^2)']; }
        else if (op === 'rref') {
            let m = A.toArray().map(r => [...r]); const rows = m.length, cols = m[0].length; let pivot = 0;
            for (let col = 0; col < cols && pivot < rows; col++) { let pivRow = -1; for (let row = pivot; row < rows; row++)if (Math.abs(m[row][col]) > 1e-10) { pivRow = row; break; } if (pivRow === -1) continue;[m[pivot], m[pivRow]] = [m[pivRow], m[pivot]]; const s = m[pivot][col]; for (let j = 0; j < cols; j++)m[pivot][j] /= s; for (let i = 0; i < rows; i++)if (i !== pivot) { const f = m[i][col]; for (let j = 0; j < cols; j++)m[i][j] -= f * m[pivot][j]; } steps.push('After pivot col ' + col + ': ' + m[pivot].map(x => x.toFixed(2)).join(', ')); pivot++; }
            sym = 'RREF(A) =\n' + m.map(r => '[ ' + r.map(x => Math.abs(x) < 1e-10 ? '0' : x.toFixed(4)).join('  ') + ' ]').join('\n'); num = sym;
        }
        else if (op === 'lu') {
            // Simple LU (no pivoting) for display
            const arr = A.toArray().map(r => [...r]), n = arr.length;
            const L = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 1 : 0));
            const U = arr.map(r => [...r]);
            for (let k = 0; k < n; k++)for (let i = k + 1; i < n; i++) { L[i][k] = U[i][k] / U[k][k]; for (let j = k; j < n; j++)U[i][j] -= L[i][k] * U[k][j]; }
            sym = 'L =\n' + matStr(L) + '\n\nU =\n' + matStr(U); num = 'A = L·U'; steps = ['LU decomposition via Gaussian elimination (no pivoting)'];
        }
        else if (op === 'adj') {
            const inv = math.inv(A), d = math.det(A);
            const adj = math.multiply(d, inv);
            sym = 'adj(A) =\n' + matStr(adj); num = sym; steps = ['adj(A) = det(A) \u00d7 A\u207b\u00b9'];
        }
        setResult(sym, num, steps.join('\n'));
    } catch (e) { setError(e.message); }
}

// ════════════════════════════════════════════════
// VECTOR CALC
// ════════════════════════════════════════════════
function updateVecUI() {
    const op = document.getElementById('vecOp').value;
    const fieldOps = ['grad', 'div', 'curl', 'lap', 'hess', 'jac', 'dirderiv'];
    const uvOps = ['dot', 'cross', 'mag', 'unit', 'proj', 'angle', 'add'];
    const cvOps = ['scale'];
    const dirOps = ['dirderiv'];
    const triOps = ['triple'];
    document.getElementById('vec-scalar').style.display = (['grad', 'lap', 'hess'].includes(op)) ? '' : 'none';
    document.getElementById('vec-field').style.display = (['div', 'curl', 'jac'].includes(op)) ? '' : 'none';
    document.getElementById('vec-uv').style.display = (['dot', 'cross', 'proj', 'angle', 'add', 'triple'].includes(op)) ? '' : 'none';
    document.getElementById('vec-cv').style.display = op === 'scale' ? '' : 'none';
    document.getElementById('vec-dir').style.display = op === 'dirderiv' ? '' : 'none';
    document.getElementById('vec-w').style.display = op === 'triple' ? '' : 'none';
    if (op === 'dirderiv') { document.getElementById('vec-scalar').style.display = ''; }
}
function ddv(expr, v) { try { return math.simplify(math.derivative(math.parse(normalizeExpr(expr)), v)).toString(); } catch { return '(error)'; } }
function parseVec(s) { return s.split(',').map(v => parseFloat(v.trim())); }
function vecStr(v, comp) { const syms = ['i', 'j', 'k']; if (comp && v.length <= 3) return v.map((c, i) => toSymbolic(c) + (syms[i] ? '\u0302' + syms[i] : 'k\u0302')).join(' + '); return '(' + v.map(toSymbolic).join(', ') + ')'; }
function doVector() {
    const op = document.getElementById('vecOp').value;
    const steps = [];
    try {
        if (op === 'grad') { const f = document.getElementById('vScalar').value; const dx = ddv(f, 'x'), dy = ddv(f, 'y'), dz = ddv(f, 'z'); steps.push('\u2207f = (\u2202f/\u2202x, \u2202f/\u2202y, \u2202f/\u2202z)'); setResult('\u2207f = ' + dx + '\u00ee + ' + dy + '\u0135 + ' + dz + 'k\u0302', '\u2202f/\u2202x = ' + dx + '\n\u2202f/\u2202y = ' + dy + '\n\u2202f/\u2202z = ' + dz, steps.join('\n')); }
        else if (op === 'div') { const P = document.getElementById('vP').value, Q = document.getElementById('vQ').value, R = document.getElementById('vR').value; const dP = ddv(P, 'x'), dQ = ddv(Q, 'y'), dR = ddv(R, 'z'); let div = ''; try { div = math.simplify(math.parse('(' + dP + ')+(' + dQ + ')+(' + dR + ')')).toString(); } catch { div = dP + '+' + dQ + '+' + dR; } steps.push('\u2207\u00b7F = \u2202P/\u2202x + \u2202Q/\u2202y + \u2202R/\u2202z'); setResult('\u2207\u00b7F = ' + div, '= ' + dP + ' + ' + dQ + ' + ' + dR + '\n= ' + div, steps.join('\n')); }
        else if (op === 'curl') { const P = document.getElementById('vP').value, Q = document.getElementById('vQ').value, R = document.getElementById('vR').value; const Ry = ddv(R, 'y'), Qz = ddv(Q, 'z'), Pz = ddv(P, 'z'), Rx = ddv(R, 'x'), Qx = ddv(Q, 'x'), Py = ddv(P, 'y'); let ci = '', cj = '', ck = ''; try { ci = math.simplify(math.parse('(' + Ry + ')-(' + Qz + ')')).toString(); } catch { ci = Ry + '-' + Qz; } try { cj = math.simplify(math.parse('(' + Pz + ')-(' + Rx + ')')).toString(); } catch { cj = Pz + '-' + Rx; } try { ck = math.simplify(math.parse('(' + Qx + ')-(' + Py + ')')).toString(); } catch { ck = Qx + '-' + Py; } steps.push('\u2207\u00d7F = (\u2202R/\u2202y-\u2202Q/\u2202z)\u00ee + ...'); setResult('\u2207\u00d7F = ' + ci + '\u00ee + ' + cj + '\u0135 + ' + ck + 'k\u0302', '(' + ci + ', ' + cj + ', ' + ck + ')', steps.join('\n')); }
        else if (op === 'lap') { const f = document.getElementById('vScalar').value; const node = math.parse(normalizeExpr(f)); const d2x = math.simplify(math.derivative(math.derivative(node, 'x'), 'x')).toString(); const d2y = math.simplify(math.derivative(math.derivative(node, 'y'), 'y')).toString(); const d2z = math.simplify(math.derivative(math.derivative(node, 'z'), 'z')).toString(); let lap = ''; try { lap = math.simplify(math.parse('(' + d2x + ')+(' + d2y + ')+(' + d2z + ')')).toString(); } catch { lap = d2x + '+' + d2y + '+' + d2z; } steps.push('\u2207\u00b2f = \u2202\u00b2f/\u2202x\u00b2 + \u2202\u00b2f/\u2202y\u00b2 + \u2202\u00b2f/\u2202z\u00b2'); setResult('\u2207\u00b2f = ' + lap, '= ' + d2x + ' + ' + d2y + ' + ' + d2z + '\n= ' + lap, steps.join('\n')); }
        else if (op === 'hess') { const f = document.getElementById('vScalar').value; const vs = ['x', 'y', 'z']; const H = vs.map(v1 => vs.map(v2 => ddv(ddv(f, v1), v2))); steps.push('H[i][j] = \u2202\u00b2f/\u2202x_i\u2202x_j'); setResult('Hessian H(f) =\n' + H.map((r, i) => '[ ' + r.map((c, j) => '\u2202\u00b2f/\u2202' + vs[i] + '\u2202' + vs[j] + '=' + c).join('  ') + ' ]').join('\n'), '3\u00d73 matrix of second partial derivatives', steps.join('\n')); }
        else if (op === 'jac') { const P = document.getElementById('vP').value, Q = document.getElementById('vQ').value, R = document.getElementById('vR').value; const vs = ['x', 'y', 'z'], fns = [P, Q, R]; const J = fns.map(f => vs.map(v => ddv(f, v))); steps.push('J[i][j] = \u2202F_i/\u2202x_j'); setResult('J(F) =\n' + J.map(r => '[ ' + r.join('  ') + ' ]').join('\n'), '3\u00d73 Jacobian matrix', steps.join('\n')); }
        else if (op === 'dot') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value); const d = u.reduce((s, x, i) => s + x * (v[i] || 0), 0); steps.push('u\u00b7v = \u03a3 u_i v_i'); u.forEach((x, i) => steps.push('u[' + i + ']\u00d7v[' + i + '] = ' + x + '\u00d7' + (v[i] || 0) + ' = ' + (x * (v[i] || 0)))); setResult('u\u00b7v = ' + toSymbolic(d), String(d), steps.join('\n')); }
        else if (op === 'cross') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value); if (u.length < 3 || v.length < 3) { setError('Cross product requires 3D vectors.'); return; } const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; steps.push('u\u00d7v = (u_y v_z - u_z v_y)\u00ee + ...'); setResult('u\u00d7v = ' + vecStr(c, true), '(' + c.map(x => x.toFixed(6)).join(', ') + ')', steps.join('\n')); }
        else if (op === 'mag') { const v = parseVec(document.getElementById('vU').value); const m = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); steps.push('|v| = sqrt(\u03a3 v_i\u00b2)'); v.forEach((x, i) => steps.push('v[' + i + ']\u00b2 = ' + x * x)); setResult('|v| = ' + toSymbolic(m), String(m), steps.join('\n')); }
        else if (op === 'unit') { const v = parseVec(document.getElementById('vU').value); const m = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); const u = v.map(x => x / m); steps.push('v\u0302 = v / |v|, |v| = ' + m); setResult('v\u0302 = ' + vecStr(u, true), '(' + u.map(x => x.toFixed(6)).join(', ') + ')', steps.join('\n')); }
        else if (op === 'proj') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value); const dot = u.reduce((s, x, i) => s + x * (v[i] || 0), 0); const mag2 = v.reduce((s, x) => s + x * x, 0); const proj = v.map(x => x * dot / mag2); steps.push('proj_v u = (u\u00b7v / |v|\u00b2) v'); steps.push('u\u00b7v = ' + dot + ', |v|\u00b2 = ' + mag2); setResult('proj_v u = ' + vecStr(proj, true), '(' + proj.map(x => x.toFixed(6)).join(', ') + ')', steps.join('\n')); }
        else if (op === 'angle') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value); const dot = u.reduce((s, x, i) => s + x * (v[i] || 0), 0); const mu = Math.sqrt(u.reduce((s, x) => s + x * x, 0)), mv = Math.sqrt(v.reduce((s, x) => s + x * x, 0)); const ang = Math.acos(dot / (mu * mv)); steps.push('cos\u03b8 = u\u00b7v / (|u||v|)'); steps.push('u\u00b7v = ' + dot + ', |u| = ' + mu + ', |v| = ' + mv); setResult('\u03b8 = ' + toSymbolic(ang) + ' rad = ' + (ang * 180 / Math.PI).toFixed(4) + '\u00b0', ang.toFixed(10), steps.join('\n')); }
        else if (op === 'add') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value); const s = u.map((x, i) => x + (v[i] || 0)); steps.push('u + v = component-wise sum'); setResult('u+v = ' + vecStr(s, true), '(' + s.join(', ') + ')', steps.join('\n')); }
        else if (op === 'scale') { const c = parseFloat(document.getElementById('vC').value), v = parseVec(document.getElementById('vSV').value); const s = v.map(x => x * c); steps.push('cv = c \u00d7 each component'); setResult('cv = ' + vecStr(s, true), '(' + s.join(', ') + ')', steps.join('\n')); }
        else if (op === 'triple') { const u = parseVec(document.getElementById('vU').value), v = parseVec(document.getElementById('vV').value), w = parseVec(document.getElementById('vW').value); const cross = [v[1] * w[2] - v[2] * w[1], v[2] * w[0] - v[0] * w[2], v[0] * w[1] - v[1] * w[0]]; const triple = u.reduce((s, x, i) => s + x * cross[i], 0); steps.push('u\u00b7(v\u00d7w) — scalar triple product = det([u,v,w])'); setResult('u\u00b7(v\u00d7w) = ' + toSymbolic(triple), String(triple), steps.join('\n')); }
        else if (op === 'dirderiv') { const f = document.getElementById('vScalar').value, u = parseVec(document.getElementById('vDirU').value), pt = parseVec(document.getElementById('vDirPt').value); const mag = Math.sqrt(u.reduce((s, x) => s + x * x, 0)); const uhat = u.map(x => x / mag); const vs = ['x', 'y', 'z'], grad = vs.map(v => ddv(f, v)); const scope = mathScope({ x: pt[0] || 0, y: pt[1] || 0, z: pt[2] || 0, ..._varStore }); const gradNum = grad.map(g => { try { return math.evaluate(normalizeExpr(g), scope); } catch { return 0; } }); const dd = gradNum.reduce((s, x, i) => s + x * (uhat[i] || 0), 0); steps.push('\u2207_u f = \u2207f \u00b7 \u0171'); steps.push('\u2207f at point = (' + gradNum.join(', ') + ')'); steps.push('\u0171 = (' + uhat.join(', ') + ')'); setResult('D_u f = ' + toSymbolic(dd), '= ' + dd.toFixed(10), steps.join('\n')); }
    } catch (e) { setError(e.message); }
}

// ════════════════════════════════════════════════
// CUSTOM FUNCTIONS
// ════════════════════════════════════════════════
function addCustomFn() {
    const name = document.getElementById('cfName').value.trim();
    const params = document.getElementById('cfParams').value.split(',').map(s => s.trim()).filter(Boolean);
    const body = document.getElementById('cfBody').value.trim();
    if (!name || !body) { setError('Provide name and body.'); return; }
    try {
        _customFns[name] = (...args) => {
            const sc = mathScope();
            params.forEach((p, i) => sc[p] = args[i]);
            return math.evaluate(normalizeExpr(body), sc);
        };
        renderCustomFns();
        document.getElementById('cfName').value = '';
        document.getElementById('cfParams').value = '';
        document.getElementById('cfBody').value = '';
    } catch (e) { setError(e.message); }
}
function renderCustomFns() {
    const list = document.getElementById('customFnList'); if (!list) return;
    list.innerHTML = '';
    Object.keys(_customFns).forEach(name => {
        const d = document.createElement('div'); d.className = 'custom-fn-item';
        d.innerHTML = '<span>' + name + '(…)</span><button class="custom-fn-del" onclick="deleteCustomFn(\'' + name + '\')">✕</button>';
        list.appendChild(d);
    });
}
function deleteCustomFn(name) { delete _customFns[name]; renderCustomFns(); }

// ════════════════════════════════════════════════
// STATISTICS
// ════════════════════════════════════════════════
function parseData(s) { return s.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)); }
function autoStats() {
    const xs = parseData(document.getElementById('statX').value);
    const ys = parseData(document.getElementById('statY').value);
    if (xs.length < 2) { document.getElementById('statsResult').textContent = 'Need ≥2 values.'; return; }
    const n = xs.length, sorted = [...xs].sort((a, b) => a - b);
    const mean = xs.reduce((a, b) => a + b) / n;
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const freq = {}; xs.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxF = Math.max(...Object.values(freq));
    const modes = Object.keys(freq).filter(k => freq[k] === maxF).join(', ');
    const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
    const sampleVar = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1);
    const std = Math.sqrt(variance);
    const q1 = sorted[Math.floor(n / 4)], q3 = sorted[Math.floor(3 * n / 4)];
    const mad = xs.reduce((a, b) => a + Math.abs(b - mean), 0) / n;
    const skew = xs.reduce((a, b) => a + ((b - mean) / std) ** 3, 0) / n;
    const kurt = xs.reduce((a, b) => a + ((b - mean) / std) ** 4, 0) / n - 3;
    let res = `n         = ${n}\nSum       = ${xs.reduce((a, b) => a + b).toPrecision(8)}\nMean      = ${mean.toPrecision(8)}\nMedian    = ${median}\nMode(s)   = ${modes}\nMin       = ${sorted[0]}\nMax       = ${sorted[n - 1]}\nRange     = ${sorted[n - 1] - sorted[0]}\nStd Dev   = ${std.toPrecision(8)}\nVariance  = ${variance.toPrecision(8)}\nSample Var= ${sampleVar.toPrecision(8)}\nQ1        = ${q1}\nQ3        = ${q3}\nIQR       = ${q3 - q1}\nMAD       = ${mad.toPrecision(8)}\nSkewness  = ${skew.toPrecision(4)}\nExcess Kurt=${kurt.toPrecision(4)}`;
    if (ys.length === n) { const my = ys.reduce((a, b) => a + b) / n; const cov = xs.reduce((a, _, i) => a + (xs[i] - mean) * (ys[i] - my), 0) / n; const sy = Math.sqrt(ys.reduce((a, b) => a + (b - my) ** 2, 0) / n); const r = cov / (std * sy); res += `\n\nWith Y:\nMean Y    = ${my.toPrecision(8)}\nCovariance= ${cov.toPrecision(8)}\nPearson r = ${r.toPrecision(8)}\nR\u00b2        = ${(r * r).toPrecision(8)}`; }
    document.getElementById('statsResult').textContent = res;
}
let _regExprId = null;
function doRegression() {
    clearRegression();
    const xs = parseData(document.getElementById('statX').value);
    const ys = parseData(document.getElementById('statY').value);
    const type = document.getElementById('regType').value;
    const el = document.getElementById('regResult');
    if (xs.length < 2 || ys.length < xs.length) { el.textContent = 'Need matching X and Y.'; return; }
    const n = xs.length;
    try {
        let res = '', exprStr = '';
        if (type === 'linear') { const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; const a = xs.reduce((s, _, i) => s + (xs[i] - mx) * (ys[i] - my), 0) / xs.reduce((s, b) => s + (b - mx) ** 2, 0); const b = my - a * mx; res = 'y = ' + a.toFixed(6) + 'x + ' + b.toFixed(6); exprStr = a.toFixed(6) + '*x+' + b.toFixed(6); }
        else if (type === 'exponential') { const lY = ys.map(y => Math.log(Math.abs(y))); const mx = xs.reduce((a, b) => a + b) / n, my = lY.reduce((a, b) => a + b) / n; const B = xs.reduce((s, _, i) => s + (xs[i] - mx) * (lY[i] - my), 0) / xs.reduce((s, b) => s + (b - mx) ** 2, 0); const A = Math.exp(my - B * mx); res = 'y = ' + A.toFixed(6) + '\u00b7e^(' + B.toFixed(6) + 'x)'; exprStr = A.toFixed(6) + '*exp(' + B.toFixed(6) + '*x)'; }
        else if (type === 'logarithmic') { const lX = xs.map(x => Math.log(x)); const mx = lX.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n; const a = lX.reduce((s, _, i) => s + (lX[i] - mx) * (ys[i] - my), 0) / lX.reduce((s, b) => s + (b - mx) ** 2, 0); const b = my - a * mx; res = 'y = ' + a.toFixed(6) + '\u00b7ln(x) + ' + b.toFixed(6); exprStr = a.toFixed(6) + '*log(x)+' + b.toFixed(6); }
        else if (type === 'power') { const lX = xs.map(x => Math.log(x)), lY = ys.map(y => Math.log(y)); const mx = lX.reduce((a, b) => a + b) / n, my = lY.reduce((a, b) => a + b) / n; const b = lX.reduce((s, _, i) => s + (lX[i] - mx) * (lY[i] - my), 0) / lX.reduce((s, b) => s + (b - mx) ** 2, 0); const A = Math.exp(my - b * mx); res = 'y = ' + A.toFixed(6) + '\u00b7x^' + b.toFixed(6); exprStr = A.toFixed(6) + '*x^' + b.toFixed(6); }
        else if (['quadratic', 'cubic'].includes(type)) {
            const deg = type === 'quadratic' ? 2 : 3, cols = deg + 1;
            const Xm = xs.map(x => Array.from({ length: cols }, (_, k) => Math.pow(x, k)));
            const Xt = Array.from({ length: cols }, (_, j) => xs.map((_, i) => Xm[i][j]));
            const XtX = Array.from({ length: cols }, (_, r) => Array.from({ length: cols }, (_, c) => Xt[r].reduce((a, _, k) => a + Xt[r][k] * Xm[k][c], 0)));
            const Xty = Array.from({ length: cols }, (_, r) => Xt[r].reduce((a, _, k) => a + Xt[r][k] * ys[k], 0));
            const m = math.lusolve(XtX, Xty).map(v => v[0]);
            res = 'y = ' + m.map((c, i) => i === 0 ? c.toFixed(5) : (i === 1 ? c.toFixed(5) + 'x' : c.toFixed(5) + 'x^' + i)).reverse().join(' + ');
            exprStr = m.map((c, i) => c.toFixed(6) + '*x^' + i).join('+');
        }
        el.textContent = res;
        if (exprStr) { addExpr(exprStr); _regExprId = _expressions[_expressions.length - 1].id; }
    } catch (e) { el.textContent = 'Error: ' + e.message; }
}
function clearRegression() {
    if (_regExprId !== null) {
        _expressions = _expressions.filter(e => e.id !== _regExprId);
        _regExprId = null; renderExprList(); renderGraph();
    }
    document.getElementById('regResult').textContent = '—';
}

// ════════════════════════════════════════════════
// GRAPHING ENGINE
// ════════════════════════════════════════════════
let _canvas, _ctx, _view = { cx: 0, cy: 0, scale: 60 }, _expressions = [], _eid = 0, _points = [];

function toSX(wx) { return _canvas.width / 2 + (wx - _view.cx) * _view.scale; }
function toSY(wy) { return _canvas.height / 2 - (wy - _view.cy) * _view.scale; }
function toWX(sx) { return _view.cx + (sx - _canvas.width / 2) / _view.scale; }
function toWY(sy) { return _view.cy - (sy - _canvas.height / 2) / _view.scale; }

function addExpr(str) {
    str = str || '';
    const id = _eid++, color = ['#5ea0ff', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a78bfa', '#fb923c', '#34d399', '#f472b6', '#38bdf8', '#e879f9'][id % 10];
    _expressions.push({ id, expr: str, color, visible: true });
    renderExprList(); renderGraph();
    requestAnimationFrame(() => { const el = document.querySelector('.einput[data-id="' + id + '"]'); if (el) el.focus(); });
}
window.addExpr = addExpr;

function removeExpr(id) { _expressions = _expressions.filter(e => e.id !== id); renderExprList(); renderGraph(); }

function renderExprList() {
    const list = document.getElementById('exprList'); if (!list) return; list.innerHTML = '';
    _expressions.forEach(e => {
        const row = document.createElement('div'); row.className = 'erow';
        row.innerHTML = '<div class="eswatch" data-id="' + e.id + '"><div class="edot" style="background:' + e.color + ';border-color:' + e.color + ';opacity:' + (e.visible ? 1 : .3) + '"></div></div><div class="einput-wrap"><textarea class="einput" data-id="' + e.id + '" rows="1" placeholder="y=f(x), r=f(θ), (x(t),y(t)), x²+y²=9">' + e.expr + '</textarea></div><button class="edel" data-id="' + e.id + '">\u00d7</button>';
        list.appendChild(row);
        const ta = row.querySelector('textarea');
        const resize = () => { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }; resize();
        ta.addEventListener('input', () => { const ex = _expressions.find(x => x.id === e.id); if (ex) ex.expr = ta.value; resize(); schedRender(); });
        row.querySelector('.eswatch').addEventListener('click', () => { const ex = _expressions.find(x => x.id === e.id); if (ex) { ex.visible = !ex.visible; renderExprList(); renderGraph(); } });
        row.querySelector('.edel').addEventListener('click', () => removeExpr(e.id));
    });
}

let _rTimer = null;
function schedRender() { clearTimeout(_rTimer); _rTimer = setTimeout(renderGraph, 120); }

function niceStep(range, maxT) {
    if (range <= 0 || !isFinite(range)) return 1;
    const rough = range / maxT, pow = Math.pow(10, Math.floor(Math.log10(rough)));
    for (const m of [1, 2, 5, 10]) if (m * pow >= rough) return m * pow;
    return pow * 10;
}

function drawGrid() {
    const W = _canvas.width, H = _canvas.height;
    const wxMin = toWX(0), wxMax = toWX(W), wyMin = toWY(H), wyMax = toWY(0);
    _ctx.clearRect(0, 0, W, H);
    const sx = niceStep(wxMax - wxMin, 10), sy = niceStep(wyMax - wyMin, 10);
    _ctx.strokeStyle = 'rgba(255,255,255,0.04)'; _ctx.lineWidth = 1;
    for (let x = Math.ceil(wxMin / sx) * sx; x <= wxMax; x += sx) { _ctx.beginPath(); _ctx.moveTo(toSX(x), 0); _ctx.lineTo(toSX(x), H); _ctx.stroke(); }
    for (let y = Math.ceil(wyMin / sy) * sy; y <= wyMax; y += sy) { _ctx.beginPath(); _ctx.moveTo(0, toSY(y)); _ctx.lineTo(W, toSY(y)); _ctx.stroke(); }
    _ctx.strokeStyle = 'rgba(255,255,255,0.22)'; _ctx.lineWidth = 1.5;
    const ax = toSX(0), ay = toSY(0);
    _ctx.beginPath(); _ctx.moveTo(ax, 0); _ctx.lineTo(ax, H); _ctx.stroke();
    _ctx.beginPath(); _ctx.moveTo(0, ay); _ctx.lineTo(W, ay); _ctx.stroke();
    _ctx.fillStyle = 'rgba(255,255,255,0.32)'; _ctx.font = "10px 'Inter',sans-serif";
    _ctx.textAlign = 'center'; _ctx.textBaseline = 'top';
    for (let x = Math.ceil(wxMin / sx) * sx; x <= wxMax; x += sx) {
        if (Math.abs(x) < sx * 0.01) continue;
        const lbl = Number.isInteger(Math.round(x * 1000) / 1000) ? Math.round(x) : parseFloat(x.toPrecision(3));
        _ctx.fillText(lbl, toSX(x), Math.min(H - 14, Math.max(4, ay + 4)));
    }
    _ctx.textAlign = 'right'; _ctx.textBaseline = 'middle';
    for (let y = Math.ceil(wyMin / sy) * sy; y <= wyMax; y += sy) {
        if (Math.abs(y) < sy * 0.01) continue;
        const lbl = Number.isInteger(Math.round(y * 1000) / 1000) ? Math.round(y) : parseFloat(y.toPrecision(3));
        _ctx.fillText(lbl, Math.min(W - 4, Math.max(26, ax - 4)), toSY(y));
    }
}

function evalAt(expr, xv, yv, tv, nv, thv) {
    const sc = mathScope({ x: xv || 0, y: yv || 0, t: tv || 0, n: nv || 0, theta: thv || 0, ..._varStore, ..._customFns });
    return math.evaluate(normalizeExpr(expr), sc);
}

function drawCurve(exprStr, color) {
    const raw = exprStr.trim(); if (!raw) return;
    const W = _canvas.width, H = _canvas.height;

    // ── POLAR: r = f(theta) ──────────────────────────────
    if (/^r\s*=/.test(raw)) {
        const rExpr = raw.replace(/^r\s*=\s*/, '');
        _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5;
        let started = false;
        for (let i = 0; i <= 3000; i++) {
            const theta = i / 3000 * 4 * Math.PI;
            let r; try { r = evalAt(rExpr, Math.cos(theta), Math.sin(theta), theta, 0, theta); } catch { started = false; continue; }
            if (!isFinite(r)) { started = false; continue; }
            const sx = toSX(r * Math.cos(theta)), sy = toSY(r * Math.sin(theta));
            if (!started) { _ctx.moveTo(sx, sy); started = true; } else _ctx.lineTo(sx, sy);
        }
        _ctx.stroke(); return;
    }

    // ── POINT: (x, y) ────────────────────────────────────
    if (/^\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)$/.test(raw)) {
        const m = raw.match(/\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)/);
        if (m) {
            const wx = parseFloat(m[1]), wy = parseFloat(m[2]);
            const px = toSX(wx), py = toSY(wy);
            _ctx.beginPath(); _ctx.arc(px, py, 7, 0, 2 * Math.PI);
            _ctx.fillStyle = color; _ctx.fill();
            _ctx.strokeStyle = 'rgba(255,255,255,0.8)'; _ctx.lineWidth = 1.5; _ctx.stroke();
            _points.push({ wx, wy, px, py, label: '(' + m[1] + ', ' + m[2] + ')', color });
        }
        return;
    }

    // ── POLYGON: polygon((x1,y1),(x2,y2),...) ────────────
    if (/^polygon\s*\(/i.test(raw)) {
        const pts = []; const re = /\(\s*(-?[\d.eE+\-]+)\s*,\s*(-?[\d.eE+\-]+)\s*\)/g; let m;
        while ((m = re.exec(raw)) !== null) pts.push([parseFloat(m[1]), parseFloat(m[2])]);
        if (pts.length >= 2) {
            _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5;
            pts.forEach(([x, y], i) => { i === 0 ? _ctx.moveTo(toSX(x), toSY(y)) : _ctx.lineTo(toSX(x), toSY(y)); });
            if (pts.length > 2) _ctx.closePath();
            _ctx.stroke();
            pts.forEach(([x, y]) => { _ctx.beginPath(); _ctx.arc(toSX(x), toSY(y), 5, 0, 2 * Math.PI); _ctx.fillStyle = color; _ctx.fill(); });
        }
        return;
    }

    // ── SLOPE FIELD: slopefield(expr) ────────────────────
    if (/^slopefield\s*\(/i.test(raw)) {
        const inner = raw.replace(/^slopefield\s*\(\s*/i, '').replace(/\)\s*$/, '');
        const wxMin = toWX(0), wxMax = toWX(W), wyMin = toWY(H), wyMax = toWY(0);
        _ctx.strokeStyle = color; _ctx.lineWidth = 1.3;
        for (let r = 0; r <= 18; r++)for (let c = 0; c <= 18; c++) {
            const x = wxMin + c * (wxMax - wxMin) / 18, y = wyMin + r * (wyMax - wyMin) / 18;
            let slope; try { slope = evalAt(inner, x, y); } catch { continue; }
            if (!isFinite(slope)) continue;
            const sx = toSX(x), sy = toSY(y), len = (wxMax - wxMin) / 18 * 0.38 * _view.scale;
            const ang = Math.atan(slope), dx = Math.cos(ang) * len, dy = Math.sin(ang) * len;
            _ctx.beginPath(); _ctx.moveTo(sx - dx, sy + dy); _ctx.lineTo(sx + dx, sy - dy); _ctx.stroke();
        }
        return;
    }

    // ── PARAMETRIC: (xExpr, yExpr) ───────────────────────
    const paramMatch = raw.match(/^\(\s*([^,]+)\s*,\s*([^)]+)\s*\)$/);
    if (paramMatch) {
        const xExpr = paramMatch[1].trim(), yExpr = paramMatch[2].trim();
        _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5;
        let started = false;
        for (let i = 0; i <= 2000; i++) {
            const t = -20 + i * 40 / 2000;
            let xv, yv; try { xv = evalAt(xExpr, 0, 0, t); yv = evalAt(yExpr, 0, 0, t); } catch { started = false; continue; }
            if (!isFinite(xv) || !isFinite(yv)) { started = false; continue; }
            const sx = toSX(xv), sy = toSY(yv);
            if (!started) { _ctx.moveTo(sx, sy); started = true; } else _ctx.lineTo(sx, sy);
        }
        _ctx.stroke(); return;
    }

    // ── IMPLICIT: F(x,y) = G(x,y) ────────────────────────
    const implMatch = raw.match(/^(.+)=(.+)$/);
    if (implMatch && !/^[yY]\s*=/.test(raw)) {
        const lhs = implMatch[1], rhs = implMatch[2];
        const step = 3, cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1;
        const grid = new Float32Array((cols + 1) * (rows + 1));
        for (let r = 0; r <= rows; r++)for (let c = 0; c <= cols; c++) {
            const x = toWX(c * step), y = toWY(r * step);
            let v = 0; try { v = evalAt(lhs, x, y) - evalAt(rhs, x, y); } catch { }
            grid[r * (cols + 1) + c] = isFinite(v) ? v : 0;
        }
        _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2;
        for (let r = 0; r < rows; r++)for (let c = 0; c < cols; c++) {
            const f00 = grid[r * (cols + 1) + c], f10 = grid[r * (cols + 1) + c + 1], f01 = grid[(r + 1) * (cols + 1) + c], f11 = grid[(r + 1) * (cols + 1) + c + 1];
            const cr = (a, b) => a * b < 0;
            const lp = (t0, t1, v0, v1) => t0 + (t1 - t0) * v0 / (v0 - v1);
            const pts = [];
            if (cr(f00, f10)) pts.push([lp(c, c + 1, f00, f10) * step, r * step]);
            if (cr(f10, f11)) pts.push([(c + 1) * step, lp(r, r + 1, f10, f11) * step]);
            if (cr(f01, f11)) pts.push([lp(c, c + 1, f01, f11) * step, (r + 1) * step]);
            if (cr(f00, f01)) pts.push([c * step, lp(r, r + 1, f00, f01) * step]);
            if (pts.length === 2) { _ctx.moveTo(pts[0][0], pts[0][1]); _ctx.lineTo(pts[1][0], pts[1][1]); }
        }
        _ctx.stroke(); return;
    }

    // ── EXPLICIT: y = f(x) ───────────────────────────────
    let expr = raw;
    if (/^[yY]\s*=/.test(expr)) expr = expr.replace(/^[yY]\s*=\s*/, '');
    _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5; _ctx.lineJoin = 'round';
    let started = false, prevSy = 0, prevY = null;
    for (let px = 0; px <= W; px++) {
        const x = toWX(px);
        let y; try { y = evalAt(expr, x); } catch { started = false; prevY = null; continue; }
        if (typeof y !== 'number' || isNaN(y)) { started = false; prevY = null; continue; }
        if (isFinite(y)) {
            const sy = toSY(y);
            if (started && prevY !== null && Math.abs(sy - prevSy) > H * 1.5) {
                // Asymptote
                _ctx.stroke();
                _ctx.save(); _ctx.strokeStyle = 'rgba(255,255,255,0.13)'; _ctx.setLineDash([4, 4]); _ctx.lineWidth = 1;
                _ctx.beginPath(); _ctx.moveTo(px, 0); _ctx.lineTo(px, H); _ctx.stroke();
                _ctx.restore();
                _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5; started = false;
            }
            if (!started) { _ctx.moveTo(px, sy); started = true; } else _ctx.lineTo(px, sy);
            prevSy = sy; prevY = y;
        } else {
            if (started) {
                _ctx.stroke();
                _ctx.save(); _ctx.strokeStyle = 'rgba(255,255,255,0.13)'; _ctx.setLineDash([4, 4]); _ctx.lineWidth = 1;
                _ctx.beginPath(); _ctx.moveTo(px, 0); _ctx.lineTo(px, H); _ctx.stroke();
                _ctx.restore();
                _ctx.beginPath(); _ctx.strokeStyle = color; _ctx.lineWidth = 2.5; started = false;
            }
            prevY = y;
        }
    }
    _ctx.stroke();
}

function renderGraph() {
    if (!_canvas || !_canvas.width || !_canvas.height) return;
    _points = [];
    drawGrid();
    _expressions.forEach(e => { if (e.visible && e.expr.trim()) drawCurve(e.expr, e.color); });
}

function gZoom(f) { _view.scale *= f; renderGraph(); }
function zoomFit() { _view = { cx: 0, cy: 0, scale: 60 }; renderGraph(); }
function resetView() { zoomFit(); } // overridden below to smooth

function smoothReset() {
    const s0 = { ..._view }, t0 = performance.now(), dur = 450;
    function step(now) {
        const p = Math.min(1, (now - t0) / dur), e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        _view.cx = s0.cx * (1 - e); _view.cy = s0.cy * (1 - e); _view.scale = s0.scale + (60 - s0.scale) * e;
        renderGraph();
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ── CONTOUR MAP ──────────────────────────────────────────────────────────────
let _contourTimer = null;
function scheduleContour() { clearTimeout(_contourTimer); _contourTimer = setTimeout(renderContour, 250); }
function renderContour() {
    if (!_canvas) return;
    const fStr = (document.getElementById('contourF') || {}).value || 'sin(x)*cos(y)';
    const nLevels = parseInt((document.getElementById('contourN') || {}).value) || 14;
    const scheme = (document.getElementById('contourScheme') || {}).value || 'cool';
    const W = _canvas.width, H = _canvas.height, step = 3;
    const cols = Math.ceil(W / step) + 1, rows = Math.ceil(H / step) + 1;
    const vals = new Float32Array((cols + 1) * (rows + 1));
    let minV = Infinity, maxV = -Infinity;
    for (let r = 0; r <= rows; r++)for (let c = 0; c <= cols; c++) {
        const x = toWX(c * step), y = toWY(r * step);
        let v = 0; try { v = math.evaluate(normalizeExpr(fStr), mathScope({ x, y })); } catch { }
        if (!isFinite(v)) v = 0; vals[r * (cols + 1) + c] = v;
        if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
    _ctx.clearRect(0, 0, W, H);
    // Colour fill
    const img = _ctx.createImageData(W, H);
    for (let py = 0; py < H; py++)for (let px = 0; px < W; px++) {
        const r = Math.min(Math.floor(py / step), rows), c = Math.min(Math.floor(px / step), cols);
        const t = (vals[r * (cols + 1) + c] - minV) / (maxV - minV + 1e-10);
        let R = 0, G = 0, B = 0;
        if (scheme === 'cool') { R = Math.round(50 + t * 200); G = Math.round(50 + (1 - t) * 150); B = Math.round(200 - t * 100); }
        else if (scheme === 'heat') { R = Math.round(t * 255); G = Math.round(t * t * 200); B = 0; }
        else { const ti = t * 255; R = Math.round(68 * (1 - t)); G = Math.round(1 + ti * 0.6); B = Math.round(84 + ti * 0.4); }
        const idx = (py * W + px) * 4; img.data[idx] = R; img.data[idx + 1] = G; img.data[idx + 2] = B; img.data[idx + 3] = 190;
    }
    _ctx.putImageData(img, 0, 0);
    // Contour lines
    const lvls = Array.from({ length: nLevels }, (_, i) => minV + (i + 1) * (maxV - minV) / (nLevels + 1));
    lvls.forEach(lv => {
        _ctx.beginPath(); _ctx.strokeStyle = 'rgba(255,255,255,0.45)'; _ctx.lineWidth = 1;
        for (let r = 0; r < rows; r++)for (let c = 0; c < cols; c++) {
            const f00 = vals[r * (cols + 1) + c], f10 = vals[r * (cols + 1) + c + 1], f01 = vals[(r + 1) * (cols + 1) + c], f11 = vals[(r + 1) * (cols + 1) + c + 1];
            const cr = (a, b) => ((a <= lv && b > lv) || (b <= lv && a > lv));
            const lp = (a, b) => (lv - a) / (b - a + 1e-15);
            const pts = [];
            if (cr(f00, f10)) pts.push([(c + lp(f00, f10)) * step, r * step]);
            if (cr(f10, f11)) pts.push([(c + 1) * step, (r + lp(f10, f11)) * step]);
            if (cr(f01, f11)) pts.push([(c + lp(f01, f11)) * step, (r + 1) * step]);
            if (cr(f00, f01)) pts.push([c * step, (r + lp(f00, f01)) * step]);
            if (pts.length === 2) { _ctx.moveTo(pts[0][0], pts[0][1]); _ctx.lineTo(pts[1][0], pts[1][1]); }
        }
        _ctx.stroke();
    });
    // Grid axes on top
    _ctx.save(); _ctx.globalAlpha = 0.3; drawGrid(); _ctx.restore();
}

// ── COMPLEX PLANE ─────────────────────────────────────────────────────────────
let _complexTimer = null;
function scheduleComplex() { clearTimeout(_complexTimer); _complexTimer = setTimeout(renderComplexPlane, 300); }
function renderComplexPlane() {
    if (!_canvas) return;
    const fStr = (document.getElementById('complexF') || {}).value || 'z^2';
    const W = _canvas.width, H = _canvas.height, step = 3;
    const img = _ctx.createImageData(W, H);
    for (let py = 0; py < H; py += step)for (let px = 0; px < W; px += step) {
        const re = toWX(px), im = toWY(py);
        let result; try { result = math.evaluate(normalizeExpr(fStr), mathScope({ z: math.complex(re, im), x: re, y: im })); } catch { continue; }
        const mag = math.abs ? math.abs(result) : Math.abs(result);
        const phase = (result && typeof result === 'object' && 'im' in result) ? Math.atan2(result.im, result.re) : (result >= 0 ? 0 : Math.PI);
        const hue = ((phase / Math.PI) + 1) * 180;
        const bright = Math.min(0.85, 0.25 + mag * 0.1);
        const h = hue / 60, s = 0.9, v = bright, ii = Math.floor(h) % 6, f2 = h - Math.floor(h);
        const p2 = v * (1 - s), q2 = v * (1 - s * f2), t2 = v * (1 - s * (1 - f2));
        let Rv = 0, Gv = 0, Bv = 0;
        if (ii === 0) { Rv = v; Gv = t2; Bv = p2; } else if (ii === 1) { Rv = q2; Gv = v; Bv = p2; }
        else if (ii === 2) { Rv = p2; Gv = v; Bv = t2; } else if (ii === 3) { Rv = p2; Gv = q2; Bv = v; }
        else if (ii === 4) { Rv = t2; Gv = p2; Bv = v; } else { Rv = v; Gv = p2; Bv = q2; }
        for (let dy = 0; dy < step && py + dy < H; dy++)for (let dx = 0; dx < step && px + dx < W; dx++) {
            const idx = ((py + dy) * W + (px + dx)) * 4;
            img.data[idx] = Rv * 255; img.data[idx + 1] = Gv * 255; img.data[idx + 2] = Bv * 255; img.data[idx + 3] = 255;
        }
    }
    _ctx.putImageData(img, 0, 0);
    _ctx.save(); _ctx.globalAlpha = 0.3; drawGrid(); _ctx.restore();
}

// ── MATRIX TRANSFORM ─────────────────────────────────────────────────────────
let _matTfTimer = null;
function scheduleMatTf() { clearTimeout(_matTfTimer); _matTfTimer = setTimeout(renderMatTf, 200); }
function applyMatPreset() {
    const presets = { identity: '1,0;0,1', scale2: '2,0;0,2', rot45: '0.707,-0.707;0.707,0.707', rot90: '0,-1;1,0', shearx: '1,1;0,1', sheary: '1,0;1,1', reflx: '1,0;0,-1', refly: '-1,0;0,1' };
    const p = (document.getElementById('matTfPreset') || {}).value;
    const inp = document.getElementById('matTfVal');
    if (inp) inp.value = presets[p] || '1,0;0,1';
    scheduleMatTf();
}
function renderMatTf() {
    if (!_canvas) return;
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height); drawGrid();
    const mStr = (document.getElementById('matTfVal') || {}).value || '1,0;0,1';
    let a = 1, b = 0, c = 0, d = 1;
    try { const rows = mStr.split(';').map(r => r.split(',').map(Number)); a = rows[0][0] || 0; b = rows[0][1] || 0; c = rows[1][0] || 0; d = rows[1][1] || 0; } catch { }
    const tw2 = (x, y) => ({ px: toSX(a * x + b * y), py: toSY(c * x + d * y) });
    // Original grid
    _ctx.strokeStyle = 'rgba(255,255,255,0.18)'; _ctx.lineWidth = 1;
    for (let i = -8; i <= 8; i++) {
        _ctx.beginPath(); _ctx.moveTo(toSX(i), toSY(-8)); _ctx.lineTo(toSX(i), toSY(8)); _ctx.stroke();
        _ctx.beginPath(); _ctx.moveTo(toSX(-8), toSY(i)); _ctx.lineTo(toSX(8), toSY(i)); _ctx.stroke();
    }
    // Transformed grid
    _ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i++) {
        _ctx.strokeStyle = 'rgba(94,160,255,0.55)'; _ctx.beginPath();
        for (let j = -8; j <= 8; j++) { const { px, py } = tw2(i, j); j === -8 ? _ctx.moveTo(px, py) : _ctx.lineTo(px, py); }
        _ctx.stroke();
        _ctx.strokeStyle = 'rgba(255,107,107,0.55)'; _ctx.beginPath();
        for (let j = -8; j <= 8; j++) { const { px, py } = tw2(j, i); j === -8 ? _ctx.moveTo(px, py) : _ctx.lineTo(px, py); }
        _ctx.stroke();
    }
    // Basis vectors
    _ctx.lineWidth = 3;
    _ctx.strokeStyle = 'rgba(94,160,255,0.9)'; _ctx.beginPath(); _ctx.moveTo(toSX(0), toSY(0)); _ctx.lineTo(toSX(1), toSY(0)); _ctx.stroke();
    _ctx.strokeStyle = 'rgba(255,107,107,0.9)'; _ctx.beginPath(); _ctx.moveTo(toSX(0), toSY(0)); _ctx.lineTo(toSX(0), toSY(1)); _ctx.stroke();
    const e1t = tw2(1, 0), e2t = tw2(0, 1);
    _ctx.strokeStyle = '#5ea0ff'; _ctx.lineWidth = 3; _ctx.beginPath(); _ctx.moveTo(toSX(0), toSY(0)); _ctx.lineTo(e1t.px, e1t.py); _ctx.stroke();
    _ctx.strokeStyle = '#ff6b6b'; _ctx.beginPath(); _ctx.moveTo(toSX(0), toSY(0)); _ctx.lineTo(e2t.px, e2t.py); _ctx.stroke();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    _canvas = document.getElementById('gc');
    if (!_canvas) return;
    _ctx = _canvas.getContext('2d');
    const tooltip = document.getElementById('coordTip');
    const ptTip = document.getElementById('ptTip');

    function resize() { const w = _canvas.parentElement; _canvas.width = w.clientWidth; _canvas.height = w.clientHeight; renderGraph(); }
    new ResizeObserver(resize).observe(_canvas.parentElement);

    // Pan
    let drag = false, ds = {}, vs = {};
    _canvas.addEventListener('mousedown', e => { drag = true; ds = { x: e.clientX, y: e.clientY }; vs = { cx: _view.cx, cy: _view.cy }; _canvas.style.cursor = 'grabbing'; });
    window.addEventListener('mouseup', () => { drag = false; _canvas.style.cursor = 'crosshair'; });
    _canvas.addEventListener('mousemove', e => {
        if (drag) { _view.cx = vs.cx - (e.clientX - ds.x) / _view.scale; _view.cy = vs.cy + (e.clientY - ds.y) / _view.scale; renderGraph(); }
        const rect = _canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const wx = toWX(mx), wy = toWY(my);
        tooltip.textContent = 'x = ' + wx.toFixed(4) + ',  y = ' + wy.toFixed(4);
        tooltip.classList.add('vis');
        // Check proximity to points
        let nearest = null, nearDist = 20;
        _points.forEach(pt => {
            const d = Math.hypot(pt.px - mx, pt.py - my);
            if (d < nearDist) { nearDist = d; nearest = pt; }
        });
        if (nearest) {
            ptTip.style.display = 'block';
            ptTip.style.left = (nearest.px + 12) + 'px';
            ptTip.style.top = (nearest.py - 12) + 'px';
            ptTip.style.borderColor = nearest.color;
            ptTip.textContent = nearest.label;
        } else { ptTip.style.display = 'none'; }
    });
    _canvas.addEventListener('mouseleave', () => { tooltip.classList.remove('vis'); ptTip.style.display = 'none'; });
    _canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const f = e.deltaY > 0 ? 1 / 1.12 : 1.12;
        const rect = _canvas.getBoundingClientRect(), mx = e.clientX - rect.left, my = e.clientY - rect.top;
        const wx = toWX(mx), wy = toWY(my);
        _view.scale *= f;
        _view.cx = wx - (mx - _canvas.width / 2) / _view.scale;
        _view.cy = wy + (my - _canvas.height / 2) / _view.scale;
        renderGraph();
    }, { passive: false });

    addExpr('sin(x)');
    addExpr('x^2/4');
});

// ════════════════════════════════════════════════
// SEARCH
// ════════════════════════════════════════════════
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = '';
    if (!q) { searchResults.style.display = 'none'; return; }
    let n = 0;
    document.querySelectorAll('.searchable').forEach(card => {
        const hay = ((card.dataset.title || '') + ' ' + (card.dataset.keywords || '') + ' ' + card.innerText).toLowerCase();
        if (!hay.includes(q)) return; n++;
        const item = document.createElement('div'); item.className = 'sri';
        item.innerHTML = '<h4>' + (card.dataset.title || '') + '</h4>';
        item.addEventListener('click', () => {
            const pid = card.dataset.page;
            if (pid) { openPage(pid); searchResults.style.display = 'none'; return; }
            const cid = card.dataset.conceptPage;
            if (cid) {
                const content = CONCEPTS[cid];
                if (content) { openPage('concept-page'); document.getElementById('conceptContent').innerHTML = content; renderMath(document.getElementById('conceptContent')); searchResults.style.display = 'none'; return; }
            }
            // No definition: try to navigate to the page of that category
            const cat = card.dataset.category;
            if (cat) { openPage(cat); searchResults.style.display = 'none'; return; }
            searchResults.style.display = 'none';
        });
        searchResults.appendChild(item);
    });
    if (!n) searchResults.innerHTML = '<div class="sri"><p>No results found.</p></div>';
    searchResults.style.display = 'block';
});
document.addEventListener('click', e => { if (!e.target.closest('.searchbar')) searchResults.style.display = 'none'; });

function renderMath(el) {
    if (window.renderMathInElement) renderMathInElement(el, { delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }] });
}

// ════════════════════════════════════════════════
// DATA: FORMULAS
// ════════════════════════════════════════════════
const FORMULAS = [
    {
        title: "Quadratic Formula", kw: "quadratic roots polynomial algebra discriminant", cat: "algebra", tag: "Algebra", latex: "\\displaystyle x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
        detail: "<h2>Quadratic Formula</h2><div class='formula-box'>\\[ \\displaystyle x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a} \\]</div><p style='margin-top:14px;line-height:1.9'>Solves \\(ax^2+bx+c=0\\). The <strong>discriminant</strong> \\(\\Delta=b^2-4ac\\): positive \\(\\Rightarrow\\) two real roots, zero \\(\\Rightarrow\\) one repeated root, negative \\(\\Rightarrow\\) two complex conjugate roots.</p>"
    },
    {
        title: "Pythagorean Theorem", kw: "pythagorean right triangle geometry hypotenuse", cat: "geometry", tag: "Geometry", latex: "\\displaystyle a^2+b^2=c^2",
        detail: "<h2>Pythagorean Theorem</h2><div class='formula-box'>\\[ \\displaystyle a^2+b^2=c^2 \\]</div><p style='margin-top:14px;line-height:1.9'>In a right triangle, the square of the hypotenuse \\(c\\) equals the sum of squares of the two legs \\(a\\) and \\(b\\).</p>"
    },
    {
        title: "Euler's Identity", kw: "euler identity complex exponential beautiful", cat: "complex-analysis", tag: "Complex Analysis", latex: "\\displaystyle e^{i\\pi}+1=0",
        detail: "<h2>Euler's Identity</h2><div class='formula-box'>\\[ \\displaystyle e^{i\\pi}+1=0 \\]</div><p style='margin-top:14px;line-height:1.9'>Combines the five most fundamental constants: \\(e\\), \\(i\\), \\(\\pi\\), \\(1\\), \\(0\\). Follows directly from Euler's formula \\(e^{i\\theta}=\\cos\\theta+i\\sin\\theta\\) at \\(\\theta=\\pi\\).</p>"
    },
    {
        title: "Euler's Formula", kw: "euler formula complex polar cis exponential", cat: "complex-analysis", tag: "Complex Analysis", latex: "\\displaystyle e^{i\\theta}=\\cos\\theta+i\\sin\\theta",
        detail: "<h2>Euler's Formula</h2><div class='formula-box'>\\[ \\displaystyle e^{i\\theta}=\\cos\\theta+i\\sin\\theta \\]</div><p style='margin-top:14px;line-height:1.9'>The complex exponential traces the unit circle as \\(\\theta\\) varies. Foundation of Fourier analysis, signal processing, and quantum mechanics.</p>"
    },
    {
        title: "Binomial Theorem", kw: "binomial expansion combinatorics pascal choose", cat: "algebra", tag: "Algebra", latex: "\\displaystyle (x+y)^n=\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}y^k",
        detail: "<h2>Binomial Theorem</h2><div class='formula-box'>\\[ \\displaystyle (x+y)^n=\\sum_{k=0}^{n}\\binom{n}{k}x^{n-k}y^k \\]</div><p style='margin-top:14px;line-height:1.9'>The binomial coefficients \\(\\binom{n}{k}=\\frac{n!}{k!(n-k)!}\\) form Pascal's triangle and satisfy \\(\\binom{n}{k}=\\binom{n-1}{k-1}+\\binom{n-1}{k}\\).</p>"
    },
    {
        title: "Fundamental Theorem of Calculus", kw: "ftc calculus integral derivative antiderivative", cat: "calculus", tag: "Calculus", latex: "\\displaystyle \\int_a^b f(x)\\,dx = F(b)-F(a)",
        detail: "<h2>Fundamental Theorem of Calculus</h2><div class='formula-box'>\\[ \\displaystyle \\int_a^b f(x)\\,dx = F(b)-F(a) \\]</div><p style='margin-top:14px;line-height:1.9'>If \\(F'=f\\), the definite integral equals the net change in \\(F\\). Bridges differential and integral calculus.</p>"
    },
    {
        title: "Taylor Series", kw: "taylor series expansion maclaurin power approximation", cat: "analysis", tag: "Analysis", latex: "\\displaystyle f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n",
        detail: "<h2>Taylor Series</h2><div class='formula-box'>\\[ \\displaystyle f(x)=\\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^n \\]</div><p style='margin-top:14px;line-height:1.9'>Represents a smooth function as an infinite polynomial centered at \\(a\\). At \\(a=0\\) this is the Maclaurin series.</p>"
    },
    {
        title: "Stokes' Theorem", kw: "stokes surface integral curl vector calculus", cat: "vector-calculus", tag: "Vector Calculus", latex: "\\displaystyle \\iint_S(\\nabla\\times F)\\cdot dS=\\oint_{\\partial S}F\\cdot dr",
        detail: "<h2>Stokes' Theorem</h2><div class='formula-box'>\\[ \\displaystyle \\iint_S(\\nabla\\times F)\\cdot dS=\\oint_{\\partial S}F\\cdot dr \\]</div><p style='margin-top:14px;line-height:1.9'>Generalises the FTC to surfaces: the surface integral of curl equals the line integral around the boundary. A special case of the generalised Stokes theorem \\(\\int_M d\\omega=\\int_{\\partial M}\\omega\\).</p>"
    },
    {
        title: "Divergence Theorem", kw: "gauss divergence flux surface volume", cat: "vector-calculus", tag: "Vector Calculus", latex: "\\displaystyle \\oiint_S F\\cdot dS=\\iiint_V(\\nabla\\cdot F)\\,dV",
        detail: "<h2>Divergence Theorem</h2><div class='formula-box'>\\[ \\displaystyle \\oiint_S F\\cdot dS=\\iiint_V(\\nabla\\cdot F)\\,dV \\]</div><p style='margin-top:14px;line-height:1.9'>Total outward flux through a closed surface equals the integral of divergence over the enclosed volume.</p>"
    },
    {
        title: "Green's Theorem", kw: "green line integral double area curl 2d", cat: "vector-calculus", tag: "Vector Calculus", latex: "\\displaystyle \\oint_C(P\\,dx+Q\\,dy)=\\iint_D\\!\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA",
        detail: "<h2>Green's Theorem</h2><div class='formula-box'>\\[ \\displaystyle \\oint_C(P\\,dx+Q\\,dy)=\\iint_D\\!\\left(\\frac{\\partial Q}{\\partial x}-\\frac{\\partial P}{\\partial y}\\right)dA \\]</div><p style='margin-top:14px;line-height:1.9'>Relates a line integral around a closed curve to a double integral over the enclosed region. Special case of Stokes' theorem in 2D.</p>"
    },
    {
        title: "Bayes' Theorem", kw: "bayes probability conditional posterior prior likelihood", cat: "probability", tag: "Probability", latex: "\\displaystyle P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)}",
        detail: "<h2>Bayes' Theorem</h2><div class='formula-box'>\\[ \\displaystyle P(A\\mid B)=\\frac{P(B\\mid A)P(A)}{P(B)} \\]</div><p style='margin-top:14px;line-height:1.9'>Updates the probability of hypothesis \\(A\\) given evidence \\(B\\). Foundation of Bayesian statistics.</p>"
    },
    {
        title: "Gaussian Integral", kw: "gaussian integral probability normal bell curve", cat: "analysis", tag: "Analysis", latex: "\\displaystyle \\int_{-\\infty}^{\\infty}e^{-x^2}dx=\\sqrt{\\pi}",
        detail: "<h2>Gaussian Integral</h2><div class='formula-box'>\\[ \\displaystyle \\int_{-\\infty}^{\\infty}e^{-x^2}dx=\\sqrt{\\pi} \\]</div><p style='margin-top:14px;line-height:1.9'>Proved via \\(\\bigl(\\int e^{-x^2}dx\\bigr)^2=\\iint e^{-(x^2+y^2)}dA\\) converted to polar coordinates.</p>"
    },
    {
        title: "Prime Number Theorem", kw: "prime number theorem distribution pi asymptotic", cat: "number-theory", tag: "Number Theory", latex: "\\displaystyle \\pi(x)\\sim\\frac{x}{\\ln x}",
        detail: "<h2>Prime Number Theorem</h2><div class='formula-box'>\\[ \\displaystyle \\pi(x)\\sim\\frac{x}{\\ln x} \\]</div><p style='margin-top:14px;line-height:1.9'>The count of primes up to \\(x\\) grows asymptotically as \\(x/\\ln x\\). Proved by Hadamard and de la Vallée-Poussin (1896).</p>"
    },
    {
        title: "Euler's Product Formula", kw: "euler product primes zeta riemann", cat: "number-theory", tag: "Number Theory", latex: "\\displaystyle \\zeta(s)=\\prod_{p\\text{ prime}}\\frac{1}{1-p^{-s}}",
        detail: "<h2>Euler's Product Formula</h2><div class='formula-box'>\\[ \\displaystyle \\zeta(s)=\\sum_{n=1}^{\\infty}\\frac{1}{n^s}=\\prod_{p\\text{ prime}}\\frac{1}{1-p^{-s}} \\]</div><p style='margin-top:14px;line-height:1.9'>Connects the Riemann zeta function to a product over all primes via unique prime factorisation. Note: each factor is \\((1-p^{-s})^{-1}\\), not \\(p^{-s}\\).</p>"
    },
    {
        title: "Cauchy-Schwarz Inequality", kw: "cauchy schwarz inequality inner product vectors", cat: "linear-algebra", tag: "Linear Algebra", latex: "\\displaystyle |\\langle u,v\\rangle|^2\\le\\langle u,u\\rangle\\cdot\\langle v,v\\rangle",
        detail: "<h2>Cauchy-Schwarz Inequality</h2><div class='formula-box'>\\[ \\displaystyle |\\langle u,v\\rangle|^2\\le\\langle u,u\\rangle\\cdot\\langle v,v\\rangle \\]</div><p style='margin-top:14px;line-height:1.9'>Fundamental inequality in inner product spaces. For vectors: \\(|u\\cdot v|\\le|u||v|\\). Equality iff \\(u\\) and \\(v\\) are linearly dependent.</p>"
    },
    {
        title: "Stirling's Approximation", kw: "stirling approximation factorial large n", cat: "number-theory", tag: "Number Theory", latex: "\\displaystyle n!\\approx\\sqrt{2\\pi n}\\left(\\frac{n}{e}\\right)^n",
        detail: "<h2>Stirling's Approximation</h2><div class='formula-box'>\\[ \\displaystyle n!\\approx\\sqrt{2\\pi n}\\left(\\frac{n}{e}\\right)^n \\]</div><p style='margin-top:14px;line-height:1.9'>Asymptotic approximation for large factorials. Relative error \\(O(1/n)\\). Essential in statistical mechanics and combinatorics.</p>"
    },
    {
        title: "Fourier Transform", kw: "fourier transform signal frequency domain F t", cat: "analysis", tag: "Analysis", latex: "\\displaystyle \\hat{F}(\\xi)=\\int_{-\\infty}^{\\infty} F(t)\\,e^{-2\\pi i t\\xi}\\,dt",
        detail: "<h2>Fourier Transform</h2><div class='formula-box'>\\[ \\displaystyle \\hat{F}(\\xi)=\\int_{-\\infty}^{\\infty} F(t)\\,e^{-2\\pi i t\\xi}\\,dt \\]</div><p style='margin-top:14px;line-height:1.9'>Decomposes a signal \\(F(t)\\) into its frequency components. The inverse is \\(F(t)=\\int\\hat{F}(\\xi)e^{2\\pi it\\xi}d\\xi\\). Some conventions use \\(j\\) instead of \\(i\\).</p>"
    },
    {
        title: "Law of Cosines", kw: "law cosines triangle angle trigonometry", cat: "geometry", tag: "Geometry", latex: "\\displaystyle c^2=a^2+b^2-2ab\\cos C",
        detail: "<h2>Law of Cosines</h2><div class='formula-box'>\\[ \\displaystyle c^2=a^2+b^2-2ab\\cos C \\]</div><p style='margin-top:14px;line-height:1.9'>Generalisation of the Pythagorean theorem. At \\(C=90^\\circ\\), \\(\\cos C=0\\) and we recover \\(a^2+b^2=c^2\\).</p>"
    },
];

// TAG → TOPIC PAGE MAPPING
const TAG_TO_TOPIC = {
    'algebra': 'topics', 'geometry': 'topics', 'calculus': 'topics', 'analysis': 'topics',
    'number-theory': 'topics', 'probability': 'topics', 'vector-calculus': 'topics',
    'complex-analysis': 'topics', 'linear-algebra': 'topics',
};

function buildFormulas() {
    const grid = document.getElementById('formulasGrid');
    FORMULAS.forEach(f => {
        const c = document.createElement('div');
        c.className = 'card searchable';
        c.dataset.title = f.title; c.dataset.keywords = f.kw; c.dataset.conceptPage = 'formula-' + f.title.replace(/\s+/g, '-').toLowerCase();
        const tagCls = f.cat.includes('calculus') || f.cat.includes('analysis') ? 'green' : f.cat.includes('theory') || f.cat.includes('number') ? 'purple' : f.cat.includes('vector') || f.cat.includes('geometry') ? 'orange' : '';
        c.innerHTML = '<h2>' + f.title + '</h2><span class="tag ' + tagCls + '" onclick="event.stopPropagation();openPage(\'topics\')" title="Go to ' + f.tag + ' in Topics">' + f.tag + '</span><div class="fn-formula">\\[' + f.latex + '\\]</div>';
        c.style.cursor = 'pointer';
        c.addEventListener('click', () => {
            document.getElementById('formulaDetailContent').innerHTML = f.detail;
            document.getElementById('formulaDetail').style.display = 'block';
            renderMath(document.getElementById('formulaDetailContent'));
            document.getElementById('formulaDetail').scrollIntoView({ behavior: 'smooth' });
        });
        grid.appendChild(c);
    });
    renderMath(grid);
}

// ════════════════════════════════════════════════
// DATA: FUNCTIONS
// ════════════════════════════════════════════════
const FUNCTIONS = [
    { name: "Sine", cat: "Trigonometric", kw: "sin sine wave periodic", latex: "\\sin x", desc: "Ratio of opposite to hypotenuse. Period \\(2\\pi\\). Taylor: \\(\\displaystyle\\sin x=x-\\frac{x^3}{6}+\\frac{x^5}{120}-\\cdots\\)" },
    { name: "Cosine", cat: "Trigonometric", kw: "cos cosine wave", latex: "\\cos x", desc: "Ratio of adjacent to hypotenuse. \\(\\cos x=\\sin(x+\\pi/2)\\)." },
    { name: "Tangent", cat: "Trigonometric", kw: "tan tangent ratio", latex: "\\tan x=\\frac{\\sin x}{\\cos x}", desc: "Poles at \\(x=\\pi/2+n\\pi\\). Returns \\(\\pm\\infty\\) (not NaN) at poles." },
    { name: "Cosecant", cat: "Trigonometric", kw: "csc cosecant reciprocal", latex: "\\csc x=\\frac{1}{\\sin x}", desc: "Reciprocal of sine. Poles at multiples of \\(\\pi\\)." },
    { name: "Secant", cat: "Trigonometric", kw: "sec secant reciprocal", latex: "\\sec x=\\frac{1}{\\cos x}", desc: "Reciprocal of cosine." },
    { name: "Cotangent", cat: "Trigonometric", kw: "cot cotangent reciprocal", latex: "\\cot x=\\frac{\\cos x}{\\sin x}", desc: "Reciprocal of tangent." },
    { name: "Arcsine", cat: "Trigonometric", kw: "arcsin asin inverse trig", latex: "\\arcsin x", desc: "Inverse sine. Range \\([-\\pi/2,\\pi/2]\\), domain \\([-1,1]\\). Returns NaN for \\(|x|>1\\)." },
    { name: "Arccosine", cat: "Trigonometric", kw: "arccos acos inverse trig", latex: "\\arccos x", desc: "Inverse cosine. Range \\([0,\\pi]\\), domain \\([-1,1]\\)." },
    { name: "Arctangent", cat: "Trigonometric", kw: "arctan atan inverse trig", latex: "\\arctan x", desc: "Inverse tangent. Range \\((-\\pi/2,\\pi/2)\\)." },
    { name: "Arccotangent", cat: "Trigonometric", kw: "arccot acot inverse cotangent", latex: "\\operatorname{arccot}\\,x=\\frac{\\pi}{2}-\\arctan x", desc: "Inverse cotangent. Range \\((0,\\pi)\\)." },
    { name: "Arcsecant", cat: "Trigonometric", kw: "arcsec asec inverse secant", latex: "\\operatorname{arcsec}\\,x=\\arccos\\!\\left(\\tfrac{1}{x}\\right)", desc: "Inverse secant. Domain \\(|x|\\ge 1\\)." },
    { name: "Arccosecant", cat: "Trigonometric", kw: "arccsc acsc inverse cosecant", latex: "\\operatorname{arccsc}\\,x=\\arcsin\\!\\left(\\tfrac{1}{x}\\right)", desc: "Inverse cosecant. Domain \\(|x|\\ge 1\\)." },
    { name: "Two-argument Arctangent", cat: "Trigonometric", kw: "atan2 angle quadrant", latex: "\\operatorname{atan2}(y,x)", desc: "Angle of point \\((x,y)\\) from positive x-axis. Returns \\((-\\pi,\\pi]\\), handling all quadrants correctly." },
    { name: "Versine", cat: "Trigonometric", kw: "versine haversine navigation", latex: "\\operatorname{versin}\\theta=1-\\cos\\theta", desc: "Historical function used in navigation." },
    { name: "Haversine", cat: "Trigonometric", kw: "haversine sphere great circle distance", latex: "\\operatorname{hav}\\theta=\\sin^2\\!\\left(\\tfrac{\\theta}{2}\\right)", desc: "Central to the haversine formula for great-circle distance on a sphere." },
    { name: "Coversine", cat: "Trigonometric", kw: "coversine", latex: "\\operatorname{coversin}\\theta=1-\\sin\\theta", desc: "Trigonometric function \\(1-\\sin\\theta\\)." },
    { name: "Gudermannian", cat: "Trigonometric", kw: "gudermannian gd hyperbolic circular", latex: "\\operatorname{gd}(x)=\\arctan(\\sinh x)", desc: "Links circular and hyperbolic trigonometry without complex numbers." },
    { name: "Sinh", cat: "Hyperbolic", kw: "sinh hyperbolic sine", latex: "\\sinh x=\\frac{e^x-e^{-x}}{2}", desc: "Hyperbolic sine. Odd function. Taylor: \\(\\displaystyle x+\\frac{x^3}{6}+\\frac{x^5}{120}+\\cdots\\)" },
    { name: "Cosh", cat: "Hyperbolic", kw: "cosh hyperbolic cosine catenary", latex: "\\cosh x=\\frac{e^x+e^{-x}}{2}", desc: "Hyperbolic cosine. Even function. Shape of a hanging chain (catenary)." },
    { name: "Tanh", cat: "Hyperbolic", kw: "tanh hyperbolic tangent sigmoid", latex: "\\tanh x=\\frac{\\sinh x}{\\cosh x}", desc: "Hyperbolic tangent. Range \\((-1,1)\\). Used as an activation function in neural networks." },
    { name: "Sech", cat: "Hyperbolic", kw: "sech hyperbolic secant", latex: "\\operatorname{sech}\\,x=\\frac{1}{\\cosh x}", desc: "Reciprocal of cosh. Bell-shaped, used in soliton theory." },
    { name: "Csch", cat: "Hyperbolic", kw: "csch hyperbolic cosecant", latex: "\\operatorname{csch}\\,x=\\frac{1}{\\sinh x}", desc: "Reciprocal of sinh. Pole at \\(x=0\\)." },
    { name: "Coth", cat: "Hyperbolic", kw: "coth hyperbolic cotangent", latex: "\\coth x=\\frac{\\cosh x}{\\sinh x}", desc: "Reciprocal of tanh. Pole at \\(x=0\\)." },
    { name: "Arsinh", cat: "Hyperbolic", kw: "arcsinh asinh inverse hyperbolic", latex: "\\operatorname{arsinh}\\,x=\\ln\\!\\left(x+\\sqrt{x^2+1}\\right)", desc: "Inverse hyperbolic sine. Domain \\(\\mathbb{R}\\)." },
    { name: "Arcosh", cat: "Hyperbolic", kw: "arccosh acosh inverse hyperbolic", latex: "\\operatorname{arcosh}\\,x=\\ln\\!\\left(x+\\sqrt{x^2-1}\\right)", desc: "Inverse hyperbolic cosine. Domain \\(x\\ge 1\\)." },
    { name: "Artanh", cat: "Hyperbolic", kw: "arctanh atanh inverse hyperbolic", latex: "\\operatorname{artanh}\\,x=\\frac{1}{2}\\ln\\frac{1+x}{1-x}", desc: "Inverse hyperbolic tangent. Domain \\(|x|<1\\)." },
    { name: "Arsech", cat: "Hyperbolic", kw: "arcsech asech inverse hyperbolic secant", latex: "\\operatorname{arsech}\\,x=\\operatorname{arcosh}\\!\\left(\\tfrac{1}{x}\\right)", desc: "Inverse hyperbolic secant. Domain \\((0,1]\\)." },
    { name: "Arcsch", cat: "Hyperbolic", kw: "arccsch acsch inverse hyperbolic cosecant", latex: "\\operatorname{arcsch}\\,x=\\operatorname{arsinh}\\!\\left(\\tfrac{1}{x}\\right)", desc: "Inverse hyperbolic cosecant." },
    { name: "Arcoth", cat: "Hyperbolic", kw: "arccoth acoth inverse hyperbolic cotangent", latex: "\\operatorname{arcoth}\\,x=\\frac{1}{2}\\ln\\frac{x+1}{x-1}", desc: "Inverse hyperbolic cotangent. Domain \\(|x|>1\\)." },
    { name: "Gamma Function", cat: "Special Functions", kw: "gamma factorial generalization", latex: "\\Gamma(z)=\\int_0^{\\infty}t^{z-1}e^{-t}\\,dt", desc: "Extension of factorial: \\(\\Gamma(n+1)=n!\\). Meromorphic on \\(\\mathbb{C}\\) with poles at non-positive integers." },
    { name: "Digamma Function", cat: "Special Functions", kw: "digamma psi logarithmic derivative gamma", latex: "\\psi(z)=\\frac{\\Gamma'(z)}{\\Gamma(z)}", desc: "Logarithmic derivative of the gamma function. \\(\\psi(n+1)=H_n-\\gamma\\) where \\(H_n\\) is the \\(n\\)-th harmonic number." },
    { name: "Beta Function", cat: "Special Functions", kw: "beta euler B a b integral", latex: "B(a,b)=\\frac{\\Gamma(a)\\Gamma(b)}{\\Gamma(a+b)}=\\int_0^1 t^{a-1}(1-t)^{b-1}\\,dt", desc: "Symmetric function of two arguments. Related to the gamma function." },
    { name: "Riemann Zeta Function", cat: "Special Functions", kw: "zeta riemann prime series analytic", latex: "\\zeta(s)=\\sum_{n=1}^{\\infty}\\frac{1}{n^s}=\\prod_p\\frac{1}{1-p^{-s}}", desc: "Fundamental in analytic number theory. Analytically continued to \\(\\mathbb{C}\\setminus\\{1\\}\\). The Riemann Hypothesis concerns the location of its non-trivial zeros." },
    { name: "Error Function", cat: "Special Functions", kw: "erf error gaussian integral probability", latex: "\\operatorname{erf}(x)=\\frac{2}{\\sqrt{\\pi}}\\int_0^x e^{-t^2}\\,dt", desc: "Integral of Gaussian. \\(\\operatorname{erf}(\\infty)=1\\). Used in probability and heat transfer. Correct for negative values: \\(\\operatorname{erf}(-x)=-\\operatorname{erf}(x)\\)." },
    { name: "Lambert W Function", cat: "Special Functions", kw: "lambert W product logarithm inverse", latex: "W(x)\\,e^{W(x)}=x", desc: "Inverse of \\(xe^x\\). Principal branch \\(W_0\\ge -1\\) defined for \\(x\\ge -1/e\\)." },
    { name: "Normalized Sinc", cat: "Special Functions", kw: "sinc nsinc normalized cardinal sine", latex: "\\operatorname{sinc}(x)=\\frac{\\sin(\\pi x)}{\\pi x},\\quad \\operatorname{sinc}(0)=1", desc: "Zeroes at all non-zero integers. Standard form in signal processing and information theory." },
    { name: "Unnormalized Sinc", cat: "Special Functions", kw: "sincu sinc unnormalized cardinal sine", latex: "\\operatorname{sinc}(x)=\\frac{\\sin x}{x},\\quad \\operatorname{sinc}(0)=1", desc: "Zeroes at non-zero multiples of \\(\\pi\\). Used in mathematics." },
    { name: "Cis Function", cat: "Special Functions", kw: "cis polar complex exponential euler", latex: "\\operatorname{cis}\\theta=e^{i\\theta}=\\cos\\theta+i\\sin\\theta", desc: "Shorthand for the complex exponential on the unit circle." },
    { name: "Heaviside Step", cat: "Special Functions", kw: "heaviside step unit function", latex: "H(x)=\\begin{cases}0&x<0\\\\1&x\\ge0\\end{cases}", desc: "Unit step function. Distributional derivative is the Dirac delta \\(\\delta(x)\\)." },
    { name: "Dirac Delta", cat: "Special Functions", kw: "dirac delta impulse distribution", latex: "\\int_{-\\infty}^{\\infty}f(x)\\,\\delta(x)\\,dx=f(0)", desc: "Generalized function (Schwartz distribution). Not a true function — defined by its action under integration." },
    { name: "Factorial", cat: "Factorials", kw: "factorial n! product integers", latex: "n!=\\prod_{k=1}^n k=\\Gamma(n+1)", desc: "Product of positive integers to \\(n\\). Defined for all complex \\(z\\) except non-positive integers via the gamma function." },
    { name: "Double Factorial", cat: "Factorials", kw: "double factorial n!!", latex: "n!!=n\\cdot(n-2)\\cdots", desc: "Product of integers with the same parity as \\(n\\), down to 1 or 2." },
    { name: "Rising Factorial", cat: "Factorials", kw: "rising factorial pochhammer symbol", latex: "(x)_n=x(x+1)\\cdots(x+n-1)=\\frac{\\Gamma(x+n)}{\\Gamma(x)}", desc: "Pochhammer symbol. Used in hypergeometric series." },
    { name: "Subfactorial", cat: "Factorials", kw: "subfactorial derangement !n", latex: "!n=n!\\sum_{k=0}^n\\frac{(-1)^k}{k!}", desc: "Number of derangements (permutations with no fixed points) of \\(n\\) elements." },
    { name: "Primorial", cat: "Factorials", kw: "primorial prime product p#", latex: "p_n\\#=\\prod_{k=1}^n p_k", desc: "Product of the first \\(n\\) primes." },
    { name: "Superfactorial", cat: "Factorials", kw: "superfactorial sf product factorials", latex: "\\operatorname{sf}(n)=\\prod_{k=1}^n k!", desc: "Product of the first \\(n\\) factorials." },
    { name: "Hyperfactorial", cat: "Factorials", kw: "hyperfactorial H power product", latex: "H(n)=\\prod_{k=1}^n k^k", desc: "Product \\(1^1\\cdot2^2\\cdots n^n\\)." },
    { name: "GCD", cat: "Number Theory", kw: "gcd greatest common divisor euclid", latex: "\\gcd(a,b)", desc: "Greatest common divisor, computed via the Euclidean algorithm. \\(\\gcd(a,0)=a\\)." },
    { name: "LCM", cat: "Number Theory", kw: "lcm least common multiple", latex: "\\operatorname{lcm}(a,b)=\\frac{|ab|}{\\gcd(a,b)}", desc: "Least common multiple." },
    { name: "Euler Totient", cat: "Number Theory", kw: "euler totient phi carmichael", latex: "\\varphi(n)=n\\prod_{p\\mid n}\\!\\left(1-\\tfrac{1}{p}\\right)", desc: "Counts integers up to \\(n\\) coprime to \\(n\\). \\(\\varphi(p)=p-1\\) for prime \\(p\\)." },
    { name: "Möbius Function", cat: "Number Theory", kw: "mobius function squarefree inversion", latex: "\\mu(n)=\\begin{cases}1&n=1\\\\(-1)^k&\\text{squarefree, }k\\text{ prime factors}\\\\0&\\text{otherwise}\\end{cases}", desc: "Fundamental in the Möbius inversion formula." },
    { name: "Fourier Transform", cat: "Transforms", kw: "fourier transform signal frequency", latex: "\\hat{F}(\\xi)=\\int_{-\\infty}^{\\infty}F(t)\\,e^{-2\\pi it\\xi}\\,dt", desc: "Decomposes a time-domain signal \\(F(t)\\) into frequency components \\(\\hat{F}(\\xi)\\)." },
    { name: "Laplace Transform", cat: "Transforms", kw: "laplace transform differential equations s-domain", latex: "\\mathcal{L}\\{F\\}(s)=\\int_0^{\\infty}F(t)\\,e^{-st}\\,dt", desc: "Converts linear ODEs to algebraic equations in the \\(s\\)-domain." },
    { name: "Gradient", cat: "Vector Calculus", kw: "gradient nabla del vector field", latex: "\\nabla f=\\left(\\frac{\\partial f}{\\partial x},\\frac{\\partial f}{\\partial y},\\frac{\\partial f}{\\partial z}\\right)", desc: "Points in the direction of steepest ascent of a scalar field." },
    { name: "Divergence", cat: "Vector Calculus", kw: "divergence nabla dot flux", latex: "\\nabla\\cdot F=\\frac{\\partial P}{\\partial x}+\\frac{\\partial Q}{\\partial y}+\\frac{\\partial R}{\\partial z}", desc: "Measures outward flux density. Zero divergence ⟹ incompressible flow." },
    { name: "Curl", cat: "Vector Calculus", kw: "curl rotation nabla cross", latex: "\\nabla\\times F", desc: "Measures local rotation of a vector field. Zero curl ⟹ conservative field." },
    { name: "Laplacian", cat: "Vector Calculus", kw: "laplacian nabla squared del pde", latex: "\\nabla^2 f=\\frac{\\partial^2 f}{\\partial x^2}+\\frac{\\partial^2 f}{\\partial y^2}+\\frac{\\partial^2 f}{\\partial z^2}", desc: "Trace of the Hessian. Central in the heat equation \\(u_t=k\\nabla^2 u\\) and Laplace equation \\(\\nabla^2\\varphi=0\\)." },
    { name: "Normal Distribution PDF", cat: "Statistical", kw: "normal gaussian pdf bell curve probability", latex: "f(x)=\\frac{1}{\\sigma\\sqrt{2\\pi}}\\exp\\!\\left(-\\frac{(x-\\mu)^2}{2\\sigma^2}\\right)", desc: "Bell-curve probability density characterised by mean \\(\\mu\\) and standard deviation \\(\\sigma\\)." },
    { name: "Logistic / Sigmoid", cat: "Statistical", kw: "logistic sigmoid activation neural network", latex: "\\sigma(x)=\\frac{1}{1+e^{-x}}", desc: "S-shaped curve mapping \\(\\mathbb{R}\\to(0,1)\\). Used in logistic regression and neural network activations." },
    { name: "Sign Function", cat: "Elementary", kw: "sign sgn signum", latex: "\\operatorname{sgn}(x)=\\begin{cases}-1&x<0\\\\0&x=0\\\\1&x>0\\end{cases}", desc: "Returns the sign of a real number." },
    { name: "Floor Function", cat: "Elementary", kw: "floor greatest integer", latex: "\\lfloor x\\rfloor", desc: "Greatest integer \\(\\le x\\). Implemented with near-integer snap at \\(10^{-10}\\) threshold." },
    { name: "Ceiling Function", cat: "Elementary", kw: "ceiling least integer", latex: "\\lceil x\\rceil", desc: "Least integer \\(\\ge x\\)." },
    { name: "Sine Integral", cat: "Special Functions", kw: "Si sine integral", latex: "\\operatorname{Si}(x)=\\int_0^x\\frac{\\sin t}{t}\\,dt", desc: "Defined for all real \\(x\\). Used in optics and signal theory." },
    { name: "Cosine Integral", cat: "Special Functions", kw: "Ci cosine integral", latex: "\\operatorname{Ci}(x)=\\gamma+\\ln x+\\int_0^x\\frac{\\cos t-1}{t}\\,dt", desc: "Defined for \\(x>0\\). \\(\\gamma\\) is the Euler–Mascheroni constant." },
];

const FN_CATEGORIES = ['All', 'Trigonometric', 'Hyperbolic', 'Special Functions', 'Factorials', 'Vector Calculus', 'Transforms', 'Number Theory', 'Statistical', 'Elementary'];

function buildFunctions() {
    const filtersEl = document.getElementById('fnFilters');
    const grid = document.getElementById('fnGrid');
    FN_CATEGORIES.forEach((cat, i) => {
        const b = document.createElement('button');
        b.className = 'ob' + (i === 0 ? ' va' : '');
        b.textContent = cat; b.dataset.cat = cat;
        b.style.fontFamily = "'Inter',sans-serif";
        b.addEventListener('click', () => {
            document.querySelectorAll('#fnFilters .ob').forEach(x => { x.classList.remove('va'); x.style.background = ''; x.style.borderColor = ''; x.style.color = ''; });
            b.classList.add('va'); b.style.background = 'rgba(94,160,255,.18)'; b.style.borderColor = 'rgba(94,160,255,.35)'; b.style.color = 'var(--accent)';
            grid.querySelectorAll('.fn-card').forEach(c => { c.style.display = (cat === 'All' || c.dataset.cat === cat) ? '' : 'none'; });
        });
        filtersEl.appendChild(b);
    });
    FUNCTIONS.forEach(f => {
        const c = document.createElement('div');
        c.className = 'card fn-card searchable';
        c.dataset.cat = f.cat; c.dataset.title = f.name; c.dataset.keywords = f.kw;
        const catSlug = f.cat.toLowerCase().replace(/\s+/g, '-');
        const tagCls = f.cat.includes('Trig') ? '' : 'fn_cat.includes("Hyp")?"":"';
        c.innerHTML = '<h2>' + f.name + '</h2><span class="tag" onclick="event.stopPropagation();openPage(\'topics\')" title="Go to ' + f.cat + ' in Topics">' + f.cat + '</span><div class="fn-formula">\\[\\displaystyle ' + f.latex + '\\]</div><p>' + f.desc + '</p>';
        grid.appendChild(c);
    });
    renderMath(grid);
}

// ════════════════════════════════════════════════
// DATA: TOPICS
// ════════════════════════════════════════════════
const TOPICS = [
    { title: "Real Analysis", kw: "limits continuity differentiability riemann integration sequences series metric spaces", desc: "Rigorous foundations of calculus: limits, continuity, differentiation, Riemann integration, sequences and series, metric spaces, Banach and Hilbert spaces." },
    { title: "Complex Analysis", kw: "holomorphic cauchy riemann residue conformal riemann surface", desc: "Holomorphic functions, Cauchy-Riemann equations, residue theorem, conformal maps, analytic continuation, Riemann surfaces, and the Riemann mapping theorem." },
    { title: "Abstract Algebra", kw: "groups rings fields modules galois representation", desc: "Groups, rings, fields, modules, homomorphisms, Galois theory, representation theory, commutative algebra, and homological algebra." },
    { title: "Linear Algebra", kw: "vector spaces matrices eigenvalues inner product svd spectral", desc: "Vector spaces, matrices, determinants, eigenvalues and eigenvectors, inner products, singular value decomposition, and the spectral theorem." },
    { title: "Topology", kw: "open sets compactness homotopy fundamental group homology", desc: "Open sets, continuity, compactness, connectedness, homotopy groups, covering spaces, singular homology, and cohomology." },
    { title: "Differential Geometry", kw: "manifolds curvature geodesics lie groups differential forms", desc: "Manifolds, tangent bundles, Riemannian metrics, curvature, geodesics, Lie groups, differential forms, and connections." },
    { title: "Number Theory", kw: "primes modular arithmetic diophantine l-functions elliptic curves", desc: "Prime numbers, modular arithmetic, Diophantine equations, L-functions, elliptic curves, and the Riemann Hypothesis." },
    { title: "Probability Theory", kw: "probability spaces random variables expectation clt martingales stochastic", desc: "Probability spaces, random variables, expectation, central limit theorem, law of large numbers, martingales, and stochastic processes." },
    { title: "Statistics", kw: "estimation hypothesis bayesian regression anova information theory", desc: "Parameter estimation, hypothesis testing, Bayesian inference, regression, ANOVA, and information theory." },
    { title: "Functional Analysis", kw: "banach hilbert operators spectral distributions sobolev", desc: "Banach and Hilbert spaces, bounded linear operators, spectral theory, distributions, and Sobolev spaces." },
    { title: "Partial Differential Equations", kw: "wave heat laplace elliptic sobolev weak solutions characteristics", desc: "Classification of PDEs, wave/heat/Laplace equations, characteristics, variational methods, and weak solutions." },
    { title: "Ordinary Differential Equations", kw: "existence uniqueness phase portraits stability lyapunov bifurcation", desc: "Existence and uniqueness theorems, phase portraits, stability, Lyapunov theory, and bifurcation theory." },
    { title: "Combinatorics", kw: "counting generating functions graph theory ramsey extremal", desc: "Enumeration, generating functions, graph theory, Ramsey theory, and extremal combinatorics." },
    { title: "Set Theory", kw: "zfc cardinals ordinals continuum hypothesis forcing", desc: "ZFC axioms, cardinal and ordinal arithmetic, the continuum hypothesis, and Cohen's method of forcing." },
    { title: "Mathematical Logic", kw: "propositional predicate godel incompleteness model proof theory", desc: "Propositional and predicate logic, completeness theorems, Gödel's incompleteness theorems, model theory, and proof theory." },
    { title: "Category Theory", kw: "categories functors natural transformations limits adjunctions monads", desc: "Categories, functors, natural transformations, limits and colimits, adjunctions, monads, and topos theory." },
    { title: "Algebraic Topology", kw: "cw complexes homology cohomology homotopy spectral sequences", desc: "CW complexes, singular homology and cohomology, homotopy groups, fibrations, spectral sequences, and K-theory." },
    { title: "Harmonic Analysis", kw: "fourier series wavelets hardy spaces littlewood paley", desc: "Fourier series and integrals, wavelets, Littlewood-Paley theory, Hardy spaces, and pseudo-differential operators." },
    { title: "Dynamical Systems", kw: "flows fixed points chaos ergodic entropy strange attractors", desc: "Flows, fixed points, stability, chaos, ergodic theory, entropy, and strange attractors." },
    { title: "Numerical Analysis", kw: "approximation quadrature finite elements iterative solvers error", desc: "Approximation theory, numerical integration, finite element methods, iterative linear solvers, and error analysis." },
    { title: "Mathematical Physics", kw: "classical quantum general relativity gauge string theory", desc: "Classical mechanics, quantum mechanics (Schrödinger/Heisenberg), general relativity, gauge theories, and string theory." },
    { title: "Algebraic Geometry", kw: "varieties schemes sheaves cohomology moduli abelian", desc: "Algebraic varieties, schemes, sheaves, cohomology, moduli spaces, and abelian varieties." },
    { title: "Measure Theory", kw: "sigma algebras lebesgue integration lp spaces radon nikodym", desc: "σ-algebras, Lebesgue measure and integration, L^p spaces, Radon-Nikodym theorem, and ergodic theory." },
    { title: "Graph Theory", kw: "connectivity planarity coloring matchings flows spectral random", desc: "Connectivity, planarity, chromatic theory, matchings, network flows, spectral graph theory, and random graphs." },
    { title: "Information Theory", kw: "entropy mutual information channel capacity coding compression", desc: "Shannon entropy, mutual information, channel capacity, source coding, error-correcting codes, and Kolmogorov complexity." },
    { title: "Game Theory", kw: "nash equilibria zero sum mechanism design evolutionary", desc: "Nash equilibria, zero-sum games, mechanism design, evolutionary game theory, and cooperative games." },
    { title: "Cryptography", kw: "rsa elliptic curve hash lattice zero knowledge", desc: "RSA, elliptic curve cryptography, hash functions, lattice-based cryptography, and zero-knowledge proofs." },
    { title: "Calculus", kw: "derivatives integrals limits chain rule product quotient", desc: "Differential and integral calculus: limits, derivatives (chain/product/quotient rules), integrals, and the fundamental theorem." },
    { title: "Vector Calculus", kw: "gradient divergence curl laplacian stokes greens divergence theorem", desc: "Gradient, divergence, curl, Laplacian, line/surface integrals, Stokes' theorem, and the divergence theorem." },
];

function buildTopics() {
    const grid = document.getElementById('topicsGrid');
    TOPICS.forEach(t => {
        const c = document.createElement('div'); c.className = 'card linked-card searchable';
        c.dataset.title = t.title; c.dataset.keywords = t.kw;
        c.innerHTML = '<h2>' + t.title + '</h2><p style="margin-top:8px">' + t.desc + '</p>';
        c.addEventListener('click', () => {
            document.getElementById('topicDetailContent').innerHTML = '<h2>' + t.title + '</h2><p style="margin-top:14px;line-height:1.9;color:var(--muted)">' + t.desc + '</p>';
            document.getElementById('topicDetail').style.display = 'block';
            document.getElementById('topicDetail').scrollIntoView({ behavior: 'smooth' });
        });
        grid.appendChild(c);
    });
}

// ════════════════════════════════════════════════
// DATA: CONSTANTS
// ════════════════════════════════════════════════
const CONSTANTS = [
    { sym: "\\pi", name: "Pi", val: "3.14159265358979…", desc: "Ratio of circumference to diameter. Transcendental (Lindemann, 1882)." },
    { sym: "e", name: "Euler's Number", val: "2.71828182845904…", desc: "Base of natural logarithm. lim(1+1/n)ⁿ. Transcendental (Hermite, 1873)." },
    { sym: "\\varphi", name: "Golden Ratio", val: "1.61803398874989…", desc: "(1+√5)/2. Unique positive root of x²=x+1." },
    { sym: "\\gamma", name: "Euler–Mascheroni", val: "0.57721566490153…", desc: "lim(Hₙ − ln n). Unknown if irrational." },
    { sym: "\\sqrt{2}", name: "Pythagoras' Constant", val: "1.41421356237309…", desc: "First proved irrational. Diagonal of the unit square." },
    { sym: "\\sqrt{3}", name: "Theodorus' Constant", val: "1.73205080756887…", desc: "Height of unit equilateral triangle." },
    { sym: "\\ln 2", name: "Natural Log of 2", val: "0.69314718055994…", desc: "Sum of the alternating harmonic series." },
    { sym: "G", name: "Catalan's Constant", val: "0.91596559417721…", desc: "β(2) = 1−1/9+1/25−… Unknown if irrational." },
    { sym: "\\zeta(3)", name: "Apéry's Constant", val: "1.20205690315959…", desc: "Σ 1/n³. Proved irrational by Apéry (1979)." },
    { sym: "\\Omega", name: "Omega Constant", val: "0.56714329040978…", desc: "Unique solution to We^W=1. W(1)." },
    { sym: "\\delta", name: "Feigenbaum δ", val: "4.66920160910299…", desc: "Universal constant in period-doubling route to chaos." },
    { sym: "\\alpha_F", name: "Feigenbaum α", val: "2.50290787509589…", desc: "Second Feigenbaum constant." },
    { sym: "K", name: "Khinchin's Constant", val: "2.68545200106530…", desc: "Geometric mean of continued-fraction coefficients for almost all reals." },
    { sym: "\\tau", name: "Tau", val: "6.28318530717958…", desc: "2π. The full-turn constant." },
    { sym: "i", name: "Imaginary Unit", val: "√(−1)", desc: "Fundamental unit of complex numbers. i²=−1." },
    { sym: "\\aleph_0", name: "Aleph-null", val: "Card(ℕ)", desc: "Cardinality of the natural numbers; smallest infinite cardinal." },
    { sym: "c", name: "Speed of Light", val: "299 792 458 m/s", desc: "Exact by SI definition. Upper bound for causal influence." },
    { sym: "\\hbar", name: "Reduced Planck", val: "1.0546×10⁻³⁴ J·s", desc: "h/(2π). Fundamental constant of quantum mechanics." },
    { sym: "k_B", name: "Boltzmann Constant", val: "1.3807×10⁻²³ J/K", desc: "Exact by 2019 SI. Links temperature to thermal energy." },
    { sym: "G", name: "Gravitational Constant", val: "6.674×10⁻¹¹ N·m²/kg²", desc: "Newton's constant of universal gravitation." },
];

function buildConstants() {
    const grid = document.getElementById('constGrid');
    CONSTANTS.forEach((c, idx) => {
        const el = document.createElement('div'); el.className = 'cc searchable';
        el.dataset.title = c.name; el.dataset.keywords = c.name.toLowerCase() + ' constant ' + c.val;
        el.innerHTML = '<div class="cc-sym">\\(' + c.sym + '\\)</div><div class="cc-name">' + c.name + '</div><div class="cc-val">' + c.val + '</div><div class="cc-desc">' + c.desc + '</div>';
        el.addEventListener('click', () => {
            document.getElementById('constDetailContent').innerHTML = '<h2>' + c.name + '</h2><div class="formula-box">\\[\\displaystyle ' + c.sym + ' \\approx ' + c.val + '\\]</div><p style="margin-top:14px;line-height:1.9;color:var(--muted)">' + c.desc + '</p>';
            document.getElementById('constDetail').style.display = 'block';
            renderMath(document.getElementById('constDetailContent'));
            document.getElementById('constDetail').scrollIntoView({ behavior: 'smooth' });
        });
        grid.appendChild(el);
    });
    renderMath(grid);
}

// ════════════════════════════════════════════════
// DATA: MATHEMATICIANS
// ════════════════════════════════════════════════
const MATHEMATICIANS = [
    { name: "Euclid", dates: "c. 300 BC", fields: "Geometry, Number Theory", desc: "Father of geometry. Author of the <em>Elements</em>, systematizing deductive mathematics for 2000+ years. Proved the infinitude of primes." },
    { name: "Archimedes", dates: "c. 287–212 BC", fields: "Geometry, Pre-calculus", desc: "Computed π to high accuracy via exhaustion, found areas and volumes — anticipating integral calculus by 1800 years." },
    { name: "Carl Friedrich Gauss", dates: "1777–1855", fields: "Number Theory, Statistics, Geometry", desc: "'Prince of Mathematics.' Quadratic reciprocity, the normal distribution, non-Euclidean geometry, and fundamental work in magnetism and astronomy." },
    { name: "Leonhard Euler", dates: "1707–1783", fields: "Analysis, Number Theory, Graph Theory", desc: "Most prolific mathematician. Introduced notation π, e, i, Σ, f(x). Euler's identity, graph theory foundations, and hundreds of theorems across all areas." },
    { name: "Bernhard Riemann", dates: "1826–1866", fields: "Analysis, Geometry, Number Theory", desc: "Riemann hypothesis, Riemannian geometry (foundation of general relativity), Riemann integral, and complex analysis." },
    { name: "Isaac Newton", dates: "1643–1727", fields: "Calculus, Physics", desc: "Co-invented calculus (method of fluxions), laws of motion, universal gravitation, and optics." },
    { name: "Gottfried Leibniz", dates: "1646–1716", fields: "Calculus, Logic", desc: "Co-invented calculus with modern notation (dx, ∫), binary arithmetic, and formal logic." },
    { name: "Henri Poincaré", dates: "1854–1912", fields: "Topology, Dynamical Systems", desc: "Poincaré conjecture, chaos theory, algebraic topology foundations, and partial contributions to special relativity." },
    { name: "David Hilbert", dates: "1862–1943", fields: "Algebra, Formalism, Analysis", desc: "Hilbert's 23 problems (1900), Hilbert spaces, formalist program, and axiomatisation of geometry." },
    { name: "Emmy Noether", dates: "1882–1935", fields: "Abstract Algebra", desc: "Noether's theorem linking symmetry to conservation laws. Revolutionised abstract algebra with her work on rings, fields, and ideals." },
    { name: "Srinivasa Ramanujan", dates: "1887–1920", fields: "Number Theory, Series", desc: "Extraordinary intuition. Mock theta functions, partition theory, Rogers–Ramanujan identities, taxicab numbers." },
    { name: "Kurt Gödel", dates: "1906–1978", fields: "Logic", desc: "Incompleteness theorems: no consistent, sufficiently powerful axiomatic system can prove its own consistency." },
    { name: "Alan Turing", dates: "1912–1954", fields: "Computation, Logic", desc: "Turing machine, computability theory, breaking the Enigma cipher, and foundations of computer science and AI." },
    { name: "Alexander Grothendieck", dates: "1928–2014", fields: "Algebraic Geometry", desc: "Revolutionised algebraic geometry via schemes, étale cohomology, K-theory, and topos theory." },
    { name: "Terence Tao", dates: "1975–present", fields: "Analysis, Number Theory", desc: "Green–Tao theorem (primes in arithmetic progressions), compressed sensing, and the Erdős discrepancy problem. Fields Medal 2006." },
    { name: "Andrew Wiles", dates: "1953–present", fields: "Number Theory", desc: "Proved Fermat's Last Theorem (1995) via modular elliptic curves and the Langlands program." },
    { name: "Maryam Mirzakhani", dates: "1977–2017", fields: "Geometry, Dynamics", desc: "First woman Fields Medalist (2014). Dynamics and geometry on moduli spaces of Riemann surfaces." },
    { name: "John von Neumann", dates: "1903–1957", fields: "Foundations, Physics, CS", desc: "Von Neumann algebras, quantum mechanics formalisation, game theory, and the stored-program computer architecture." },
];

function buildMathematicians() {
    const grid = document.getElementById('mathsGrid');
    MATHEMATICIANS.forEach(m => {
        const c = document.createElement('div'); c.className = 'card linked-card searchable';
        c.dataset.title = m.name; c.dataset.keywords = m.name.toLowerCase() + ' ' + m.fields.toLowerCase() + ' ' + m.dates;
        c.innerHTML = '<h2>' + m.name + '</h2><p style="color:var(--muted);font-size:.8rem;margin-bottom:8px">' + m.dates + '</p><p style="font-size:.8rem;color:var(--accent);margin-bottom:8px">' + m.fields + '</p><p>' + m.desc + '</p>';
        c.addEventListener('click', () => {
            document.getElementById('mathDetailContent').innerHTML = '<h2>' + m.name + '</h2><p style="color:var(--muted);font-size:.85rem;margin-bottom:6px">' + m.dates + ' &nbsp;|&nbsp; ' + m.fields + '</p><p style="margin-top:10px;line-height:1.9">' + m.desc + '</p>';
            document.getElementById('mathDetail').style.display = 'block';
            document.getElementById('mathDetail').scrollIntoView({ behavior: 'smooth' });
        });
        grid.appendChild(c);
    });
}

// ════════════════════════════════════════════════
// DATA: RESEARCH — Unsolved Problems
// ════════════════════════════════════════════════
const RESEARCH = [
    {
        title: "Riemann Hypothesis", kw: "riemann zeta zeros critical line millennium", color: "var(--accent)", border: "rgba(94,160,255,.3)", desc: "All non-trivial zeros of ζ(s) lie on Re(s)=½. Clay Millennium Prize Problem.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>Proposed by Riemann (1859). Over 10 trillion non-trivial zeros verified — all on Re(s)=½. No proof exists.</p><div class='formula-box'>\\[\\displaystyle\\zeta(s)=\\sum_{n=1}^\\infty\\frac{1}{n^s},\\quad\\text{all non-trivial zeros satisfy }\\operatorname{Re}(s)=\\tfrac{1}{2}\\]</div><p style='margin-top:12px;line-height:1.9'>A proof would imply optimal error bounds in the prime number theorem: \\(\\pi(x)=\\operatorname{Li}(x)+O(\\sqrt{x}\\ln x)\\).</p>"
    },
    {
        title: "P vs NP", kw: "P NP complexity computation millennium", color: "#34d399", border: "rgba(52,211,153,.3)", desc: "Is every efficiently verifiable problem also efficiently solvable? Clay Millennium Prize.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>The central open problem in theoretical computer science.</p><div class='formula-box'>\\[\\displaystyle\\text{Does }P=NP?\\]</div><p style='margin-top:12px;line-height:1.9'><strong>P</strong>: decidable in polynomial time. <strong>NP</strong>: verifiable in polynomial time. Most experts believe P≠NP, but no proof exists in either direction. A proof of P=NP would break most public-key cryptography.</p>"
    },
    {
        title: "Birch & Swinnerton-Dyer Conjecture", kw: "birch swinnerton dyer elliptic curves L function rank millennium", color: "#a78bfa", border: "rgba(167,139,250,.3)", desc: "The rank of an elliptic curve's rational points equals the order of vanishing of its L-function at s=1.",
        content: "<div class='formula-box'>\\[\\displaystyle\\operatorname{ord}_{s=1}L(E,s)=\\operatorname{rank}(E(\\mathbb{Q}))\\]</div><p style='margin-top:12px;line-height:1.9'>Proved for rank 0 and 1 in special cases (Coates–Wiles, Kolyvagin). The full conjecture is open. Clay Millennium Prize Problem.</p>"
    },
    {
        title: "Navier–Stokes Existence & Smoothness", kw: "navier stokes fluid dynamics existence smoothness millennium", color: "#fb923c", border: "rgba(251,146,60,.3)", desc: "Do smooth solutions to the 3D Navier–Stokes equations always exist? Clay Millennium Prize.",
        content: "<div class='formula-box'>\\[\\displaystyle\\frac{\\partial u}{\\partial t}+(u\\cdot\\nabla)u=-\\nabla p+\\nu\\nabla^2 u+f\\]</div><p style='margin-top:12px;line-height:1.9'>In 3D, whether smooth initial conditions always produce a smooth global solution is unknown. Blow-up may occur. The 2D case is solved.</p>"
    },
    {
        title: "Hodge Conjecture", kw: "hodge conjecture algebraic geometry cohomology", color: "#f472b6", border: "rgba(244,114,182,.3)", desc: "On a complex projective manifold, every Hodge class is a rational linear combination of cohomology classes of algebraic cycles.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>Clay Millennium Prize Problem. Proved for \\(H^0\\), \\(H^{2n}\\), and some special cases.</p><div class='formula-box'>\\[\\displaystyle H^{2k}(X,\\mathbb{Q})\\cap H^{k,k}(X)=?\\text{ algebraic}\\]</div>"
    },
    {
        title: "Yang–Mills Existence & Mass Gap", kw: "yang mills existence mass gap quantum field theory millennium", color: "#38bdf8", border: "rgba(56,189,248,.3)", desc: "Does Yang–Mills theory exist rigorously and does it have a mass gap?",
        content: "<p style='line-height:1.9'>Clay Millennium Prize Problem. The existence of a rigorous quantum Yang–Mills theory in 4D and a proof that it has a positive mass gap (lowest energy excitation is strictly positive) are both open.</p>"
    },
    {
        title: "Goldbach's Conjecture", kw: "goldbach conjecture prime even number sum", color: "#ffe66d", border: "rgba(255,230,109,.3)", desc: "Every even integer greater than 2 is the sum of two primes.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>Proposed in 1742. Verified computationally up to 4×10¹⁸. Related results: Chen (1966) proved every sufficiently large even integer is the sum of a prime and a product of at most two primes.</p><div class='formula-box'>\\[\\displaystyle\\forall n\\ge 2,\\;2n=p+q\\text{ for primes }p,q\\]</div>"
    },
    {
        title: "Twin Prime Conjecture", kw: "twin prime conjecture infinite prime pairs", color: "#5ea0ff", border: "rgba(94,160,255,.3)", desc: "There are infinitely many primes p such that p+2 is also prime.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>Known twin prime pairs: (3,5), (5,7), (11,13), (17,19),… Bounded gaps result (Yitang Zhang, 2013): infinitely many primes separated by at most 246 (Polymath project). Full conjecture open.</p><div class='formula-box'>\\[\\displaystyle\\exists^\\infty p:\\;p+2\\text{ is prime}\\]</div>"
    },
    {
        title: "Collatz Conjecture", kw: "collatz conjecture 3n+1 halting", color: "#4ecdc4", border: "rgba(78,205,196,.3)", desc: "Starting from any positive integer, the sequence n→n/2 (even) or n→3n+1 (odd) always reaches 1.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>Verified for all integers up to 2⁶⁸. Erdős said 'Mathematics is not yet ready for such problems.'</p><div class='formula-box'>\\[\\displaystyle f(n)=\\begin{cases}n/2&n\\text{ even}\\\\3n+1&n\\text{ odd}\\end{cases}\\]</div>"
    },
    {
        title: "Langlands Program", kw: "langlands automorphic forms number theory representation galois", color: "#a78bfa", border: "rgba(167,139,250,.3)", desc: "A vast web of conjectures unifying number theory, representation theory, and harmonic analysis.",
        content: "<p style='line-height:1.9'>Proposed by Langlands (1967). Called a 'grand unified theory of mathematics.' Fermat's Last Theorem (Wiles, 1995) was a special case. The geometric Langlands conjecture was recently proved (Fargues–Scholze, 2024). The full program remains open.</p>"
    },
    {
        title: "abc Conjecture", kw: "abc conjecture number theory radical", color: "#fb923c", border: "rgba(251,146,60,.3)", desc: "For coprime a+b=c, the radical rad(abc) is almost always larger than c.",
        content: "<div class='formula-box'>\\[\\displaystyle c<\\operatorname{rad}(abc)^{1+\\varepsilon}\\text{ for all }\\varepsilon>0\\text{ (finitely many exceptions)}\\]</div><p style='margin-top:12px;line-height:1.9'>Implies Fermat's Last Theorem, Mordell conjecture, and many other results. Mochizuki claims a proof via inter-universal Teichmüller theory (2012), but the mathematical community has not reached consensus.</p>"
    },
    {
        title: "Erdős Discrepancy Problem", kw: "erdos discrepancy sequence combinatorics", color: "#34d399", border: "rgba(52,211,153,.3)", desc: "Proved by Tao (2015): every completely multiplicative ±1 sequence has unbounded partial sums along arithmetic progressions.",
        content: "<p style='line-height:1.9'>Posed by Erdős in the 1930s, solved by Terence Tao (2015) using correlation results related to the Elliott conjecture on multiplicative functions.</p>"
    },
    {
        title: "Existence of Odd Perfect Numbers", kw: "odd perfect number divisors sigma", color: "#ffe66d", border: "rgba(255,230,109,.3)", desc: "No odd perfect number has ever been found. It is unknown whether one exists.",
        content: "<p style='line-height:1.9;margin-bottom:14px'>A perfect number equals the sum of its proper divisors: \\(\\sigma(n)=2n\\). All known perfect numbers are even (related to Mersenne primes). Any odd perfect number must exceed \\(10^{1500}\\) and have at least 101 prime factors.</p>"
    },
    {
        title: "Szemerédi's Theorem Bounds", kw: "szemeredi arithmetic progressions primes combinatorics", color: "#38bdf8", border: "rgba(56,189,248,.3)", desc: "The exact quantitative bounds in Szemerédi's theorem on arithmetic progressions remain open.",
        content: "<p style='line-height:1.9'>Szemerédi (1975): any subset of integers with positive upper density contains arithmetic progressions of every length. The quantitative bounds (how large a subset is needed) are far from optimal and remain an active area of research.</p>"
    },
];

function buildResearch() {
    const list = document.getElementById('researchList');
    RESEARCH.forEach(r => {
        const b = document.createElement('button'); b.className = 'rbtn searchable';
        b.dataset.title = r.title; b.dataset.keywords = r.kw;
        b.innerHTML = '<h3>' + r.title + '</h3><p>' + r.desc + '</p>';
        b.style.borderColor = r.border;
        b.addEventListener('click', () => openResearch(r));
        list.appendChild(b);
    });
}

function openResearch(r) {
    document.getElementById('researchList').style.display = 'none';
    const view = document.getElementById('researchArticleView');
    view.classList.add('vis');
    document.getElementById('researchContent').innerHTML = '<div class="card" style="border-color:' + r.border + '"><h2 style="color:' + r.color + ';font-size:1.4rem;margin-bottom:14px">' + r.title + '</h2>' + r.content + '</div>';
    renderMath(document.getElementById('researchContent'));
}
function closeResearch() {
    document.getElementById('researchList').style.display = '';
    document.getElementById('researchArticleView').classList.remove('vis');
}

// ════════════════════════════════════════════════
// CONCEPT PAGES
// ════════════════════════════════════════════════
const CONCEPTS = {};
FORMULAS.forEach(f => { CONCEPTS['formula-' + f.title.replace(/\s+/g, '-').toLowerCase()] = f.detail; });

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    buildFormulas();
    buildFunctions();
    buildTopics();
    buildConstants();
    buildMathematicians();
    buildResearch();
    updateCalcUI();
    updateMatUI();
    updateVecUI();
    setTimeout(() => { renderMathInElement(document.body, { delimiters: [{ left: "\\(", right: "\\)", display: false }, { left: "\\[", right: "\\]", display: true }] }); }, 200);
});