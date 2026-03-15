const nodemailer = require('nodemailer');

// Initialize nodemailer transporter with SendGrid SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

// Recommendation library matching frontend
const RECS = {
  7: { title: 'Activate AI lead scoring in your CRM', dim: 'CRM Intelligence', why: 'Score every lead by likelihood to close. Reps who use AI scoring spend 30% more time on high-probability deals.', result: 'Save 1.5+ hours/week. 15–20% improvement in conversion within 30 days.', saves: 0.75 },
  8: { title: 'Set up automatic activity capture', dim: 'CRM Intelligence', why: 'Auto-capture emails, meetings, and calls. AI summarizes the key points automatically.', result: 'Save 2+ hours/week on CRM data entry.', saves: 1.0 },
  9: { title: 'Use AI account briefs for call prep', dim: 'CRM Intelligence', why: 'Get an AI summary of the account in seconds before every call.', result: 'Save 30+ min/week on call preparation.', saves: 0.5 },
  10: { title: 'Enable AI pipeline predictions', dim: 'CRM Intelligence', why: 'Predict which deals will close. AI forecasting improves accuracy 20–30%.', result: 'Catch at-risk deals 2–3 weeks earlier.', saves: 0.75 },
  11: { title: 'Act on AI-surfaced insights', dim: 'CRM Intelligence', why: 'Your CRM generates risk alerts and next-best-action suggestions. Use them.', result: 'Catch 2–3 deals/month that would have slipped.', saves: 0.5 },
  12: { title: 'Use AI to draft sales emails', dim: 'Communication AI', why: 'AI generates personalized first drafts in seconds. You edit and send.', result: 'Save 45+ min/day on email writing.', saves: 0.75 },
  13: { title: 'Summarize long email threads', dim: 'Communication AI', why: 'AI pulls out key decisions, questions, and action items instantly.', result: 'Save 30+ min/week on email processing.', saves: 0.5 },
  14: { title: 'Try AI-suggested replies', dim: 'Communication AI', why: 'Your email tool suggests complete replies and coaches on tone.', result: 'Save 15–20 min/day. 10–15% higher response rates.', saves: 0.3 },
  15: { title: 'Use AI send-time optimization', dim: 'Communication AI', why: 'Send emails when each contact is most likely to respond.', result: '10–20% higher open rates.', saves: 0.25 },
  16: { title: 'Let AI handle your meeting scheduling', dim: 'Communication AI', why: 'AI scheduling eliminates back-and-forth emails.', result: 'Save 15–20 min/week on scheduling.', saves: 0.2 },
  17: { title: 'Turn on AI transcription for calls', dim: 'Meeting Intelligence', why: 'Transcription captures 100% of conversations. Search them forever.', result: 'Save 45+ min/week on note-taking.', saves: 0.75 },
  18: { title: 'Use AI meeting summaries', dim: 'Meeting Intelligence', why: 'AI generates a structured summary in 60 seconds after every call.', result: 'Save 1–2 hours/week. CRM quality improves dramatically.', saves: 1.0 },
  19: { title: 'Auto-extract action items', dim: 'Meeting Intelligence', why: 'AI pulls action items from meetings and pushes them to your task tool.', result: 'Zero dropped follow-ups.', saves: 0.5 },
  20: { title: 'Search past transcripts', dim: 'Meeting Intelligence', why: 'Find what was said in previous calls by searching your transcripts.', result: 'Perfect recall of previous discussions.', saves: 0.25 },
  21: { title: 'Auto-share meeting recaps', dim: 'Meeting Intelligence', why: 'Share summaries instantly with your manager and team.', result: 'Save 30+ min/week on internal communication.', saves: 0.5 },
  22: { title: 'Use AI lead recommendations', dim: 'Prospecting & Outreach', why: 'AI finds lookalike prospects automatically. 2–3x conversion rates.', result: 'Save 45+ min/week. Higher quality leads.', saves: 0.75 },
  23: { title: 'Generate personalized outreach at scale', dim: 'Prospecting & Outreach', why: 'AI generates unique opening lines for every prospect.', result: 'Save 30+ min/day. 2–3x higher reply rates.', saves: 0.5 },
  24: { title: 'Let AI optimize your sequences', dim: 'Prospecting & Outreach', why: 'AI adjusts timing and channels based on engagement signals.', result: '15–25% higher engagement rates.', saves: 0.5 },
  25: { title: 'Set up buying signal alerts', dim: 'Prospecting & Outreach', why: 'AI alerts you when prospects visit your pricing page or open emails.', result: '3–5x higher connection rates.', saves: 0.5 },
  26: { title: 'Unlock Sales Navigator AI', dim: 'Prospecting & Outreach', why: 'Use Account Prioritization, Lead Recommendations, and Relationship Explorer.', result: 'Find 2–3x more decision-makers per account.', saves: 0.25 },
  27: { title: 'Generate proposals with AI', dim: 'Productivity Suite', why: 'AI generates complete first drafts in minutes.', result: 'Save 1–2 hours per proposal.', saves: 0.4 },
  28: { title: 'Use AI for data analysis', dim: 'Productivity Suite', why: 'AI builds formulas and charts from natural language questions.', result: 'Save 20+ min/week on data analysis.', saves: 0.3 },
  29: { title: 'Draft internal reports with AI', dim: 'Productivity Suite', why: 'AI drafts weekly updates from your bullet points in seconds.', result: 'Save 20+ min/week on internal communication.', saves: 0.2 },
  30: { title: 'Summarize long documents', dim: 'Productivity Suite', why: 'AI extracts key points from RFPs and contracts in seconds.', result: 'Save 30+ min/week on document review.', saves: 0.3 },
  31: { title: 'Create charts with AI', dim: 'Productivity Suite', why: 'AI generates professional charts from descriptions.', result: 'Save 15+ min per visualization.', saves: 0.2 },
  32: { title: 'Connect your tools with automation', dim: 'Workflow Orchestration', why: 'Data flows automatically between tools. No copy-paste.', result: 'Save 45+ min/week on data entry.', saves: 0.75 },
  33: { title: 'Make AI your daily copilot', dim: 'Workflow Orchestration', why: 'Use AI for research, brainstorming, and drafting instantly.', result: 'Save 30+ min/day across dozens of tasks.', saves: 0.5 },
  34: { title: 'Build an AI morning briefing', dim: 'Workflow Orchestration', why: 'Consolidate everything into one daily briefing.', result: 'Save 20–30 min every morning.', saves: 0.25 },
  35: { title: 'Automate repetitive admin', dim: 'Workflow Orchestration', why: 'Automate your top 5 repetitive tasks.', result: 'Save 3–5 hours/week on admin.', saves: 0.75 },
  36: { title: 'Build confidence with weekly experiments', dim: 'Workflow Orchestration', why: 'Try one new AI feature every Friday.', result: 'Compounding AI advantage over time.', saves: 0.25 }
};

