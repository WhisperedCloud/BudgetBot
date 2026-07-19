import { GoogleGenAI, Type, Schema } from '@google/genai';
import OpenAI, { toFile } from 'openai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.GROK_API_KEY || 'missing_groq_key',
  baseURL: 'https://api.groq.com/openai/v1',
});

// Using Structured Outputs (JSON Schema) to guarantee we get back exactly what we need
const expenseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      description: "Whether this is an INCOME (e.g. salary, deposit, adding balance, received money) or an EXPENSE (e.g. spent money, bought something).",
      enum: ["INCOME", "EXPENSE"]
    },
    amount: {
      type: Type.NUMBER,
      description: "The monetary amount of the transaction. Just the number."
    },
    category: {
      type: Type.STRING,
      description: "A short, standard financial category (e.g., Salary, Food & Dining, Transportation, Entertainment, Utilities, Shopping)"
    },
    description: {
      type: Type.STRING,
      description: "A clean, concise description of the transaction."
    }
  },
  required: ["type", "amount", "category", "description"]
};

export const parseExpenseWithAI = async (textInput: string) => {
  if (!process.env.GROQ_API_KEY && !process.env.GROK_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables.');
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { 
        role: 'system', 
        content: `You are a financial data extraction API. Always return a valid JSON object matching this schema exactly without any markdown or extra text: 
{ 
  "type": "INCOME" or "EXPENSE", 
  "amount": number (just the amount), 
  "category": string (e.g., Salary, Food, Utilities, Shopping), 
  "description": string (short description) 
}` 
      },
      { role: 'user', content: `Extract the expense details from: "${textInput}"` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const responseText = response.choices[0].message.content;
  if (!responseText) {
    throw new Error('Failed to generate AI response.');
  }

  return JSON.parse(responseText);
};

export const parseBudgetWithAI = async (textInput: string) => {
  if (!process.env.GROQ_API_KEY && !process.env.GROK_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables.');
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { 
        role: 'system', 
        content: `You are a financial data extraction API. Always return a valid JSON object matching this schema exactly without any markdown or extra text: 
{ 
  "amount": number (just the limit amount), 
  "category": string (e.g., Food, Rent, Overall)
}` 
      },
      { role: 'user', content: `Extract the budget limit details from: "${textInput}"` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const responseText = response.choices[0].message.content;
  if (!responseText) {
    throw new Error('Failed to generate AI response.');
  }

  return JSON.parse(responseText);
};

export const generateInsights = async (transactions: string) => {
  if (!process.env.GROQ_API_KEY && !process.env.GROK_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables.');
  }

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are an AI financial advisor. Give a 1 to 2 sentence personalized advice or observation. Be encouraging, highly concise, and refer to specific spending patterns if visible. Do not use formatting.' },
      { role: 'user', content: `Based on these recent transactions: ${transactions}. Give your advice.` }
    ],
    temperature: 0.7,
  });

  if (!response.choices[0].message.content) {
    throw new Error('Failed to generate AI response.');
  }

  return response.choices[0].message.content;
};

export const transcribeAudio = async (buffer: Buffer, filename: string = 'audio.webm') => {
  if (!process.env.GROQ_API_KEY && !process.env.GROK_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables.');
  }

  const file = await toFile(buffer, filename);
  
  const response = await groq.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3'
  });

  return response.text;
};
