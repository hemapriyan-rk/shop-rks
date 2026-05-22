import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';
import { isAdminOrAbove } from '../../middleware/auth';
import { getISTDayBounds, getISTMonthBounds, toISTDateString } from '../../utils/time';
import { sendSuccess } from '../../utils/response';

/**
 * Fix #3: All expense calculations use ONLY APPROVED expenses.
 * Financial Engine — all queries performed in PostgreSQL via Prisma aggregates.
 */

export async function getTodaySummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const today = toISTDateString();
    const { start, end } = getISTDayBounds(today);
    const isAdmin = isAdminOrAbove(req.user!, 'analytics');
    const userId = isAdmin ? undefined : req.user!.userId;

    const [txGroups, expAgg, pendingExpenses] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: start, lte: end }, ...(userId && { userId }) },
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: {
          createdAt: { gte: start, lte: end },
          status: 'APPROVED',  // Fix #3: Only APPROVED
          ...(userId && { userId }),
        },
        _sum: { amount: true },
        _count: true,
      }),
      isAdmin ? prisma.expense.count({
        where: { createdAt: { gte: start, lte: end }, status: 'PENDING' },
      }) : Promise.resolve(0),
    ]);

    let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;
    for (const g of txGroups) {
      const sum = Number(g._sum.totalPrice ?? 0);
      income += sum;
      txCount += g._count;
      if (g.paymentMethod === 'CASH') cashIncome += sum;
      if (g.paymentMethod === 'ONLINE') onlineIncome += sum;
      if (g.paymentMethod === 'OTHER') otherIncome += sum;
      if (g.paymentMethod === 'SHOP_XEROX') shopXeroxIncome += sum;
    }

    const expenses = Number(expAgg._sum.amount ?? 0);
    const profit = income - expenses;

    sendSuccess(res, {
      date: today,
      income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,
      profit,
      transactionCount: txCount,
      expenseCount: expAgg._count,
      pendingExpenseCount: pendingExpenses,
    });
  } catch (err) { next(err); }
}

export async function getDailyAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetDate = (req.query.date as string) || toISTDateString();
    const { start, end } = getISTDayBounds(targetDate);
    const isAdmin = isAdminOrAbove(req.user!, 'analytics');
    const targetUserId = isAdmin && req.query.userId ? (req.query.userId as string) : undefined;
    const userIdFilter = targetUserId ? { userId: targetUserId } : {};

    const [txGroups, expAgg, topServices, userBreakdown] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: start, lte: end }, ...userIdFilter },
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: 'APPROVED', ...userIdFilter },
        _sum: { amount: true },
        _count: true,
      }),
      // Top services by revenue
      prisma.transaction.groupBy({
        by: ['serviceId'],
        where: { createdAt: { gte: start, lte: end }, ...userIdFilter },
        _sum: { totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 5,
      }),
      // Per-user breakdown
      prisma.transaction.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: start, lte: end }, ...userIdFilter },
        _sum: { totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
      }),
    ]);

    // Enrich top services with names
    const serviceIds = topServices.map(s => s.serviceId);
    const serviceNames = await prisma.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true, category: true },
    });
    const serviceMap = Object.fromEntries(serviceNames.map(s => [s.id, s]));

    // Enrich user breakdown with names
    const userIds = userBreakdown.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true },
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    // Expense categories breakdown
    const expenseCategories = await prisma.expense.groupBy({
      by: ['category'],
      where: { createdAt: { gte: start, lte: end }, status: 'APPROVED', ...userIdFilter },
      _sum: { amount: true },
    });

    let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;
    let expenses = 0;

    // Check Snapshot if no transactions exist (maybe deleted by auto-cleanup)
    if (txGroups.length === 0 && expAgg._count === 0) {
      let snapshot: any = null;
      if (targetUserId) {
        snapshot = await prisma.userDailyAnalyticsSnapshot.findUnique({
          where: { userId_date: { userId: targetUserId, date: new Date(`${targetDate}T00:00:00Z`) } }
        });
      } else {
        snapshot = await prisma.dailyAnalyticsSnapshot.findUnique({
          where: { date: new Date(`${targetDate}T00:00:00Z`) }
        });
      }
      
      if (snapshot) {
        income = Number(snapshot.income);
        cashIncome = Number(snapshot.cashIncome);
        onlineIncome = Number(snapshot.onlineIncome);
        otherIncome = Number(snapshot.otherIncome);
        shopXeroxIncome = Number(snapshot.shopXeroxIncome);
        expenses = Number(snapshot.expenses);
        txCount = snapshot.transactionCount;
      }
    } else {
      for (const g of txGroups) {
        const sum = Number(g._sum.totalPrice ?? 0);
        income += sum;
        txCount += g._count;
        if (g.paymentMethod === 'CASH') cashIncome += sum;
        if (g.paymentMethod === 'ONLINE') onlineIncome += sum;
        if (g.paymentMethod === 'OTHER') otherIncome += sum;
        if (g.paymentMethod === 'SHOP_XEROX') shopXeroxIncome += sum;
      }
      expenses = Number(expAgg._sum.amount ?? 0);
    }

    sendSuccess(res, {
      date: targetDate,
      income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,
      profit: income - expenses,
      transactionCount: txCount,
      expenseCount: expAgg._count,
      topServices: topServices.map(s => ({
        service: serviceMap[s.serviceId],
        revenue: Number(s._sum.totalPrice ?? 0),
        count: s._count,
      })),
      userBreakdown: userBreakdown.map(u => ({
        user: userMap[u.userId],
        revenue: Number(u._sum.totalPrice ?? 0),
        count: u._count,
      })),
      expenseCategories: expenseCategories.map(e => ({
        category: e.category,
        total: Number(e._sum.amount ?? 0),
      })),
    });
  } catch (err) { next(err); }
}

