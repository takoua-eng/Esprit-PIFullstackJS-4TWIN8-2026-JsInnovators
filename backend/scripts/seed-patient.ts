/**
 * Script de seed : crée le rôle "Patient" (s'il n'existe pas)
 * puis crée un compte patient de test.
 *
 * Lancer avec : npx ts-node scripts/seed-patient.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

const MONGO_URI =
  'mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority';

const RoleSchema = new mongoose.Schema({ name: String, permissions: [String] });
const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  },
  { timestamps: true },
);

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const RoleModel = mongoose.model('Role', RoleSchema);
  const UserModel = mongoose.model('User', UserSchema);

  // 1. Créer le rôle "Patient" s'il n'existe pas
  let role = await RoleModel.findOne({ name: 'Patient' });
  if (!role) {
    role = await RoleModel.create({ name: 'Patient', permissions: [] });
    console.log('Role "Patient" created');
  } else {
    console.log('Role "Patient" already exists');
  }

  // 2. Créer le compte patient test
  const email = 'patient@test.com';
  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.log(`User ${email} already exists — no action needed`);
  } else {
    const hashed = await bcrypt.hash('Patient123!', 10);
    await UserModel.create({
      firstName: 'Aya',
      lastName: 'Patient',
      email,
      password: hashed,
      role: role._id,
    });
    console.log(`\n✅ Patient account created!\n  Email   : ${email}\n  Password: Patient123!\n`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
