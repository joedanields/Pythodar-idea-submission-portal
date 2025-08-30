import User from "../Models/user.model.js";
import XLSX from "xlsx";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const login = async(req, res) => {
  try {
    const { rollno, password } = req.body;

    const user = await User.findOne({ rollno });
    
    if (!user) {
      return res.status(400).json({ message: "Invalid roll number or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid roll number or password" });
    }
    
    res.status(200).json({ message: "Login successful", token: generateToken(user._id) });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error In the login" });
  }
}
export const register = async (req, res) => {
  try {
    const filePath = path.resolve("data/users.xlsx");

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const usersToInsert = [];

    for (let row of rows) {
      const { username, rollno, password } = row;

      if (!username || !rollno || !password) continue; 

      const existingUser = await User.findOne({ rollno });
      if (existingUser) continue; 

      const hashedPassword = await bcrypt.hash(password, 10);

      usersToInsert.push({
        username,
        rollno,
        password: hashedPassword,
      });
    }

    if (usersToInsert.length > 0) {
      await User.insertMany(usersToInsert);
    }

    res.status(201).json({
      message: `Inserted ${usersToInsert.length} users successfully from local Excel`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error reading local Excel file" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    } 
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}