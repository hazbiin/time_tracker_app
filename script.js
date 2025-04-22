// localStorage.clear();

// creating new task pop up..
const createTaskPopupButton = document.getElementById('create-task-popup-btn');
const taskInputpopup = document.querySelector(".task-input-container");
const createTaskButton = document.getElementById("create-task-button");

// intro description..
const tasksSectionDescription = document.getElementById("tasks-section-desc");


// getting saved tasks from localStorage..
const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
console.log(tasks);

// object to store timer states.
const timers = {};


// inital loading from local storage.
displayTasks();
function displayTasks() {
    const newTasksList = document.getElementById("new-tasks-list");
    // newTasksList.innerHTML = "" ;

    tasks.forEach(task =>{
        renderTask(task)
    });

    if(tasks.length !== 0) {
        tasksSectionDescription.classList.add('hide');
    }
}


// creating new tasks ///////////////////////////////////////////////////
createTaskPopupButton.addEventListener("click", () => {
    taskInputpopup.classList.add('show');

    const closeCreateTaskPopup = document.getElementById('close-create-task-pop-up-btn');
    closeCreateTaskPopup.addEventListener("click", () => {
        taskInputpopup.classList.remove('show');
    })
})

if(createTaskButton){
    // task creation inputs.
    const taskNameInput = document.getElementById("task-name");
    const taskDescInput = document.getElementById("task-desc");
    const taskTagInput = document.getElementById("task-tag"); 

    createTaskButton.addEventListener("click", () => {
        const taskName = taskNameInput.value;
        const taskDesc = taskDescInput.value;
        const taskTag = taskTagInput.value;
    
        taskNameInput.value = "";
        taskDescInput.value = "";
        taskTagInput.value = "";
        
        const dateCreated = new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long", 
            day:"numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12:true
        });

        const newTask = {
            "taskId" : Date.now(),
            "startDate": dateCreated,
            "endDate":"",
            "taskName" : taskName,
            "taskDesc" : taskDesc,
            "taskTag" : taskTag,
            "taskStatus" : "not-started",
            "timeLogs" : [],
            "taskTotalDuration" : ""
        };
        tasks.push(newTask);
        
        // storing to local storage.
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // closing the popup
        taskInputpopup.classList.remove('show');
        if(tasksSectionDescription) {
            tasksSectionDescription.classList.add('hide');
        }

        // render newly created task.
        renderTask(newTask);
    })
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

    let totalTimeToDisplay;
    if(task.taskTotalDuration === ""){
        totalTimeToDisplay = "00h 00min 00secs"
    }else {
        const [hrs,mins,secs] = task.taskTotalDuration.split(':');
        totalTimeToDisplay = `${hrs}h ${mins}min ${secs}secs`;
    }
    
    li.innerHTML = `
        <div class="task-info">
            <div class="list-item-text-section">
                <h4 class="task-name">${task.taskName}</h4>
                <p class="task-total">${totalTimeToDisplay}</p>
                <h5 class="task-status">${task.taskStatus}</h5>
            </div>
            <div class="list-item-buttons-section">
                <button class="timer-btn">
                    <svg class="timer-icon" xmlns="http://www.w3.org/2000/svg"  viewBox="0 -960 960 960" ><path class="timer-path" d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z"/></svg>
                </button>
                <button class="task-edit-btn" id="edit-btn">
                    <i class="bi bi-three-dots-vertical "></i>
                </button>
            </div>
        </div>

        <div id="timer-container" class="timer-container">
            <h3 class="timer"></h3> 
        </div>


        <div class="task-timelogs">
            <button class="time-log-btn">
                <span class="time-log-btn-text">Hide Time Logs</span>
                <i class="bi bi-chevron-up"></i>
            </button>
                                    
            <div class="time-log">
                <ul class="time-log-list">
                    ${timeLogsMarkup}
                </ul>
                <div class="total-time-container">
                    <h3>Total Task Duration: <span class="task-total"></span> </h3>
                </div>
            </div> 
        </div>                       
    `;


    if(task.taskName !== "") {
        newTasksList.appendChild(li);

        if(task.timeLogs.length > 0) {
            const timeLogBtns = document.querySelectorAll(".time-log-btn");
            timeLogBtns.forEach(timeLogBtn =>{
                timeLogBtn.classList.add("show");
                timeLogBtn.querySelector(".time-log-btn-text").textContent = "Show Time Logs";

                if(timeLogBtn.querySelector("i").classList.contains("bi-chevron-up")){
                    timeLogBtn.querySelector("i").classList.remove("bi-chevron-up");
                    timeLogBtn.querySelector("i").classList.add("bi-chevron-down");
                }
            });
        }
    }
    
    // attaching timer for the tasks.
    attachTimerListenerTo(li);
}

