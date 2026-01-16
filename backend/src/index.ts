import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'inversie-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Verify session is still valid
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: token,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    (req as any).user = session.user;
    (req as any).session = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Inversie API',
    version: '1.0.0',
    description: 'Financial guardianship app API',
  });
});

// ============================================
// AUTH ROUTES
// ============================================

// Login with PIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and PIN are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPin = await bcrypt.compare(pin, user.pinHash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30m' });
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    console.log(`[AUTH] User logged in: ${user.email}`);

    res.json({
      token,
      user: {
        id: user.id,
        type: user.type,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        language: user.language,
        biometricsEnabled: user.biometricsEnabled,
        textSize: user.textSize,
        highContrast: user.highContrast,
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    const session = (req as any).session;

    await prisma.session.delete({
      where: { id: session.id }
    });

    console.log(`[AUTH] User logged out: ${(req as any).user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[AUTH] Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    type: user.type,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    language: user.language,
    biometricsEnabled: user.biometricsEnabled,
    textSize: user.textSize,
    highContrast: user.highContrast,
  });
});

// Change PIN
app.post('/api/auth/pin/change', authenticateToken, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    const user = (req as any).user;

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Current and new PIN are required' });
    }

    if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    const validPin = await bcrypt.compare(currentPin, user.pinHash);
    if (!validPin) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    const newPinHash = await bcrypt.hash(newPin, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash: newPinHash }
    });

    console.log(`[AUTH] PIN changed for user: ${user.email}`);
    res.json({ message: 'PIN changed successfully' });
  } catch (error) {
    console.error('[AUTH] PIN change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// POTJES ROUTES
// ============================================

// Get all potjes for current user
app.get('/api/potjes', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const potjes = await prisma.potje.findMany({
      where: { clientId: user.id },
      orderBy: { name: 'asc' }
    });

    res.json(potjes);
  } catch (error) {
    console.error('[POTJES] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single potje
app.get('/api/potjes/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const potje = await prisma.potje.findFirst({
      where: { id, clientId: user.id }
    });

    if (!potje) {
      return res.status(404).json({ error: 'Potje not found' });
    }

    res.json(potje);
  } catch (error) {
    console.error('[POTJES] Get by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// DECISIONS ROUTES
// ============================================

// Get all decisions for current user
app.get('/api/decisions', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const decisions = await prisma.decision.findMany({
      where: { clientId: user.id },
      include: {
        potje: true,
        reflection: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(decisions);
  } catch (error) {
    console.error('[DECISIONS] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new decision
app.post('/api/decisions', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, amount, potjeId, needsHelp } = req.body;

    if (!title || !amount || !potjeId) {
      return res.status(400).json({ error: 'Title, amount, and potje are required' });
    }

    // Verify potje belongs to user
    const potje = await prisma.potje.findFirst({
      where: { id: potjeId, clientId: user.id }
    });

    if (!potje) {
      return res.status(404).json({ error: 'Potje not found' });
    }

    const decision = await prisma.decision.create({
      data: {
        clientId: user.id,
        title,
        description,
        amount,
        potjeId,
        needsHelp: needsHelp || false,
        status: 'PENDING'
      },
      include: { potje: true }
    });

    console.log(`[DECISIONS] New decision created: ${title} by ${user.email}`);
    res.status(201).json(decision);
  } catch (error) {
    console.error('[DECISIONS] Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single decision
app.get('/api/decisions/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const decision = await prisma.decision.findFirst({
      where: { id, clientId: user.id },
      include: {
        potje: true,
        reflection: true
      }
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    res.json(decision);
  } catch (error) {
    console.error('[DECISIONS] Get by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add reflection to decision
app.post('/api/decisions/:id/reflection', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { satisfactionRating, notes } = req.body;

    if (!satisfactionRating || satisfactionRating < 1 || satisfactionRating > 5) {
      return res.status(400).json({ error: 'Satisfaction rating must be 1-5' });
    }

    const decision = await prisma.decision.findFirst({
      where: { id, clientId: user.id }
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    const reflection = await prisma.reflection.create({
      data: {
        decisionId: id,
        satisfactionRating,
        notes
      }
    });

    console.log(`[DECISIONS] Reflection added to decision: ${id}`);
    res.status(201).json(reflection);
  } catch (error) {
    console.error('[DECISIONS] Reflection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// MONEY REQUESTS ROUTES
// ============================================

// Get all money requests for current user
app.get('/api/money-requests', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const requests = await prisma.moneyRequest.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('[MONEY-REQUESTS] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new money request
app.post('/api/money-requests', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { amount, category, description, photoUrl } = req.body;

    if (!amount || !category || !photoUrl) {
      return res.status(400).json({ error: 'Amount, category, and photo are required' });
    }

    const request = await prisma.moneyRequest.create({
      data: {
        clientId: user.id,
        amount,
        category,
        description,
        photoUrl,
        status: 'PENDING'
      }
    });

    console.log(`[MONEY-REQUESTS] New request created: €${amount} for ${category} by ${user.email}`);
    res.status(201).json(request);
  } catch (error) {
    console.error('[MONEY-REQUESTS] Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// TRANSACTIONS ROUTES
// ============================================

// Get all transactions for current user
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { startDate, endDate, category } = req.query;

    const where: any = { clientId: user.id };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (category) {
      where.category = category;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    res.json(transactions);
  } catch (error) {
    console.error('[TRANSACTIONS] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// SAVINGS GOALS ROUTES
// ============================================

// Get all savings goals for current user
app.get('/api/savings-goals', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const goals = await prisma.savingsGoal.findMany({
      where: { clientId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(goals);
  } catch (error) {
    console.error('[SAVINGS-GOALS] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new savings goal
app.post('/api/savings-goals', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { name, targetAmount, targetDate, imageUrl } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        clientId: user.id,
        name,
        targetAmount,
        targetDate: targetDate ? new Date(targetDate) : null,
        imageUrl
      }
    });

    console.log(`[SAVINGS-GOALS] New goal created: ${name} by ${user.email}`);
    res.status(201).json(goal);
  } catch (error) {
    console.error('[SAVINGS-GOALS] Create error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update savings goal
app.put('/api/savings-goals/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { name, targetAmount, targetDate, imageUrl, currentAmount, isCompleted } = req.body;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, clientId: user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        targetAmount: targetAmount ?? existing.targetAmount,
        targetDate: targetDate ? new Date(targetDate) : existing.targetDate,
        imageUrl: imageUrl ?? existing.imageUrl,
        currentAmount: currentAmount ?? existing.currentAmount,
        isCompleted: isCompleted ?? existing.isCompleted,
        completedAt: isCompleted && !existing.isCompleted ? new Date() : existing.completedAt
      }
    });

    res.json(goal);
  } catch (error) {
    console.error('[SAVINGS-GOALS] Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete savings goal
app.delete('/api/savings-goals/:id', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const existing = await prisma.savingsGoal.findFirst({
      where: { id, clientId: user.id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    await prisma.savingsGoal.delete({
      where: { id }
    });

    console.log(`[SAVINGS-GOALS] Goal deleted: ${existing.name} by ${user.email}`);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('[SAVINGS-GOALS] Delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================

// Get all notifications for current user
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(notifications);
  } catch (error) {
    console.error('[NOTIFICATIONS] Get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;

    const notification = await prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('[NOTIFICATIONS] Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[NOTIFICATIONS] Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// USER PROFILE ROUTES
// ============================================

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  const user = (req as any).user;
  res.json({
    id: user.id,
    type: user.type,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    language: user.language,
    biometricsEnabled: user.biometricsEnabled,
    textSize: user.textSize,
    highContrast: user.highContrast,
  });
});

// Update user settings
app.put('/api/users/settings', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { language, biometricsEnabled, textSize, highContrast } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        language: language ?? user.language,
        biometricsEnabled: biometricsEnabled ?? user.biometricsEnabled,
        textSize: textSize ?? user.textSize,
        highContrast: highContrast ?? user.highContrast,
      }
    });

    res.json({
      id: updatedUser.id,
      type: updatedUser.type,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      language: updatedUser.language,
      biometricsEnabled: updatedUser.biometricsEnabled,
      textSize: updatedUser.textSize,
      highContrast: updatedUser.highContrast,
    });
  } catch (error) {
    console.error('[USERS] Settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// BEWINDVOERDER ROUTES
// ============================================

// Get all clients for current bewindvoerder
app.get('/api/bewindvoerder/clients', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can access this' });
    }

    const relations = await prisma.clientBewindvoerderRelation.findMany({
      where: { bewindvoerderId: user.id },
      include: {
        client: true
      }
    });

    const clientsWithCounts = await Promise.all(
      relations.map(async (relation) => {
        const pendingDecisions = await prisma.decision.count({
          where: { clientId: relation.clientId, status: 'PENDING' }
        });
        const pendingMoneyRequests = await prisma.moneyRequest.count({
          where: { clientId: relation.clientId, status: 'PENDING' }
        });

        return {
          id: relation.client.id,
          firstName: relation.client.firstName,
          lastName: relation.client.lastName,
          email: relation.client.email,
          pendingDecisions,
          pendingMoneyRequests,
          lastActivity: relation.client.updatedAt.toISOString()
        };
      })
    );

    res.json(clientsWithCounts);
  } catch (error) {
    console.error('[BEWINDVOERDER] Get clients error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get decisions for a client (bewindvoerder)
app.get('/api/bewindvoerder/clients/:clientId/decisions', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { clientId } = req.params;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can access this' });
    }

    // Verify relationship
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: { bewindvoerderId: user.id, clientId }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized for this client' });
    }

    const decisions = await prisma.decision.findMany({
      where: { clientId },
      include: { potje: true, reflection: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(decisions);
  } catch (error) {
    console.error('[BEWINDVOERDER] Get client decisions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get money requests for a client (bewindvoerder)
app.get('/api/bewindvoerder/clients/:clientId/money-requests', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { clientId } = req.params;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can access this' });
    }

    // Verify relationship
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: { bewindvoerderId: user.id, clientId }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized for this client' });
    }

    const requests = await prisma.moneyRequest.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error) {
    console.error('[BEWINDVOERDER] Get client money requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve decision (bewindvoerder)
app.post('/api/bewindvoerder/decisions/:id/approve', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { message } = req.body;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can approve decisions' });
    }

    const decision = await prisma.decision.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Verify authorization by checking relation directly
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: {
        clientId: decision.clientId,
        bewindvoerderId: user.id
      }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized to approve this decision' });
    }

    const updated = await prisma.decision.update({
      where: { id },
      data: {
        status: 'APPROVED',
        bewindvoerderMessage: message || null,
        approvedAt: new Date()
      },
      include: { potje: true }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: decision.clientId,
        type: 'decision_approved',
        title: 'Keuze goedgekeurd',
        message: `Je keuze "${decision.title}" is goedgekeurd door ${user.firstName}.`
      }
    });

    console.log(`[BEWINDVOERDER] Decision approved: ${id} by ${user.email}`);
    res.json(updated);
  } catch (error) {
    console.error('[BEWINDVOERDER] Approve decision error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deny decision (bewindvoerder)
app.post('/api/bewindvoerder/decisions/:id/deny', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { message } = req.body;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can deny decisions' });
    }

    const decision = await prisma.decision.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!decision) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    // Verify authorization by checking relation directly
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: {
        clientId: decision.clientId,
        bewindvoerderId: user.id
      }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized to deny this decision' });
    }

    const updated = await prisma.decision.update({
      where: { id },
      data: {
        status: 'DENIED',
        bewindvoerderMessage: message || null
      },
      include: { potje: true }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: decision.clientId,
        type: 'decision_denied',
        title: 'Keuze afgewezen',
        message: message || `Je keuze "${decision.title}" is afgewezen.`
      }
    });

    console.log(`[BEWINDVOERDER] Decision denied: ${id} by ${user.email}`);
    res.json(updated);
  } catch (error) {
    console.error('[BEWINDVOERDER] Deny decision error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve money request (bewindvoerder)
app.post('/api/bewindvoerder/money-requests/:id/approve', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { message } = req.body;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can approve money requests' });
    }

    const request = await prisma.moneyRequest.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Money request not found' });
    }

    // Verify authorization by checking relation directly
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: {
        clientId: request.clientId,
        bewindvoerderId: user.id
      }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized to approve this request' });
    }

    const updated = await prisma.moneyRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        bewindvoerderMessage: message || null
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: request.clientId,
        type: 'money_approved',
        title: 'Geldverzoek goedgekeurd',
        message: `Je geldverzoek van €${request.amount.toFixed(2)} is goedgekeurd.`
      }
    });

    console.log(`[BEWINDVOERDER] Money request approved: ${id} by ${user.email}`);
    res.json(updated);
  } catch (error) {
    console.error('[BEWINDVOERDER] Approve money request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deny money request (bewindvoerder)
app.post('/api/bewindvoerder/money-requests/:id/deny', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { message } = req.body;

    if (user.type !== 'BEWINDVOERDER') {
      return res.status(403).json({ error: 'Only bewindvoerders can deny money requests' });
    }

    const request = await prisma.moneyRequest.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!request) {
      return res.status(404).json({ error: 'Money request not found' });
    }

    // Verify authorization by checking relation directly
    const relation = await prisma.clientBewindvoerderRelation.findFirst({
      where: {
        clientId: request.clientId,
        bewindvoerderId: user.id
      }
    });

    if (!relation) {
      return res.status(403).json({ error: 'Not authorized to deny this request' });
    }

    const updated = await prisma.moneyRequest.update({
      where: { id },
      data: {
        status: 'DENIED',
        bewindvoerderMessage: message || null
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: request.clientId,
        type: 'money_denied',
        title: 'Geldverzoek afgewezen',
        message: message || `Je geldverzoek van €${request.amount.toFixed(2)} is afgewezen.`
      }
    });

    console.log(`[BEWINDVOERDER] Money request denied: ${id} by ${user.email}`);
    res.json(updated);
  } catch (error) {
    console.error('[BEWINDVOERDER] Deny money request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// SEED DATA ENDPOINT (for development)
// ============================================

app.post('/api/dev/seed', async (req, res) => {
  try {
    // Create test users
    const pinHash = await bcrypt.hash('1234', 10);

    // Create client user
    const client = await prisma.user.upsert({
      where: { email: 'jan@test.nl' },
      update: {},
      create: {
        type: 'CLIENT',
        email: 'jan@test.nl',
        pinHash,
        firstName: 'Jan',
        lastName: 'de Vries',
        language: 'nl'
      }
    });

    // Create bewindvoerder user
    const bewindvoerder = await prisma.user.upsert({
      where: { email: 'maria@bewind.nl' },
      update: {},
      create: {
        type: 'BEWINDVOERDER',
        email: 'maria@bewind.nl',
        pinHash,
        firstName: 'Maria',
        lastName: 'Jansen',
        language: 'nl'
      }
    });

    // Create relation
    await prisma.clientBewindvoerderRelation.upsert({
      where: {
        clientId_bewindvoerderId: {
          clientId: client.id,
          bewindvoerderId: bewindvoerder.id
        }
      },
      update: {},
      create: {
        clientId: client.id,
        bewindvoerderId: bewindvoerder.id
      }
    });

    // Create potjes for client
    const potjesData = [
      { name: 'Boodschappen', icon: 'cart', monthlyBudget: 400, currentSpent: 280 },
      { name: 'Vrije tijd', icon: 'game-controller', monthlyBudget: 100, currentSpent: 45 },
      { name: 'Kleding', icon: 'shirt', monthlyBudget: 75, currentSpent: 20 },
      { name: 'Vervoer', icon: 'bus', monthlyBudget: 50, currentSpent: 50 },
    ];

    for (const potjeData of potjesData) {
      await prisma.potje.upsert({
        where: {
          id: `${client.id}-${potjeData.name.toLowerCase()}`
        },
        update: potjeData,
        create: {
          id: `${client.id}-${potjeData.name.toLowerCase()}`,
          clientId: client.id,
          ...potjeData
        }
      });
    }

    console.log('[SEED] Test data created successfully');
    res.json({
      message: 'Seed data created',
      client: { email: client.email, pin: '1234' },
      bewindvoerder: { email: bewindvoerder.email, pin: '1234' }
    });
  } catch (error) {
    console.error('[SEED] Error:', error);
    res.status(500).json({ error: 'Seed failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
================================================
  Inversie Backend Server
  Running on http://localhost:${PORT}
================================================

  Test credentials (after seeding):
  - Client: jan@test.nl / PIN: 1234
  - Bewindvoerder: maria@bewind.nl / PIN: 1234

  Run POST /api/dev/seed to create test data
  `);
});

export default app;
