import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";
import cookieParser from "cookie-parser";

import { UserRepository } from "./user-repository.js";
import { SECRET_JWT_KEY, PORT, CORS_URL } from "./config.js";

const app = express();

//? MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: CORS_URL,
    credentials: true,
  })
);

app.use((req, res, next) => {
  const token = req.cookies.access_token;
  req.session = { user: null };

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY);
    req.session.user = data;
  } catch {}

  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: res.statusCode,
    auth: {
      POST: { login: "/login", register: "/register", logout: "/logout" },
      GET: { protected: "/protected", user: "/user" },
    },
  });
});

app.get("/user", async (req, res) => {
  const { user } = req.session;
  if (!user) return;
  res.status(200).json(user);
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserRepository.login({ username, password });
    const token = jwt.sign(
      { id: user._id, mail: user.mail, username: user.username },
      SECRET_JWT_KEY,
      {
        expiresIn: "30d", // Expira en 30 días
      }
    );
    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Adjust based on environment
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Adjust based on environment
        maxAge: 30 * 24 * 60 * 60 * 1000,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      .send(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  const { mail, username, password } = req.body;
  try {
    const id = await UserRepository.create({ mail, username, password });
    console.log(id);
    res.json({ id: id }).status(200);
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("access_token").status(200).json({ message: "logout success" });
});

//! PROTECTED
app.get("/protected", (req, res) => {
  const { user } = req.session;
  if (!user) {
    res.status(403).send("Access not authorized");
  }
  res.render("protected", user);
});

//? SERVER
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
