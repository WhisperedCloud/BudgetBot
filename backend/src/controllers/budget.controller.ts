import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // 1. Get all budgets for the current month
    const budgets = await prisma.budget.findMany({
      where: { userId, month: currentMonth, year: currentYear }
    });

    // 2. Get all expenses for the current month to calculate 'spent'
    const expenses = await prisma.expense.findMany({
      where: { 
        userId, 
        type: 'EXPENSE',
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1)
        }
      }
    });

    // 3. Map budgets and calculate spent amounts
    const budgetsWithSpent = budgets.map(budget => {
      let spent = 0;
      if (budget.category) {
        spent = expenses
          .filter(exp => 
            exp.category.toLowerCase().includes(budget.category!.toLowerCase()) || 
            budget.category!.toLowerCase().includes(exp.category.toLowerCase())
          )
          .reduce((sum, exp) => sum + exp.amount, 0);
      } else {
        // Overall budget
        spent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      }

      return {
        id: budget.id,
        category: budget.category || 'Overall',
        limit: budget.amount,
        spent
      };
    });

    res.json(budgetsWithSpent);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBudget = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, category } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Budget amount is required' });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Check if budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        month: currentMonth,
        year: currentYear,
        category: category || 'Overall'
      }
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: parseFloat(amount) }
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          amount: parseFloat(amount),
          category: category || 'Overall',
          month: currentMonth,
          year: currentYear,
          userId
        }
      });
    }

    res.status(201).json(budget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
