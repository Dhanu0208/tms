import { createUser, getUserByEmail, matchPassword } from "../models/user.js";
import { dbConnection } from "../utils/index.js";
import { createJWT } from "../utils/index.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, isAdmin, role, title } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ status: false, message: "User already exists" });
    }

    const newUser = await createUser({
      name,
      email,
      password,
      isAdmin,
      role,
      title,
    });
    if (newUser) {
      isAdmin ? createJWT(res, newUser.id) : null;
      newUser.password = undefined;
      res
        .status(201)
        .json({
          status: true,
          newUser,
          message: "User registered successfully",
        });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await matchPassword(password, user.password);
    if (isMatch) {
      createJWT(res, user.id);
      res.status(200).json(user);
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = (req, res) => {
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: "Logout successful" });
};

export const getTeamList = async (req, res) => {
  try {
    const connection = await dbConnection();
    const [users] = await connection.execute("SELECT * FROM users");
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId, isAdmin } = req.user;
    const { id, name, title, role } = req.body;
    const targetId = isAdmin ? id : userId;

    const connection = await dbConnection();
    await connection.execute(
      "UPDATE users SET name = ?, title = ?, role = ? WHERE id = ?",
      [name, title, role, targetId]
    );
    res
      .status(200)
      .json({ status: true, message: "Profile updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const changeUserPassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const connection = await dbConnection();
    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);
    res
      .status(200)
      .json({ status: true, message: "Password changed successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const activateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const connection = await dbConnection();
    await connection.execute("UPDATE users SET isActive = ? WHERE id = ?", [
      isActive,
      id,
    ]);
    res.status(200).json({
      status: true,
      message: `User account has been ${isActive ? "activated" : "disabled"}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await dbConnection();
    await connection.execute("DELETE FROM users WHERE id = ?", [id]);
    res
      .status(200)
      .json({ status: true, message: "User deleted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
