import { Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, amount, description, category, paymentMethod, date } = req.body;

    if (!amount || !description || !category) {
      return res.status(400).json({ message: 'Amount, description, and category are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        type: type || 'EXPENSE',
        amount: parseFloat(amount),
        description,
        category,
        paymentMethod,
        date: date ? new Date(date) : new Date(),
        userId
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const expenses = await prisma.expense.findMany({ where: { userId } });
    
    // Calculate total expenses and total income
    const expensesList = expenses.filter((exp: any) => exp.type === 'EXPENSE');
    const incomesList = expenses.filter((exp: any) => exp.type === 'INCOME');

    const totalExpenses = expensesList.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const totalIncome = incomesList.reduce((sum: number, exp: any) => sum + exp.amount, 0);
    const totalBalance = totalIncome - totalExpenses;
    
    // Aggregate by category
    const expensesByCategory = expensesList.reduce((acc: any, exp: any) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const categoryData = Object.keys(expensesByCategory).map(key => ({
      name: key,
      value: expensesByCategory[key]
    })).sort((a, b) => b.value - a.value);

    // Calculate Financial Score
    let financialScore = 50; // Default neutral score
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
      if (savingsRate >= 40) financialScore = 98;
      else if (savingsRate >= 30) financialScore = 90;
      else if (savingsRate >= 20) financialScore = 80;
      else if (savingsRate >= 10) financialScore = 65;
      else if (savingsRate >= 0) financialScore = 55;
      else if (savingsRate >= -10) financialScore = 40;
      else financialScore = 20;
    } else if (totalExpenses > 0) {
      financialScore = 15; // Spending with no logged income
    }
    
    const categoryAggregates = expenses.reduce((acc: any, exp: any) => {
      const key = `${exp.type}_${exp.category}`;
      if (!acc[key]) {
        acc[key] = { name: exp.category, type: exp.type, value: 0 };
      }
      acc[key].value += exp.amount;
      return acc;
    }, {});
    const allCategoryData = Object.values(categoryAggregates).sort((a: any, b: any) => b.value - a.value);

    res.json({
      totalBalance,
      financialScore,
      totalExpenses,
      totalIncome,
      expenseCount: expensesList.length,
      recentExpenses: expenses.slice(0, 5), // Last 5 transactions
      categoryData,
      allCategoryData
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
