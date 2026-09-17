const taskCards = document.querySelectorAll(".task-card");
const taskLists = document.querySelectorAll(".task-list");
const dropMessage = document.getElementById("dropMessage");

let draggedTask = null;

taskCards.forEach(task => {
    task.addEventListener("dragstart", () => {
        draggedTask = task;
        task.classList.add("dragging");
        dropMessage.classList.add("show");
    });

    task.addEventListener("dragend", () => {
        task.classList.remove("dragging");
        draggedTask = null;
        dropMessage.classList.remove("show");

        taskLists.forEach(list => {
            list.classList.remove("drag-over");
        });

        updateCounts();
    });
});

taskLists.forEach(list => {
    list.addEventListener("dragover", event => {
        event.preventDefault();
        list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", event => {
        if (!list.contains(event.relatedTarget)) {
            list.classList.remove("drag-over");
        }
    });

    list.addEventListener("drop", event => {
        event.preventDefault();

        if (draggedTask) {
            list.appendChild(draggedTask);
        }

        list.classList.remove("drag-over");
        updateCounts();
    });
});

function updateCounts() {
    const todo = document.querySelector('[data-status="todo"]').children.length;
    const progress = document.querySelector('[data-status="progress"]').children.length;
    const completed = document.querySelector('[data-status="completed"]').children.length;

    document.getElementById("todoCount").textContent = todo;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("totalTasks").textContent = todo + progress + completed;
}