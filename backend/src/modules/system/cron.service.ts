import cron from 'node-cron';
import { prisma } from '../../config/prisma';
import * as xlsx from 'xlsx';

/**
 * Snapshot function to preserve 1 year of daily analytics before raw transactions are deleted.
 * Call this before deleting transactions for a specific date range.
 */
async function createAnalyticsSnapshots(endDate: Date) {
  // Aggregate transactions by date up to endDate
  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { lt: endDate } },
    select: { createdAt: true, paymentMethod: true, totalPrice: true }
  });

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { lt: endDate }, status: 'APPROVED' },
    select: { createdAt: true, amount: true }
  });

  const snapshotMap = new Map<string, any>();

  for (const t of transactions) {
    const dStr = t.createdAt.toISOString().split('T')[0];
    if (!snapshotMap.has(dStr)) {
      snapshotMap.set(dStr, { income: 0, cashIncome: 0, onlineIncome: 0, otherIncome: 0, shopXeroxIncome: 0, expenses: 0, transactionCount: 0 });
    }
    const day = snapshotMap.get(dStr)!;
    const amount = Number(t.totalPrice);
    day.income += amount;
    day.transactionCount += 1;
    if (t.paymentMethod === 'CASH') day.cashIncome += amount;
    if (t.paymentMethod === 'ONLINE') day.onlineIncome += amount;
    if (t.paymentMethod === 'OTHER') day.otherIncome += amount;
    if (t.paymentMethod === 'SHOP_XEROX') day.shopXeroxIncome += amount;
  }

  for (const e of expenses) {
    const dStr = e.createdAt.toISOString().split('T')[0];
    if (!snapshotMap.has(dStr)) {
      snapshotMap.set(dStr, { income: 0, cashIncome: 0, onlineIncome: 0, otherIncome: 0, shopXeroxIncome: 0, expenses: 0, transactionCount: 0 });
    }
    const day = snapshotMap.get(dStr)!;
    day.expenses += Number(e.amount);
  }

  // Save to database
  for (const [dateStr, stats] of snapshotMap.entries()) {
    const dateObj = new Date(dateStr);
    await prisma.dailyAnalyticsSnapshot.upsert({
      where: { date: dateObj },
      update: { ...stats, profit: stats.income - stats.expenses },
      create: { date: dateObj, ...stats, profit: stats.income - stats.expenses }
    });
  }
}

/**
 * Generate Excel buffer with 3 sheets: Transactions, Expenses, Audit Logs
 */
async function generateExcelBuffer(endDate: Date): Promise<Buffer> {
  const wb = xlsx.utils.book_new();

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { lt: endDate } },
    include: { service: true, user: true }
  });
  const txData = transactions.map(t => ({
    ID: t.id,
    Date: t.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    Operator: t.user?.name || 'Unknown',
    Service: t.service?.name || 'Unknown',
    PaymentMethod: t.paymentMethod,
    Quantity: t.quantity,
    UnitPrice: Number(t.unitPrice),
    TotalPrice: Number(t.totalPrice),
    Notes: t.notes || ''
  }));
  const txSheet = xlsx.utils.json_to_sheet(txData);
  xlsx.utils.book_append_sheet(wb, txSheet, 'Transactions');

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { lt: endDate } },
    include: { user: true }
  });
  const expData = expenses.map(e => ({
    ID: e.id,
    Date: e.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    Operator: e.user?.name || 'Unknown',
    Category: e.category,
    Amount: Number(e.amount),
    Status: e.status,
    Notes: e.note || ''
  }));
  const expSheet = xlsx.utils.json_to_sheet(expData);
  xlsx.utils.book_append_sheet(wb, expSheet, 'Expenses');

  const logs = await prisma.log.findMany({
    where: { createdAt: { lt: endDate } },
    include: { user: true }
  });
  const logData = logs.map(l => ({
    ID: l.id,
    Date: l.createdAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    Operator: l.user?.name || 'Unknown',
    Action: l.action,
    Table: l.tableName,
    RecordID: l.recordId
  }));
  const logSheet = xlsx.utils.json_to_sheet(logData);
  xlsx.utils.book_append_sheet(wb, logSheet, 'Audit Logs');

  // Generate buffer
  return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

