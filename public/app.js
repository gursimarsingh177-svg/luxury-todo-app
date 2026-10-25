
const todoForm = document.getElementById("todo-form");
const todoInput = document.getElementById("todo-input");
const todoList = document.getElementById("todo-list");
const statusMessage = document.getElementById("status");

const totalCount = document.getElementById("total-count");
const completedCount = document.getElementById("completed-count");
const pendingCount = document.getElementById("pending-count");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const progressTrack = document.getElementById("progress-track");
const progressCaption = document.getElementById("progress-caption");
const currentDate = document.getElementById("current-date");

let todos = [];
let currentFilter = "all";
let isLoading = false;

// Display today's date.
currentDate.textContent = new Intl.DateTimeFormat("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date());

async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // Keep the default message if the response isn't JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function updateDashboard() {
  const total = todos.length;
  const completed = todos.filter(todo => todo.completed).length;
  const pending = total - completed;
  const percentage = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  totalCount.textContent = total;
  completedCount.textContent = completed;
  pendingCount.textContent = pending;
  progressPercent.textContent = `${percentage}%`;
  progressFill.style.width = `${percentage}%`;

  progressTrack.setAttribute("aria-valuenow", percentage);

  if (total === 0) {
    progressCaption.textContent =
      "Your next accomplishment starts here.";
  } else if (percentage === 100) {
    progressCaption.textContent =
      "Beautiful work. You've completed every task.";
  } else {
    progressCaption.textContent =
      `${pending} task${pending === 1 ? "" : "s"} left to go. Keep going.`;
  }
}

function getVisibleTodos() {
  if (currentFilter === "pending") {
    return todos.filter(todo => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter(todo => todo.completed);
  }

  return todos;
}

function renderTodos() {
  todoList.replaceChildren();
  updateDashboard();

  const visibleTodos = getVisibleTodos();

  if (todos.length === 0) {
    statusMessage.textContent =
      "No tasks yet. Add your first task above.";
    return;
  }

  if (visibleTodos.length === 0) {
    statusMessage.textContent =
      currentFilter === "pending"
        ? "All caught up. You have no pending tasks."
        : "No completed tasks yet. Keep making progress.";
    return;
  }

  statusMessage.textContent =
    `Showing ${visibleTodos.length} of ${todos.length} task(s)`;

  visibleTodos.forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const label = document.createElement("label");
    label.className = "todo-label";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute(
      "aria-label",
      `Mark "${todo.text}" as ${todo.completed ? "pending" : "completed"}`
    );

    const text = document.createElement("span");
    text.textContent = todo.text;
    text.classList.toggle("completed", todo.completed);

    checkbox.addEventListener("change", async () => {
      checkbox.disabled = true;

      try {
        await request(`/api/todos/${todo.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: checkbox.checked })
        });

        await loadTodos();
      } catch (error) {
        checkbox.checked = !checkbox.checked;
        checkbox.disabled = false;
        statusMessage.textContent =
          error.message || "Could not update task. Please try again.";
      }
    });

    label.append(checkbox, text);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);

    deleteButton.addEventListener("click", async () => {
      deleteButton.disabled = true;

      try {
        await request(`/api/todos/${todo.id}`, {
          method: "DELETE"
        });

        await loadTodos();
      } catch (error) {
        deleteButton.disabled = false;
        statusMessage.textContent =
          error.message || "Could not delete task.";
      }
    });

    li.append(label, deleteButton);
    todoList.append(li);
  });
}

async function loadTodos() {
  isLoading = true;
  statusMessage.textContent = "Loading your tasks...";

  try {
    const data = await request("/api/todos");

    if (!Array.isArray(data)) {
      throw new Error("The server returned an unexpected response.");
    }

    todos = data;
    renderTodos();
  } catch (error) {
    statusMessage.textContent =
      error.message || "Could not load tasks. Check the server.";
  } finally {
    isLoading = false;
  }
}

todoForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (isLoading) return;

  const text = todoInput.value.trim();

  if (!text) {
    statusMessage.textContent = "Please enter a task.";
    todoInput.focus();
    return;
  }

  const submitButton = todoForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    await request("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    todoInput.value = "";
    currentFilter = "all";
    updateFilterButtons();

    await loadTodos();
    todoInput.focus();
  } catch (error) {
    statusMessage.textContent =
      error.message || "Could not add task.";
  } finally {
    submitButton.disabled = false;
  }
});

function updateFilterButtons() {
  document.querySelectorAll(".filter-button").forEach(button => {
    const isActive = button.dataset.filter === currentFilter;

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    renderTodos();
  });
});

loadTodos();
