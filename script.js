const storageKey = "taskflow-tasks";
const defaultTasks = [
    ["Design Landing Page", "Create a clean and modern landing page UI.", "high", "todo", "Design", "purple", "Sep 18"],
    ["Build Navigation", "Develop responsive navigation for the website.", "medium", "todo", "Development", "blue", "Sep 19"],
    ["Setup API Integration", "Connect the application with the user API.", "high", "todo", "API", "green", "Sep 20"],
    ["Test Contact Form", "Check validation and form submission.", "low", "todo", "Testing", "orange", "Sep 21"],
    ["Create Dashboard", "Build a responsive dashboard interface.", "high", "progress", "Frontend", "blue", "Sep 22"],
    ["Test Login Form", "Check login validation and error handling.", "medium", "progress", "Testing", "orange", "Sep 23"],
    ["Improve Mobile Layout", "Optimize the website for mobile devices.", "medium", "progress", "UI/UX", "purple", "Sep 24"],
    ["Create Login Page", "Build a responsive login page interface.", "low", "completed", "Development", "green", "Sep 25"],
    ["Create Wireframe", "Prepare the initial website wireframe.", "low", "completed", "Design", "purple", "Sep 26"],
    ["Setup Project Structure", "Create the basic HTML, CSS and JS structure.", "low", "completed", "Frontend", "blue", "Sep 27"]
].map(([title, description, priority, status, tag, tagColor, date], index) => ({
    id: `default-${index + 1}`, title, description, priority, status, tag, tagColor, date
}));

let tasks = loadTasks();
let draggedTaskId = null;
let editingTaskId = null;
let toastTimer;

const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");
const dropMessage = document.getElementById("dropMessage");

function loadTasks() {
    const savedTasks = localStorage.getItem(storageKey);
    if (!savedTasks) {
        localStorage.setItem(storageKey, JSON.stringify(defaultTasks));
        return [...defaultTasks];
    }
    try {
        const parsedTasks = JSON.parse(savedTasks);
        return Array.isArray(parsedTasks) ? parsedTasks : [...defaultTasks];
    } catch (error) {
        return [...defaultTasks];
    }
}

function saveTasks() {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
}

function renderTasks() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedPriority = priorityFilter.value;
    const visibleTasks = tasks.filter(task => {
        const titleMatches = task.title.toLowerCase().includes(searchTerm);
        const priorityMatches = selectedPriority === "all" || task.priority === selectedPriority;
        return titleMatches && priorityMatches;
    });

    document.querySelectorAll(".task-list").forEach(list => {
        const matchingTasks = visibleTasks.filter(task => task.status === list.dataset.status);
        list.innerHTML = matchingTasks.length
            ? matchingTasks.map(createTaskMarkup).join("")
            : `<p class="empty-message">${visibleTasks.length ? "No tasks in this column" : "No tasks found"}</p>`;
    });
    updateCounts();
}

function createTaskMarkup(task) {
    const priorityLabel = task.status === "completed" ? "Done" : capitalize(task.priority);
    const footerLabel = task.status === "completed" ? "✓ Completed" : `📅 ${task.date || "No date"}`;
    return `
        <div class="task-card${task.status === "completed" ? " completed-card" : ""}" draggable="true" data-task-id="${task.id}">
            <div class="card-header">
                <span class="tag ${task.tagColor || "blue"}">${escapeHtml(task.tag || "Task")}</span>
                <div class="card-actions">
                    <button class="card-action edit-action" type="button" data-action="edit" aria-label="Edit ${escapeHtml(task.title)}">✎</button>
                    <button class="card-action delete-action" type="button" data-action="delete" aria-label="Delete ${escapeHtml(task.title)}">×</button>
                    <span class="drag-icon" aria-hidden="true">⠿</span>
                </div>
            </div>
            <h3>${escapeHtml(task.title)}</h3>
            <p>${escapeHtml(task.description)}</p>
            <div class="card-footer">
                <span>${footerLabel}</span>
                <span class="priority ${task.status === "completed" ? "done" : task.priority}">${priorityLabel}</span>
            </div>
        </div>`;
}

