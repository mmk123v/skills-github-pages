// js/script.js — 精简与优化的交互脚本

// 元素信息表（可扩展）
const ELEMENT_DATA = {
  hydrogen: '氢（H）：原子序数 1，是最轻的元素，常以双原子分子 H₂ 存在，广泛参与酸碱与有机反应。',
  sodium: '钠（Na）：原子序数 11，碱金属，易失去一个电子形成 Na⁺，在水中与水反应并释放氢气。',
  chlorine: '氯（Cl）：原子序数 17，卤素，常以 Cl⁻ 形式存在于溶液中，具有强氧化性（气态 Cl₂ 有毒）。',
  oxygen: '氧（O）：原子序数 8，非金属元素，是地壳中含量较高的元素，参与呼吸和燃烧。',
  copper: '铜（Cu）：原子序数 29，过渡金属，常见价态为 Cu⁺/Cu²⁺，许多无机沉淀和配合物与铜有关。',
  barium: '钡（Ba）：原子序数 56，碱土金属，Ba²⁺ 可与 SO₄²⁻ 形成难溶的 BaSO₄ 沉淀。',
  silver: '银（Ag）：原子序数 47，过渡金属，Ag⁺ 可与卤素离子形成难溶沉淀（如 AgCl）。'
};

// 元素元数据：用于面板标题显示（中文名 + 符号 + 可选序数）
const ELEMENT_META = {
  hydrogen: { cn: '氢', symbol: 'H', number: 1 },
  sodium: { cn: '钠', symbol: 'Na', number: 11 },
  chlorine: { cn: '氯', symbol: 'Cl', number: 17 },
  oxygen: { cn: '氧', symbol: 'O', number: 8 },
  copper: { cn: '铜', symbol: 'Cu', number: 29 },
  barium: { cn: '钡', symbol: 'Ba', number: 56 },
  silver: { cn: '银', symbol: 'Ag', number: 47 }
};

// 显示元素信息（非阻塞的提示替代 alert）
// 元素信息侧边面板（替代原来的 toast 用于元素信息）
function ensureElementInfoPanel() {
  let panel = document.getElementById('element-info-panel');
  if (panel) return panel;
  panel = document.createElement('aside');
  panel.id = 'element-info-panel';
  panel.className = 'element-info-panel';
  panel.innerHTML = `
    <button class="close-btn" aria-label="关闭">✕</button>
    <div class="content"></div>
  `;
  document.body.appendChild(panel);
  panel.querySelector('.close-btn').addEventListener('click', () => panel.classList.remove('open'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.classList.remove('open'); });
  return panel;
}

function showInfoByKey(key) {
  const info = ELEMENT_DATA[key];
  if (!info) return;
  const panel = ensureElementInfoPanel();
  const content = panel.querySelector('.content');
  const meta = ELEMENT_META[key];
  const title = meta ? `${meta.cn}（${meta.symbol}）` + (meta.number ? ` — 原子序数 ${meta.number}` : '') : key.toUpperCase();
  content.innerHTML = `<h3>${title}</h3><p>${info}</p>`;
  panel.classList.add('open');
}

// 事件委托：处理内部的锚点平滑滚动与元素卡片点击
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a');
  if (anchor && anchor.getAttribute) {
    const href = anchor.getAttribute('href') || '';
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  }

  const card = e.target.closest('.element-card');
  if (card && card.dataset && card.dataset.element) {
    showInfoByKey(card.dataset.element);
  }
});

// DOM 就绪：更新页脚年份，设置主题切换监听（如果存在）
document.addEventListener('DOMContentLoaded', () => {
  const footer = document.querySelector('footer');
  if (footer) {
    const yearEl = footer.querySelector('.year');
    const year = new Date().getFullYear();
    if (yearEl) yearEl.textContent = year;
    else {
      const span = document.createElement('span');
      span.className = 'year';
      span.textContent = year;
      // 在现有文字前插入年（仅在 footer 有 p 时）
      const p = footer.querySelector('p');
      if (p) p.insertBefore(span, p.firstChild);
    }
  }

  document.querySelectorAll('[data-toggle-theme]').forEach(btn => {
    btn.addEventListener('click', () => document.body.classList.toggle('dark-theme'));
  });

  console.log('js/script.js 已加载');
});

