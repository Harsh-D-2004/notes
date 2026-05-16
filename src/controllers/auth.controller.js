const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userDAO = require("../dao/user.dao");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await userDAO.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userDAO.create(email, passwordHash);

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

async function login(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userDAO.findByEmail(email);

    const isPasswordCorrect =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({ access_token: token });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
}

module.exports = { register, login };
