/**
 * Nettoie les serviceId invalides en base (ex: "1", "undefined", etc.)
 * Usage: npx ts-node -r tsconfig-paths/register scripts/fix-service-ids.ts
 */
import * as mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté');

  const db = mongoose.connection.db!;
  const users = db.collection('users');

  // Trouver tous les users avec serviceId invalide (pas un ObjectId 24 chars)
  const all = await users.find({ serviceId: { $exists: true } }).toArray();
  let fixed = 0;

  for (const user of all) {
    const svc = user.serviceId;
    const isValid = svc && mongoose.Types.ObjectId.isValid(String(svc)) && String(svc).length === 24;
    if (!isValid) {
      await users.updateOne({ _id: user._id }, { $unset: { serviceId: '' } });
      console.log(`🔧 Fixed user ${user.email} — removed invalid serviceId: ${svc}`);
      fixed++;
    }
  }

  console.log(`✅ Done — fixed ${fixed} users`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
