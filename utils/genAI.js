const asyncHandler = require("express-async-handler");
const { GoogleGenAI } = require("@google/genai");
const contextBuilder = require("./contextBuilder");

const genAI = asyncHandler(async (iflowJson) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const context = contextBuilder(iflowJson);
    const prompt = `${context}\n\nIflow Details in JSON: ${iflowJson}\n\nReply:`;
    console.log("Working ??")
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });
    return response.text.trim();
})

module.exports = genAI;