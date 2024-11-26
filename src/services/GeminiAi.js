/* eslint-disable no-undef */
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const GeminiAI = async (prompt, img = false) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    function fileToGenerativePart(buffer, mimeType) {
        return {
          inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType,
          },
        };
    }

    if(img != false) {
        const imgData = fileToGenerativePart(img.buffer, img.mimeType);
        const result = await model.generateContent([prompt, imgData]);
        return result.response.text();
    } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }

}

module.exports = GeminiAI;