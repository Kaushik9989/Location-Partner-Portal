require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo").default;
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const parcel = require("./models/parcel.js");
const LocationPartner = require("./models/LocationPartnerSchema");
const PartnerHostingRequest = require("./models/PartnerHostingRequestSchema.js");
const Locker = require("./models/locker.js");
const PartnerTicket = require("./models/TicketSchema.js");



const app = express();


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());





const passport = require("passport");

require("./config/passport");

app.set("trust proxy", 1);




app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),

  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // ⭐ key fix
    sameSite: "lax"
  }
}));


app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error", err));




app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {

    if (err) return next(err);

    if (!user) {
      const code = info?.message || "auth_failed";
      return res.redirect(`/login?error=${code}`);
    }

    req.logIn(user, (err) => {
      if (err) return next(err);

      req.session.partnerId = user._id.toString();

      req.session.save(() => {
        res.redirect("/dashboard");
      });
    });

  })(req, res, next);
});


app.get("/", (req, res) => {
  const errorCode = req.query.error;

  let error = null;

  if (errorCode === "not_onboarded") {
    error = "Your account is not onboarded yet. Please request partner access.";
  } else if (errorCode === "not_approved") {
    error = "Your account is pending approval by Droppoint.";
  } else if (errorCode === "disabled") {
    error = "Your account has been disabled. Please contact support.";
  } else if (errorCode === "auth_failed") {
    error = "Login failed. Please try again.";
  }

  res.render("login", { error });
});


app.get("/login", (req, res) => {
  const errorCode = req.query.error;

  let error = null;

  if (errorCode === "not_onboarded") {
    error = "Your account is not onboarded yet. Please request partner access.";
  } else if (errorCode === "not_approved") {
    error = "Your account is pending approval by Droppoint.";
  } else if (errorCode === "disabled") {
    error = "Your account has been disabled. Please contact support.";
  } else if (errorCode === "auth_failed") {
    error = "Login failed. Please try again.";
  }

  res.render("login", { error });
});


app.post("/login", async (req, res) => {
  const { apiKey } = req.body;

  const partner = await LocationPartner.findOne({ apiKey, isActive: true });
  if (!partner) {
    return res.render("login", { error: "Invalid API Key" });
  }

  req.session.partnerId = partner._id;
  await req.session.save();
  res.redirect("/dashboard");
});

app.get("/dashboard", async (req, res) => {
  try {
    const partner = await LocationPartner
      .findById(req.session.partnerId)
      .populate("lockers");

    if (!partner) {
      return res.status(404).send("Partner not found");
    }

    // ---------- AVG PER LOCATION ----------
    const avgPerLocation = partner.lockers.length > 0
      ? (partner.revenueStats.partnerShareEarned / partner.lockers.length).toFixed(2)
      : 0;

    // ---------- GET ALL LOCKER IDS ----------
    const lockerIds = partner.lockers.map(l => l.lockerId);

    // ---------- COUNT PARCELS ----------
    const parcelsLength = await parcel.countDocuments({
      lockerId: { $in: lockerIds }
    });

    // ---------- RENDER ----------
    res.render("partner-details", {
      partner,
      avgPerLocation,
      annualProjection: (partner.revenueStats.partnerShareEarned * 12).toFixed(2),
      parcelsLength   // ✅ sent to frontend
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading dashboard");
  }
});


app.get("/request-access", (req, res) => {
    const flash = req.session.flash;
    delete req.session.flash;
    res.render("request_access", {
    flash,
    });
});

app.post("/request-access", async (req, res) => {
  try {
    const {
      companyName,
      propertyType,
      contactName,
      email,
      phone,
      message
    } = req.body;

    // ---------- VALIDATION ----------
    if (!companyName || !propertyType || !contactName || !email || !phone || !message) {
      req.session.flash = {
        type: "error",
        message: "All fields are required."
      };
      return res.redirect("/request-access");
    }

    // ---------- DUPLICATE CHECK ----------
    const existing = await PartnerHostingRequest.findOne({
      email,
      status: { $in: ["submitted", "reviewing"] }
    });

    if (existing) {
      req.session.flash = {
        type: "error",
        message: "You already have a pending request."
      };
      return res.redirect("/request-access");
    }

    // ---------- CREATE ----------
    await PartnerHostingRequest.create({
      companyName,
      propertyType,
      contactName,
      email,
      phone,
      message
    });

    // ---------- SUCCESS ----------
    req.session.flash = {
      type: "success",
      message: "Request submitted. Our team will contact you soon."
    };

    return res.redirect("/request-access");

  } catch (err) {
    console.error(err);

    req.session.flash = {
      type: "error",
      message: "Something went wrong. Please try again."
    };

    return res.redirect("/request-access");
  }
});

app.post("/partner/tickets/new", async (req, res) => {
  try {
      console.log("🔥 ticket route hit");
  console.log(req.body);
  console.log("partnerId:", req.session.partnerId);

    const { type, title, description, priority, relatedLocker } = req.body;

    if (!title || !description) {
      req.session.flash = {
        type: "error",
        message: "Title and description required"
      };
      return res.redirect("/dashboard");
    }

    await PartnerTicket.create({
      partner: req.session.partnerId,
      type: type || "locker_deployment",
      title,
      description,
      priority: priority || "medium",
     relatedLocker: relatedLocker ? relatedLocker : undefined
    });

    req.session.flash = {
      type: "success",
      message: "Request submitted to admin team"
    };

    res.redirect("/dashboard");

  } catch (err) {
     console.error("TICKET CREATE ERROR:", err);
  return res.status(500).json(err);


    req.session.flash = {
      type: "error",
      message: "Could not submit request"
    };

    res.redirect("/dashboard");
  }
});




app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});





// =======================
// START SERVER
// =======================
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});