// Tier information matching frontend
const TIERS = [
  { min: 0, max: 20, name: 'AI Unaware', color: '#C0392B', bg: '#FADBD8' },
  { min: 21, max: 40, name: 'AI Curious', color: '#E67E22', bg: '#FDEBD0' },
  { min: 41, max: 60, name: 'AI Enabled', color: '#B7950B', bg: '#FEF9E7' },
  { min: 61, max: 80, name: 'AI Proficient', color: '#27AE60', bg: '#D5F5E3' },
  { min: 81, max: 100, name: 'AI Native', color: '#2E86C1', bg: '#D6EAF8' }
];

const TIER_MESSAGES = {
  'AI Unaware': "You're sitting on a goldmine of AI capability. Your tools can do 5x more than you're currently using them for. The good news? Small changes = big impact.",
  'AI Curious': "You've started your AI journey, but you're only scratching the surface. Let's unlock the features that will make the biggest difference in your pipeline this quarter.",
  'AI Enabled': "You're ahead of most sales professionals. Now it's time to connect the dots — the biggest gains come from making your tools talk to each other.",
  'AI Proficient': "You're in the top 15% of AI-enabled sales professionals. Let's find the final optimizations that separate good from great.",
  'AI Native': "You're a top 5% AI-powered sales professional. You're the benchmark others should aspire to."
};

function getTier(score) {
  for (const tier of TIERS) {
    if (score >= tier.min && score <= tier.max) return tier;
  }
  return TIERS[4];
}

function generateRecommendationsHTML(topRecs) {
  let html = '';
  topRecs.slice(0, 3).forEach((recIndex, i) => {
    const rec = RECS[recIndex];
    if (!rec) return;

    html += `
      <div style="margin-bottom: 24px; padding: 20px; background: #f8f9fa; border-left: 4px solid #2E86C1; border-radius: 4px;">
        <h4 style="margin: 0 0 8px 0; color: #1B4F72; font-size: 16px; font-weight: 700;">
          Recommendation #${i + 1}: ${rec.title}
        </h4>
        <p style="margin: 6px 0; color: #566573; font-size: 13px;">
          <strong>Category:</strong> ${rec.dim}
        </p>
        <p style="margin: 10px 0; color: #2C3E50; font-size: 14px; line-height: 1.6;">
          <strong>Why this matters:</strong> ${rec.why}
        </p>
        <p style="margin: 10px 0; color: #1E8449; font-size: 14px; line-height: 1.6;">
          <strong>Expected result:</strong> ${rec.result}
        </p>
      </div>
    `;
  });
  return html;
}

