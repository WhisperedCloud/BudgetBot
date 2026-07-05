import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract the expense details from the following user input: "${textInput}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: expenseSchema,
      temperature: 0.1, // Keep it deterministic
    }
  });

  if (!response.text) {
    throw new Error('Failed to generate AI response.');
  }

  return JSON.parse(response.text);
};

const budgetSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    amount: {
      type: Type.NUMBER,
      description: "The monetary amount of the budget limit. Just the number."
    },
    category: {
      type: Type.STRING,
      description: "The category for this budget (e.g., Food, Rent, Shopping, Entertainment, Overall)"
    }
  },
  required: ["amount", "category"]
};

export const parseBudgetWithAI = async (textInput: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract the budget limit details from the following user input: "${textInput}"`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: budgetSchema,
      temperature: 0.1,
    }
  });
  if (!response.text) {
    throw new Error('Failed to generate AI response.');
  }

  return JSON.parse(response.text);
};

export const generateInsights = async (transactions: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing in environment variables.');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `You are an AI financial advisor. Based on these recent transactions: ${transactions}. Give a 1 to 2 sentence personalized advice or observation. Be encouraging, highly concise, and refer to specific spending patterns if visible. Do not use formatting.`,
    config: {
      temperature: 0.7,
    }
  });

  if (!response.text) {
    throw new Error('Failed to generate AI response.');
  }

  return response.text;
};
