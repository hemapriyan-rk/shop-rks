import * as fs from 'fs';
const file = 'src/pages/admin/UserPerformancePage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace daily StatCards
content = content.replace(
  /<StatCard label="Cash Income" value={daily.cashIncome} color="#10B981" \/>[\s\S]*?<StatCard label="Other Income" value={daily.otherIncome \|\| 0} color="#F59E0B" \/>/,
  `<StatCard label="Shop Computer Cash" value={daily.computerCash || 0} color="#10B981" />
              <StatCard label="Shop Computer Online" value={daily.computerOnline || 0} color="#3B82F6" />
              <StatCard label="Shop Xerox Cash" value={daily.xeroxCash || 0} color="#059669" />
              <StatCard label="Shop Xerox Online" value={daily.xeroxOnline || 0} color="#2563EB" />
              <StatCard label="Shop Xerox (Direct)" value={daily.shopXeroxDirect || 0} color="#8B5CF6" />
              <StatCard label="Other Income" value={daily.otherIncome || 0} color="#F59E0B" />`
);

// Replace monthly StatCards
content = content.replace(
  /<StatCard label="Cash Income" value={monthly.cashIncome} color="#10B981" \/>[\s\S]*?<StatCard label="Monthly Other" value={monthly.otherIncome \|\| 0} color="#F59E0B" \/>/,
  `<StatCard label="Shop Computer Cash" value={monthly.computerCash || 0} color="#10B981" />
              <StatCard label="Shop Computer Online" value={monthly.computerOnline || 0} color="#3B82F6" />
              <StatCard label="Shop Xerox Cash" value={monthly.xeroxCash || 0} color="#059669" />
              <StatCard label="Shop Xerox Online" value={monthly.xeroxOnline || 0} color="#2563EB" />
              <StatCard label="Shop Xerox (Direct)" value={monthly.shopXeroxDirect || 0} color="#8B5CF6" />
              <StatCard label="Monthly Other" value={monthly.otherIncome || 0} color="#F59E0B" />`
);

// Replace BarChart bars
content = content.replace(
  /<Bar dataKey="cashIncome" name="Cash Income" stackId="income" fill="#10B981" \/>[\s\S]*?<Bar dataKey="otherIncome" name="Other Income" stackId="income" fill="#F59E0B" radius=\{\[4, 4, 0, 0\]\} \/>/,
  `<Bar dataKey="computerCash" name="Computer Cash" stackId="income" fill="#10B981" />
                  <Bar dataKey="computerOnline" name="Computer Online" stackId="income" fill="#3B82F6" />
                  <Bar dataKey="xeroxCash" name="Xerox Cash" stackId="income" fill="#059669" />
                  <Bar dataKey="xeroxOnline" name="Xerox Online" stackId="income" fill="#2563EB" />
                  <Bar dataKey="shopXeroxDirect" name="Xerox (Direct)" stackId="income" fill="#8B5CF6" />
                  <Bar dataKey="otherIncome" name="Other Income" stackId="income" fill="#F59E0B" radius={[4, 4, 0, 0]} />`
);

fs.writeFileSync(file, content);