export async function performManualCleanup(endDate: Date, types: string[]) {
  // 1. Snapshot analytics before deletion
  if (types.includes('transactions') || types.includes('expenses')) {
    await createAnalyticsSnapshots(endDate);
  }

  // 2. Perform deletion
  if (types.includes('transactions')) await prisma.transaction.deleteMany({ where: { createdAt: { lt: endDate } } });
  if (types.includes('expenses')) await prisma.expense.deleteMany({ where: { createdAt: { lt: endDate } } });
  if (types.includes('logs')) await prisma.log.deleteMany({ where: { createdAt: { lt: endDate } } });
}

export function initCronJobs() {
  // ── Render Anti-Sleep Ping ──
  // Runs every 10 minutes to prevent Render free-tier from spinning down
  cron.schedule('*/10 * * * *', async () => {
    try {
      const pingUrl = process.env.RENDER_EXTERNAL_URL 
        ? `${process.env.RENDER_EXTERNAL_URL}/api/health`
        : `http://localhost:${process.env.PORT || 5001}/api/health`;
      
      const res = await fetch(pingUrl);
      if (res.ok) {
        console.log(`[Anti-Sleep] Pinged ${pingUrl} successfully.`);
      } else {
        console.warn(`[Anti-Sleep] Pinged ${pingUrl} but got status: ${res.status}`);
      }
    } catch (err) {
      console.error('[Anti-Sleep] Failed to ping self:', err);
    }
  });

  // Run daily at 1:00 AM IST
  cron.schedule('0 1 * * *', async () => {
    console.log('🕒 Running Daily Maintenance Job...');
    try {
      const config = await prisma.systemConfig.findUnique({ where: { id: 1 } });
      if (!config) return;

      const now = new Date();

      // Clean up expired DataExports
      const expiredExports = await prisma.dataExport.deleteMany({
        where: { expiresAt: { lt: now } }
      });
      if (expiredExports.count > 0) {
        console.log(`🗑️ Deleted ${expiredExports.count} expired Excel exports.`);
      }

      // Cleanup Old Snapshots (> 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      await prisma.dailyAnalyticsSnapshot.deleteMany({
        where: { date: { lt: oneYearAgo } }
      });

      if (!config.autoCleanupEnabled) return;

      // Handle Auto Cleanup Scheduling
      if (!config.nextCleanupDate) {
        // Set next cleanup to 1st of next month
        const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 1, 0, 0);
        await prisma.systemConfig.update({ where: { id: 1 }, data: { nextCleanupDate: nextDate } });
        return;
      }

      const nextCleanup = new Date(config.nextCleanupDate);
      const timeDiff = nextCleanup.getTime() - now.getTime();
      const daysUntilCleanup = Math.ceil(timeDiff / (1000 * 3600 * 24));

      const targetDeletionDate = new Date(nextCleanup);
      targetDeletionDate.setMonth(targetDeletionDate.getMonth() - config.autoCleanupDurationMonths);

      // Phase 1: 5 days before, generate Excel
      if (daysUntilCleanup <= 5 && daysUntilCleanup > 0) {
        const existingExport = await prisma.dataExport.findFirst({
          where: { scheduledFor: nextCleanup }
        });
        if (!existingExport) {
          console.log(`📦 Generating Auto-Cleanup Excel Export (Target: < ${targetDeletionDate.toISOString()})...`);
          const buffer = await generateExcelBuffer(targetDeletionDate);
          
          const expires = new Date(nextCleanup);
          expires.setDate(expires.getDate() + 2); // Expire 2 days after cleanup

          await prisma.dataExport.create({
            data: {
              fileName: `RKS_Archive_${targetDeletionDate.toISOString().split('T')[0]}.xlsx`,
              fileData: buffer,
              scheduledFor: nextCleanup,
              expiresAt: expires
            }
          });
          console.log('✅ Export generated and stored in DB.');
        }
      }

      // Phase 2: Cleanup day
      if (daysUntilCleanup <= 0) {
        console.log(`🧹 Executing Auto-Cleanup for data older than ${targetDeletionDate.toISOString()}`);
        await performManualCleanup(targetDeletionDate, ['transactions', 'expenses', 'logs']);
        
        // Schedule next cleanup (1st of next month)
        const newNextCleanup = new Date(now.getFullYear(), now.getMonth() + 1, 1, 1, 0, 0);
        await prisma.systemConfig.update({
          where: { id: 1 },
          data: { 
            lastCleanupDate: now,
            nextCleanupDate: newNextCleanup
          }
        });
        console.log('✅ Auto-cleanup complete.');
      }
      
    } catch (err) {
      console.error('❌ Cron Job Error:', err);
    }
  }, {
    timezone: "Asia/Kolkata"
  });
}
