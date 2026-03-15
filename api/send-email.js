import nodemailer from 'nodemailer';

const handler = async (req, res) => {
  // ✅ Handle CORS preflight
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
    // Send results email to user via SendGrid
    const transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    const resultsEmail = `
      <h2>Tu MerkaAI Score: ${score}</h2>
      <p>¡Hola ${userName}!</p>
      <p>Tu evaluación ha sido completada. Aquí está tu resultado:</p>
      <pre>${JSON.stringify(results, null, 2)}</pre>
    `;

    await transporter.sendMail({
      from: 'info@merkaai.com',
      to: userEmail,
      subject: `Tu MerkaAI Score: ${score}`,
      html: resultsEmail,
    });

    // Send lead notification via Web3Forms (usando JSON, no FormData)
    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: process.env.WEB3FORMS_KEY,
        name: userName,
        email: userEmail,
        score: score,
        dimensions: JSON.stringify(dimension_scores),
        message: `New MerkaAI Score: ${score}`
      })
    });

    res.status(200).json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export default handler;