// 简单 toast 实用函数（用于替代原始 alert，非阻塞）
function showToast(msg, ms = 2000) {
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    background: 'rgba(0,0,0,0.8)',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '6px',
    zIndex: 9999,
    fontSize: '14px',
    maxWidth: '320px'
  });
  document.body.appendChild(el);
  setTimeout(() => el.remove(), ms);
}

/* --------------------------
   Ksp 搜索功能
   数据优先从 `ksp.json` 异步加载，若加载失败则使用内置默认数据
   -------------------------- */
const DEFAULT_KSP = [
  { key: 'agcl', name: '氯化银', formula: 'AgCl', ions: [{ion:'Ag+',coef:1},{ion:'Cl-',coef:1}], ksp: '1.8×10⁻¹⁰', ksp_val: 1.8e-10, equation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)', note: '难溶，常见沉淀' },
  { key: 'cuoh2', name: '氢氧化铜', formula: 'Cu(OH)₂', ions: [{ion:'Cu2+',coef:1},{ion:'OH-',coef:2}], ksp: '2.2×10⁻²⁰', ksp_val: 2.2e-20, equation: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)', note: '蓝色沉淀' },
  { key: 'baso4', name: '硫酸钡', formula: 'BaSO₄', ions: [{ion:'Ba2+',coef:1},{ion:'SO4 2-',coef:1}], ksp: '1.1×10⁻¹⁰', ksp_val: 1.1e-10, equation: 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)', note: '非常难溶，常用于沉淀离子检验' },
  { key: 'nacl', name: '氯化钠（示例）', formula: 'NaCl', ions: [{ion:'Na+',coef:1},{ion:'Cl-',coef:1}], ksp: '溶于水', ksp_val: null, equation: 'Na⁺(aq) + Cl⁻(aq) → NaCl (可溶)', note: '强电解质，通常不形成沉淀' }
];

let KSP_DATA = [];

function loadKspData() {
  return fetch('./ksp.json')
    .then(res => {
      if (!res.ok) throw new Error('fetch failed');
      return res.json();
    })
    .then(json => {
      KSP_DATA = json;
      return KSP_DATA;
    })
    .catch(() => {
      // 回退到内置数据
      KSP_DATA = DEFAULT_KSP;
      return KSP_DATA;
    });
}