export async function getMonthlyAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const year = parseInt((req.query.year as string) || String(now.getFullYear()));
    const month = parseInt((req.query.month as string) || String(now.getMonth() + 1));

    const { start, end } = getISTMonthBounds(year, month);
    const isAdmin = isAdminOrAbove(req.user!, 'analytics');
    const targetUserId = isAdmin && req.query.userId ? (req.query.userId as string) : undefined;
    const userIdFilter = targetUserId ? { userId: targetUserId } : {};

    const [txGroups, expAgg] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['paymentMethod'],
        where: { createdAt: { gte: start, lte: end }, ...userIdFilter },
        _sum: { totalPrice: true },
        _count: true,
      }),
      prisma.expense.aggregate({
        where: { createdAt: { gte: start, lte: end }, status: 'APPROVED', ...userIdFilter },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    // Build daily breakdown for chart
    const dailyTransactions = await prisma.$queryRaw<Array<{
      day: string; income: string; cash_income: string; online_income: string; count: bigint;
    }>>`
      SELECT 
        to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') as day,
        SUM(total_price)::text as income,
        SUM(CASE WHEN payment_method = 'CASH' THEN total_price ELSE 0 END)::text as cash_income,
        SUM(CASE WHEN payment_method = 'ONLINE' THEN total_price ELSE 0 END)::text as online_income,
        SUM(CASE WHEN payment_method = 'OTHER' THEN total_price ELSE 0 END)::text as other_income,
        SUM(CASE WHEN payment_method = 'SHOP_XEROX' THEN total_price ELSE 0 END)::text as shop_xerox_income,
        COUNT(*)::bigint as count
      FROM transactions
      WHERE created_at >= ${start} AND created_at <= ${end}
      ${targetUserId ? Prisma.sql`AND user_id = ${targetUserId}` : Prisma.empty}
      GROUP BY day
      ORDER BY day ASC
    `;

    const dailyExpenses = await prisma.$queryRaw<Array<{
      day: string; total: string;
    }>>`
      SELECT 
        to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') as day,
        SUM(amount)::text as total
      FROM expenses
      WHERE created_at >= ${start} AND created_at <= ${end}
        AND status = 'APPROVED'
        ${targetUserId ? Prisma.sql`AND user_id = ${targetUserId}` : Prisma.empty}
      GROUP BY day
      ORDER BY day ASC
    `;

    // Merge into daily data map
    const dayMap: Record<string, { income: number; cashIncome: number; onlineIncome: number; otherIncome: number; shopXeroxIncome: number; expenses: number; profit: number; count: number }> = {};
    for (const row of dailyTransactions as any[]) {
      dayMap[row.day] = { 
        income: parseFloat(row.income), 
        cashIncome: parseFloat(row.cash_income || '0'),
        onlineIncome: parseFloat(row.online_income || '0'),
        otherIncome: parseFloat(row.other_income || '0'),
        shopXeroxIncome: parseFloat(row.shop_xerox_income || '0'),
        expenses: 0, profit: 0, count: Number(row.count) 
      };
    }
    for (const row of dailyExpenses as any[]) {
      if (!dayMap[row.day]) dayMap[row.day] = { income: 0, cashIncome: 0, onlineIncome: 0, otherIncome: 0, shopXeroxIncome: 0, expenses: 0, profit: 0, count: 0 };
      dayMap[row.day].expenses = parseFloat(row.total);
    }
    for (const day of Object.keys(dayMap)) {
      dayMap[day].profit = dayMap[day].income - dayMap[day].expenses;
    }

    let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;
    let expenses = 0, expCount = expAgg._count;

    if (txGroups.length === 0 && expAgg._count === 0) {
      // Fallback to snapshots
      let snapshots: any[] = [];
      if (targetUserId) {
        snapshots = await prisma.userDailyAnalyticsSnapshot.findMany({
          where: { userId: targetUserId, date: { gte: start, lte: end } }
        });
      } else {
        snapshots = await prisma.dailyAnalyticsSnapshot.findMany({
          where: { date: { gte: start, lte: end } }
        });
      }
      for (const snap of snapshots) {
        const dayStr = snap.date.toISOString().split('T')[0];
        dayMap[dayStr] = {
          income: Number(snap.income),
          cashIncome: Number(snap.cashIncome),
          onlineIncome: Number(snap.onlineIncome),
          otherIncome: Number(snap.otherIncome),
          shopXeroxIncome: Number(snap.shopXeroxIncome),
          expenses: Number(snap.expenses),
          profit: Number(snap.profit),
          count: snap.transactionCount
        };
        income += Number(snap.income);
        cashIncome += Number(snap.cashIncome);
        onlineIncome += Number(snap.onlineIncome);
        otherIncome += Number(snap.otherIncome);
        shopXeroxIncome += Number(snap.shopXeroxIncome);
        expenses += Number(snap.expenses);
        txCount += snap.transactionCount;
      }
    } else {
      for (const g of txGroups) {
        const sum = Number(g._sum.totalPrice ?? 0);
        income += sum;
        txCount += g._count;
        if (g.paymentMethod === 'CASH') cashIncome += sum;
        if (g.paymentMethod === 'ONLINE') onlineIncome += sum;
        if (g.paymentMethod === 'OTHER') otherIncome += sum;
        if (g.paymentMethod === 'SHOP_XEROX') shopXeroxIncome += sum;
      }
      expenses = Number(expAgg._sum.amount ?? 0);
    }

    sendSuccess(res, {
      year,
      month,
      income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,
      profit: income - expenses,
      transactionCount: txCount,
      expenseCount: expCount,
      daily: Object.entries(dayMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    });
  } catch (err) { next(err); }
}

export async function manualAdjust(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, type, amount, note } = req.body;
    
    if (req.user!.role !== 'SUPER_ADMIN') {
      sendSuccess(res, null, 403, undefined, 'Only Super Admin can do this');
      return;
    }

    if (!date || !type || !amount || amount <= 0) {
      sendSuccess(res, null, 400, undefined, 'Missing required fields or invalid amount');
      return;
    }

    // Set the time to 12:00 PM on that date to ensure it falls safely in that day
    const [year, month, day] = date.split('-');
    const adjustedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0));

    let result;
    if (type === 'INCOME') {
      // Find a dummy service or create an arbitrary record
      let defaultService = await prisma.service.findFirst({ where: { name: 'Others' } });
      if (!defaultService) {
        defaultService = await prisma.service.findFirst();
      }
      if (!defaultService) {
        defaultService = await prisma.service.create({
          data: { name: 'Manual Adjustment', category: 'OTHER', price: 0, isActive: false }
        });
      }

      result = await prisma.transaction.create({
        data: {
          userId: req.user!.userId,
          serviceId: defaultService.id,
          quantity: 1,
          unitPrice: amount,
          totalPrice: amount,
          paymentMethod: 'OTHER',
          notes: note || 'SuperAdmin Manual Income Adjustment',
          createdAt: adjustedDate
        }
      });
    } else if (type === 'EXPENSE') {
      result = await prisma.expense.create({
        data: {
          userId: req.user!.userId,
          amount,
          category: 'Manual Adjustment',
          note: note || 'SuperAdmin Manual Expense Adjustment',
          status: 'APPROVED',
          createdAt: adjustedDate
        }
      });
    } else {
      sendSuccess(res, null, 400, undefined, 'Invalid type');
      return;
    }

    await prisma.log.create({
      data: {
        userId: req.user!.userId,
        action: 'CREATE',
        tableName: type === 'INCOME' ? 'transactions' : 'expenses',
        recordId: result.id,
        newValue: { action: 'MANUAL_ANALYTICS_ADJUSTMENT', type, amount, note, adjustedDate } as any,
      }
    });

    sendSuccess(res, result, 200, undefined, `${type} adjustment applied successfully to ${date}`);
  } catch (err) { next(err); }
}
