import { isEmpty, validate } from "class-validator";
import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie";

import { User } from "../entities/User";
import { authentication } from "../middleware";
import { catchErrors } from "../errors";

// Register
const register = catchErrors(async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  // Validate data
  let errors: any = {};
  const emailUser = await User.findOne({ email });
  const usernameUser = await User.findOne({ username });

  if (emailUser) errors.email = "Email is already taken";
  if (usernameUser) errors.username = "Username is already taken";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  // Create the user
  const user = new User({ email, username, password });

  errors = await validate(user);
  if (errors.length > 0) return res.status(400).json({ errors });

  await user.save();
  // Return the user
  return res.json(user);
});

// Login
const login = catchErrors(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Validate data
  let errors: any = {};
  if (isEmpty(username)) errors.username = "Username must not be empty";
  if (isEmpty(password)) errors.password = "Password must not be empty";
  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ error: "User not found" });

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches)
    return res.status(401).json({ password: "Password is incorrect" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET);

  res.set(
    "Set-Cookie",
    cookie.serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600,
      path: "/",
    })
  );

  return res.json({ user, token });
});

const getCurrent = catchErrors(async (req: Request, res: Response) => {
  const token = req.cookies.token;
  console.log(req.cookies);
  if (!token) throw new Error("Unauthenticated");

  const { username }: any = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({ username });

  if (!user) throw new Error("Unauthenticated");

  return res.json(user);
});

const logout = (_: Request, res: Response) => {
  res.set(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  return res.status(200).json({ success: true });
};

// Router
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/getCurrent", getCurrent);
router.get("/logout", logout);

export default router;
