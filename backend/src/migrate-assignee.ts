/**
 * Migration: Add assignee field to existing tasks
 * Run once with: npm run migrate:assignee
 */

import { readData, writeData, withLock } from './services/storage.service.js';
import type { Task } from '../../contracts/types.js';

interface TasksData {
  tasks: Task[];
}

async function migrate() {
  console.log('🔄 Starting migration: Add assignee field to tasks...');
  
  await withLock(async () => {
    const data = await readData<TasksData>();
    let updated = 0;
    
    data.tasks.forEach((task: Task & { assignee?: string | null }) => {
      if (task.assignee === undefined) {
        task.assignee = null;
        updated++;
      }
    });
    
    if (updated > 0) {
      await writeData(data);
      console.log(`✅ Migration complete: Updated ${updated} tasks`);
    } else {
      console.log('✅ No tasks to migrate (all have assignee field)');
    }
  });
}

migrate().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
