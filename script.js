
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


// inital loading from local storage.
displayTasks();

// listing tasks ////////////////////////////
function displayTasks() {
    const newTasksList = document.getElementById("new-tasks-list");
    newTasksList.innerHTML = "";

    tasks.forEach(task => {

        const timeLogsMarkup = task.timeLogs.map(log => {
            return `<li>${log.startTime} - ${log.endTime} - ${log.totalTime}</li>`
        }).join("");


        newTasksList.innerHTML += `
            <li class="task-list-item" data-task-id="${task.taskId}">
                <div class="task-info">
                    <div class="list-item-text-section">
                        <h4>${task.taskName}</h4>
                        <p>${task.taskTotalDuration}</p>
                        <p>${task.taskStatus}</p>
                    </div>
                    <div class="list-item-buttons-section">
                        <button class="timer-btn">start timer</button>
                        <button id="edit-btn">edit</button>
                    </div>
                </div>

                <div id="timer-container" class="timer-container">
                    <h3 class="timer">00:00:00</h3> 
                </div>

                <div class="task-list-item-timelog">
                    <button>view less</button>
                    <div class="time-log">
                        <ul>
                            ${timeLogsMarkup}
                        </ul>
                        <div class="total-time-container">
                            <span>Total time:</span>
                            <span>${task.taskTotalDuration}</span>
                        </div>
                    </div>       
                </div>
            </li>
        `;
    });

    if(tasks.length !== 0) {
        tasksSectionDescription.classList.add('hide');
    }

    // calling funciton to attach timers 
    attachTimerListeners();
}



function attachTimerListeners() {
    const timerBtns = document.querySelectorAll(".timer-btn");

    timerBtns.forEach(timerBtn => {

        // setting initial states for each timer btns
        let seconds = 0, minutes = 0, hours = 0;
        let timerInterval = null;
        let timerStatus = "stopped";


        let startTime, endTime, totalTime;
        // let taskTimeLogs = [];
        let taskTotalDuration;


        // attaching event listner for timerBtn
        timerBtn.addEventListener("click", (e) => {
            const taskItem = e.target.closest(".task-list-item");
            const timer = taskItem.querySelector(".timer");


            // variable to change the task stored in local storage
            const taskId = Number(taskItem.dataset.taskId);
            const taskToUpdate = tasks.find(t => t.taskId === taskId); // gets the first match


            // timer start stop functionality///////////////////
            if(timerStatus === "stopped") {
                // getting startTIme
                startTime = new Date();
                timerInterval = setInterval(() => {
                    seconds++;
                    if(seconds === 60) {
                        seconds = 0;
                        minutes++;
                        if(minutes === 60) {
                            minutes = 0;
                            hours++;
                        }
                    }
                    timer.innerText = `${formatWithLeadingZeros(hours)}:${formatWithLeadingZeros(minutes)}:${formatWithLeadingZeros(seconds)}`;
                }, 1000);

                e.target.innerText = "stop timer";
                timerStatus = "started";
            }else {

                clearInterval(timerInterval);

                // getting end time
                endTime = new Date();

                // finding difference between the start time and end time/////////////////////////////
                let currentLogDuration = endTime - startTime;  // milliseconds
                let currentLogDurationInSeconds = Math.floor(currentLogDuration / 1000);

                totalTime = convertSecondsToTimeFormat(currentLogDurationInSeconds);

                // updating task object with time logs /////////////
                taskToUpdate.timeLogs.push({
                    timeLogId : taskToUpdate.timeLogs.length + 1,
                    startTime : startTime.toLocaleTimeString(),
                    endTime: endTime.toLocaleTimeString(),
                    totalTime : totalTime
                });
                // console.log("task time logs ------->>", taskToUpdate.timeLogs);


                // summing all the totaltimes of each task to get the final total time for each tasks..
                let allTimeLogsTotalSeconds = 0;
                taskToUpdate.timeLogs.forEach(log => {
                    const [hrs, mins, secs] = log.totalTime.split(':');
                    allTimeLogsTotalSeconds += (Number(hrs) * 3600) + (Number(mins) * 60) + Number(secs);
                });
                // console.log("all time logs total ------>>",allTimeLogsTotalSeconds);


                // total task duration /////////////////////////////////////////////////////////
                taskTotalDuration = convertSecondsToTimeFormat(allTimeLogsTotalSeconds);
                // console.log("task total duration ------->>",taskTotalDuration);


                taskToUpdate["taskTotalDuration"] = taskTotalDuration;

                // updating local storage 
                localStorage.setItem("tasks", JSON.stringify(tasks))

                // refresh the UI after the update
                displayTasks();


                // resetting the timer.
                seconds = 0; minutes = 0; hours = 0;
                timer.innerText = "00:00:00";
                e.target.innerText = "start timer";
                timerStatus = "stopped";
            }
        })
    })
}

function convertSecondsToTimeFormat(totalSeconds) {
    let hrs = Math.floor(totalSeconds / 3600); // becuase 1 hr == 3600 seconds
    let mins = Math.floor( (totalSeconds % 3600) / 60); // we wanna check how many seconds is left from total seconds after substracting hours, then we check how many full minutes we get form the reminaing seconds.
    let secs = totalSeconds % 60; // checking how many remaining seconds we get after taking full minutes.

    return `${formatWithLeadingZeros(hrs)}:${formatWithLeadingZeros(mins)}:${formatWithLeadingZeros(secs)}`;
}
function formatWithLeadingZeros(val) {
    return (val < 10) ? `0${val}` : val;
}


// creating new tasks ///////////////////////////////////////////////////
createTaskPopupButton.addEventListener("click", () => {
    createNewTaskPopup.classList.add('show');
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
            "taskId" : Date.now(),
            "taskName" : taskName,
            "taskDesc" : taskDesc,
            "taskTag" : taskTag,
            "taskStatus" : taskStatus,
            "timeLogs" : [],
            "taskTotalDuration" : ""
        };
        
        tasks.push(newTask);
        
        // storing to local storage.
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // closing the popup
        createNewTaskPopup.classList.remove('show');


        // display all newly created task
        displayTasks();
    })
}

// clearing tasks on development mode.
// localStorage.clear();
