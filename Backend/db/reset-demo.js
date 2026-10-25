import { pool } from './db.js';
import { seedDemoData } from './seed.js';

async function resetDemo() {
  const client = await pool.connect();
  try {
    console.log('Resetting demo rows only...');
    await client.query('BEGIN');

    // Delete only is_demo rows from each table
    const delSafety = await client.query('DELETE FROM safety_events WHERE is_demo = true');
    const delLogs = await client.query('DELETE FROM symptom_logs WHERE is_demo = true');
    const delQuestions = await client.query('DELETE FROM custom_questions WHERE is_demo = true');
    const delUsers = await client.query('DELETE FROM users WHERE is_demo = true');
    const delProfiles = await client.query('DELETE FROM profiles WHERE is_demo = true');

    console.log(
      `Deleted demo rows: ${delUsers.rowCount} users, ${delProfiles.rowCount} profiles, ${delLogs.rowCount} logs, ${delQuestions.rowCount} questions, ${delSafety.rowCount} safety events.`
    );

    // Re-seed demo records
    const result = await seedDemoData(client);
    await client.query('COMMIT');

    console.log(
      `Demo reset complete. Re-seeded: ${result.userCount} users, ${result.profileCount} profiles, ${result.logCount} logs, ${result.questionCount} custom questions.`
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Reset-demo error:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDemo();
