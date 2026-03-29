/**
 * One-off script: ensure Role "Nurse" exists and create a test nurse user.
 *
 * Usage (from backend/):
 *   npx ts-node scripts/seed-test-nurse.ts
 *
 * Env: MONGODB_URI (defaults to mongodb://127.0.0.1:27017/medifollow)
 *
 * Default test account:
 *   Email:    nurse.test@local.dev
 *   Password: NurseTest123!
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medifollow';

const TEST_EMAIL = 'nurse.test@local.dev';
const TEST_PASSWORD = 'NurseTest123!';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const conn = mongoose.connection;
  if (conn.readyState !== 1 || !conn.db) {
    throw new Error('MongoDB connection failed');
  }

  const roles = conn.db.collection('roles');
  const users = conn.db.collection('users');

  let nurseRole = await roles.findOne({ name: 'Nurse' });
  if (!nurseRole) {
    const r = await roles.insertOne({
      name: 'Nurse',
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    nurseRole = await roles.findOne({ _id: r.insertedId });
    console.log('Created role "Nurse".');
  } else {
    console.log('Role "Nurse" already exists.');
  }

  if (!nurseRole) {
    throw new Error('Failed to resolve Nurse role');
  }

  const existing = await users.findOne({ email: TEST_EMAIL });
  if (existing) {
    console.log(
      `User ${TEST_EMAIL} already exists (_id: ${existing._id}). Nothing to do.`,
    );
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(TEST_PASSWORD, 10);
  const doc = {
    firstName: 'Test',
    lastName: 'Nurse',
    email: TEST_EMAIL,
    password: hashed,
    role: nurseRole._id,
    resetToken: null,
    assignedPatients: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const ins = await users.insertOne(doc);
  console.log('Created test nurse user:');
  console.log(`  Email:    ${TEST_EMAIL}`);
  console.log(`  Password: ${TEST_PASSWORD}`);
  console.log(`  _id:      ${ins.insertedId}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
