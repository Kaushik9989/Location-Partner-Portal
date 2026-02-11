require("dotenv").config();
const mongoose = require("mongoose");

const LocationPartner = require("./models/LocationPartnerSchema");

// 🔧 CONFIG — change this
const PARTNER_ID = "698c5f04d9094759e710a645";
const LOCKER_ID = "695b8e87a056631c33e0335f";

async function run() {
  try {
    // ---------- CONNECT ----------
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");

    // ---------- UPDATE ----------
    const result = await LocationPartner.findByIdAndUpdate(
      PARTNER_ID,
      {
        $addToSet: {
          lockers: new mongoose.Types.ObjectId(LOCKER_ID)
        }
      },
      { new: true }
    );

    if (!result) {
      console.log("❌ Partner not found");
      process.exit(0);
    }

    console.log("✅ Locker assigned to partner");
    console.log("Partner:", result.partnerName);
    console.log("Lockers:", result.lockers);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Mongo disconnected");
  }
}

run();
