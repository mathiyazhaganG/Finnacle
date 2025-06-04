// ai.js
const fetch = require('node-fetch');

// async function askLLM(prompt) {
//   const res = await fetch('http://localhost:11434/api/generate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: 'phi3',
//       prompt: prompt,
//       stream: false // ⬅️ important to avoid streaming
//     })
//   });

//   const data = await res.json();
//   console.log(data.response);
// }

// askLLM(`Here's my monthly financial data:
// Income: ₹60,000
// Expenses:
// - Rent: ₹15,000
// - Food: ₹12,000
// - Transport: ₹4,000
// - Subscriptions: ₹3,000
// - Shopping: ₹7,000
// - Entertainment: ₹5,000
// - Savings: ₹3,000

// whats the total expenses. Limit your response to 10 words.
// `);
// console.log("hello")

async function askLLM() {
  const prompt = "Who is the PM of england?";
  
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama2',
      prompt,
      stream: false
    })
  });

  const data = await response.json(); // extract actual response data
  console.log("Model Response:", data.response); // print model's answer
}

