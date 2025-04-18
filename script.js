
// localStorage.clear();
// creating new task pop up..
const createTaskPopupButton = document.getElementById('create-task-popup-btn');
const createNewTaskPopup = document.getElementById('create-new-task-popup');
const createTaskButton = document.getElementById("create-task-button");

// intro description..
const tasksSectionDescription = document.getElementById("tasks-section-desc");

// getting saved tasks from localStorage..
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
console.log(tasks);


// ///////////implementing timer////////////////////////
// variables for time values 
let seconds = 0;
let minutes = 0;
let hours = 0;

// variables for leading zeros
let leadingSeconds = 0;
let leadingMinutes = 0;
let leadingHours = 0;

// variables for set inteval and timer status
let timerInterval = null;
let timerStatus = "stopped";


// listing tasks if any from local storage////
if(tasks.length !== 0) {
    tasksSectionDescription.classList.add('hide');
    
    let newTasksList = document.getElementById("new-tasks-list");
    newTasksList.innerHTML = "";

    tasks.forEach(task => {
        newTasksList.innerHTML += `
            <li class="task-list-item">
                <div class="task-info">
                    <div class="list-item-text-section">
                        <h4>${task.taskName}</h4>
                        <p>0hrs 0mins 0secs</p>
                        <p>${task.taskStatus}</p>
                    </div>
                    <div class="list-item-buttons-section">
                        <button id="timer-btn">start timer</button>
                        <button id="edit-btn">edit</button>
                    </div>
                </div>

                <div id="timer-container" class="timer-container">
                    <h3 id="timer"></h3> 
                </div>
            </li>
    `;
    
    // console.log(task)  
    })

    const timerBtns = document.querySelectorAll("#timer-btn");
    timerBtns.forEach(timerBtn =>{
        timerBtn.addEventListener("click", () => {

            // let displayTimer = document.getElementById("timer");
            const timerContainer = document.getElementById("timer-container");
            console.log(timerContainer)
            timerContainer.classList.add("started");

            const now = new Date();
            // let time = {}; 

            if(timerStatus === "stopped") {   
                timerInterval = window.setInterval(timer, 1000);
                document.getElementById("timer-btn").innerHTML= "stop timer";
                timerStatus = "started";
                
                // time["startTime"] = now.toLocaleTimeString();
                // console.log(time)
            }else {
                window.clearInterval(timerInterval);
                document.getElementById("timer-btn").innerHTML= "start timer";
                timerStatus = "stopped";
    
                // time["endTime"] = now.toLocaleTimeString();
                // console.log(time)
            }

            // console.log(time);
        })
    })
}



// timer function
function timer() {
    seconds ++;

    if(seconds === 60) {
        seconds = 0;
        minutes++;
        if(minutes === 60) {
            minutes = 0;
            hours++;
        }
    }

    if(seconds < 10) {
        leadingSeconds = "0" + seconds.toString();
    }else {
        leadingSeconds = seconds;
    }

    if(minutes < 10) {
        leadingMinutes = "0" + minutes.toString();
    }else {
        leadingMinutes = minutes
    }

    if(hours < 10) {
        leadingHours = "0" + hours.toString();
    }else {
        leadingHours = hours;
    }


    let displayTimer = document.getElementById("timer");
    displayTimer.innerText = `${leadingHours}:${leadingMinutes}:${leadingSeconds}`;
}





// creating new tasks //////////////
createTaskPopupButton.addEventListener("click", () => {
    createNewTaskPopup.classList.add('show');

    const closeCreateTaskPopup = document.getElementById('close-create-task-pop-up-btn');
    closeCreateTaskPopup.addEventListener("click", () => {
        createNewTaskPopup.classList.remove('show');
    })
})

if(createTaskButton){

    // task creation inputs ..
    const taskNameInput = document.getElementById("task-name");
    const taskDescInput = document.getElementById("task-desc");
    const taskTagInput = document.getElementById("task-tag");
    const taskStatusInput = document.getElementById("task-status"); 

    createTaskButton.addEventListener("click", () => {
        const taskName = taskNameInput.value;
        const taskDesc = taskDescInput.value;
        const taskTag = taskTagInput.value;
        const taskStatus = taskStatusInput.value;
    
        taskNameInput.value = "";
        taskDescInput.value = "";
        taskTagInput.value = "";
        taskStatusInput.value = "";

        
        const newTask = {
            "taskName" : taskName,
            "taskDesc" : taskDesc,
            "taskTag" : taskTag,
            "taskStatus" : taskStatus
        }
        
        tasks.push(newTask);
        
        // storing to local storage.
        localStorage.setItem("tasks", JSON.stringify(tasks));
    })
}


// clearing tasks on development mode.
// localStorage.clear();
