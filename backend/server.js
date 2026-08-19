require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Resend } = require("resend");
const cookieParser = require("cookie-parser");
const db = require("./db");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const admin = require("./firebaseAdmin");
const app = express();
const jwt = require("jsonwebtoken");
const blogRoutes = require("./routes/blogs");
const uploadRoutes = require("./routes/upload");
const testimonialRoutes = require("./routes/testimonialRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const fs = require("fs");
const path = require("path");
const logsDir = path.join(__dirname, "logs");
const logFile = path.join(logsDir, "app.log");

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function logToFile(line) {
  const timestamp = new Date().toISOString();
  try {
    fs.appendFileSync(logFile, `[${timestamp}] ${line}\n`);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}
app.use(
  cors({
    origin: [
      "https://www.quwwahealth.com",
      "https://quwwahealth.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Create API router
const apiRouter = express.Router();

// Mount all API routes under /api
app.use("/api", apiRouter); // ✅ Match frontend request

// Mount blog routes under /api
apiRouter.use("/blogs", blogRoutes);

// Mount upload routes under /api
apiRouter.use("/upload", uploadRoutes);

// Mount testimonial routes under /api
apiRouter.use("/testimonials", testimonialRoutes);
apiRouter.use("/health", (req, res) => {
  res.status(200).json({ message: "API is healthy" });
});
apiRouter.post("/contact", async (req, res) => {
  const { firstName, lastName, email, phone, subject, message } = req.body;

  try {
    await resend.emails.send({
      from: `QuwwaHealth Contact Form <no-reply@quwwahealth.com>`,
      to: [process.env.RECEIVER_EMAIL],
      reply_to: email,
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>New Contact Message from QuwwaHealth</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">
            ${message.replace(/\n/g, "<br/>")}
          </blockquote>
          <hr/>
          <p style="font-size: 12px; color: #888;">You can reply to this message directly to contact the sender.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
});

apiRouter.post("/internshipForm", async (req, res) => {
  const {
    fullName,
    email,
    phone,
    dob,
    city,
    course,
    college,
    year,
    lookingFor,
    role,
    mode,
  } = req.body;

  try {
    await resend.emails.send({
      from: `Internship Application <no-reply@quwwahealth.com>`,
      to: [process.env.RECEIVER_EMAIL],
      reply_to: email,
      subject: `New Internship Application from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>New Internship Application Received</h2>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Date of Birth:</strong> ${dob}</p>
          <p><strong>City/Country:</strong> ${city}</p>
          <p><strong>Course:</strong> ${course}</p>
          <p><strong>College/University:</strong> ${college}</p>
          <p><strong>Year of Study:</strong> ${year}</p>
          <p><strong>Looking For:</strong> ${lookingFor}</p>
          <p><strong>Preferred Role:</strong> ${role}</p>
          <p><strong>Preferred Work Mode:</strong> ${mode}</p>
          <hr />
          <p style="font-size: 12px; color: #888;">You can reply directly to <a href="mailto:${email}">${email}</a> to follow up with the applicant.</p>
        </div>
      `,
    });

    res
      .status(200)
      .json({ message: "Internship form submitted successfully!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ message: "Failed to send internship form." });
  }
});

// Auth: verify Firebase token, set session cookie
apiRouter.post("/auth/register", async (req, res) => {
  logToFile("📩 Register route hit");

  const {
    email,
    password,
    schoolName,
    country,
    phoneNumber,
    address,
    city,
    state,
    zipCode,
  } = req.body;

  console.log("📦 Received req.body:", req.body);
  logToFile(`📦 Received req.body: ${JSON.stringify(req.body)}`);

  if (!email || !password) {
    logToFile("⚠️ Missing email or password");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    console.log("🔍 Existing users query result:", existingUsers);
    logToFile(`🔍 Existing users: ${JSON.stringify(existingUsers)}`);

    if (existingUsers.length > 0) {
      logToFile("⚠️ User already exists");
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    logToFile("🔐 Hashing password...");
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (hashError) {
      const msg = `❌ bcrypt error: ${hashError.message || hashError}`;
      console.error(msg);
      logToFile(msg);
      return res.status(500).json({ message: "Password hashing failed" });
    }

    const insertValues = [
      email,
      hashedPassword,
      schoolName || null,
      country || null,
      phoneNumber || null,
      address || null,
      city || null,
      state || null,
      zipCode || null,
    ];

    console.log("📝 Insert values:", insertValues);
    logToFile(`📝 Insert values: ${JSON.stringify(insertValues)}`);

    const data = await db.query(
      `INSERT INTO users (email, password, school_name, country, phone_number, address, city, state, zip_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      insertValues
    );

    const jwtSecret = "secretkey"; // change to env in production
    logToFile(`🔐 Creating JWT for user ID: ${data.insertId}`);

    const jwtToken = jwt.sign({ id: data.insertId, email }, jwtSecret, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", jwtToken, {
      httpOnly: false,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
      path: "/",
    });

    const successMsg = `✅ User registered: ${email}`;
    logToFile(successMsg);
    console.log(successMsg);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        email,
        schoolName,
        country,
        phoneNumber,
        address,
        city,
        state,
        zipCode,
      },
      success: true,
    });
  } catch (error) {
    const logMsg = `🛑 Register error: ${error.message || error}`;
    console.error(logMsg);
    logToFile(logMsg);
    return res
      .status(500)
      .json({ message: "Failed to register user", success: false });
  }
});

apiRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  logToFile("📩 Login route hit");
  logToFile(`📨 Login request body: ${JSON.stringify(req.body)}`);

  if (!email || !password) {
    const msg = "⛔ Email and password are required";
    logToFile(msg);
    return res.status(400).json({ message: msg });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      const msg = `❌ No user found with email: ${email}`;
      logToFile(msg);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];
    logToFile(`✅ User fetched: ${JSON.stringify(user)}`);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logToFile("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const jwtSecret = process.env.JWT_SECRET || "secretkey";
    const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res
      .cookie("auth_token", token, {
        httpOnly: true,
        secure: isProduction,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
      })
      .status(200)
      .json({ message: "Login successful", user, success: true });

    logToFile(`✅ Login successful for: ${email}`);
  } catch (error) {
    const errMsg = `🛑 Login error: ${error.message || error}`;
    console.error(errMsg);
    logToFile(errMsg);
    res.status(500).json({ message: "Failed to login", success: false });
  }
});

// Route for frontend to check authentication status
apiRouter.get("/auth/check", authMiddleware, async (req, res) => {
  const User = req.user;
  console.log("User", User);
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      User.email,
    ]);
    const tablesMsg = `🗄️ datae: ${rows}`;
    console.log(tablesMsg);
    logToFile(tablesMsg);
    const fetchUser = rows[0];
    res.json({ authenticated: true, user: fetchUser });
  } catch (error) {
    console.error("Auth check error:", error);
    res.status(500).json({ message: "Failed to check authentication", error });
  }
});

// Logout route to clear the cookie
apiRouter.post("/auth/logout", (req, res) => {
  console.log("Logout request received");
  // Clear the cookie with the exact same options used when setting it
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    //domain: isProduction ? '.quwwahealth.com' : undefined
  });

  console.log("Auth token cookie cleared");
  res.json({ success: true, message: "Successfully logged out" });
});

apiRouter.post("/auth/session", async (req, res) => {
  const { idToken } = req.body;

  logToFile("📩 Session route hit");
  logToFile(`📨 Received idToken: ${idToken ? "present" : "missing"}`);

  if (!idToken) {
    const msg = "⛔ No idToken provided";
    logToFile(msg);
    return res.status(400).json({ message: msg });
  }

  try {
    // 1. Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = decoded.email;
    const firebase_uid = decoded.uid;

    logToFile(`✅ Firebase token verified: ${email}`);

    // 2. Check if user exists
    let [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    let user;

    if (rows.length === 0) {
      logToFile(`ℹ️ No user found for ${email}, creating new user...`);

      await db.query(
        "INSERT INTO users (email, password, firebase_uid) VALUES (?, ?, ?)",
        [email, "", firebase_uid]
      );

      [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      user = rows[0];

      logToFile(`✅ New user created: ${email}`);
    } else {
      user = rows[0];
      logToFile(`✅ Existing user found: ${email}`);
    }

    // 3. Generate JWT
    const jwtSecret = process.env.JWT_SECRET || "secretkey";
    const jwtToken = jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
      expiresIn: "7d",
    });

    // 4. Set cookie options
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    logToFile(
      `🍪 Setting auth_token cookie with: ${JSON.stringify(cookieOptions)}`
    );

    res.cookie("auth_token", jwtToken, cookieOptions);
    return res.status(200).json({ message: "✅ Session cookie set", user });
  } catch (err) {
    const errorMsg = `🛑 Firebase token verify error: ${err.message || err}`;
    console.error(errorMsg);
    logToFile(errorMsg);
    return res
      .status(401)
      .json({ message: "Invalid token", error: err.message });
  }
});

apiRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      // To prevent user enumeration, we send a generic success message even if the user doesn't exist.
      return res.status(200).json({
        message: "If an account with this email exists, an OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.query(
      "INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt]
    );

    await resend.emails.send({
      from: "QuwwaHealth <no-reply@quwwahealth.com>",
      to: [email],
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Use the following One-Time Password (OTP) to proceed:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${otp}</p>
          <p>This OTP is valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
          <hr/>
          <p style="font-size: 12px; color: #888;">Thank you for using QuwwaHealth.</p>
        </div>
      `,
    });

    res.status(200).json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

apiRouter.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM otps WHERE email = ? AND otp = ?",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const otpData = rows[0];
    const isExpired = new Date() > new Date(otpData.expires_at);

    if (isExpired) {
      // Clean up expired OTP
      await db.query("DELETE FROM otps WHERE id = ?", [otpData.id]);
      return res.status(400).json({ message: "OTP has expired." });
    }

    // OTP is verified, clean it up to prevent reuse
    await db.query("DELETE FROM otps WHERE id = ?", [otpData.id]);

    res
      .status(200)
      .json({ message: "OTP verified successfully.", success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Failed to verify OTP.", success: false });
  }
});

apiRouter.post("/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(result);

    res
      .status(200)
      .json({ message: "Password updated successfully.", success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    res
      .status(500)
      .json({ message: "Failed to reset password.", success: false });
  }
});

async function bootstrap() {
  try {
    // 1) Ensure DB & tables exist
    logToFile("📦 Starting database and table initialization...");
    await db.createDatabaseAndTables();
    const initMsg = "✅ Database and tables initialized.";
    console.log(initMsg);
    logToFile(initMsg);

    // 2) List tables to confirm
    const [rows] = await db.query("SHOW TABLES");
    const tableNames = rows.map((r) => Object.values(r)[0]).join(", ");
    const tablesMsg = `🗄️ Tables in database: ${tableNames}`;
    console.log(tablesMsg);
    logToFile(tablesMsg);

    // 3) Start the HTTP server
    const serverMsg = `🚀 Server running on port ${PORT}`;
    app.listen(PORT, () => {
      console.log(serverMsg);
      logToFile(serverMsg);
    });
  } catch (err) {
    const errorMsg =
      "🔥 Error during bootstrap: " + (err.stack || err.message || err);
    console.error(errorMsg);
    logToFile(errorMsg);
    process.exit(1);
  }
}
bootstrap();
