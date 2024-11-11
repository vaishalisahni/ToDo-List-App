function startTodoListApp() {
    const input = document.getElementById('todo-input');
    const button = document.getElementById('todo-button');
    const form = document.getElementById('todo-form');
    const list = document.getElementById('todo-list');
    let activeEditItem = false; 

    form.addEventListener('submit', e => {
        e.preventDefault();
        // console.log("input",input.value);
        if(input.value.trim()){
        addTasks(input.value.trim());
        input.value = "";
        }
    });

    function syncTasks() {
        const currentTasks = list.querySelectorAll(".todo-task");
        let tasks = [];
        currentTasks.forEach((task) => {
            const label = task.querySelector(".todo-task-label").innerText;
            const checked = task.querySelector(".todo-task-status").className.includes("checked");
            tasks.push({ label, checked });
        });
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function addTasks(label, checked = false) {
        const item = document.createElement("li");
        item.classList.add("todo-task")

        const taskLabel = document.createElement("span");
        taskLabel.classList.add("todo-task-label");
        taskLabel.innerText = label;

        const container=document.createElement("span");
        container.classList.add("function-container");

        const editTask = document.createElement("img");
        editTask.classList.add("todo-task-edit");
        editTask.src = "assets/edit.svg";
        editTask.alt = "edit task";

        
        editTask.addEventListener("click",()=>{
            if(activeEditItem) return;
            activeEditItem=true;
            const editInput=document.createElement("input");
            editInput.type="text";
            editInput.value=taskLabel.innerText;
            editInput.classList.add("edit-input");
            
            item.replaceChild(editInput, taskLabel);
            editInput.focus();

            const buttonContainer=document.createElement("span");
            buttonContainer.classList.add("button-container");

            const save=document.createElement("button");
            save.innerText="Save";
            // save.type="submit";
            save.classList.add("save-btn");

            const cancel = document.createElement("button");
            cancel.innerText = "Cancel";
            cancel.classList.add("cancel-btn"); 

            buttonContainer.append(save,cancel);

            item.replaceChild(buttonContainer,container);
            
            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    taskLabel.innerText=editInput.value.trim() || label;
                    item.replaceChild(taskLabel, editInput);
                    item.replaceChild(container,buttonContainer);
                    activeEditItem = false;
                    syncTasks();
                }
            });
            

            save.addEventListener("click",()=>{
                taskLabel.innerText=editInput.value.trim() || label;
                item.replaceChild(taskLabel, editInput);
                item.replaceChild(container,buttonContainer);
                activeEditItem = false;
                syncTasks();
            });

            cancel.addEventListener("click",()=>{
                item.replaceChild(taskLabel, editInput);
                item.replaceChild(container,buttonContainer);
                activeEditItem = false;
                syncTasks();
            })
            
           
            
        })

        const checkedTask = document.createElement("img");
        checkedTask.classList.add("todo-task-status");
        if (checked)
            checkedTask.classList.add("checked");
        if(checkedTask.className.includes("checked")){
            taskLabel.style.textDecoration="line-through";
            checkedTask.src ="assets/checked.svg" ;
            editTask.style.visibility="hidden";
        }
        else{
            taskLabel.style.textDecoration="none";
            checkedTask.src ="assets/unchecked.svg";
            editTask.style.visibility="visible";
        }
        checkedTask.alt = "task (un)checked";
        checkedTask.addEventListener("click", () => {
            checkedTask.classList.toggle("checked");
            if(checkedTask.className.includes("checked")){
                taskLabel.style.textDecoration="line-through";
                checkedTask.src ="assets/checked.svg" ;
                editTask.style.visibility="hidden";
            }
            else{
                taskLabel.style.textDecoration="none";
                checkedTask.src ="assets/unchecked.svg";
                editTask.style.visibility="visible";
            }
            syncTasks();
        });

        const deleteTask = document.createElement("img");
        deleteTask.classList.add("todo-task-delete");
        deleteTask.src = "assets/trash.svg";
        deleteTask.alt = "delete task";
        deleteTask.addEventListener("click", () => {
            let result= confirm(`Are you Sure, you want to delete ${label}`);
            if(result)
            item.remove();
            syncTasks();
        });

        container.append(editTask,checkedTask,deleteTask);

        item.append( taskLabel, container);

        list.append(item);
        syncTasks();
    }
    // Load previous tasks from local storage
    const previousTasks = localStorage.getItem("tasks") ? JSON.parse(localStorage.getItem("tasks")) : [];
    previousTasks.forEach((task) => addTasks(task.label, task.checked));

    // reset
    document.getElementById("reset").addEventListener("click",()=>{
        list.innerHTML="";
        localStorage.clear();
    })

    // check-all
    document.getElementById("check-all").addEventListener("click",()=>{
        const tasks=list.querySelectorAll(".todo-task");
        tasks.forEach(task=>{
            const status=task.querySelector(".todo-task-status");
            if (!status.classList.contains("checked")) {
                status.classList.add("checked");
                status.src = "assets/checked.svg";
            }
        });
        syncTasks();
    });

    

}
startTodoListApp();

// deadline
// edit
// completed when
// right side mai 2 buttons -reset & check all