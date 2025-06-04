const express = require('express');
const { GoogleGenAI} = require("@google/genai");


const apiKey = process.env.GOOGLE_API_KEY;
// const genAI = new GoogleGenerativeAI(apiKey);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const ai = new GoogleGenAI({ apiKey: apiKey });


exports.gemini =async (req,res) => {
	const { prompt } = req.body;
  
	if (!prompt) {
	  return res.status(400).json({ error: 'Prompt is required in the request body.' });
	}
  
	try {
	//   const result = await model.generateContent(prompt);
	//   const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
  
	//   if (responseText) {
	// 	res.json({ answer: responseText });
	//   } else {
	// 	res.status(500).json({ error: 'Failed to get a valid response from Gemini.' });
	//   }
	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		contents: prompt,
	  });
	  
	  res.json(response.text);
	} catch (error) {
	  console.error('Error calling Gemini API:', error);
	  res.status(500).json({ error: 'Failed to process the request.' });
	}
};

