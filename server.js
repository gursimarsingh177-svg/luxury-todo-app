
const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// In-memory storage (no database)
let todos = [];
let nextId = 1;

// GET: Fetch all tasks
app.get("/api/todos", (req, res) => {
  res.status(200).json(todos);
});

// POST: Add a new task
app.post("/api/todos", (req, res) => {
  const { text } = req.body || {};

  if (typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({
      message: "Task text cannot be empty."
    });
  }

  const todo = {
    id: nextId++,
    text: text.trim(),
    completed: false
  };

  todos.push(todo);

  res.status(201).json(todo);
});

// PATCH: Update task text or completion status
app.patch("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((item) => item.id === id);

  if (!todo) {
    return res.status(404).json({
      message: "Task not found."
    });
  }

  const { text, completed } = req.body || {};

  if (text !== undefined) {
    if (typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        message: "Task text cannot be empty."
      });
    }

    todo.text = text.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({
        message: "Completed must be true or false."
      });
    }

    todo.completed = completed;
  }

  if (text === undefined && completed === undefined) {
    return res.status(400).json({
      message: "Provide text or completed to update."
    });
  }

  res.status(200).json(todo);
});

// DELETE: Delete a task
app.delete("/api/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = todos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Task not found."
    });
  }

  todos.splice(index, 1);

  res.status(204).end();
});

// Handle invalid JSON requests
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON request body."
    });
  }

  next(err);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
