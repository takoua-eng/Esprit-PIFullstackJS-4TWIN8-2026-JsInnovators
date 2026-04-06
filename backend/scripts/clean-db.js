const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://Medifollow:Medifollow2025@cluster0.15l0i6q.mongodb.net/?retryWrites=true&w=majority')
  .then(async () => {
    const users = mongoose.connection.db.collection('users');
    const all = await users.find({ serviceId: { $exists: true } }).toArray();
    let fixed = 0;
    for (const u of all) {
      const s = String(u.serviceId);
      if (!/^[a-f0-9]{24}$/i.test(s)) {
        await users.updateOne({ _id: u._id }, { $unset: { serviceId: '' } });
        console.log('Fixed:', u.email, '- removed invalid serviceId:', s);
        fixed++;
      }
    }
    console.log('Done. Total fixed:', fixed);
    await mongoose.disconnect();
  })
  .catch(e => { console.error(e.message); process.exit(1); });
