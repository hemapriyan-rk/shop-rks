import * as fs from 'fs';
const file = 'src/modules/analytics/analytics.controller.ts';
let content = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

// Replace getTodaySummary groupBy
content = content.replace(
  `by: ['paymentMethod'],\n        where: { createdAt: { gte: start, lte: end }, ...(userId && { userId }), shop: shopFilter },`,
  `by: ['paymentMethod', 'shop'],\n        where: { createdAt: { gte: start, lte: end }, ...(userId && { userId }), shop: shopFilter },`
);

// Replace getTodaySummary aggregation
content = content.replace(
  /let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;[\s\S]*?const expenses = Number\(expAgg\._sum\.amount \?\? 0\);/m,
  `let income = 0, computerCash = 0, computerOnline = 0, xeroxCash = 0, xeroxOnline = 0, otherIncome = 0, shopXeroxDirect = 0, txCount = 0;
    for (const g of txGroups) {
      const sum = Number(g._sum.totalPrice ?? 0);
      income += sum;
      txCount += g._count;
      if (g.paymentMethod === 'CASH') {
        if (g.shop === 'SHOP_COMPUTER') computerCash += sum;
        else xeroxCash += sum;
      } else if (g.paymentMethod === 'ONLINE') {
        if (g.shop === 'SHOP_COMPUTER') computerOnline += sum;
        else xeroxOnline += sum;
      } else if (g.paymentMethod === 'OTHER') {
        otherIncome += sum;
      } else if (g.paymentMethod === 'SHOP_XEROX') {
        shopXeroxDirect += sum;
      }
    }

    const expenses = Number(expAgg._sum.amount ?? 0);`
);

// Replace getTodaySummary response
content = content.replace(
  `income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,`,
  `income,
      computerCash,
      computerOnline,
      xeroxCash,
      xeroxOnline,
      otherIncome,
      shopXeroxDirect,
      expenses,`
);

// Replace getDailyAnalytics and getMonthlyAnalytics groupBy
content = content.replace(
  `by: ['paymentMethod'],\n        where: { createdAt: { gte: start, lte: end }, ...userIdFilter, shop: shopFilter },`,
  `by: ['paymentMethod', 'shop'],\n        where: { createdAt: { gte: start, lte: end }, ...userIdFilter, shop: shopFilter },`
);
content = content.replace(
  `by: ['paymentMethod'],\n        where: { createdAt: { gte: start, lte: end }, ...userIdFilter, shop: shopFilter },`,
  `by: ['paymentMethod', 'shop'],\n        where: { createdAt: { gte: start, lte: end }, ...userIdFilter, shop: shopFilter },`
);

// Replace getDailyAnalytics aggregation
content = content.replace(
  /let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;\s*let expenses = 0;\s*\/\/ Check Snapshot if no transactions exist \(maybe deleted by auto-cleanup\)\s*if \(txGroups\.length === 0 && expAgg\._count === 0\) {[\s\S]*? expenses = Number\(expAgg\._sum\.amount \?\? 0\);\s*}/m,
  `let income = 0, computerCash = 0, computerOnline = 0, xeroxCash = 0, xeroxOnline = 0, otherIncome = 0, shopXeroxDirect = 0, txCount = 0;
    let expenses = 0;

    // Check Snapshot if no transactions exist (maybe deleted by auto-cleanup)
    if (txGroups.length === 0 && expAgg._count === 0) {
      let snapshots: any[] = [];
      if (targetUserId) {
        snapshots = await prisma.userDailyAnalyticsSnapshot.findMany({
          where: { userId: targetUserId, date: new Date(\`\${targetDate}T00:00:00Z\`), ...(shop ? { shop: shop as any } : {}) }
        });
      } else {
        snapshots = await prisma.dailyAnalyticsSnapshot.findMany({
          where: { date: new Date(\`\${targetDate}T00:00:00Z\`), ...(shop ? { shop: shop as any } : {}) }
        });
      }
      
      for (const snap of snapshots) {
        income += Number(snap.income);
        if (snap.shop === 'SHOP_COMPUTER') {
          computerCash += Number(snap.cashIncome);
          computerOnline += Number(snap.onlineIncome);
        } else if (snap.shop === 'SHOP_XEROX') {
          xeroxCash += Number(snap.cashIncome);
          xeroxOnline += Number(snap.onlineIncome);
        }
        otherIncome += Number(snap.otherIncome);
        shopXeroxDirect += Number(snap.shopXeroxIncome);
        expenses += Number(snap.expenses);
        txCount += snap.transactionCount;
      }
    } else {
      for (const g of txGroups) {
        const sum = Number(g._sum.totalPrice ?? 0);
        income += sum;
        txCount += g._count;
        if (g.paymentMethod === 'CASH') {
          if (g.shop === 'SHOP_COMPUTER') computerCash += sum;
          else xeroxCash += sum;
        } else if (g.paymentMethod === 'ONLINE') {
          if (g.shop === 'SHOP_COMPUTER') computerOnline += sum;
          else xeroxOnline += sum;
        } else if (g.paymentMethod === 'OTHER') {
          otherIncome += sum;
        } else if (g.paymentMethod === 'SHOP_XEROX') {
          shopXeroxDirect += sum;
        }
      }
      expenses = Number(expAgg._sum.amount ?? 0);
    }`
);