function generateDimensionScoresHTML(dimScores) {
  const dimBarColors = {
    D1: '#148F77',
    D2: '#2E86C1',
    D3: '#1E8449',
    D4: '#E67E22',
    D5: '#6C3483',
    D6: '#C0392B'
  };

  let html = '<h3 style="margin: 24px 0 16px 0; color: #1B4F72; font-size: 18px; font-weight: 700;">Your Score by Dimension</h3>';

  for (const [d, s] of Object.entries(dimScores)) {
    const barColor = dimBarColors[d] || '#2E86C1';
    html += `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 600; color: #2C3E50;">${s.name}</span>
          <span style="color: ${barColor}; font-weight: 700;">${s.pct}%</span>
        </div>
        <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
          <div style="height: 100%; width: ${s.pct}%; background: ${barColor};"></div>
        </div>
      </div>
    `;
  }

  return html;
}

function generateActionPlanHTML() {
  return `
    <h3 style="margin: 24px 0 16px 0; color: #1B4F72; font-size: 18px; font-weight: 700;">Your 30-Day AI Upgrade Path</h3>

    <h4 style="margin: 16px 0 8px 0; color: #2C3E50; font-size: 15px; font-weight: 600;">Week 1: Foundation</h4>
    <ol style="margin: 0 0 16px 20px; padding: 0; color: #566573;">
      <li style="margin-bottom: 6px;">Pick your #1 pain point from the recommendations above</li>
      <li style="margin-bottom: 6px;">Enable the feature in your primary tool (15 min)</li>
      <li style="margin-bottom: 6px;">Use it on 3 tasks before your next meeting</li>
    </ol>

    <h4 style="margin: 16px 0 8px 0; color: #2C3E50; font-size: 15px; font-weight: 600;">Week 2: Integration</h4>
    <ol style="margin: 0 0 16px 20px; padding: 0; color: #566573;">
      <li style="margin-bottom: 6px;">Make it a daily habit—use before every call or email</li>
      <li style="margin-bottom: 6px;">Add a second recommendation from your list</li>
      <li style="margin-bottom: 6px;">Track the time saved (use a note or simple sheet)</li>
    </ol>

    <h4 style="margin: 16px 0 8px 0; color: #2C3E50; font-size: 15px; font-weight: 600;">Week 3-4: Acceleration</h4>
    <ol style="margin: 0 0 16px 20px; padding: 0; color: #566573;">
      <li style="margin-bottom: 6px;">Review your time savings and share results with your manager</li>
      <li style="margin-bottom: 6px;">Pick a third recommendation and layer it in</li>
      <li style="margin-bottom: 6px;">By day 30, you should have 3 new AI habits locked in</li>
    </ol>
  `;
}

