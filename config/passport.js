require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Partner = require("../models/LocationPartnerSchema"); // adjust path

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;

    console.log("🧠 Google email:", email);

    const partner = await Partner.findOne({ email });

    console.log("🧠 Partner found in DB:", partner);

if (!partner) {
  return done(null, false, { message: "not_onboarded" });
}

if (!partner.isApproved) {
  return done(null, false, { message: "not_approved" });
}

if (!partner.isActive) {
  return done(null, false, { message: "disabled" });
}

    // Link google account if not linked
    if (!partner.googleId) {
      partner.googleId = profile.id;
      await partner.save();
      console.log("✅ Linked Google ID");
    }

    console.log("✅ Passport success for:", partner.email);
    return done(null, partner);

  } catch (err) {
    console.error("❌ Passport error:", err);
    return done(err, null);
  }
}

  )
);

passport.serializeUser((partner, done) => {
  done(null, partner.id);
});

passport.deserializeUser(async (id, done) => {
  const partner = await Partner.findById(id);
  done(null, partner);
});
