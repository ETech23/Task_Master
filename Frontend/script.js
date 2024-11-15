// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard');
const taskList = document.getElementById('task-list');
const errorDisplay = document.getElementById('auth-error');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authTitle = document.getElementById('auth-title');

// Retrieve the token from local storage
let token = localStorage.getItem('token');

// Function to toggle between Login and Registration forms
function toggleForm(formType) {
  if (formType === 'register') {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authTitle.innerText = 'Register';
    errorDisplay.style.display = 'none';
  } else {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authTitle.innerText = 'Login';
    errorDisplay.style.display = 'none';
  }
}

// Event Listener for Login Form
loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch('https://taskmaster.fly.dev/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerText = data.error;
    } else {
      // Login success
      errorDisplay.style.display = 'none';
      localStorage.setItem('token', data.token);
      token = data.token;

      authSection.style.display = 'none';
      dashboardSection.style.display = 'block';
      loadTasks();
    }
  } catch (error) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerText = "An unexpected error occurred. Please try again.";
  }
});

// Event Listener for Registration Form
registerForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    const response = await fetch('https://taskmaster.fly.dev/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerText = data.error;
    } else {
      // Registration success
      errorDisplay.style.display = 'none';
      alert('Registration successful! You can now log in.');
      toggleForm('login'); // Switch to login form
    }
  } catch (error) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerText = "An unexpected error occurred. Please try again.";
  }
});

// Function to load tasks from the backend
async function loadTasks() {
  try {
    const response = await fetch('https://taskmaster.fly.dev/api/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      taskList.innerHTML = ''; // Clear previous task list

      // Populate task list
      data.tasks.forEach(task => {
        const taskItem = document.createElement('tr');
        taskItem.innerHTML = `
          <td>${task.title}</td>
          <td>${task.description}</td>
          <td>${task.deadline}</td>
          <td>${task.priority}</td>
          <td>
            <button onclick="updateTask('${task._id}')">Update</button>
            <button onclick="deleteTask('${task._id}')">Delete</button>
          </td>
        `;
        taskList.appendChild(taskItem);
      });
    } else {
      alert('Failed to load tasks.');
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
}

// Task Management Functions

// Add a new task
async function addTask() {
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const deadline = document.getElementById('task-deadline').value;
  const priority = document.getElementById('task-priority').value;

  try {
    const response = await fetch('https://taskmaster.fly.dev/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, deadline, priority })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Task added successfully!');
      loadTasks();
    } else {
      alert('Failed to add task.');
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

// Update an existing task
async function updateTask(taskId) {
  const newTitle = prompt('Enter new task title');
  const newDescription = prompt('Enter new task description');
  const newPriority = prompt('Enter new priority (low, medium, high)');
  const newDeadline = prompt('Enter new deadline');

  try {
    const response = await fetch(`https://taskmaster.fly.dev/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        deadline: newDeadline
      })
    });

    const data = await response.json();
    if (response.ok) {
      alert('Task updated successfully!');
      loadTasks();
    } else {
      alert('Failed to update task.');
    }
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

// Delete a task
async function deleteTask(taskId) {
  try {
    const response = await fetch(`https://taskmaster.fly.dev/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (response.ok) {
      alert('Task deleted successfully!');
      loadTasks();
    } else {
      alert('Failed to delete task.');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}
