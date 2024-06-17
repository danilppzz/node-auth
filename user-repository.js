import DBLocal from "db-local";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "./config.js";
import crypto from "crypto";
import { type } from "os";

const { Schema } = new DBLocal({ path: "./db" });

const User = Schema("User", {
  _id: { type: String, require: true },
  mail: { type: String, require: true },
  username: { type: String, require: true },
  password: { type: String, require: true },
});

export class UserRepository {
  static async create({ mail, username, password }) {
    Validation.username(username);
    Validation.password(password);

    const user = User.findOne({ username });
    if (user) throw new Error("Username already exists");
    const cmail = User.findOne({ mail });
    if (cmail) throw new Error("Email is allready in use");

    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    User.create({
      _id: id,
      mail: mail,
      username,
      password: hashedPassword,
    }).save();
    return id;
  }
  static async login({ username, password }) {
    Validation.username(username);
    Validation.password(password);

    const user = User.findOne({ username });
    if (!user) throw new Error("Username does not exist");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Password is invalid");

    const { password: _, ...publicUser } = user;

    return publicUser;
  }
}

class Validation {
  static mail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (typeof username !== "string") throw new Error("Email must be a string");
    if (username.length < 5) throw new Error("Email must be at least 5 characters long");
    if (!emailPattern.test(email)) throw new Error("Invalid email") 
  }
  static username(username) {
    if (typeof username !== "string") throw new Error("Username must be a string");
    if (username.length < 3) throw new Error("Username must be at least 3 characters long");

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error(`Invalid character in username`);
    }

    for (let i = 0; i < username.length; i++) {
      if (!/^[a-zA-Z0-9_]+$/.test(username[i])) {
        throw new Error(`Invalid character in username`);
      }
    }
  }
  static password(password) {
    if (typeof password !== "string") throw new Error("Password must be a string");
    if (password.length < 8) throw new Error("Password must be at least 8 caracters long");
    if (!/\d/.test(password)) throw new Error("Password must contain at least one number");
    if (!/[A-Z]/.test(password))
      throw new Error("Password must contain at least one uppercase letter");
  }
}