function renderKspResults(items, container) {
  container.innerHTML = '';
  if (!items || items.length === 0) {
    const no = document.createElement('div');
    no.className = 'ksp-no-results';
    no.textContent = '未找到匹配项。请尝试化学式或离子（例如 AgCl、Ag+）。';
    container.appendChild(no);
    return;
  }

  items.forEach(it => {
    const card = document.createElement('div');
    card.className = 'ksp-card';
    const title = document.createElement('h4');
    title.textContent = `${it.name} — ${it.formula}`;
    const meta = document.createElement('div');
    meta.className = 'ksp-meta';
    const ionList = (it.ions || []).map(i => (typeof i === 'string' ? i : i.ion)).join(', ');
    meta.innerHTML = `Ksp: <span class="ksp-ksp">${it.ksp}</span> · ${it.note} <br> 主要离子: ${ionList}`;
    card.appendChild(title);
    card.appendChild(meta);

    if (it.equation) {
      const eq = document.createElement('div');
      eq.className = 'ksp-eq';
      eq.style.marginTop = '8px';
      eq.style.fontStyle = 'italic';
      eq.textContent = `化学方程式：${it.equation}`;
      card.appendChild(eq);
    }
    // 添加“判断沉淀”按钮与表单（按需显示）
    const calcWrap = document.createElement('div');
    calcWrap.style.marginTop = '8px';
    const calcBtn = document.createElement('button');
    calcBtn.type = 'button';
    calcBtn.textContent = '判断沉淀';
    calcBtn.style.padding = '6px 10px';
    calcBtn.style.marginRight = '8px';
    calcBtn.className = 'ksp-calc-btn';
    calcWrap.appendChild(calcBtn);

    const form = document.createElement('div');
    form.className = 'ksp-calc-form';
    form.style.marginTop = '8px';
    form.style.display = 'none';
    // 为每个离子生成输入
    (it.ions || []).forEach(i => {
      const ion = typeof i === 'string' ? i : i.ion;
      const row = document.createElement('div');
      row.style.marginBottom = '6px';
      const label = document.createElement('label');
      label.textContent = `${ion} 浓度 (mol/L): `;
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = 'any';
      input.placeholder = '例如 0.001';
      input.dataset.ion = ion;
      input.style.width = '120px';
      input.style.marginLeft = '8px';
      row.appendChild(label);
      row.appendChild(input);
      form.appendChild(row);
    });

    const submit = document.createElement('button');
    submit.type = 'button';
    submit.textContent = '计算 Q vs Ksp';
    submit.style.padding = '6px 10px';
    form.appendChild(submit);

    const resultDiv = document.createElement('div');
    resultDiv.className = 'ksp-calc-result';
    resultDiv.style.marginTop = '8px';
    form.appendChild(resultDiv);

    calcWrap.appendChild(form);
    card.appendChild(calcWrap);

    // 事件：切换表单
    calcBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });

    // 事件：提交计算
    submit.addEventListener('click', () => {
      // collect concentrations
      const inputs = Array.from(form.querySelectorAll('input[data-ion]'));
      const conc = {};
      inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        conc[inp.dataset.ion] = isNaN(val) ? 0 : val;
      });

      if (!it.ksp_val) {
        resultDiv.innerHTML = `<div class="result-error">无可用于计算的 Ksp 值（${it.ksp}）。</div>`;
        return;
      }

      // 计算 Q = ∏ [ion]^coef
      let Q = 1;
      (it.ions || []).forEach(i => {
        const ion = typeof i === 'string' ? i : i.ion;
        const coef = typeof i === 'string' ? 1 : (i.coef || 1);
        const c = conc[ion] || 0;
        Q *= Math.pow(c, coef);
      });

      const kspv = it.ksp_val;
      const conclusion = Q > kspv ? '会生成沉淀（Q > Ksp）' : (Q === kspv ? '处于饱和平衡（Q = Ksp）' : '不会生成沉淀（Q < Ksp）');
      resultDiv.innerHTML = `<div class="result-success">Q = ${Q.toExponential()}，Ksp = ${kspv.toExponential()} → ${conclusion}</div>`;
    });

    // 快捷操作：复制方程式 & 加入比较
    const quick = document.createElement('div');
    quick.className = 'quick-actions';
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.textContent = '复制方程式';
    copyBtn.className = 'copy-btn';
    quick.appendChild(copyBtn);

    const compareBtn = document.createElement('button');
    compareBtn.type = 'button';
    compareBtn.textContent = '加入比较';
    compareBtn.className = 'compare-btn';
    quick.appendChild(compareBtn);

    card.appendChild(quick);

    // copy handler
    copyBtn.addEventListener('click', () => {
      const text = it.equation || `${it.name} — ${it.formula}`;
      copyToClipboard(text).then(() => showToast('已复制方程式')).catch(() => showToast('复制失败'));
    });

    // compare handling
    compareBtn.addEventListener('click', () => {
      toggleCompareItem(it);
      const inList = isInCompare(it);
      compareBtn.classList.toggle('active', inList);
      compareBtn.textContent = inList ? '移除比较' : '加入比较';
      updateComparePanel();
    });

    container.appendChild(card);
  });
}

// 复制到剪贴板的兼容函数
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      resolve();
    } catch (e) {
      reject(e);
    } finally {
      ta.remove();
    }
  });
}

