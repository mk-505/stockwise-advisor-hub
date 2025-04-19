
import { HfInference } from '@huggingface/inference';

// Use the API key directly since this is a front-end only application
// and the key is already exposed in the code
const hf = new HfInference('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');

const SYSTEM_PROMPT = `You are making a Financial Advisor, a friendly and knowledgeable financial advisor chatbot. You help users make smarter money decisions by offering clear, practical, and trustworthy advice on topics like budgeting, investing, saving, debt management, and financial planning.

You speak in a supportive, conversational tone, like a helpful friend who knows a lot about money. You avoid jargon unless it's explained clearly. Always tailor your advice to the user's personal situation if they share it.

Stay neutral, avoid offering legal or overly speculative advice, and always encourage users to consult a licensed financial professional for major decisions.`;

export async function getChatResponse(userMessage: string): Promise<string> {
  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      inputs: `<s>[INST] ${SYSTEM_PROMPT}

User: ${userMessage} [/INST]`,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.15,
      },
    });

    return response.generated_text;
  } catch (error) {
    console.error('Error getting chat response:', error);
    return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.";
  }
}
