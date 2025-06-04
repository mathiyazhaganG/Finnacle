const { getOneYearFinanceSummary } = require('../utils/financeSummary');
const fetch = require('node-fetch');

const Aichat = async (req, res) => {
  const { userQuestion } = req.body;
  const userId = req.user.id;

  try {
    const summaryData = await getOneYearFinanceSummary(userId);
    console.log(summaryData);

    const prompt = `
    give me short and crisp answer to this 


${JSON.stringify(summaryData, null, 2)} on

User's Question:
"${userQuestion}"

`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2', 
        prompt,
        stream: false
      })
    });

    const data = await response.json();
    console.log(data.response.trim());
    
    res.json({ response: data.response.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
};

module.exports = { Aichat };