// 比较列表管理
let COMPARE_LIST = [];
function isInCompare(item) {
  return COMPARE_LIST.some(i => i.key === item.key);
}
function toggleCompareItem(item) {
  const idx = COMPARE_LIST.findIndex(i => i.key === item.key);
  if (idx === -1) COMPARE_LIST.push(item);
  else COMPARE_LIST.splice(idx, 1);
}

function updateComparePanel() {
  const panel = document.getElementById('ksp-compare');
  if (!panel) return;
  panel.innerHTML = '';
  if (COMPARE_LIST.length === 0) {
    panel.textContent = '比较栏：空';
    return;
  }

  // 构建对比表格
  const table = document.createElement('table');
  table.className = 'compare-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>名称</th><th>化学式</th><th>Ksp</th><th>主要离子</th><th>化学方程式</th><th>是否可溶</th><th>操作</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  COMPARE_LIST.forEach(it => {
    const tr = document.createElement('tr');
    const ionList = (it.ions || []).map(i => (typeof i === 'string' ? i : i.ion)).join(', ');
    const soluble = (it.ksp_val === null || it.ksp_val === undefined) ? '可溶' : '难溶（有 Ksp）';

    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.formula}</td>
      <td>${it.ksp || ''}</td>
      <td>${ionList}</td>
      <td>${it.equation || ''}</td>
      <td>${soluble}</td>
      <td class="compare-actions"></td>
    `;

    const actionTd = tr.querySelector('.compare-actions');
    const rm = document.createElement('button');
    rm.className = 'remove';
    rm.textContent = '移除';
    rm.addEventListener('click', () => {
      toggleCompareItem(it);
      // 取消结果卡按钮状态
      document.querySelectorAll('.ksp-card').forEach(card => {
        const title = card.querySelector('h4');
        if (title && title.textContent.includes(it.formula)) {
          const btn = card.querySelector('.compare-btn');
          if (btn) { btn.classList.remove('active'); btn.textContent = '加入比较'; }
        }
      });
      updateComparePanel();
    });
    actionTd.appendChild(rm);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  panel.appendChild(table);

  const clear = document.createElement('button');
  clear.className = 'compare-clear';
  clear.textContent = '清空比较';
  clear.addEventListener('click', () => {
    COMPARE_LIST = [];
    updateComparePanel();
    document.querySelectorAll('.compare-btn').forEach(b => { b.classList.remove('active'); b.textContent = '加入比较'; });
  });
  panel.appendChild(clear);
}

function normalizeQuery(q) {
  if (!q) return '';
  // 全角转半角 + 修剪
  q = q.replace(/\uFF0B/g, '+').replace(/\uFF0D/g, '-');
  q = q.toLowerCase().trim();
  return q;
}

function searchKsp(query) {
  const qRaw = normalizeQuery(query);
  if (!qRaw) return [];

  const qAlnum = qRaw.replace(/[^a-z0-9+\-]/g, '');

  return KSP_DATA.filter(item => {
    const name = (item.name || '').toLowerCase();
    const formula = (item.formula || '').toLowerCase();
    const ions = ((item.ions || []).map(i => (typeof i === 'string' ? i : i.ion))).join(' ').toLowerCase();
    // 完全匹配或包含匹配
    if (name.includes(qRaw) || formula.includes(qAlnum) || ions.includes(qAlnum)) return true;
    if (/^[a-z]{1,2}$/.test(qAlnum) && formula.toLowerCase().includes(qAlnum)) return true;
    return false;
  });
}

// 绑定事件：搜索按钮与回车
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('ksp-search-btn');
  const input = document.getElementById('ksp-query');
  const results = document.getElementById('ksp-results');
  if (!btn || !input || !results) return;

  // 先加载 Ksp 数据（异步），加载完成后允许搜索
  loadKspData().then(() => {
    const doSearch = () => {
      const q = input.value || '';
      const found = searchKsp(q);
      // 清理状态类
      results.classList.remove('result-success', 'result-error');
      if (found.length) results.classList.add('result-success');
      else results.classList.add('result-error');
      renderKspResults(found, results);
    };

    btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  });
});
