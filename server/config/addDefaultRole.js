const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('../models/role'); // Assurez-vous que le modèle Role est correctement défini


dotenv.config(); // Charger les variables d'environnement au début
const DB = process.env.MONGO_URL;

async function createDefaultRole() {
    try {
      await mongoose.connect ("mongodb+srv://admin:admin@cluster0.sygrgok.mongodb.net/online-voting", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      const existingRole = await Role.findOne({ IsAdmin: false });
      if (!existingRole) {
        const newRole = new Role({ IsAdmin: false });
        await newRole.save();
        console.log('Default role created:', newRole);
      } else {
        console.log('Default role already exists:', existingRole);
      }
    } catch (err) {
      console.error('Error creating default role:', err);
    } finally {
      mongoose.connection.close();
    }
  }
  

  createDefaultRole();