import { runCashReconciliation } from './src/modules/system/cron.service';
runCashReconciliation().then(() => console.log('Done')).catch(console.error);
