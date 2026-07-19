import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        profileImage: (user as any).profileImage,
        budgetAlerts: (user as any).budgetAlerts,
        weeklyReport: (user as any).weeklyReport,
        currency: (user as any).currency,
        isTwoFactorEnabled: (user as any).isTwoFactorEnabled
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if ((user as any).isTwoFactorEnabled) {
      return res.json({
        requires2FA: true,
        userId: user.id,
        message: '2FA code required'
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        profileImage: (user as any).profileImage,
        budgetAlerts: (user as any).budgetAlerts,
        weeklyReport: (user as any).weeklyReport,
        currency: (user as any).currency,
        isTwoFactorEnabled: (user as any).isTwoFactorEnabled
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, budgetAlerts, weeklyReport, currency, profileImage } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (budgetAlerts !== undefined) data.budgetAlerts = budgetAlerts;
    if (weeklyReport !== undefined) data.weeklyReport = weeklyReport;
    if (currency !== undefined) data.currency = currency;
    if (profileImage !== undefined) data.profileImage = profileImage;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data
    });

    res.json({
      message: 'Settings updated successfully',
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        name: updatedUser.name, 
        role: updatedUser.role,
        profileImage: (updatedUser as any).profileImage,
        budgetAlerts: (updatedUser as any).budgetAlerts,
        weeklyReport: (updatedUser as any).weeklyReport,
        currency: (updatedUser as any).currency,
        isTwoFactorEnabled: (updatedUser as any).isTwoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyLogin2FA = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'User ID and code are required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(user as any).isTwoFactorEnabled || !(user as any).twoFactorSecret) {
      return res.status(400).json({ message: '2FA is not enabled for this user' });
    }

    const verified = speakeasy.totp.verify({
      secret: (user as any).twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (!verified) return res.status(401).json({ message: 'Invalid 2FA code' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        profileImage: (user as any).profileImage,
        budgetAlerts: (user as any).budgetAlerts,
        weeklyReport: (user as any).weeklyReport,
        currency: (user as any).currency,
        isTwoFactorEnabled: true
      },
    });
  } catch (error) {
    console.error('2FA Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Passwords are required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return res.status(400).json({ message: 'Incorrect current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const generate2FA = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret = speakeasy.generateSecret({ name: `FinanceTracker (${user.email})` });
    
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 } as any
    });

    qrcode.toDataURL(secret.otpauth_url!, (err, data_url) => {
      if (err) return res.status(500).json({ message: 'Error generating QR code' });
      res.json({ qrCodeUrl: data_url, secret: secret.base32 });
    });
  } catch (error) {
    console.error('Generate 2FA error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verify2FA = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    if (!code) return res.status(400).json({ message: 'Code is required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(user as any).twoFactorSecret) return res.status(400).json({ message: '2FA not generated' });

    const verified = speakeasy.totp.verify({
      secret: (user as any).twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1
    });

    if (verified) {
      await prisma.user.update({
        where: { id: userId },
        data: { isTwoFactorEnabled: true } as any
      });
      res.json({ message: '2FA enabled successfully' });
    } else {
      res.status(400).json({ message: 'Invalid code' });
    }
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const disable2FA = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: false, twoFactorSecret: null } as any
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
