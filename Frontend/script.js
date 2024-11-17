// DOM Elements
const authSection = document.getElementById("auth-section");
const dashboardSection = document.getElementById("dashboard");
const taskList = document.getElementById("task-list");
const errorDisplay = document.getElementById("auth-error");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const authTitle = document.getElementById("auth-title");
const searchBar = document.getElementById("task-search");
const filterPriority = document.getElementById("filter-priority");
const filterDate = document.getElementById("filter-date");

// Retrieve the token from local storage
let token = localStorage.getItem("token");

// Check if the user is already logged in
if (token) {
  authSection.style.display = "none";
  document.getElementById("task-filters").style.display = "block";
  dashboardSection.style.display = "block";
  loadTasks();
}

// Function to toggle between Login and Registration forms
function toggleForm(formType) {
  if (formType === "register") {
    loginForm.style.display = "none";
    registerForm.style.display = "block";
    authTitle.innerText = "Register";
    errorDisplay.style.display = "none";
  } else {
    loginForm.style.display = "block";
    registerForm.style.display = "none";
    authTitle.innerText = "Login";
    errorDisplay.style.display = "none";
  }
}

// Event Listener for Login Form
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch("https://taskmaster.fly.dev/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      errorDisplay.style.display = "none";
      localStorage.setItem("token", data.token);
      token = data.token;

      authSection.style.display = "none";
      document.getElementById("task-filters").style.display = "block";
      dashboardSection.style.display = "block";
      loadTasks();
    } else {
      handleError(data.error || "Invalid login credentials");
    }
  } catch (error) {
    handleError("An unexpected error occurred. Please try again.");
  }
});

// Event Listener for Registration Form
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    const response = await fetch("https://taskmaster.fly.dev/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Registration successful! You can now log in.");
      toggleForm("login");
    } else {
      handleError(data.error || "Registration failed.");
    }
  } catch (error) {
    handleError("An unexpected error occurred. Please try again.");
  }
});

// Function to load tasks from the backend
async function loadTasks(filters = {}) {
  try {
    let url = "https://taskmaster.fly.dev/api/tasks";
    if (filters.priority || filters.dueDate || filters.search) {
      const params = new URLSearchParams(filters).toString();
      url += `?${params}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      renderTasks(data.tasks);
    } else {
      handleError("Failed to load tasks.");
    }
  } catch (error) {
    handleError("An unexpected error occurred while fetching tasks.");
  }
}

// Function to render tasks in the table
function renderTasks(tasks) {
  // Clear task list and insert "New Task" row
  taskList.innerHTML = `
    <tr id="new-task-row">
      <td>s/n</td> <!-- Serial number header -->
      <td><input type="text" id="task-title" placeholder="Title"></td>
      <td><input type="text" id="task-description" placeholder="Description"></td>
      <td><input type="date" id="task-deadline"></td>
      <td>
        <select id="task-priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </td>
      <td>
        <button onclick="addTask()">Add Task</button>
      </td>
    </tr>
  `;

  // Populate task list with serial numbers
  tasks.forEach((task, index) => {
    const taskItem = document.createElement("tr");
    taskItem.innerHTML = `
      <td>${index + 1}</td> <!-- Serial number -->
      <td>${task.title}</td>
      <td>${task.description}</td>
      <td>${task.deadline.split("T")[0]}</td>
      <td>${task.priority}</td>
      <td>
        <button onclick="updateTask('${task._id}', '${task.title}', '${task.description}', '${task.priority}', '${task.deadline}')">Update</button>
        <button onclick="deleteTask('${task._id}')">Delete</button>
      </td>
    `;
    taskList.appendChild(taskItem);
  });
}

// Function to add a new task
async function addTask() {
  const title = document.getElementById("task-title").value;
  const description = document.getElementById("task-description").value;
  const deadline = document.getElementById("task-deadline").value;
  const priority = document.getElementById("task-priority").value;

  if (!title || !description || !deadline || !priority) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch("https://taskmaster.fly.dev/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, deadline, priority }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Task added successfully!");
      loadTasks();
    } else {
      handleError(data.error || "Failed to add task.");
    }
  } catch (error) {
    handleError("An unexpected error occurred while adding the task.");
  }
}

// Function to update a task
async function updateTask(taskId, currentTitle, currentDescription, currentPriority, currentDeadline) {
  const newTitle = prompt("Enter new title:", currentTitle);
  const newDescription = prompt("Enter new description:", currentDescription);
  const newPriority = prompt("Enter new priority (low, medium, high):", currentPriority);
  const newDeadline = prompt("Enter new deadline (YYYY-MM-DD):", currentDeadline.split("T")[0]);

  if (!newTitle || !newDescription || !newPriority || !newDeadline) {
    alert("All fields are required to update the task.");
    return;
  }

  try {
    const response = await fetch(`https://taskmaster.fly.dev/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        deadline: newDeadline,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      alert("Task updated successfully!");
      loadTasks();
    } else {
      handleError(data.error || "Failed to update task.");
    }
  } catch (error) {
    handleError("An unexpected error occurred while updating the task.");
  }
}

// Function to delete a task
async function deleteTask(taskId) {
  const confirmDelete = confirm("Are you sure you want to delete this task?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`https://taskmaster.fly.dev/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      alert("Task deleted successfully!");
      loadTasks();
    } else {
      handleError(data.error || "Failed to delete task.");
    }
  } catch (error) {
    handleError("An unexpected error occurred while deleting the task.");
  }
}

// Task filtering
filterPriority.addEventListener("change", () => {
  const priority = filterPriority.value;
  const dueDate = filterDate.value;
  loadTasks({ priority, dueDate });
});

filterDate.addEventListener("change", () => {
  const priority = filterPriority.value;
  const dueDate = filterDate.value;
  loadTasks({ priority, dueDate });
});

// Task search
searchBar.addEventListener("input", () => {
  const search = searchBar.value;
  loadTasks({ search });
});

// Logout functionality
function logout() {
  localStorage.removeItem("token");
  location.reload();
}

// Function to handle errors and display messages
function handleError(message) {
  console.error(message);
  alert(message);
}