import nodemailer from 'nodemailer';

const handler = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail, userName, score, results, dimension_scores } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    // Datos del resultado
    const tier = results.tier;
    const dimScores = results.dimScores;
    const profileAnswers = results.profileAnswers;
    const utilization = results.utilization;
    const totalWaste = results.totalWaste;

    // Calcular detalles adicionales
    const REVENUE_PER_HOUR = {
      0: { low: 400, high: 800, label: "SMB Account Executive" },
      1: { low: 200, high: 300, label: "SDR/BDR" },
      2: { low: 500, high: 1500, label: "Sales Manager" },
      3: { low: 1000, high: 2500, label: "Enterprise Account Executive" },
      4: { low: 400, high: 800, label: "Sales Professional" }
    };

    const rKey = profileAnswers.role;
    const rev = REVENUE_PER_HOUR[rKey] || { low: 400, high: 800, label: "Sales Professional" };
    const wkLow = Math.round(totalWaste * rev.low);
    const wkHigh = Math.round(totalWaste * rev.high);
    const qLow = wkLow * 13;
    const qHigh = wkHigh * 13;
    const avgDeal = { 0: 35000, 1: 500, 2: 50000, 3: 150000, 4: 25000 }[rKey] || 25000;
    const dealsLow = Math.max(1, Math.floor(qLow / avgDeal));
    const dealsHigh = Math.max(1, Math.ceil(qHigh / avgDeal));
    const pctile = Math.min(99, Math.max(1, Math.round(100 / (1 + Math.exp(-0.08 * (score - 35))))));

    const TIER_MESSAGES = {
      "AI Unaware": "You're sitting on a goldmine of AI capability. Your tools can do 5x more than you're currently using them for. The good news? Small changes = big impact.",
      "AI Curious": "You've started your AI journey, but you're only scratching the surface. Let's unlock the features that will make the biggest difference in your pipeline this quarter.",
      "AI Enabled": "You're ahead of most sales professionals. Now it's time to connect the dots — the biggest gains come from making your tools talk to each other.",
      "AI Proficient": "You're in the top 15% of AI-enabled sales professionals. Let's find the final optimizations that separate good from great.",
      "AI Native": "You're a top 5% AI-powered sales professional. You're the benchmark others should aspire to."
    };

    const scoreMessage = TIER_MESSAGES[tier.name] || "";

    const dimBarColors = {
      D1: "#148F77",
      D2: "#2E86C1",
      D3: "#1E8449",
      D4: "#E67E22",
      D5: "#6C3483",
      D6: "#C0392B"
    };

    const roleNames = {
      0: "Account Executive",
      1: "SDR/BDR",
      2: "Sales Manager",
      3: "VP of Sales",
      4: "Sales Professional"
    };

    const avgForRole = { 0: 31, 1: 28, 2: 35, 3: 38, 4: 29 }[rKey] || 31;

    const emailHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F8F9FA; color: #2C3E50; line-height: 1.6; }
          .container { max-width: 840px; margin: 0 auto; padding: 20px; background: white; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #E8E8E8; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; color: #1B4F72; margin-bottom: 5px; }
          .score-hero { text-align: center; background: linear-gradient(135deg, #1B4F72, #2E86C1); border-radius: 12px; padding: 60px 24px; margin-bottom: 24px; color: white; }
          .score-number { font-size: 96px; font-weight: 900; line-height: 1; margin-bottom: 8px; }
          .score-of { font-size: 24px; opacity: 0.9; font-weight: 400; }
          .tier-badge { display: inline-block; padding: 10px 28px; border-radius: 24px; font-size: 16px; font-weight: 700; margin-top: 16px; background: rgba(255,255,255,0.2); }
          .score-msg { font-size: 16px; opacity: 0.95; max-width: 480px; margin: 24px auto 0; line-height: 1.6; }
          .metrics-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
          .metric-card { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); text-align: center; border-top: 5px solid #2E86C1; }
          .metric-card.waste { border-top-color: #E67E22; }
          .metric-card.revenue { border-top-color: #C0392B; }
          .metric-val { font-size: 42px; font-weight: 900; margin-bottom: 6px; }
          .metric-label { font-size: 12px; color: #566573; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
          .metric-desc { font-size: 13px; color: #566573; margin-top: 10px; }
          .section { background: white; border-radius: 12px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin-bottom: 24px; border-left: 5px solid #2E86C1; }
          .section h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; color: #2C3E50; }
          .section p { font-size: 15px; color: #566573; line-height: 1.7; margin-bottom: 12px; }
          .dim-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
          .dim-name { width: 160px; font-size: 13px; font-weight: 600; color: #2C3E50; flex-shrink: 0; }
          .dim-bar-bg { flex: 1; height: 28px; background: #F0F0F0; border-radius: 14px; overflow: hidden; }
          .dim-bar-fill { height: 100%; border-radius: 14px; }
          .dim-pct { width: 50px; font-size: 15px; font-weight: 700; text-align: right; flex-shrink: 0; }
          .role-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E8E8E8; }
          .role-item:last-child { border-bottom: none; }
          .role-name { font-size: 14px; color: #2C3E50; font-weight: 600; }
          .role-score { font-size: 14px; font-weight: 700; color: #2E86C1; }
          .rec-card { background: linear-gradient(135deg, #F8F9FA, white); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #1E8449; }
          .rec-rank { font-size: 11px; font-weight: 700; color: #1E8449; text-transform: uppercase; margin-bottom: 6px; }
          .rec-title { font-size: 16px; font-weight: 700; color: #2C3E50; margin-bottom: 8px; }
          .rec-dim-tag { font-size: 11px; padding: 4px 12px; border-radius: 12px; background: #D6EAF8; color: #2E86C1; font-weight: 600; display: inline-block; margin-bottom: 10px; }
          .rec-why { font-size: 14px; color: #566573; margin-bottom: 12px; line-height: 1.5; }
          .rec-result { background: #D5F5E3; border-radius: 8px; padding: 12px; font-size: 13px; color: #2C3E50; }
          .rec-result strong { color: #1E8449; }
          .week-group { margin-bottom: 24px; }
          .week-title { font-size: 14px; font-weight: 700; color: #2E86C1; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .action-item { display: flex; gap: 12px; margin-bottom: 10px; padding: 10px; background: #F8F9FA; border-radius: 8px; border-left: 3px solid #2E86C1; }
          .action-item-num { font-weight: 700; color: #2E86C1; min-width: 20px; }
          .action-item-text { font-size: 14px; color: #2C3E50; }
          .footer { text-align: center; padding: 40px 20px; color: #566573; font-size: 13px; border-top: 1px solid #E8E8E8; margin-top: 40px; }
          @media (max-width: 600px) {
            .metrics-row { grid-template-columns: 1fr; }
            .score-number { font-size: 64px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Merka<span style="color: #2E86C1;">AI</span></div>
          </div>

          <div class="score-hero">
            <div class="score-number" style="color: ${tier.color};">${score}<span class="score-of">/100</span></div>
            <div class="tier-badge" style="background: ${tier.bg}; color: ${tier.color};">${tier.name}</div>
            <p class="score-msg">${scoreMessage}</p>
          </div>

          <div class="metrics-row">
            <div class="metric-card">
              <div class="metric-val" style="color: #2E86C1;">${utilization}%</div>
              <div class="metric-label">AI Utilization</div>
              <div class="metric-desc">of your available AI features</div>
            </div>
            <div class="metric-card waste">
              <div class="metric-val" style="color: #E67E22;">${totalWaste}h</div>
              <div class="metric-label">Weekly Time Waste</div>
              <div class="metric-desc">hours you could reclaim</div>
            </div>
            <div class="metric-card revenue">
              <div class="metric-val" style="color: #C0392B;">${dealsLow}–${dealsHigh}</div>
              <div class="metric-label">Deals at Risk</div>
              <div class="metric-desc">lost per quarter to AI gaps</div>
            </div>
          </div>

          <div class="section">
            <h3>📊 Your Score by Dimension</h3>
            ${Object.entries(dimScores).map(([key, dim]) => `
              <div class="dim-bar-row">
                <div class="dim-name">${dim.name}</div>
                <div class="dim-bar-bg">
                  <div class="dim-bar-fill" style="width: ${dim.pct}%; background: ${dimBarColors[key]};"></div>
                </div>
                <div class="dim-pct" style="color: ${dimBarColors[key]};">${dim.pct}%</div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h3>🎯 How You Compare to Your Role</h3>
            <div class="role-item">
              <div class="role-name">Your Score</div>
              <div class="role-score">${score}/100</div>
            </div>
            <div class="role-item">
              <div class="role-name">Average ${roleNames[rKey]}</div>
              <div class="role-score">${avgForRole}/100</div>
            </div>
            <div class="role-item">
              <div class="role-name">Your Percentile</div>
              <div class="role-score">Top ${pctile}%</div>
            </div>
          </div>

          <div class="section">
            <h3>💡 Your Top 3 Recommendations</h3>
            <div class="rec-card">
              <div class="rec-rank">Priority #1</div>
              <div class="rec-title">Focus on your highest-impact opportunity</div>
              <div class="rec-dim-tag">Next Steps</div>
              <div class="rec-why">Review your detailed results at www.merkaai.com to see personalized recommendations based on your profile.</div>
              <div class="rec-result"><strong>Expected impact:</strong> 15–30% improvement in AI adoption within 30 days</div>
            </div>
          </div>

          <div class="section">
            <h3>🚀 Your 30-Day AI Upgrade Path</h3>
            <div class="week-group">
              <div class="week-title">Week 1: Foundation</div>
              <div class="action-item">
                <div class="action-item-num">1.</div>
                <div class="action-item-text">Pick your #1 pain point from recommendations</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">2.</div>
                <div class="action-item-text">Enable the feature in your primary tool (15 min)</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">3.</div>
                <div class="action-item-text">Use it on 3 tasks before your next meeting</div>
              </div>
            </div>
            <div class="week-group">
              <div class="week-title">Week 2: Integration</div>
              <div class="action-item">
                <div class="action-item-num">1.</div>
                <div class="action-item-text">Make it a daily habit—use before every call</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">2.</div>
                <div class="action-item-text">Add a second recommendation from your list</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">3.</div>
                <div class="action-item-text">Track the time saved</div>
              </div>
            </div>
            <div class="week-group">
              <div class="week-title">Week 3-4: Acceleration</div>
              <div class="action-item">
                <div class="action-item-num">1.</div>
                <div class="action-item-text">Review your time savings and share with your manager</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">2.</div>
                <div class="action-item-text">Pick a third recommendation and layer it in</div>
              </div>
              <div class="action-item">
                <div class="action-item-num">3.</div>
                <div class="action-item-text">By day 30, you should have 3 new AI habits locked in</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Next Step:</strong> Log in to www.merkaai.com to see your complete results with all recommendations, detailed insights, and personalized action plan.</p>
            <p style="margin-top: 20px;">© 2026 MerkaAI · www.merkaai.com · Built in Ireland</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: 'info@merkaai.com',
      to: userEmail,
      subject: `Tu MerkaAI Score: ${score}/100 (${tier.name})`,
      html: emailHTML,
    });

    // Send lead notification via Web3Forms
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY,
        name: userName,
        email: userEmail,
        score: results.score,
        tier: results.tier.name,
        message: `New MerkaAI Score: ${results.score}/100 (${results.tier.name})`
      })
    });

    res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
