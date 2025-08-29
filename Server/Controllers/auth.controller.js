import User from "../Models/user.model.js";
import XLSX from "xlsx";
import path from "path";
import bcrypt from "bcryptjs";


export const login = async(req, res) => {}
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
