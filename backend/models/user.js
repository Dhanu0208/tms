import bcrypt from "bcryptjs";
import { dbConnection } from "../utils/db.js";

// Function to create a new user
export const createUser = async ({
  name,
  title,
  role,
  email,
  password,
  isAdmin,
}) => {
  try {
    const connection = await dbConnection();

    // Hash the password before storing it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO users (name, title, role, email, password, isAdmin)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [name, title, role, email, hashedPassword, isAdmin];

    const [result] = await connection.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error creating user:", error.message);
    throw error;
  }
};

// Function to fetch a user by email
export const getUserByEmail = async (email) => {
  try {
    const connection = await dbConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error fetching user by email:", error.message);
    throw error;
  }
};

// Function to compare passwords
export const matchPassword = async (enteredPassword, storedPassword) => {
  return await bcrypt.compare(enteredPassword, storedPassword);
};