function updateCounts() {
    const counts = { todo: 0, progress: 0, completed: 0 };
    tasks.forEach(task => counts[task.status]++);
    document.getElementById("todoCount").textContent = counts.todo;
    document.getElementById("progressCount").textContent = counts.progress;
    document.getElementById("completedCount").textContent = counts.completed;
    document.getElementById("totalTasks").textContent = tasks.length;
    document.getElementById("completionPercentage").textContent = `${tasks.length ? Math.round((counts.completed / tasks.length) * 100) : 0}%`;
}

function openModal(task = null) {
    editingTaskId = task ? task.id : null;
    document.getElementById("modalTitle").textContent = task ? "Edit Task" : "Add New Task";
    taskTitle.value = task ? task.title : "";
    taskDescription.value = task ? task.description : "";
    taskPriority.value = task ? task.priority : "medium";
    taskModal.classList.add("open");
    taskModal.setAttribute("aria-hidden", "false");
    taskTitle.focus();
}

function closeModal() {
    taskModal.classList.remove("open");
    taskModal.setAttribute("aria-hidden", "true");
    taskForm.reset();
    editingTaskId = null;
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(value) {
    return value.replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

document.getElementById("addTaskButton").addEventListener("click", () => openModal());
document.getElementById("closeModalButton").addEventListener("click", closeModal);
document.getElementById("cancelModalButton").addEventListener("click", closeModal);
taskModal.addEventListener("click", event => {
    if (event.target === taskModal) closeModal();
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && taskModal.classList.contains("open")) closeModal();
});

taskForm.addEventListener("submit", event => {
    event.preventDefault();
    const details = { title: taskTitle.value.trim(), description: taskDescription.value.trim(), priority: taskPriority.value };
    if (editingTaskId) {
        tasks = tasks.map(task => task.id === editingTaskId ? { ...task, ...details } : task);
        showToast("Task updated successfully.");
    } else {
        tasks.push({ ...details, id: `task-${Date.now()}`, status: "todo", tag: "Task", tagColor: "blue", date: "New" });
        showToast("Task added successfully.");
    }
    saveTasks();
    renderTasks();
    closeModal();
});

searchInput.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);

document.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const card = actionButton.closest("[data-task-id]");
    const task = tasks.find(item => item.id === card.dataset.taskId);
    if (!task) return;
    if (actionButton.dataset.action === "edit") openModal(task);
    if (actionButton.dataset.action === "delete") {
        tasks = tasks.filter(item => item.id !== task.id);
        saveTasks();
        renderTasks();
        showToast("Task deleted successfully.");
    }
});

document.addEventListener("dragstart", event => {
    const card = event.target.closest(".task-card");
    if (!card) return;
    draggedTaskId = card.dataset.taskId;
    card.classList.add("dragging");
    dropMessage.classList.add("show");
});

document.addEventListener("dragend", event => {
    const card = event.target.closest(".task-card");
    if (card) card.classList.remove("dragging");
    draggedTaskId = null;
    dropMessage.classList.remove("show");
    document.querySelectorAll(".task-list").forEach(list => list.classList.remove("drag-over"));
});

document.querySelectorAll(".task-list").forEach(list => {
    list.addEventListener("dragover", event => {
        event.preventDefault();
        list.classList.add("drag-over");
    });
    list.addEventListener("dragleave", event => {
        if (!list.contains(event.relatedTarget)) list.classList.remove("drag-over");
    });
    list.addEventListener("drop", event => {
        event.preventDefault();
        const task = tasks.find(item => item.id === draggedTaskId);
        if (!task || task.status === list.dataset.status) return;
        task.status = list.dataset.status;
        saveTasks();
        renderTasks();
        showToast("Task moved successfully.");
    });
});

renderTasks();