// Replace getDailyAnalytics response
content = content.replace(
  `income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,`,
  `income,
      computerCash,
      computerOnline,
      xeroxCash,
      xeroxOnline,
      otherIncome,
      shopXeroxDirect,
      expenses,`
);


// Replace getMonthlyAnalytics SQL
content = content.replace(
  /const dailyTransactions = await prisma\.\$queryRaw<Array<\{[\s\S]*?ORDER BY day ASC\n    `;/m,
  `// Build daily breakdown for chart
    const dailyTransactions = await prisma.$queryRaw<Array<{
      day: string; income: string; computer_cash: string; computer_online: string; xerox_cash: string; xerox_online: string; other_income: string; shop_xerox_direct: string; count: bigint;
    }>>\`
      SELECT 
        to_char(created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') as day,
        SUM(total_price)::text as income,
        SUM(CASE WHEN payment_method = 'CASH' AND shop = 'SHOP_COMPUTER' THEN total_price ELSE 0 END)::text as computer_cash,
        SUM(CASE WHEN payment_method = 'ONLINE' AND shop = 'SHOP_COMPUTER' THEN total_price ELSE 0 END)::text as computer_online,
        SUM(CASE WHEN payment_method = 'CASH' AND shop = 'SHOP_XEROX' THEN total_price ELSE 0 END)::text as xerox_cash,
        SUM(CASE WHEN payment_method = 'ONLINE' AND shop = 'SHOP_XEROX' THEN total_price ELSE 0 END)::text as xerox_online,
        SUM(CASE WHEN payment_method = 'OTHER' THEN total_price ELSE 0 END)::text as other_income,
        SUM(CASE WHEN payment_method = 'SHOP_XEROX' THEN total_price ELSE 0 END)::text as shop_xerox_direct,
        COUNT(*)::bigint as count
      FROM transactions
      WHERE created_at >= \${start} AND created_at <= \${end}
      \${targetUserId ? Prisma.sql\`AND user_id = \${targetUserId}\` : Prisma.empty}
      \${shop ? Prisma.sql\`AND shop = \${shop}::"Shop"\` : Prisma.sql\`AND shop = ANY(\${req.user!.shopAccess}::"Shop"[])\`}
      GROUP BY day
      ORDER BY day ASC
    \`;`
);

// Replace getMonthlyAnalytics dayMap creation
content = content.replace(
  /const dayMap: Record<string, \{ income: number; cashIncome: number; onlineIncome: number; otherIncome: number; shopXeroxIncome: number; expenses: number; profit: number; count: number \}> = \{\};\n    for \(const row of dailyTransactions as any\[\]\) \{\n      dayMap\[row\.day\] = \{ \n        income: parseFloat\(row\.income\), \n        cashIncome: parseFloat\(row\.cash_income \|\| '0'\),\n        onlineIncome: parseFloat\(row\.online_income \|\| '0'\),\n        otherIncome: parseFloat\(row\.other_income \|\| '0'\),\n        shopXeroxIncome: parseFloat\(row\.shop_xerox_income \|\| '0'\),\n        expenses: 0, profit: 0, count: Number\(row\.count\) \n      \};\n    \}/m,
  `const dayMap: Record<string, { income: number; computerCash: number; computerOnline: number; xeroxCash: number; xeroxOnline: number; otherIncome: number; shopXeroxDirect: number; expenses: number; profit: number; count: number }> = {};
    for (const row of dailyTransactions as any[]) {
      dayMap[row.day] = { 
        income: parseFloat(row.income), 
        computerCash: parseFloat(row.computer_cash || '0'),
        computerOnline: parseFloat(row.computer_online || '0'),
        xeroxCash: parseFloat(row.xerox_cash || '0'),
        xeroxOnline: parseFloat(row.xerox_online || '0'),
        otherIncome: parseFloat(row.other_income || '0'),
        shopXeroxDirect: parseFloat(row.shop_xerox_direct || '0'),
        expenses: 0, profit: 0, count: Number(row.count) 
      };
    }`
);

// Replace dayMap expense init
content = content.replace(
  `if (!dayMap[row.day]) dayMap[row.day] = { income: 0, cashIncome: 0, onlineIncome: 0, otherIncome: 0, shopXeroxIncome: 0, expenses: 0, profit: 0, count: 0 };`,
  `if (!dayMap[row.day]) dayMap[row.day] = { income: 0, computerCash: 0, computerOnline: 0, xeroxCash: 0, xeroxOnline: 0, otherIncome: 0, shopXeroxDirect: 0, expenses: 0, profit: 0, count: 0 };`
);

// Replace getMonthlyAnalytics aggregation
content = content.replace(
  /let income = 0, cashIncome = 0, onlineIncome = 0, otherIncome = 0, shopXeroxIncome = 0, txCount = 0;\s*let expenses = 0, expCount = expAgg\._count;\s*if \(txGroups\.length === 0 && expAgg\._count === 0\) \{[\s\S]*?expenses = Number\(expAgg\._sum\.amount \?\? 0\);\s*\}/m,
  `let income = 0, computerCash = 0, computerOnline = 0, xeroxCash = 0, xeroxOnline = 0, otherIncome = 0, shopXeroxDirect = 0, txCount = 0;
    let expenses = 0, expCount = expAgg._count;

    if (txGroups.length === 0 && expAgg._count === 0) {
      // Fallback to snapshots
      let snapshots: any[] = [];
      if (targetUserId) {
        snapshots = await prisma.userDailyAnalyticsSnapshot.findMany({
          where: { userId: targetUserId, date: { gte: start, lte: end }, ...(shop ? { shop: shop as any } : {}) }
        });
      } else {
        snapshots = await prisma.dailyAnalyticsSnapshot.findMany({
          where: { date: { gte: start, lte: end }, ...(shop ? { shop: shop as any } : {}) }
        });
      }
      for (const snap of snapshots) {
        const dayStr = snap.date.toISOString().split('T')[0];
        if (!dayMap[dayStr]) dayMap[dayStr] = { income: 0, computerCash: 0, computerOnline: 0, xeroxCash: 0, xeroxOnline: 0, otherIncome: 0, shopXeroxDirect: 0, expenses: 0, profit: 0, count: 0 };
        dayMap[dayStr].income += Number(snap.income);
        if (snap.shop === 'SHOP_COMPUTER') {
          dayMap[dayStr].computerCash += Number(snap.cashIncome);
          dayMap[dayStr].computerOnline += Number(snap.onlineIncome);
          computerCash += Number(snap.cashIncome);
          computerOnline += Number(snap.onlineIncome);
        } else if (snap.shop === 'SHOP_XEROX') {
          dayMap[dayStr].xeroxCash += Number(snap.cashIncome);
          dayMap[dayStr].xeroxOnline += Number(snap.onlineIncome);
          xeroxCash += Number(snap.cashIncome);
          xeroxOnline += Number(snap.onlineIncome);
        }
        dayMap[dayStr].otherIncome += Number(snap.otherIncome);
        dayMap[dayStr].shopXeroxDirect += Number(snap.shopXeroxIncome);
        dayMap[dayStr].expenses += Number(snap.expenses);
        dayMap[dayStr].profit += Number(snap.profit);
        dayMap[dayStr].count += snap.transactionCount;
        
        income += Number(snap.income);
        otherIncome += Number(snap.otherIncome);
        shopXeroxDirect += Number(snap.shopXeroxIncome);
        expenses += Number(snap.expenses);
        txCount += snap.transactionCount;
      }
    } else {
      for (const g of txGroups) {
        const sum = Number(g._sum.totalPrice ?? 0);
        income += sum;
        txCount += g._count;
        if (g.paymentMethod === 'CASH') {
          if (g.shop === 'SHOP_COMPUTER') computerCash += sum;
          else xeroxCash += sum;
        } else if (g.paymentMethod === 'ONLINE') {
          if (g.shop === 'SHOP_COMPUTER') computerOnline += sum;
          else xeroxOnline += sum;
        } else if (g.paymentMethod === 'OTHER') {
          otherIncome += sum;
        } else if (g.paymentMethod === 'SHOP_XEROX') {
          shopXeroxDirect += sum;
        }
      }
      expenses = Number(expAgg._sum.amount ?? 0);
    }`
);

// Replace getMonthlyAnalytics final response
content = content.replace(
  `income,
      cashIncome,
      onlineIncome,
      otherIncome,
      shopXeroxIncome,
      expenses,`,
  `income,
      computerCash,
      computerOnline,
      xeroxCash,
      xeroxOnline,
      otherIncome,
      shopXeroxDirect,
      expenses,`
);

fs.writeFileSync(file, content);
