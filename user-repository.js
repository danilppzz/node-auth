import DBLocal from "db-local";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config.js";
import crypto from "crypto";
import { type } from "os";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, require: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
});

export class UserRepository {
  static async create({ username, password }) {
    Validation.username(username);
    Validation.password(password);

    const user = User.findOne({ username });
    if (user) throw new Error("username already exists");

    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    User.create({
      _id: id,
      username,
      password: hashedPassword,
    }).save();
    return id;
  }
  static async login({ username, password }) {
    Validation.username(username);
    Validation.password(password);

    const user = User.findOne({ username });
    if (!user) throw new Error("username does not exist");
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("password is invalid");

    const { password: _, ...publicUser } = user

    return publicUser;
  }
}

class Validation {
  static username(username) {
    if (typeof username !== "string") throw new Error("username must be a string");
    if (username.length < 4) throw new Error("username must be at least 4 caracters long");
  }
  static password(password) {
    if (typeof password !== "string") throw new Error("password must be a string");
    if (password.length < 8) throw new Error("password must be at least 8 caracters long");
    if (!/\d/.test(password)) throw new Error("password must contain at least one number");
    if (!/[A-Z]/.test(password))
      throw new Error("password must contain at least one uppercase letter");
  }
}
