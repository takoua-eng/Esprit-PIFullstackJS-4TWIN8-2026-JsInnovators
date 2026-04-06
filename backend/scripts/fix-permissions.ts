/**
 * Script de migration : met à jour les permissions de tous les rôles existants en base.
 * Usage: npx ts-node -r tsconfig-paths/register scripts/fix-permissions.ts
 */
import * as mongoose from 'mongoose';
import { DEFAULT_ROLES } from '../src/common/seed/seed-roles';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority';

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: [String],
  description: String,
  isActive: Boolean,
  isArchived: Boolean,
});

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connecté à MongoDB');

  const RoleModel = mongoose.model('Role', RoleSchema);

  for (const roleData of DEFAULT_ROLES) {
    const result = await RoleModel.updateOne(
      { name: roleData.name },
      { $set: { permissions: roleData.permissions } },
      { upsert: true },
    );
    console.log(`🔄 ${roleData.name}: matched=${result.matchedCount} modified=${result.modifiedCount} upserted=${result.upsertedCount}`);
  }

  await mongoose.disconnect();
  console.log('✅ Migration terminée');
}

run().catch((err) => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
