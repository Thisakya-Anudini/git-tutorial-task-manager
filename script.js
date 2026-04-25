const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const clearButton = document.getElementById("clear-button");
const emptyState = document.getElementById("empty-state");
const statTotal = document.getElementById("stat-total");
const statDone = document.getElementById("stat-done");

const STORAGE_KEY = "task_manager.tasks.v1";

let tasks = loadTasks();
render();

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    addTask(taskText);
    taskInput.value = "";
    taskInput.focus();
});

clearButton.addEventListener("click", () => {
    tasks = [];
    saveTasks(tasks);
    render();
});

taskList.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    if (!button) return;

    const action = button.dataset.action;
    const taskId = button.dataset.id;
    if (!taskId) return;

    if (action === "delete") {
        deleteTask(taskId);
    }
});

taskList.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"][data-id]');
    if (!checkbox) return;

    const taskId = checkbox.dataset.id;
    toggleTask(taskId, checkbox.checked);
});

function addTask(text) {
    const newTask = {
        id: cryptoId(),
        text,
        completed: false,
        createdAt: Date.now(),
    };

    tasks = [newTask, ...tasks];
    saveTasks(tasks);
    render();
}

function deleteTask(taskId) {
    tasks = tasks.filter((t) => t.id !== taskId);
    saveTasks(tasks);
    render();
}

function toggleTask(taskId, completed) {
    tasks = tasks.map((t) => (t.id === taskId ? { ...t, completed } : t));
    saveTasks(tasks);
    render();
}

function render() {
    taskList.innerHTML = "";

    for (const task of tasks) {
        taskList.appendChild(renderTask(task));
    }

    const doneCount = tasks.filter((t) => t.completed).length;
    statTotal.textContent = String(tasks.length);
    statDone.textContent = String(doneCount);

    const isEmpty = tasks.length === 0;
    emptyState.hidden = !isEmpty;
    clearButton.disabled = isEmpty;
}

function renderTask(task) {
    const li = document.createElement("li");
    li.className = `task${task.completed ? " task--done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task__check";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as done");
    checkbox.dataset.id = task.id;

    const text = document.createElement("p");
    text.className = "task__text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task__actions";

    const del = document.createElement("button");
    del.className = "icon-btn icon-btn--danger";
    del.type = "button";
    del.dataset.action = "delete";
    del.dataset.id = task.id;
    del.setAttribute("aria-label", "Delete task");
    del.title = "Delete";
    del.textContent = "×";

    actions.appendChild(del);

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(actions);

    return li;
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter((t) => t && typeof t === "object")
            .map((t) => ({
                id: typeof t.id === "string" ? t.id : cryptoId(),
                text: typeof t.text === "string" ? t.text : "",
                completed: Boolean(t.completed),
                createdAt: typeof t.createdAt === "number" ? t.createdAt : Date.now(),
            }))
            .filter((t) => t.text.trim().length > 0);
    } catch {
        return [];
    }
}

function saveTasks(nextTasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
}

function cryptoId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}