function attachTimerListenerTo(taskItem) {
    const timerBtn = taskItem.querySelector(".timer-btn");

    timerBtn.addEventListener("click", (e) => {
        const timer = taskItem.querySelector(".timer");
        const timerPath = taskItem.querySelector(".timer-path")

        // inputs for updating the tasks.
        const taskId = Number(taskItem.dataset.taskId);
        const taskToUpdate = tasks.find(task => task.taskId === taskId);
        
        // setting initial timerstates for each clicked task
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
        // console.log(timers);

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
            

            timerPath.setAttribute("d", "m798-274-60-60q11-27 16.5-53.5T760-440q0-116-82-198t-198-82q-24 0-51 5t-56 16l-60-60q38-20 80.5-30.5T480-800q60 0 117.5 20T706-722l56-56 56 56-56 56q38 51 58 108.5T840-440q0 42-10.5 83.5T798-274ZM520-552v-88h-80v8l80 80ZM792-56l-96-96q-48 35-103.5 53.5T480-80q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-60 18.5-115.5T192-656L56-792l56-56 736 736-56 56ZM480-160q42 0 82-13t75-37L248-599q-24 35-36 75t-12 84q0 116 82 198t198 82ZM360-840v-80h240v80H360Zm83 435Zm113-112Z");
            timerState.status = "started";

            taskToUpdate.taskStatus = "in-progress"
            const taskStatus = taskItem.querySelector(".task-status");
            taskStatus.textContent = taskToUpdate.taskStatus;

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

            // if(taskToUpdate.timeLogs.length !== 0 && taskToUpdate.taskStatus !== "in-progress") {
            //     taskToUpdate.taskStatus = "in-progress"
            // }

            // updating local storage 
            localStorage.setItem("tasks", JSON.stringify(tasks));

            
            // //////////////////////necesaryy dom updates ////////////////////////
            // only updating the necessary part of the list without full updating.

            const taskTotal = taskItem.querySelector(".task-total");
            const [hrs,mins,secs] = taskToUpdate.taskTotalDuration.split(':');
            taskTotal.textContent = `${hrs}h ${mins}min ${secs}secs`;

            // const taskStatus = taskItem.querySelector(".task-status");
            // taskStatus.textContent = taskToUpdate.taskStatus;
            

            const timeLogBtn = taskItem.querySelector(".time-log-btn");
            timeLogBtn.classList.add("show");

            const textSpan = timeLogBtn.querySelector(".time-log-btn-text");
            const icon = timeLogBtn.querySelector("i");
            textSpan.textContent = "Hide Time Logs";
            if(icon.classList.contains("bi-chevron-down")){
                icon.classList.remove("bi-chevron-down");
                icon.classList.add("bi-chevron-up");
            }  

            

            const taskTimeLogs = taskItem.querySelector(".time-log");
            taskTimeLogs.classList.add("show");
            

            const timeLogList = taskItem.querySelector(".time-log-list");
            const newLog = document.createElement("li");
            newLog.textContent = `${timerState.startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()} - ${totalTime}`;
            timeLogList.appendChild(newLog);

            
            // resetting the timer.
            timerState.seconds = 0;
            timerState.minutes = 0;
            timerState.hours = 0;
            timer.innerText = "";
            timerPath.setAttribute("d", "M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z");
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

// function convertTimeFormatToSeconds(h, m, s){
//     return (h * 3600 + m * 60 + s)
// }
function formatWithLeadingZeros(val) {
    return (val < 10) ? `0${val}` : val;
}


//////toggling time logs ///////////
const timeLogBtns = document.querySelectorAll(".time-log-btn");
timeLogBtns.forEach(timeLogBtn => {
    timeLogBtn.addEventListener("click", () => {

        console.log("herereeeeeee")

        const timeLogContainer = timeLogBtn.closest(".task-timelogs").querySelector(".time-log");
        timeLogContainer.classList.toggle("show");

        const textSpan = timeLogBtn.querySelector(".time-log-btn-text");
        const icon = timeLogBtn.querySelector("i");

        // Toggle text
        if(textSpan.textContent.trim() === "Hide Time Logs") {
            textSpan.textContent = "Show Time Logs";
        }else {
            textSpan.textContent = "Hide Time Logs";
        }

        // Toggle icon
        icon.classList.toggle("bi-chevron-up");
        icon.classList.toggle("bi-chevron-down");
    })
})


//////////////////////// to do soon //////////////////
// associate date with the task.
// start date, end date - when can i take that,??????
// start date -- take whenever a new task is created in the localstorage. -- done.

// end date -- when user manually enter status done.
// if status is done, get the end date, and also dont allow the user to further work on it.
// give a seperate section for easily accessing and changing the status rather than going to edit task menu.

// what all status can be given??
// 1) in-progress 
// 2) done 
// do we need to give another statuses as well??????
// what can be other statuses --- pending, 
// You could also add a status change history later, to keep track of transitions.



// style task views -
// do styling, // displaying only current running taskss.
// plan agian on create task pop up, and clubing it with option to edit or delete tasks..

// create login page design -- and set color theme based on the login page image.
// associate user and task done by each user.



// //////////////////////////////to do later /////////////////////////////////
// what if user want to work on some other previous task. ????????????
// on each new day, user must hve an option ot create a new task and also work on old task(take the task from local storage and resume timelogs) 


// now you gathered total time of a particular task? what can you do with that?
// can show daily, weekly, monthly --- analytics, like how much hrs spend on each task.
// plan on how to display insights??????///
// tasks pov
// hours by tasks -- daily, weekly, monthly (for this associating dates is necessary.)
// day pov
// hours per day -- daily, weekly, monthly


// task listing --
// just take the tasks form local storage and list with certain dom manipulation.
// allow user to search tasks by tags.-- user can give any tags to task to group tasks together.
// task details --
// you must note down - when a user started to work on a task and when did he ended that task.
// and user must get the whole details about how many days he have worked on that task, on which dates, including time log lists.



// jjjjj