import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

import { connectDB, getDB } from "./db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// --------------------------------------------------
// Helper
// --------------------------------------------------

function errorResponse(res, message, status = 400) {
  return res.status(status).json({
    success: false,
    message
  });
}

// --------------------------------------------------
// Test Route
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker Backend is running"
  });
});

// --------------------------------------------------
// REGISTER
// --------------------------------------------------

app.post("/api/register", async (req, res) => {
  try {
    const {
      username,
      password,
      email,
      fullName
    } = req.body;

    if (!username || !password || !email || !fullName) {
      return errorResponse(
        res,
        "All fields are required."
      );
    }

    const db = getDB();

    const users = db.collection("users");

    const existingUsername = await users.findOne({
      username: username.trim()
    });

    if (existingUsername) {
      return errorResponse(
        res,
        "Username already exists."
      );
    }

    const existingEmail = await users.findOne({
      email: email.trim().toLowerCase()
    });

    if (existingEmail) {
      return errorResponse(
        res,
        "Email already registered."
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = {
      username: username.trim(),
      password: hashedPassword,
      email: email.trim().toLowerCase(),
      fullName: fullName.trim(),
      createdAt: new Date()
    };

    await users.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful."
    });

  } catch (error) {

    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration."
    });
  }
});

// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post("/api/login", async (req, res) => {
  try {

    const {
      username,
      password
    } = req.body;

    if (!username || !password) {
      return errorResponse(
        res,
        "Username and password are required."
      );
    }

    const db = getDB();

    const user = await db
      .collection("users")
      .findOne({
        username: username.trim()
      });

    if (!user) {
      return errorResponse(
        res,
        "Invalid username or password."
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return errorResponse(
        res,
        "Invalid username or password."
      );
    }

    res.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        fullName: user.fullName
      }
    });

  } catch (error) {

    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login."
    });
  }
});

// --------------------------------------------------
// ADD EXPENSE
// --------------------------------------------------

app.post("/api/expenses", async (req, res) => {

  try {

    const {
      username,
      title,
      amount,
      date,
      description
    } = req.body;

    if (!username || !title || !amount || !date) {
      return errorResponse(
        res,
        "Username, expense name, amount and date are required."
      );
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return errorResponse(
        res,
        "Amount must be a valid positive number."
      );
    }

    const db = getDB();

    const expense = {

      username: username.trim(),

      title: title.trim(),

      amount: numericAmount,

      date: new Date(date),

      description:
        description?.trim() || "",

      createdAt: new Date()
    };

    const result = await db
      .collection("expenses")
      .insertOne(expense);

    res.status(201).json({

      success: true,

      message: "Expense added successfully.",

      expenseId:
        result.insertedId.toString()
    });

  } catch (error) {

    console.error("Add expense error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while adding expense."
    });
  }
});

// --------------------------------------------------
// GET EXPENSES
// --------------------------------------------------

app.get(
  "/api/expenses/:username",
  async (req, res) => {

    try {

      const username =
        req.params.username;

      if (!username) {
        return errorResponse(
          res,
          "Username is required."
        );
      }

      const db = getDB();

      const expenses =
        await db
          .collection("expenses")
          .find({
            username
          })
          .sort({
            date: -1
          })
          .toArray();

      const formattedExpenses =
        expenses.map((expense) => ({

          id: expense._id.toString(),

          title: expense.title,

          amount:
            Number(expense.amount).toFixed(2),

          date:
            expense.date
              ? expense.date
                  .toISOString()
                  .split("T")[0]
              : "",

          description:
            expense.description || ""
        }));

      res.json({
        success: true,
        expenses: formattedExpenses
      });

    } catch (error) {

      console.error(
        "Fetch expenses error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while fetching expenses."
      });
    }
  }
);

// --------------------------------------------------
// GET SINGLE EXPENSE
// --------------------------------------------------

app.get(
  "/api/expense/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return errorResponse(
          res,
          "Invalid expense ID."
        );
      }

      const db = getDB();

      const expense =
        await db
          .collection("expenses")
          .findOne({
            _id: new ObjectId(id)
          });

      if (!expense) {
        return errorResponse(
          res,
          "Expense not found.",
          404
        );
      }

      res.json({
        success: true,

        expense: {

          id: expense._id.toString(),

          title: expense.title,

          amount: expense.amount,

          date:
            expense.date
              ? expense.date
                  .toISOString()
                  .split("T")[0]
              : "",

          description:
            expense.description || ""
        }
      });

    } catch (error) {

      console.error(
        "Get expense error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while getting expense."
      });
    }
  }
);

// --------------------------------------------------
// UPDATE EXPENSE
// --------------------------------------------------

app.put(
  "/api/expenses/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        title,
        amount,
        date,
        description
      } = req.body;

      if (!ObjectId.isValid(id)) {
        return errorResponse(
          res,
          "Invalid expense ID."
        );
      }

      if (!title || !amount || !date) {
        return errorResponse(
          res,
          "Expense name, amount and date are required."
        );
      }

      const numericAmount =
        Number(amount);

      if (
        Number.isNaN(numericAmount) ||
        numericAmount <= 0
      ) {
        return errorResponse(
          res,
          "Amount must be a valid positive number."
        );
      }

      const db = getDB();

      const result =
        await db
          .collection("expenses")
          .updateOne(

            {
              _id: new ObjectId(id)
            },

            {
              $set: {

                title:
                  title.trim(),

                amount:
                  numericAmount,

                date:
                  new Date(date),

                description:
                  description?.trim() || "",

                updatedAt:
                  new Date()
              }
            }
          );

      if (result.matchedCount === 0) {
        return errorResponse(
          res,
          "Expense not found.",
          404
        );
      }

      res.json({
        success: true,
        message:
          "Expense updated successfully."
      });

    } catch (error) {

      console.error(
        "Update expense error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while updating expense."
      });
    }
  }
);

// --------------------------------------------------
// DELETE EXPENSE
// --------------------------------------------------

app.delete(
  "/api/expenses/:id",
  async (req, res) => {

    try {

      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return errorResponse(
          res,
          "Invalid expense ID."
        );
      }

      const db = getDB();

      const result =
        await db
          .collection("expenses")
          .deleteOne({
            _id: new ObjectId(id)
          });

      if (result.deletedCount === 0) {
        return errorResponse(
          res,
          "Expense not found.",
          404
        );
      }

      res.json({
        success: true,
        message:
          "Expense deleted successfully."
      });

    } catch (error) {

      console.error(
        "Delete expense error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while deleting expense."
      });
    }
  }
);

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

async function startServer() {

  try {

    await connectDB();

    app.listen(
      PORT,
      () => {

        console.log(
          `Server running at http://localhost:${PORT}`
        );

      }
    );

  } catch (error) {

    console.error(
      "Failed to start server:",
      error
    );

    process.exit(1);
  }
}

startServer();