function generateEmailHTML(data) {
  const { userName, score, results } = data;
  const tier = getTier(score);
  const { dimScores, totalWaste, utilization } = results;

  // Extract topRecs from the data - these are question IDs with gaps
  const topRecs = data.topRecs || [7, 12, 17]; // Fallback to default if not provided

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C3E50; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 24px 0; border-bottom: 1px solid #e0e0e0; }
        .logo { font-size: 28px; font-weight: 800; color: #1B4F72; margin: 0; }
        .logo span { color: #2E86C1; }
        .score-hero { text-align: center; padding: 32px 24px; background: #f8f9fa; border-radius: 8px; margin: 24px 0; }
        .score-number { font-size: 64px; font-weight: 800; color: ${tier.color}; margin: 0; }
        .score-of { font-size: 32px; }
        .tier-badge { display: inline-block; background: ${tier.bg}; color: ${tier.color}; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-top: 8px; }
        .metrics-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 24px 0; }
        .metric { text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px; }
        .metric-value { font-size: 24px; font-weight: 800; color: #1B4F72; margin: 0; }
        .metric-label { font-size: 12px; color: #566573; text-transform: uppercase; margin-top: 4px; }
        .section { margin: 32px 0; padding: 0; }
        h3 { margin: 24px 0 16px 0; color: #1B4F72; font-size: 18px; font-weight: 700; }
        p { margin: 12px 0; }
        .story-box { background: #D6EAF8; padding: 16px; border-radius: 8px; border-left: 4px solid #2E86C1; }
        .cta-box { background: #1B4F72; color: white; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0; }
        .cta-button { display: inline-block; background: #2E86C1; color: white; padding: 12px 32px; border-radius: 4px; text-decoration: none; font-weight: 600; margin-top: 12px; }
        .footer { border-top: 1px solid #e0e0e0; padding-top: 16px; margin-top: 32px; font-size: 12px; color: #566573; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo">Merka<span>AI</span> Score</h1>
          <p style="margin: 8px 0 0 0; color: #566573;">Your AI Sales Readiness Assessment</p>
        </div>

        <div class="score-hero">
          <div class="score-number">${score}<span class="score-of">/100</span></div>
          <div class="tier-badge">${tier.name}</div>
          <p style="margin: 16px 0 0 0; color: #2C3E50; font-size: 15px;">${TIER_MESSAGES[tier.name]}</p>
        </div>

        <div class="metrics-row">
          <div class="metric">
            <div class="metric-value" style="color: #2E86C1;">${utilization}%</div>
            <div class="metric-label">AI Utilization</div>
          </div>
          <div class="metric">
            <div class="metric-value" style="color: #E67E22;">${totalWaste}h</div>
            <div class="metric-label">Weekly Time Waste</div>
          </div>
          <div class="metric">
            <div class="metric-value" style="color: #C0392B;">High Risk</div>
            <div class="metric-label">Deal Impact</div>
          </div>
        </div>

        <div class="section">
          <div class="story-box">
            <p style="margin: 0; font-style: italic;">"${TIER_MESSAGES[tier.name]}"</p>
          </div>
        </div>

        <div class="section">
          ${generateDimensionScoresHTML(dimScores)}
        </div>

        <div class="section">
          <h3 style="margin-top: 24px;">Your Top 3 Priority Recommendations</h3>
          <p style="color: #566573; margin-bottom: 16px;">These three actions will have the biggest impact on your AI utilization and save you the most time this month.</p>
          ${generateRecommendationsHTML(topRecs)}
        </div>

        <div class="section">
          ${generateActionPlanHTML()}
        </div>

        <div class="cta-box">
          <h3 style="color: white; margin-top: 0;">Ready to Implement These Changes?</h3>
          <p style="color: #D6EAF8; margin: 12px 0;">We offer personalized advisory services to help sales teams like yours implement these AI optimizations quickly and effectively.</p>
          <p style="color: #D6EAF8; margin: 12px 0;"><strong>Typical results:</strong> 2–5 hours/week of reclaimed time + 15–25% improvement in pipeline velocity</p>
          <p style="margin: 16px 0 0 0;">
            <a href="https://www.merkaai.com/advisory" class="cta-button">Schedule Your Advisory Call</a>
          </p>
          <p style="color: #D6EAF8; font-size: 12px; margin-top: 12px;">15 minutes to discuss your specific challenges and opportunities</p>
        </div>

        <div class="section">
          <h3>What's Next?</h3>
          <p>You've taken the first step by assessing your AI readiness. Here's what we recommend:</p>
          <ol style="color: #566573;">
            <li><strong>This week:</strong> Pick one recommendation and enable it in your primary tool</li>
            <li><strong>Next week:</strong> Make it a daily habit and track time saved</li>
            <li><strong>Within 30 days:</strong> Schedule an advisory call to layer in your remaining recommendations and build a custom AI implementation roadmap</li>
          </ol>
        </div>

        <div class="footer">
          <p style="margin: 0; color: #566573;">© 2026 MerkaAI · www.merkaai.com · Built in Ireland</p>
          <p style="margin: 8px 0 0 0; color: #566573;">Questions? Reply to this email or visit <a href="https://www.merkaai.com" style="color: #2E86C1; text-decoration: none;">www.merkaai.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, userName, score, results, topRecs } = req.body;

    if (!userEmail || !userName || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields: userEmail, userName, score' });
    }

    // Generate HTML email
    const htmlEmail = generateEmailHTML({
      userName,
      score,
      results,
      topRecs
    });

    // Send email to user
    const userEmailResult = await transporter.sendMail({
      from: 'info@merkaai.com',
      to: userEmail,
      subject: `Your MerkaAI Score: ${score}/100 — ${getTier(score).name}`,
      html: htmlEmail,
      replyTo: 'info@merkaai.com'
    });

    console.log('User email sent:', userEmailResult.messageId);

    // Send lead notification to Web3Forms
    const web3FormsKey = process.env.WEB3FORMS_KEY;
    if (web3FormsKey) {
      try {
        const leadNotificationPayload = {
          access_key: web3FormsKey,
          name: userName,
          email: userEmail,
          score: score,
          tier: getTier(score).name,
          ai_utilization: results.utilization,
          weekly_time_waste: results.totalWaste,
          subject: `New Lead: ${userName} - MerkaAI Score ${score}/100`,
          message: `New assessment completed: ${userName} scored ${score}/100 (${getTier(score).name})`
        };

        const web3Response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadNotificationPayload)
        });

        console.log('Web3Forms notification sent:', web3Response.status);
      } catch (web3Error) {
        console.error('Web3Forms error (non-critical):', web3Error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Emails sent successfully',
      messageId: userEmailResult.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
};
