
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

function displayTasks() {
    const newTasksList = document.getElementById("new-tasks-list");
    newTasksList.innerHTML = "" ;
    tasks.forEach(task => renderTask(task));

    if(tasks.length !== 0) {
        tasksSectionDescription.classList.add('hide');
    }
}


function renderTask(task) {
    const newTasksList = document.getElementById("new-tasks-list");

    // generating time logs.
    const timeLogsMarkup = task.timeLogs.map(log => {
        return `<li>${log.startTime} - ${log.endTime} - ${log.totalTime}</li>`
    }).join("");


    // creating task list item.
    const li = document.createElement("li");
    li.className = "task-list-item";
    li.setAttribute("data-task-id", task.taskId);

    li.innerHTML = `
        <div class="task-info">
            <div class="list-item-text-section">
                <h4>${task.taskName}</h4>
                <p class="task-total">${task.taskTotalDuration}</p>
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
                <ul class="time-log-list">
                    ${timeLogsMarkup}
                </ul>
                <div class="total-time-container">
                    <span>Total time:</span>
                    <span>${task.taskTotalDuration}</span>
                </div>
            </div>       
        </div>
    `;

    newTasksList.appendChild(li);

    // attaching timer for that newly created task.
    attachTimerListenerTo(li);
}

// object to store timer states.
const timers = {};
function attachTimerListenerTo(taskItem) {
    const timerBtn = taskItem.querySelector(".timer-btn");

    timerBtn.addEventListener("click", (e) => {
        const timer = taskItem.querySelector(".timer");
        const taskId = Number(taskItem.dataset.taskId);
        const taskToUpdate = tasks.find(task => task.taskId === taskId);
        

        if(!timers[taskId]) {
            timers[taskId] = {
                intervalId: null,
                status: "stopped",
                startTime: null,
                seconds:0,
                minutes:0,
                hours:0
            };
        }
        const timerState = timers[taskId];

        // timer start stop functionality///////////////////
        if(timerState.status === "stopped") {
            // getting startTIme
            timerState.startTime = new Date();

            timerState.intervalId = setInterval(() => {
                timerState.seconds++;
                if(timerState.seconds === 60) {
                    timerState.seconds = 0;
                    timerState.minutes++;
                    if(timerState.minutes === 60) {
                        timerState.minutes = 0;
                        timerState.hours++;
                    }
                }
                timer.innerText = `${formatWithLeadingZeros(timerState.hours)}:${formatWithLeadingZeros(timerState.minutes)}:${formatWithLeadingZeros(timerState.seconds)}`;
            }, 1000);

            e.target.innerText = "stop timer";
            timerState.status = "started";
        }else {

            clearInterval(timerState.intervalId);

            // getting end time
            const endTime = new Date();

            // finding difference between the start time and end time
            const currentLogDuration = endTime - timerState.startTime; 
            const currentLogDurationInSeconds = Math.floor(currentLogDuration / 1000);
            const totalTime = convertSecondsToTimeFormat(currentLogDurationInSeconds);


            // updating local storage with time logs 
            taskToUpdate.timeLogs.push({
                timeLogId : taskToUpdate.timeLogs.length + 1,
                startTime : timerState.startTime.toLocaleTimeString(),
                endTime: endTime.toLocaleTimeString(),
                totalTime : totalTime
            });
            // console.log("task time logs ------->>", taskToUpdate.timeLogs);


            // summing all the time logs
            let allTimeLogsTotalSeconds = 0;
            taskToUpdate.timeLogs.forEach(log => {
                const [hrs, mins, secs] = log.totalTime.split(':');
                allTimeLogsTotalSeconds += (Number(hrs) * 3600) + (Number(mins) * 60) + Number(secs);
            });
            // console.log("all time logs total ------>>",allTimeLogsTotalSeconds);


            // total task duration /////////////////////////////////////////////////////////
            taskToUpdate.taskTotalDuration = convertSecondsToTimeFormat(allTimeLogsTotalSeconds);
            // console.log("task total duration ------->>",taskTotalDuration);


            // updating local storage 
            localStorage.setItem("tasks", JSON.stringify(tasks))

            
            // only updating the necessary part of the list without full updating.
            const timeLogList = taskItem.querySelector(".time-log-list");
            const newLog = document.createElement("li");
            newLog.textContent = `${timerState.startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()} - ${totalTime}`;
            timeLogList.appendChild(newLog);

            const totalTimeSpan = taskItem.querySelector(".total-time-container span:last-child");
            totalTimeSpan.textContent = taskToUpdate.taskTotalDuration;

            const mainTotal = taskItem.querySelector(".task-total");
            mainTotal.textContent = taskToUpdate.taskTotalDuration;


            // resetting the timer.
            timerState.seconds = 0;
            timerState.minutes = 0;
            timerState.hours = 0;
            timer.innerText = "00:00:00";
            e.target.innerText = "start timer";
            timerState.status = "stopped";
        }
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

    const closeCreateTaskPopup = document.getElementById('close-create-task-pop-up-btn');
    closeCreateTaskPopup.addEventListener("click", () => {
        createNewTaskPopup.classList.remove('show');
    })
})

if(createTaskButton){
    // task creation inputs.
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
        if(tasksSectionDescription) {
            tasksSectionDescription.classList.add('hide');
        }

        // render newly created task.
        renderTask(newTask);
    })
}

// clearing tasks on development mode.
// localStorage.clear();