
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
        newTasksList.innerHTML += `
            <li class="task-list-item" data-task-id="${tasks.taskId}">
                <div class="task-info">
                    <div class="list-item-text-section">
                        <h4>${task.taskName}</h4>
                        <p>0hrs 0mins 0secs</p>
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
                    <div>
                        <a href="#">see time logs.. <span>></span></a>
                    </div>

                            <div class="time-log">
                                <ul>
                                    <li>10:00 AM - 2:00 PM</li>
                                    <li>10:00 AM - 2:00 PM</li>
                                    <li>10:00 AM - 2:00 PM</li>
                                    <li>10:00 AM - 2:00 PM</li>
                                    <li>10:00 AM - 2:00 PM</li>
                                </ul>
                                <div class="total-time-container">
                                    <span>Total time:</span>
                                    <span>4hr 50min</span>
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
        let taskTotalTimes = [];
        let taskTotalDuration;


        // attaching event listner for timerBtn
        timerBtn.addEventListener("click", (e) => {
            const taskItem = e.target.closest(".task-list-item");
            const timer = taskItem.querySelector(".timer");

            // variable to change the task stored in local storage
            // const taskId = Number(taskItem.getAttribute("data-task-id"));
            // console.log(taskId)
            // const taskToUpdate = tasks.find(t => t.taskId === taskId);
            // console.log(taskToUpdate)


            // starting timer
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

                    // formatting time values with leading zeros 
                    // const format = (val) => (val < 10 ? `0${val}` : val);
                    // timer.innerText = `${format(hours)}:${format(minutes)}:${format(seconds)}`;

                    timer.innerText = `${formatWithLeadingZeros(hours)}:${formatWithLeadingZeros(minutes)}:${formatWithLeadingZeros(seconds)}`;
                }, 1000);

                e.target.innerText = "stop timer";
                timerStatus = "started";

            }else {

                clearInterval(timerInterval);

                // getting end time
                endTime = new Date();

                // console.log(endTime.toLocaleTimeString())

                // finding difference between the start time and end time/////////////////////////////.
                let totalDurationInMilliseconds = endTime - startTime;  
                let totalDurationInSeconds = Math.floor(totalDurationInMilliseconds / 1000);

                let hrs = Math.floor(totalDurationInSeconds / 3600); // becuase 1 hr == 3600 seconds
                let mins = Math.floor( (totalDurationInSeconds % 3600) / 60); // we wanna check how seconds is left from total seconds after substracting hours, then we check how many full minutes we get form the reminaing seconds.
                let secs = totalDurationInSeconds % 60; // checking how many remaining secongs we get after taking full minutes.
                
                
                // formatting time values with leading zeros 
                const totalFormat = (val) => (val < 10 ? `0${val}` : val);
                totalTime = `${totalFormat(hrs)}:${totalFormat(mins)}:${totalFormat(secs)}`;
                console.log(totalTime);


                taskTotalTimes.push(totalTime);
                console.log(taskTotalTimes)


                // summing all the totaltimes of each task to get the final total time for each tasks..
                let taskTotalSeconds = 0;
                for(let i = 0; i < taskTotalTimes.length; i++) {
                    let time = taskTotalTimes[i];  // getting one totaltime

                    let [hrs, mins, secs] = time.split(":");
                    // console.log(hrs,mins, secs)

                    // let parts = time.split(":");
                    // let hrs = Number(parts[0]);
                    // let mins = Number(parts[1]);
                    // let secs = Number(parts[2]);

                    taskTotalSeconds += (Number(hrs) * 3600) + (Number(mins * 60)) + Number(secs);
                    
                }

                console.log(taskTotalSeconds);

                taskTotalDuration = convertSecondsToTimeFormat(taskTotalSeconds);
                console.log("task total duration",taskTotalDuration);


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
    let hrs = Math.floor(totalSeconds / 3600);
    let mins = Math.floor( (totalSeconds % 3600) / 60);
    let secs = totalSeconds % 60;

    return `${formatWithLeadingZeros(hrs)}:${formatWithLeadingZeros(mins)}:${formatWithLeadingZeros(secs)}`;
}

function formatWithLeadingZeros(val) {
    return (val < 10) ? `0${val}` : val;
}


// creating new tasks //////////////
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
            "timeLog" : [],
            "taskTotalDuration" : []
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
