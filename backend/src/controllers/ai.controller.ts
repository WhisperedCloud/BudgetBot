import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { parseExpenseWithAI, parseBudgetWithAI, generateInsights, transcribeAudio } from '../services/ai.service';
import prisma from '../utils/prisma';

export const processVoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Transcribe audio using Whisper
    const text = await transcribeAudio(req.file.buffer, req.file.originalname || 'audio.webm');

    res.json({ text });
  } catch (error: any) {
    console.error('Voice Processing Error:', error);
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      return res.status(429).json({ message: 'OpenAI rate limit reached. Please check your billing or quota.' });
    }
    res.status(500).json({ message: error.message || 'Failed to process voice audio' });
  }
};

export const parseAndSaveExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide the text description of your expense.' });
    }

    // 1. Send to Gemini for NLP Extraction
    const parsedData = await parseExpenseWithAI(text);

    // 2. Save directly to database
    const expense = await prisma.expense.create({
      data: {
        type: parsedData.type || "EXPENSE",
        amount: parsedData.amount,
        description: parsedData.description,
        category: parsedData.category,
        date: new Date(),
        userId
      }
    });

    res.status(201).json({
      message: 'Successfully parsed and saved!',
      expense
    });

  } catch (error: any) {
    console.error('AI Parsing Error:', error);
    
    let message = 'Failed to parse expense using AI.';
    let status = 500;
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      message = 'AI rate limit reached. Please wait 1 minute before trying again.';
      status = 429;
    } else {
      try {
        const parsed = JSON.parse(error.message[0] === '[' ? error.message.slice(error.message.indexOf('{')) : error.message);
        if (parsed.error?.message) {
          message = parsed.error.message;
          if (message.includes('quota') || message.includes('rate limit')) {
            message = 'AI rate limit reached. Please wait 1 minute before trying again.';
            status = 429;
          }
        }
      } catch {
        if (error.message?.includes('503') || error.message?.includes('high demand')) {
          message = 'The AI service is currently experiencing high demand. Please try again in a few moments.';
        } else {
          message = error.message || message;
        }
      }
    }

    res.status(status).json({ message });
  }
};

export const parseAndSaveBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide the text description of your budget.' });
    }

    const parsedData = await parseBudgetWithAI(text);
    
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId, month: currentMonth, year: currentYear, category: parsedData.category || 'Overall'
      }
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: parsedData.amount }
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          amount: parsedData.amount,
          category: parsedData.category || 'Overall',
          month: currentMonth,
          year: currentYear,
          userId
        }
      });
    }

    res.status(201).json({
      message: 'Successfully parsed and saved budget!',
      budget
    });
  } catch (error: any) {
    console.error('AI Parsing Error:', error);
    let message = 'Failed to parse budget using AI.';
    let status = 500;
    
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      message = 'AI rate limit reached. Please wait 1 minute before trying again.';
      status = 429;
    } else {
      try {
        const parsed = JSON.parse(error.message[0] === '[' ? error.message.slice(error.message.indexOf('{')) : error.message);
        if (parsed.error?.message) {
          message = parsed.error.message;
          if (message.includes('quota') || message.includes('rate limit')) {
            message = 'AI rate limit reached. Please wait 1 minute before trying again.';
            status = 429;
          }
        }
      } catch {
        if (error.message?.includes('503') || error.message?.includes('high demand')) {
          message = 'The AI service is currently experiencing high demand. Please try again in a few moments.';
        } else {
          message = error.message || message;
        }
      }
    }

    res.status(status).json({ message });
  }
};
export const getInsights = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get last 10 expenses
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10
    });
    
    if (expenses.length === 0) {
      return res.json({ insight: "You haven't logged any transactions yet. Start logging to get personalized AI insights!" });
    }

    const expenseSummary = expenses.map((e: any) => `${e.type === 'INCOME' ? '+' : '-'}${e.amount} on ${e.category} (${e.description})`).join(', ');
    
    const insight = await generateInsights(expenseSummary);
    
    res.json({ insight });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    if (error.message?.includes('429') || error.message?.includes('quota') || error.status === 429) {
      res.status(429).json({ insight: "AI rate limit reached. Please wait a moment before fetching new insights." });
    } else {
      res.status(500).json({ insight: "Failed to generate insights at this moment." });
    }
  }
};
