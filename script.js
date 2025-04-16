const messages = [
    "Yay! No tasks for now. Time to relax! 🥳",
    "Your todo list is clear — enjoy the moment! 🌈",
    "No tasks? Woof! That’s a good day 🐶",
    "All done! You're sparkling with productivity ✨"
];
function startTodoListApp() {
    const input = document.getElementById('todo-input');
    const button = document.getElementById('todo-button');
    const form = document.getElementById('todo-form');
    const list = document.getElementById('todo-list');
    const messageBox = document.querySelector(".message-box");
    const deadline = document.getElementById("task-deadline");

    let activeEditItem = null;

    // let checkedAll=false;
    updateMessageBox();

    form.addEventListener('submit', e => {
        e.preventDefault();
        // console.log("input",input.value);
        if (input.value.trim()) {
            addTasks(input.value.trim(), false, deadline.value);
            input.value = "";
            deadline.value = "";
        }
    });

    function syncTasks() {
        const currentTasks = list.querySelectorAll(".todo-task");
        const tasks = [];

        currentTasks.forEach(task => {
            const label = task.querySelector(".todo-task-label").innerText;
            const checked = task.querySelector(".todo-task-status").classList.contains("checked");
            const deadline = task.querySelector(".todo-task-deadline")?.innerText.replace('Deadline: ', '') || '';
            tasks.push({ label, checked, deadline });
        });

        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function addTasks(label, checked = false, deadline = '') {
        const item = document.createElement("li");
        item.classList.add("todo-task");

        const taskContainer = document.createElement("div");
        taskContainer.classList.add("task-container");

        const taskLabel = document.createElement("span");
        taskLabel.classList.add("todo-task-label");
        taskLabel.innerText = label;

        const container = document.createElement("span");
        container.classList.add("function-container");

        const editTask = document.createElement("img");
        editTask.classList.add("todo-task-edit");
        editTask.src = "assets/edit.svg";
        editTask.alt = "edit task";

        editTask.addEventListener("click", () => {
            if (activeEditItem) return;
            activeEditItem = item;
            // edit input
            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.value = taskLabel.innerText;
            editInput.classList.add("edit-input");

            taskContainer.replaceChild(editInput, taskLabel);
            editInput.focus();

            // btn container
            const buttonContainer = document.createElement("span");
            buttonContainer.classList.add("button-container");

            // save btn
            const save = document.createElement("button");
            save.innerText = "Save";
            save.classList.add("save-btn");

            // Cancel btn
            const cancel = document.createElement("button");
            cancel.innerText = "Cancel";
            cancel.classList.add("cancel-btn");

            buttonContainer.append(save, cancel);

            taskContainer.replaceChild(buttonContainer, container);

            const finishEdit = (saveChanges) => {
                if (saveChanges && editInput.value.trim()) {
                    taskLabel.innerText = editInput.value.trim();
                }
                taskContainer.replaceChild(taskLabel, editInput);
                taskContainer.replaceChild(container, buttonContainer);
                activeEditItem = null;
                syncTasks();
            };

            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") finishEdit(true);
                if (e.key === "Escape") finishEdit(false);
            });

            save.addEventListener("click", () => finishEdit(true));
            cancel.addEventListener("click", () => finishEdit(false));
        });

        const checkedTask = document.createElement("img");
        checkedTask.classList.add("todo-task-status");
        if (checked)
            checkedTask.classList.add("checked");
        if (checkedTask.classList.contains("checked")) {
            taskLabel.style.textDecoration = "line-through";
            checkedTask.src = "assets/checked.svg";
            editTask.style.visibility = "hidden";
        }
        else {
            taskLabel.style.textDecoration = "none";
            checkedTask.src = "assets/unchecked.svg";
            editTask.style.visibility = "visible";
        }
        checkedTask.alt = "task (un)checked";
        // Inside your existing code where you handle task checking
        checkedTask.addEventListener("click", () => {
            checkedTask.classList.toggle("checked");

            if (checkedTask.classList.contains("checked")) {
                taskLabel.style.textDecoration = "line-through";

                // Get the ::before background color for this task
                const computedStyle = window.getComputedStyle(item, '::before');
                const beforeBgColor = computedStyle.getPropertyValue('background-color');

                // Apply the same color to the text-decoration
                taskLabel.style.textDecorationColor = beforeBgColor;
                taskLabel.style.textDecorationThickness = "2px";

                checkedTask.src = "assets/checked.svg";
                editTask.style.visibility = "hidden";
            }
            else {
                taskLabel.style.textDecoration = "none";
                taskLabel.style.textDecorationColor = ""; // Reset decoration color
                checkedTask.src = "assets/unchecked.svg";
                editTask.style.visibility = "visible";
            }
            syncTasks();
        });

        const deleteTask = document.createElement("img");
        deleteTask.classList.add("todo-task-delete");
        deleteTask.src = "assets/trash.svg";
        deleteTask.alt = "delete task";
        deleteTask.addEventListener("click", () => {
            let result = confirm(`Are you Sure, you want to delete ${label}`);
            if (result) {
                item.remove();
                updateMessageBox();
                syncTasks();
            }
        });

        const deadlineElement = document.createElement("span");
        deadlineElement.classList.add("todo-task-deadline");

        // Handle the deadline logic
        if (deadline) {
            deadlineElement.innerText = `Deadline: ${deadline}`;
            // Check if the deadline is in the past
            if (deadline && new Date(deadline) < new Date()) {
                deadlineElement.classList.add('overdue');
            }

        } else {
            deadlineElement.innerText = ''; // If there's no deadline, leave it empty
        }

        // Append the elements to the task item
        container.append(editTask, checkedTask, deleteTask);
        taskContainer.append(taskLabel, container);
        item.append(taskContainer, deadlineElement); // This places the deadline on a new line
        list.append(item);

        sortTasksByDeadline();
        syncTasks();

        updateMessageBox();

    }

    // Load previous tasks from local storage
    const previousTasks = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
    previousTasks.forEach((task) => addTasks(task.label, task.checked, task.deadline));
    updateMessageBox();

    // reset
    document.getElementById("reset").addEventListener("click", () => {
        if (list.children.length > 0) {
            let result = confirm("Are you sure you want to clear all tasks?");
            if (result) {
                list.innerHTML = "";
                localStorage.clear();
                updateMessageBox();
            }
        }
    });

    // check-all
    document.getElementById("check-all").addEventListener("click", () => {
        const tasks = list.querySelectorAll(".todo-task");
        // checkedAll = !checkedAll;  // Toggle state
        const uncheckedtasks = Array.from(tasks).filter(task =>
            !task.querySelector(".todo-task-status").classList.contains("checked")
        )
        console.log(uncheckedtasks);
        const shouldCheckedAll = uncheckedtasks.length > 0;

        tasks.forEach(task => {
            const status = task.querySelector(".todo-task-status");
            const label = task.querySelector(".todo-task-label");
            const editIcon = task.querySelector(".todo-task-edit");

            if (shouldCheckedAll) {
                status.classList.add("checked");
                status.src = "assets/checked.svg";
                label.style.textDecoration = "line-through";
                editIcon.style.visibility = "hidden";
            } else {
                status.classList.remove("checked");
                status.src = "assets/unchecked.svg";
                label.style.textDecoration = "none";
                editIcon.style.visibility = "visible";
            }
        });

        syncTasks();
    });
    function updateMessageBox() {
        const tasks = list.querySelectorAll(".todo-task");
        if (tasks.length === 0) {
            const randomIndex = Math.floor(Math.random() * messages.length);
            messageBox.innerText = messages[randomIndex];
            messageBox.style.display = "flex";
        } else {
            messageBox.innerText = "";
            messageBox.style.display = "none";
        }
    }
    function sortTasksByDeadline() {
        const tasks = Array.from(list.querySelectorAll(".todo-task"));
        tasks.sort((a, b) => {
            const dateA = new Date(a.querySelector(".todo-task-deadline").innerText.split(" ")[1]);
            const dateB = new Date(b.querySelector(".todo-task-deadline").innerText.split(" ")[1]);
            return dateA - dateB;  // Ascending order
        });

        // Re-render the sorted tasks
        list.innerHTML = "";
        tasks.forEach(task => list.appendChild(task));
    }



}
document.addEventListener('DOMContentLoaded', startTodoListApp);

// deadline
// edit
// completed when
// right side mai 2 buttons -reset & check all