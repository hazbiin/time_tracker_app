
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


// listing tasks if any from local storage/////
if(tasks.length !== 0) {
    tasksSectionDescription.classList.add('hide');
    
    let newTasksList = document.getElementById("new-tasks-list");
    newTasksList.innerHTML = "";


    tasks.forEach(task => {
        newTasksList.innerHTML += `
            <li class="task-list-item" data-task-id="${tasks.taskId}">
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
                    <h3 id="timer">00:00:00</h3> 
                </div>
            </li>
    `;
    })

    const timerBtns = document.querySelectorAll("#timer-btn");
    timerBtns.forEach(timerBtn => {

        // ///////////implementing timer////////////////////////
        // variables for time values 
        let seconds = 0;
        let minutes = 0;
        let hours = 0;

        // variables for set inteval and timer status
        let timerInterval = null;
        let timerStatus = "stopped";

        
        timerBtn.addEventListener("click", (e) => {
            
            const timerBtn = e.target;
            const taskItem = timerBtn.closest(".task-list-item");
            // const timerContainer = taskItem.querySelector(".timer-container");
            const timer = taskItem.querySelector("#timer");

            let time = [];
            let startTime;
            let endTime;

            if(timerStatus === "stopped") { 
                
                startTime = new Date().toLocaleTimeString();
                timerInterval = window.setInterval(() => {

                    // ////////timer ///////////
                    seconds ++;
                    if(seconds === 60) {
                        seconds = 0;
                        minutes++;
                        if(minutes === 60) {
                            minutes = 0;
                            hours++;
                        }
                    }

                    let leadingSeconds = seconds < 10 ? `0${seconds}` : seconds;
                    let leadingMinutes = minutes < 10 ? `0${minutes}` : minutes;
                    let leadingHours =  hours < 10 ? `0${hours}` : hours;

                    timer.innerText = `${leadingHours}:${leadingMinutes}:${leadingSeconds}`;
                }, 1000);
                
                timerBtn.innerHTML= "stop timer";
                // timerContainer.classList.add("open");

                timerStatus = "started";
            }else {

                window.clearInterval(timerInterval);
                seconds = 0;
                minutes = 0;
                hours = 0;
                timer.innerText = "00:00:00";

                endTime = new Date().toLocaleTimeString();

                timerBtn.innerHTML = "start timer";
                // timerContainer.classList.remove("open");
                timerStatus = "stopped";
            }


            console.log(startTime)
            time.push({
                startTime,
                endTime,
                totalTime: "00:00:00"
            })
            console.log(time);

            // tasks.push(time);
            // localStorage.setItem("tasks", JSON.stringify(tasks))
        })
    })
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
            "taskId" : tasks.length + 1,
            "taskName" : taskName,
            "taskDesc" : taskDesc,
            "taskTag" : taskTag,
            "taskStatus" : taskStatus,
            "timeLog" : []
        }
        
        tasks.push(newTask);
        
        // storing to local storage.
        localStorage.setItem("tasks", JSON.stringify(tasks));
    })
}

// clearing tasks on development mode.
// localStorage.clear();

