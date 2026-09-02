// src/utils/pdfGenerator.js
// Generates a simple, clear, farmer-friendly PDF report using the browser's print API.
// No external libraries needed — pure HTML injected into a print window.

const SCORE_COLORS = {
  A: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7', label: 'EXCELLENT' },
  B: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'GOOD' },
  C: { bg: '#fef3c7', text: '#92400e', border: '#fcd34d', label: 'AVERAGE' },
  D: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5', label: 'NEEDS WORK' },
};

const PRIORITY_COLORS = {
  high:   { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  medium: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  low:    { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
};

function formatNum(n) {
  if (n === null || n === undefined) return '0';
  return parseFloat(n).toLocaleString('en-KE', { maximumFractionDigits: 1 });
}

function scoreBar(score) {
  const grades = ['A','B','C','D'];
  return grades.map(g => {
    const active = g === score;
    const c = SCORE_COLORS[g];
    return `<span style="
      display:inline-block; padding:4px 14px; border-radius:20px; font-weight:700; font-size:14px;
      background:${active ? c.bg : '#f1f5f9'}; color:${active ? c.text : '#94a3b8'};
      border:2px solid ${active ? c.border : '#e2e8f0'}; margin-right:4px;
    ">${g}</span>`;
  }).join('');
}

export function generateFarmerPDF(data) {
  const { period, company, emissions, greenScore, recommendations, generatedAt } = data;
  const score = greenScore?.score || 'C';
  const sc    = SCORE_COLORS[score];
  const dateStr = new Date(generatedAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // Plain-language score explanation
  const scoreExplanations = {
    A: 'Your business is doing an EXCELLENT job at reducing pollution. You are among the cleanest businesses in your region. Keep up the great work!',
    B: 'Your business is doing WELL. You are on the right path. A few small improvements can move you to the top grade.',
    C: 'Your business produces an AVERAGE amount of pollution. There are several areas where you can make improvements that will save you money and help the environment.',
    D: 'Your business is producing MORE POLLUTION THAN RECOMMENDED. This report will show you the most important steps to reduce it quickly.',
  };

  // Simple recommendations in plain language
  const simplify = (rec) => {
    const simple = {
      'Electricity': {
        action: '💡 Switch to Solar Power',
        plain: 'Your electricity bill is high. Consider installing solar panels. Solar pays for itself in 3–5 years and then saves you money every month.',
      },
      'Fuel': {
        action: '🚗 Reduce Fuel Costs',
        plain: 'You are spending a lot on fuel. Plan trips better, keep vehicles serviced, and consider a fuel-efficient or electric vehicle next time you upgrade.',
      },
      'Waste': {
        action: '♻️ Start Recycling',
        plain: 'Much of your waste is going to landfill. Start separating waste into recyclables and compost. This can cut your waste costs by 20–30%.',
      },
      'Business Travel': {
        action: '✈️ Cut Down on Flights',
        plain: 'Business flights add a lot of carbon. Use video calls for meetings where possible. When you must travel, choose ground transport for shorter trips.',
      },
      'Overall': {
        action: '🔍 Get an Environmental Audit',
        plain: 'Your overall carbon footprint is high. Hiring an environmental consultant for a one-day audit can identify the biggest savings for your business.',
      },
    };
    return simple[rec.category] || { action: rec.category, plain: rec.suggestion };
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>EcoTrack Report — ${company?.name || 'Company'} — ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      color: #1e293b;
      background: white;
      padding: 0;
    }
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
      .page-break { page-break-before: always; }
    }

    /* ── Header band ── */
    .header {
      background: linear-gradient(135deg, #065f46 0%, #0ea5e9 100%);
      color: white;
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .header-logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header-logo span { color: #6ee7b7; }
    .header-title { font-size: 13px; opacity: 0.85; margin-top: 3px; }
    .header-right { text-align: right; font-size: 12px; opacity: 0.85; }

    /* ── Sections ── */
    .section {
      background: white;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 20px 24px;
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 14px;
      padding-bottom: 8px;
      border-bottom: 2px solid #f1f5f9;
    }

    /* ── Company info grid ── */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .info-item { }
    .info-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { font-size: 14px; color: #1e293b; font-weight: 600; margin-top: 1px; }

    /* ── Score card ── */
    .score-card {
      background: ${sc.bg};
      border: 2px solid ${sc.border};
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .score-letter {
      width: 70px; height: 70px;
      background: ${sc.text};
      color: white;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 900;
      flex-shrink: 0;
    }
    .score-info { flex: 1; }
    .score-label { font-size: 18px; font-weight: 800; color: ${sc.text}; }
    .score-desc  { font-size: 13px; color: ${sc.text}; margin-top: 4px; line-height: 1.5; }
    .score-bar   { margin-top: 10px; }
    .score-bar-label { font-size: 11px; color: ${sc.text}; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; }

    /* ── Big number ── */
    .big-total {
      display: flex; align-items: baseline; gap: 6px; margin: 12px 0;
    }
    .big-number { font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1; }
    .big-unit   { font-size: 16px; color: #64748b; font-weight: 600; }

    /* ── Emission rows ── */
    .emission-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px;
      border-radius: 8px;
      background: #f8fafc;
      margin-bottom: 8px;
      border-left: 4px solid;
    }
    .emission-row-left { display: flex; align-items: center; gap: 10px; }
    .em-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .em-name { font-weight: 700; font-size: 14px; color: #1e293b; }
    .em-sub  { font-size: 11px; color: #94a3b8; margin-top: 1px; }
    .em-val  { font-weight: 800; font-size: 15px; color: #0f172a; }
    .em-unit { font-size: 11px; color: #94a3b8; }

    /* ── What this means (plain language) ── */
    .explain-box {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 16px;
    }
    .explain-title { font-weight: 700; font-size: 14px; color: #065f46; margin-bottom: 6px; }
    .explain-text  { font-size: 13px; color: #374151; line-height: 1.7; }

    /* ── Recommendation cards ── */
    .rec-card {
      border-radius: 10px;
      padding: 16px 18px;
      margin-bottom: 12px;
      border-left: 5px solid;
      page-break-inside: avoid;
    }
    .rec-action { font-size: 16px; font-weight: 800; margin-bottom: 6px; }
    .rec-plain  { font-size: 13px; line-height: 1.7; }
    .rec-saving { display: inline-block; margin-top: 8px; font-size: 12px; font-weight: 700;
                  background: rgba(0,0,0,0.08); padding: 3px 10px; border-radius: 20px; }

    /* ── Per-employee box ── */
    .per-emp {
      background: #eff6ff;
      border: 1.5px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 14px;
    }
    .per-emp-icon { font-size: 28px; }
    .per-emp-val  { font-size: 22px; font-weight: 900; color: #1e40af; }
    .per-emp-label { font-size: 12px; color: #3b82f6; font-weight: 600; }
    .per-emp-explain { font-size: 12px; color: #374151; margin-top: 2px; line-height: 1.5; }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding: 16px;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1.5px solid #e2e8f0;
      margin-top: 20px;
    }

    /* ── Print button ── */
    .print-btn {
      position: fixed; top: 16px; right: 16px; z-index: 9999;
      background: #065f46; color: white;
      border: none; border-radius: 10px;
      padding: 10px 20px; font-size: 14px; font-weight: 700;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      display: flex; align-items: center; gap: 8px;
    }
    .print-btn:hover { background: #047857; }
  </style>
</head>
<body>

  <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>

  <!-- ── HEADER ── -->
  <div class="header">
    <div>
      <div class="header-logo">Eco<span>Track</span></div>
      <div class="header-title">Carbon Footprint Report</div>
    </div>
    <div class="header-right">
      <div style="font-weight:700; font-size:16px;">${period}</div>
      <div style="margin-top:4px;">Generated: ${dateStr}</div>
    </div>
  </div>

  <!-- ── COMPANY INFORMATION ── -->
  <div class="section">
    <div class="section-title">🏢 Company Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Company Name</div>
        <div class="info-value">${company?.name || '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Industry</div>
        <div class="info-value">${company?.industry?.replace(/_/g, ' ') || '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Location</div>
        <div class="info-value">${company?.location || '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Number of Employees</div>
        <div class="info-value">${company?.employees || 1} people</div>
      </div>
      ${company?.employees ? `
      <div class="info-item">
        <div class="info-label">Report Period</div>
        <div class="info-value">${period}</div>
      </div>` : ''}
    </div>
  </div>

  <!-- ── OVERALL SCORE ── -->
  <div class="score-card">
    <div class="score-letter">${score}</div>
    <div class="score-info">
      <div class="score-label">Environmental Grade: ${sc.label}</div>
      <div class="score-desc">${scoreExplanations[score]}</div>
      <div class="score-bar">
        <div class="score-bar-label">Grade Scale</div>
        ${scoreBar(score)}
      </div>
    </div>
  </div>

  <!-- ── TOTAL EMISSIONS ── -->
  <div class="section">
    <div class="section-title">🌍 Total Carbon Footprint This Month</div>
    <div class="big-total">
      <div class="big-number">${formatNum(emissions?.total?.amount)}</div>
      <div class="big-unit">kg of CO₂ equivalent</div>
    </div>

    <div class="explain-box">
      <div class="explain-title">📖 What does this mean in plain language?</div>
      <div class="explain-text">
        One kilogram of CO₂ is roughly what a car emits driving about 6 kilometres.
        Your business emitted the same amount of greenhouse gas as a car
        driving <strong>${Math.round((emissions?.total?.amount || 0) * 6).toLocaleString()} km</strong> this month.
        ${(emissions?.total?.amount || 0) > 2000
          ? ' This is on the higher side — the recommendations below will help you reduce it.'
          : ' This is a manageable level — keep an eye on the recommendations below to keep improving.'}
      </div>
    </div>

    <!-- Per-employee -->
    <div class="per-emp">
      <div class="per-emp-icon">👤</div>
      <div>
        <div class="per-emp-val">${greenScore?.emissionsPerEmployee || 0} kg</div>
        <div class="per-emp-label">Per Employee Per Month</div>
        <div class="per-emp-explain">
          A score under 50 kg per person is <strong>excellent</strong>.
          Under 150 kg is <strong>good</strong>. Above 300 kg needs <strong>urgent attention</strong>.
        </div>
      </div>
    </div>
  </div>

  <!-- ── BREAKDOWN BY SOURCE ── -->
  <div class="section">
    <div class="section-title">📊 Where Does the Pollution Come From?</div>

    <div class="emission-row" style="border-left-color: #10b981;">
      <div class="emission-row-left">
        <div class="em-dot" style="background:#10b981;"></div>
        <div>
          <div class="em-name">⚡ Electricity</div>
          <div class="em-sub">${formatNum(emissions?.electricity?.kwh)} kWh used → converted to carbon</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="em-val">${formatNum(emissions?.electricity?.amount)}</div>
        <div class="em-unit">kg CO₂e</div>
      </div>
    </div>

    <div class="emission-row" style="border-left-color: #3b82f6;">
      <div class="emission-row-left">
        <div class="em-dot" style="background:#3b82f6;"></div>
        <div>
          <div class="em-name">⛽ Fuel (${emissions?.transport?.fuelType || 'Diesel'})</div>
          <div class="em-sub">${formatNum(emissions?.transport?.litres)} litres burned → converted to carbon</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="em-val">${formatNum(emissions?.transport?.amount)}</div>
        <div class="em-unit">kg CO₂e</div>
      </div>
    </div>

    <div class="emission-row" style="border-left-color: #f59e0b;">
      <div class="emission-row-left">
        <div class="em-dot" style="background:#f59e0b;"></div>
        <div>
          <div class="em-name">🗑️ Waste &amp; Business Travel</div>
          <div class="em-sub">${formatNum(emissions?.waste?.kg)} kg waste · ${formatNum(emissions?.waste?.flightKm)} km flights</div>
        </div>
      </div>
      <div style="text-align:right;">
        <div class="em-val">${formatNum(emissions?.waste?.amount)}</div>
        <div class="em-unit">kg CO₂e</div>
      </div>
    </div>

    <div style="margin-top:10px; padding:10px 14px; background:#f8fafc; border-radius:8px; font-size:12px; color:#64748b;">
      <strong>Scope explained:</strong> Electricity = Scope 2 (from your power bill) · Fuel = Scope 1 (direct burning) · Waste &amp; Travel = Scope 3 (indirect)
    </div>
  </div>

  <!-- ── RECOMMENDATIONS ── -->
  ${recommendations?.length > 0 ? `
  <div class="section page-break">
    <div class="section-title">✅ What You Should Do Next</div>
    <p style="font-size:13px; color:#374151; margin-bottom:14px;">
      These recommendations are listed from most important to least important.
      Even doing just the first one will make a big difference.
    </p>

    ${recommendations.map((rec, i) => {
      const s = simplify(rec);
      const c = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.medium;
      return `
    <div class="rec-card" style="background:${c.bg}; border-left-color:${c.border};">
      <div class="rec-action" style="color:${c.text};">${i + 1}. ${s.action}</div>
      <div class="rec-plain" style="color:#374151;">${s.plain}</div>
      <div class="rec-saving" style="color:${c.text};">
        💰 Potential saving: ${rec.potentialReduction} reduction in emissions
      </div>
    </div>`;
    }).join('')}
  </div>` : ''}

  <!-- ── NEXT STEPS CHECKLIST ── -->
  <div class="section">
    <div class="section-title">📋 Simple Action Checklist</div>
    <p style="font-size:13px; color:#374151; margin-bottom:12px;">Print this checklist and tick off each item as you complete it:</p>
    ${[
      'Share this report with your management team',
      'Identify which source produces the most carbon (see chart above)',
      'Pick ONE recommendation and make a plan to act on it this month',
      'Log next month\'s data in EcoTrack to track your progress',
      'Set a target to reduce your total emissions by 10% each quarter',
    ].map((item, i) => `
    <div style="display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f1f5f9;">
      <div style="width:22px; height:22px; border:2px solid #cbd5e1; border-radius:4px; flex-shrink:0;"></div>
      <span style="font-size:13px; color:#374151;">${i + 1}. ${item}</span>
    </div>`).join('')}
  </div>

  <!-- ── FOOTER ── -->
  <div class="footer">
    <strong>EcoTrack Carbon Footprint Tracker</strong> — Report generated on ${dateStr}<br/>
    Emission factors based on GHG Protocol standards.
    Data is specific to ${company?.name || 'your company'} for the period <strong>${period}</strong>.<br/>
    For questions, contact your EcoTrack administrator.
  </div>

</body>
</html>`;

  return html;
}

export function openPDFPreview(reportData) {
  const html = generateFarmerPDF(reportData);
  const win  = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Please allow pop-ups to view the PDF report.');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
