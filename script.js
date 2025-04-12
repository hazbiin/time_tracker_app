const createTaskButton = document.getElementById('create-task-button');
const createNewTaskPopup = document.getElementById('create-new-task-popup');
// const tasksSectionDescription = document.getElementById("tasks-section-description");
const taskSection = document.getElementById("tasks-section");


// task creation inputs ..
const taskNameInput = document.getElementById("task-name");
const taskDescInput = document.getElementById("task-desc");
const saveTaskButton = document.getElementById("save-task-button");


let task;
createTaskButton.addEventListener("click", () => {
    createNewTaskPopup.classList.toggle('show');
    // taskSection.classList.toggle('hide');



    // listing tasks...
    // the task and all other data must be listed by taking it from local storage.
    if(task) {
        // const newTasksContainer = document.getElementById("new-tasks-container");

        const newTaskslist = document.getElementById("new-tasks-list");
        // console.log(newTaskslist)

        // newTaskslist.innerHTML += `<li>
        //                     <h6>${task.name}</h6>
        //                     </li>`
        // task = null;

        newTaskslist.innerHTML += `
                     <li class="task-list-item">

                        <div class="list-item-top">
                            <div class="list-text-section">
                                <h4>working on project</h4>
                                <p>0hrs 0mins 0secs</p>
                                <p>in-progress...</p>
                            </div>
                            <div class="list-item-buttons">
                                <button id="timer-btn">start timer</button>
                                <button id="edit-btn">edit</button>
                            </div>
                        </div>

                        <div class="list-item-bottom">
                            <div><a href="#">view more.. </a></div>
                        </div>
                    
                    </li>
        `;

        task = null;
    }
})


// edit button implementation.
// show the pop up 
// allow user to edit whatever he needs
// on clciking save button, we wanna check if there is a change for each task object property, 
// if there is change means update that, else keep no change. 



// task creation , 
// after the task creation we wanna save that to the local storage.

saveTaskButton.addEventListener("click", () => {
    const taskName = taskNameInput.value;
    const taskDesc = taskDescInput.value;
  
    taskNameInput.value = "";
    taskDescInput.value = "";

    task = {
        name : taskName,
        desc : taskDesc
    }


    // you have to save this object to local storage.
    console.log(task)
})

