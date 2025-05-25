
// // getting users form localStorage. 
const users = JSON.parse(localStorage.getItem("users")) || [];
console.log("users",users);


const signupSection = document.getElementById("signup-section");
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app-section");

const toLoginLink = document.getElementById("to-login");
const toSignupLink = document.getElementById("to-signup");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");


// switch between login and signup
toLoginLink.addEventListener("click", () => {
  signupSection.style.display = "none";
  loginSection.style.display = "block";
});

toSignupLink.addEventListener("click", () => {
  loginSection.style.display = "none";
  signupSection.style.display = "block";
});

// signup 
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const password = document.getElementById("signup-password").value;  

    const newUser = {
      userId: Date.now(),
      username,
      password,
      tasks : []
    };
    users.push(newUser);
    
    const user = users.find( u => u.username === username);
    if(user) {
        alert("user already exists!");
        return;
    }

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", username);

    // when the user is logged in
    const currentUserName = localStorage.getItem('currentUser');
    if(currentUserName) {
      signupSection.style.display = "none";
      appSection.style.display = "block";
    }
});

// login 
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.querySelector("#login-username").value.trim();
    const password = document.querySelector("#login-password").value;

    const user = users.find( u => u.username === username && u.password === password);
  
    if(!user){
      alert("invalid credentials");
      return;
    }

    localStorage.setItem("currentUser", username);

    loginSection.style.display = "none";
    appSection.style.display = "block";
});

// logout 
document.querySelector("#logout-btn").addEventListener("click", () => {
 
  localStorage.removeItem("currentUser");
  appSection.style.display = "none";
  loginSection.style.display = "block";
})


document.addEventListener("DOMContentLoaded", () => {
  const currentUserName = localStorage.getItem('currentUser');

  if(currentUserName) {
    appSection.style.display = "block";
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    // displayTasks();
  }

})

// // /////////////////////////////////////////////////////////////////////////////////////task management
// creating new task pop up..
const createTaskPopupButton = document.getElementById("create-task-popup-btn");
const newTaskPopUp = document.querySelector('.new-task-popup');
const createTaskButton = document.getElementById("create-task-btn");

// timer section 
const timerSection = document.querySelector(".timer-section");
const timerSectionCloseBtn = document.querySelector(".timer-section-close-btn");
const ongoingTaskName = document.querySelector(".ongoing-task-name");
const hoursText = document.querySelector(".hours");
const minutesText = document.querySelector(".minutes");
const secondsText = document.querySelector(".seconds");
const timerBtn = document.querySelector(".timer-btn");

// global variables
let intervalId = null;
let timerStatus = "stopped";
let seconds = 0;
let minutes = 0;
let hours = 0;
let startTime = null;
let currentTaskItem = null;

// loading page based on if user is logged in or not.
document.addEventListener("DOMContentLoaded", () => {
  const currentUserName = localStorage.getItem('currentUser');

  if(currentUserName) {
    appSection.style.display = "block";
    loginSection.style.display = "none";
    signupSection.style.display = "none";
    displayTasks();
  }
  
  // making changes on new day
  scheduleMidnightUpdate();
  
  // restoring any active timers on page reloads
  const activeTimer = JSON.parse(localStorage.getItem("activeTimer"));
  if(activeTimer){
    const taskId = activeTimer.taskId;
    startTime = new Date(activeTimer.startTime);

    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskToUpdate = tasks.find(task => task.taskId === taskId);

    if(taskToUpdate) {
      currentTaskItem = document.querySelector(`[data-task-id= '${taskId}']`);
      ongoingTaskName.textContent = taskToUpdate.taskName;

      if(!timerSection.classList.contains('show')) {
        timerSection.classList.add('show');
      }
      
      // restore timer variables.
      hours = activeTimer.hours;
      minutes = activeTimer.minutes;
      seconds = activeTimer.seconds;
  
      const elapsedSeconds = Math.floor((Date.now() - startTime.getTime()) / 1000);
      
      //converting excess seconds into minutes, and minutes into hours.
      seconds += elapsedSeconds;
      
      if(seconds >= 60){
        minutes += Math.floor(seconds / 60);
        seconds = seconds % 60;
      }
      if(minutes >= 60){
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
      
      hoursText.innerText = `${formatWithLeadingZeros(hours)} h`;
      minutesText.innerText = `${formatWithLeadingZeros(minutes)} m`;
      secondsText.innerText = `${formatWithLeadingZeros(seconds)} s`;
  
      // start timer form where it was paused
      timerStatus = 'started';
      timerBtn.textContent = 'stop';

      intervalId = setInterval(() => {
        seconds++;
        if(seconds === 60) {
          seconds = 0;
          minutes ++;
          if(minutes === 60) {
            minutes = 0;
            hours++
          }
        }
  
        hoursText.innerText = `${formatWithLeadingZeros(hours)} h`;
        minutesText.innerText = `${formatWithLeadingZeros(minutes)} m`;
        secondsText.innerText = `${formatWithLeadingZeros(seconds)} s`;
  
      }, 1000);

      // const dailyTasksList = document.getElementById("daily-tasks-list");
      // renderTask(taskToUpdate, dailyTasksList);
    }
  }
});

// inital loading of daily tasks list from local storage.
function displayTasks() {
  const dailyTasksList = document.getElementById("daily-tasks-list");
  const todoTasksList = dailyTasksList.querySelector('.todo-tasks');
  const inProgressTasksList = dailyTasksList.querySelector('.inprogress-tasks');
  const doneTasksList = dailyTasksList.querySelector('.done-tasks');
  todoTasksList.innerHTML = "";
  inProgressTasksList.innerHTML = "";
  doneTasksList.innerHTML = "";

  const today = new Date().toLocaleDateString();
  // const formatedTodayDate = formateDate(new Date());
  const formatedTodayDate = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //getting saved tasks from localStorage.. 
  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks || [];

  tasks.forEach((task) => {

    // for those task which has not yet started, means for those that does not has current day timelogs.
    const taskCreatedDate = task.createdAt;
    if(taskCreatedDate === formatedTodayDate) {

        const dailyTasksList = document.getElementById("daily-tasks-list");
        const listCategories = dailyTasksList.querySelectorAll(".list-category");
        listCategories.forEach(lc => {
          lc.style.display = "block";
        });

      if(task.taskStatus === "to-do") {
        renderTask(task, todoTasksList);
      }
    }
    
    task.timeLogs.forEach(timeLog => {
      const logDate = new Date(timeLog.startTime).toLocaleDateString();
        if(logDate === today) {

          if(task.taskStatus === "to-do") {
            renderTask(task, todoTasksList);
          }else if(task.taskStatus === "in-progress") {
            renderTask(task, inProgressTasksList)
          }else if(task.taskStatus === "done") {
            renderTask(task, doneTasksList)
          }
        }
    })
  });
}


// -------------------------------creating new tasks -----------------------------------------
createTaskPopupButton.addEventListener("click", () => {
  newTaskPopUp.classList.add("show");
});

if(createTaskButton) {
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
      day: "numeric",
    });

    const newTask = {
      taskId: Date.now(),
      createdAt: dateCreated,
      startDate: "",
      endDate: "",
      taskName: taskName,
      taskDesc: taskDesc,
      taskTag: taskTag,
      taskStatus: "to-do",
      timeLogs: [],
      taskTotalDuration: "",
    };

    // storing to local Storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    currentUser.tasks.push(newTask);
    localStorage.setItem("users", JSON.stringify(users));

    // closing the popup
    newTaskPopUp.classList.remove("show");

    // render newly created task.
    const dailyTasksList = document.getElementById("daily-tasks-list");
    const todoTasksList = dailyTasksList.querySelector('.todo-tasks');
    renderTask(newTask, todoTasksList);
  });
}

const closePopup = document.getElementById("close-popup-btn");
if(closePopup) {
  closePopup.addEventListener("click", () => {
    newTaskPopUp.classList.remove("show");
  })
}


//-------------------- task rendering function ------------------------
function renderTask(task, containerElement) {
  // skip if task name is empty
  if(!task.taskName) return;

  // skip if task already exists in the list
  if(containerElement.querySelector(`[data-task-id="${task.taskId}"]`)) {
    return;
  }

  // removing exisiting tasks from other lists if the status is changed.
  const mainTaskList = document.querySelector('.main-tasks-list');
  const listSubCategories = mainTaskList.querySelectorAll('.list-sub-category');
  const taskId = task.taskId;
  listSubCategories.forEach(subCat => {
    if(subCat !== containerElement) {
      const existingItem = subCat.querySelector(`[data-task-id="${taskId}"]`);
      if(existingItem) {
        existingItem.remove();
      }
    }
  });

  // create task list item
  const li = document.createElement("li");
  li.className = "task-list-item";
  li.setAttribute("data-task-id", task.taskId);

  // formatting totaltime
  let totalTimeToDisplay;
  if (task.taskTotalDuration === "") {
    totalTimeToDisplay = "00h 00m 00s";
  } else {
    const [hrs, mins, secs] = task.taskTotalDuration.split(":");
    totalTimeToDisplay = `${hrs}h ${mins}m ${secs}s`;
  }

  // formatting buttonlabel
  let buttonLabel;
  if(task.timeLogs.length === 0) {
    buttonLabel = "Begin Your Work Session";
  }else {
    buttonLabel = "Resume Your Work Session";
  }

  // formatting based on task status
  let totalTimeText; 
  let timerBtn;
  let selectBox;

  if(task.taskStatus === "to-do") {
    totalTimeText = `time spent until now: ${totalTimeToDisplay}`;
    timerBtn = `
      <button class="start-timer-btn">
        ${buttonLabel}
      </button>
    `;

    selectBox = `
      <select id="task-status" style="display:none" >
        <option value="" selected>change status</option>
        <option value="done"> ✅ Done</option>
      </select>
    `;
  } else if(task.taskStatus === "in-progress") {
    totalTimeText = `time spent until now: ${totalTimeToDisplay}`;
    timerBtn = `
      <button class="start-timer-btn">
        ${buttonLabel}
      </button>
    `;

    selectBox = `
      <select id="task-status">
        <option value="" selected>change status</option>
        <option value="done"> ✅ Done</option>
      </select>
    `;

  } else {
    totalTimeText = `total task duration: ${totalTimeToDisplay}`;

    timerBtn = `
      <button class="start-timer-btn" style="display:none">
        ${buttonLabel}
      </button>
    `;
    
    selectBox = `
      <select id="task-status" style="display:none" >
        <option value="" selected>change status</option>
        <option value="done"> ✅ Done</option>
      </select>
    `;
  }

  // setting innerHTML
  li.innerHTML = `
    <div class="task-info">
      <div class="list-item-text-section">
          <h4 class="task-name">${task.taskName}</h4>
          <p class="task-total">${totalTimeText}</p>
          <p class="task-status">task status: ${task.taskStatus}</p>
          ${selectBox}
      </div>
      <div class="list-item-buttons-section">
           ${timerBtn}
          <button class="task-details-btn" id="task-details-btn">
            view task details
          </button>
      </div>
    </div>
  `;
  containerElement.appendChild(li);

  // attach timers
  showTimer(li);

  // // show taskDetails 
  showTaskDetaitls(li);

  // change task status 
  updateTaskStatus(li);

  // delete tasks 
  // deleteTask(li);
}



// ---------------------show timer details ---------------------
function showTimer(taskItem) {
  console.log("show timer function called");

  const startTimerBtn = taskItem.querySelector(".start-timer-btn");
  startTimerBtn.addEventListener("click", (e) => {

    if(startTimerBtn.closest('.list-sub-category')){
      if(document.querySelector("#all-tasks-section").style.display = "flex") {
        document.querySelector("#all-tasks-section").style.display = "none";
      }
      document.querySelector("#today-tasks-section").style.display = "flex";
    }
    
    if(!timerSection.classList.contains("show")) {
      timerSection.classList.add('show');
    }

    // setting current task to update
    currentTaskItem = taskItem;
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskId = Number(currentTaskItem.dataset.taskId);

    const taskToUpdate = tasks.find(task => task.taskId === taskId);


    // necessary dom updates
    if(timerStatus !== "started"){

      const currentTaskName = taskItem.querySelector('.task-name');
      ongoingTaskName.textContent = currentTaskName.textContent;

      timerBtn.textContent = 'start';
      hoursText.innerText = `00 h`;
      minutesText.innerText = `00 m`;
      secondsText.innerText = `00 s`;

      seconds = 0;
      minutes = 0;
      hours = 0;

      if(taskToUpdate.timeLogs.length !== 0){

        timerBtn.textContent = 'resume';

        const [hrs, mins, secs] = taskToUpdate.taskTotalDuration.split(':');
        hoursText.innerText = `${hrs} h`;
        minutesText.innerText = `${mins} m`;
        secondsText.innerText = `${secs} s`;

        seconds = Number(secs);
        minutes = Number(mins);
        hours = Number(hrs);
      }
    }
  });
}

timerSectionCloseBtn.addEventListener("click", () => {
  if(timerStatus !== "started"){
    timerSection.classList.remove('show');
  }
});

console.log(currentTaskItem)
// main timer functionality
timerBtn.addEventListener("click", (e) => {

  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  const activeTimer = JSON.parse(localStorage.getItem("activeTimer"));

  let taskId;
  if(activeTimer) {
    taskId = activeTimer.taskId
  }else {
    taskId = Number(currentTaskItem.dataset.taskId);
  }

  // const taskId = Number(currentTaskItem.dataset.taskId);
  const taskToUpdate = tasks.find(task => task.taskId === taskId);

  if(timerStatus === "stopped"){

      // getting start time.
      startTime = new Date();

      // storing active timer incase of page refresh
      localStorage.setItem("activeTimer", JSON.stringify({
        taskId: taskToUpdate.taskId,
        startTime: startTime.toISOString(),
        hours,
        minutes,
        seconds
      }))

      
      if(taskToUpdate.startDate === "") {
        taskToUpdate.startDate = `${formateDate(new Date())}`;
      }

      taskToUpdate.taskStatus = "in-progress";
      currentUser.tasks = tasks;
      localStorage.setItem("users", JSON.stringify(users));

      const taskStatusLabel = currentTaskItem.querySelector('.task-status');
      taskStatusLabel.textContent = `task-status: ${taskToUpdate.taskStatus}`;
      
      intervalId = setInterval(() => {
        seconds++;
        if(seconds === 60) {
          seconds = 0;
          minutes ++;
          if(minutes === 60) {
            minutes = 0;
            hours ++;
          }
        }
        hoursText.innerText = `${formatWithLeadingZeros(hours)} h`;
        minutesText.innerText = `${formatWithLeadingZeros(minutes)} m`;
        secondsText.innerText = `${formatWithLeadingZeros(seconds)} s`;
      }, 1000);

      timerStatus = "started";
      timerBtn.textContent = "stop";


      // dom changes 
      const dailyTasksList = document.getElementById("daily-tasks-list");
      const inProgressTasksList = dailyTasksList.querySelector('.inprogress-tasks');
      addUpdatedAndRemoveExisitingTaskItem(inProgressTasksList, currentTaskItem);

    }else {

      clearInterval(intervalId);

      const endTime = new Date();

      const currentLogDuration = endTime - startTime;
      const currentLogDurationInSeconds = Math.floor(currentLogDuration / 1000);
      const totalTime = convertSecondsToTimeFormat(currentLogDurationInSeconds);

      taskToUpdate.timeLogs.push({
        timeLogId : taskToUpdate.timeLogs.length + 1,
        startTime,
        endTime,
        totalTime
      });

      // summing all time logs
      let allTimeLogsTotalSeconds = 0;
      taskToUpdate.timeLogs.forEach(log => {
          const [hrs, mins, secs] = log.totalTime.split(':');
          allTimeLogsTotalSeconds += (Number(hrs) * 3600) + (Number(mins) * 60) + Number(secs);
      });
      
      // total task duration 
      taskToUpdate.taskTotalDuration = convertSecondsToTimeFormat(allTimeLogsTotalSeconds);
      // console.log("task total duration ------->>", convertSecondsToTimeFormat(allTimeLogsTotalSeconds));


      // update local Storage
      currentUser.tasks = tasks;
      localStorage.setItem("users", JSON.stringify(users));

      // necessary dom changes 
      displayTotalTaskDuration(taskToUpdate, taskId);

      const currentTaskButtonLabel = currentTaskItem.querySelector('.start-timer-btn');
      currentTaskButtonLabel.textContent = `Resume Your Work Session`;

      if(timerSection.classList.contains("show")) {
        timerSection.classList.remove('show');
      }

      seconds = 0;
      minutes = 0;
      hours = 0;
      hoursText.innerText = `00 h`;
      minutesText.innerText = `00 m`;
      secondsText.innerText = `00 s`;
      timerStatus = "stopped";
      
      timerBtn.textContent = "start";

      // removing active timer from local storage
      localStorage.removeItem("activeTimer");
    }
  });


function formateDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}-${month}-${year}`;
}

function convertSecondsToTimeFormat(totalSeconds) {
  let hrs = Math.floor(totalSeconds / 3600); // becuase 1 hr == 3600 seconds
  let mins = Math.floor((totalSeconds % 3600) / 60); // we wanna check how many seconds is left from total seconds after substracting hours, then we check how many full minutes we get form the reminaing seconds.
  let secs = totalSeconds % 60; // checking how many remaining seconds we get after taking full minutes.
  
  return `${formatWithLeadingZeros(hrs)}:${formatWithLeadingZeros(mins)}:${formatWithLeadingZeros(secs)}`;
}
function formatWithLeadingZeros(val) {
  return val < 10 ? `0${val}` : val;
}


// ----------------------task status updation------------------------
function updateTaskStatus(taskItem) {
  const statusSelectBox = taskItem.querySelector("#task-status");

  statusSelectBox.addEventListener("change", () => {

    if(timerStatus === "started") {
      return;
    }

    const updatedTaskStatus = statusSelectBox.value;
    if(updatedTaskStatus === "done" && timerStatus !== "started") {
      
      if(statusSelectBox.closest(".main-tasks-list")) {
        if(document.querySelector("#all-tasks-section").style.display === "flex") {
            document.querySelector("#all-tasks-section").style.display = "none";
        }
        document.querySelector("#today-tasks-section").style.display = "flex";
      }

      // setting current task to update
      currentTaskItem = taskItem;
    
      // getting tasks of current user form local storage
      const currentUserName = localStorage.getItem('currentUser');
      const currentUser = users.find(u => u.username === currentUserName);
      const tasks = currentUser?.tasks;

      const taskId = Number(currentTaskItem.dataset.taskId);
      const taskToUpdate = tasks.find(task => task.taskId === taskId);


      if(taskToUpdate.taskStatus !== "done") {

        taskToUpdate.endDate = `${formateDate(new Date())}`;
        taskToUpdate.taskStatus = "done";
        currentUser.tasks = tasks;
        localStorage.setItem("users", JSON.stringify(users));


        // dom updates
        const taskStatusLabel = currentTaskItem.querySelector('.task-status');
        taskStatusLabel.textContent = `task status: ${taskToUpdate.taskStatus}`;

        displayTotalTaskDuration(taskToUpdate, taskId);

        const dailyTasksList = document.getElementById("daily-tasks-list");
        const doneTasksList = dailyTasksList.querySelector('.done-tasks');
        addUpdatedAndRemoveExisitingTaskItem(doneTasksList, currentTaskItem);
          
        // removing timerbtn and status select box
        const timerBtn = currentTaskItem.querySelector('.start-timer-btn');
        timerBtn.remove();
        statusSelectBox.remove();
      }
    }
  })
}


function addUpdatedAndRemoveExisitingTaskItem(container, taskItem) {

  console.log("callllllllllled meeeeeeee")
  const dailyTasksList = container.closest('#daily-tasks-list');
  const taskId = Number(taskItem.dataset.taskId);

  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  const taskToUpdate = tasks.find(task => task.taskId === taskId);

  if(taskToUpdate.taskStatus === "in-progress") {
    taskItem.querySelector('#task-status').style.display = "inline-block";
  }else if(taskToUpdate.taskStatus === "done") {
    taskItem.querySelector('#task-status').style.display = "none";
  }

  // appending to appropriate list
  if(!container.querySelector(`[data-task-id="${taskId}"]`)) {
    container.append(currentTaskItem);
  }

  // removing exisiting one from other lists
  const listSubCategories = dailyTasksList.querySelectorAll('.list-sub-category');
  listSubCategories.forEach(subCat => {
    if(subCat !== container) {
      const existingItem = subCat.querySelector(`[data-task-id="${taskId}"]`);
      if(existingItem) {
        existingItem.remove();
      }
    }
  });
}

function displayTotalTaskDuration(taskToUpdate, taskId) {
  const allListItemToUpdate = document.querySelectorAll(`[data-task-id="${taskId}"]`);

  allListItemToUpdate.forEach(listItemToUpdate => {
    const taskTotalContainer =  listItemToUpdate.querySelector('.task-total');
    const [hrs,mins,secs] = taskToUpdate.taskTotalDuration.split(':');

    if(taskToUpdate.taskStatus === "in-progress") {
      taskTotalContainer.textContent = `time-spent until now: ${hrs}h ${mins}m ${secs}s`;
    }else if(taskToUpdate.taskStatus === "done"){
      taskTotalContainer.textContent = `total task duration: ${hrs}h ${mins}m ${secs}s`;
    }
  })
}



// ----------------- show task details -------------------------
let isEditMode = false;
function showTaskDetaitls(taskItem) {

  const taskDetailsBtn = taskItem.querySelector(".task-details-btn");
  const tasksDetailSection = taskDetailsBtn.closest('.tasks-management-container').querySelector('.tasks-details-section');
  taskDetailsBtn.addEventListener("click", () => {
    if(!tasksDetailSection.classList.contains("show")) {
      tasksDetailSection.classList.add('show');
    }

    // setting current task to update
    currentTaskItem = taskItem;
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskId = Number(taskItem.dataset.taskId);
    const taskToUpdate = tasks.find(task => task.taskId === taskId);

    // populating the task details l;l;
    if(!isEditMode) {
      populateTaskDetails(tasksDetailSection,taskToUpdate);
    }else {
      alert("switch form edit mode, to view further task details!");
    }

  })

  // task details close 
  const tasksDetailSectionCloseBtn = tasksDetailSection.querySelector(".tasks-details-section-close-btn");
  tasksDetailSectionCloseBtn.addEventListener("click", () => {
    tasksDetailSection.classList.remove('show');
  })
}

// ------------ populate task details ---------
function populateTaskDetails(tasksDetailsContainer, taskData){
 
  // only show status changing option when the task status is in-progress.
  const taskStatusField = tasksDetailsContainer.querySelector('#task-status');
  if(taskData.taskStatus === "in-progress") {
    taskStatusField.style.display = "inline-block"
  }else {
    taskStatusField.style.display = "none"
  }

  // populate basic fields
  tasksDetailsContainer.querySelector("#task-details-task-name").value = taskData.taskName;
  tasksDetailsContainer.querySelector("#task-details-task-desc").value = taskData.taskDesc;
  tasksDetailsContainer.querySelector("#task-details-task-status").textContent = taskData.taskStatus;
  tasksDetailsContainer.querySelector("#task-details-task-startdate").textContent = taskData.startDate;
  tasksDetailsContainer.querySelector("#task-details-task-enddate").textContent = taskData.endDate;
  tasksDetailsContainer.querySelector("#task-details-task-totalduration").textContent = taskData.taskTotalDuration;

  // populating time logs 
  const timeLogList = tasksDetailsContainer.querySelector('#task-details-task-timeloglist');
  const logTogglerBtn = tasksDetailsContainer.querySelector('.time-log-toggler-btn');

  timeLogList.innerHTML = "";
  const logs = taskData.timeLogs;
  const logItems = logs.map(tl => {
    const logDate = new Date(tl.startTime).toLocaleDateString('en-CA');
    const logStartTime = new Date(tl.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:false});
    const logEndTime = new Date(tl.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:false});

    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.gap = "10px";
    li.style.justifyContent = "space-evenly"
    li.innerHTML = `
      <div class="task-details-logdate">${logDate}</div>
      <div class="task-details-starttime">${logStartTime}</div>
      <div class="task-details-endtime">${logEndTime}</div>
      <div class="task-details-totaltime">${tl.totalTime}</div>
    `;

    return li;
  })

  // initially show only first 3 logs 
  logItems.forEach((li, i) => {
    if(i < 3){
      li.style.display = "flex";
    }else {
      li.style.display = "none"
    }

    // append each li
    timeLogList.appendChild(li)
  })


  if(logItems.length === 0) {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.gap = "10px";
    li.style.justifyContent = "space-evenly"
    li.innerHTML = `
      <div class="task-details-logdate">--</div>
      <div class="task-details-starttime">--</div>
      <div class="task-details-endtime">--</div>
      <div class="task-details-totaltime">--</div>
    `;
    timeLogList.append(li);
  }

  // only show the toggler btn if the logs are greater than 3
  if(logItems.length <= 3) {
    logTogglerBtn.style.display = "none";
  }else {
    logTogglerBtn.style.display = "inline-block"
  }

  // reset button text and toggle state
  logTogglerBtn.textContent = "View more +";
  logTogglerBtn.dataset.expanded = "false";

  // show more btn functionality
  logTogglerBtn.addEventListener("click", () => {
    const isExpanded = logTogglerBtn.dataset.expanded === "true";

    logItems.forEach((li, i) => {
      if(!isExpanded || i < 3) {
        li.style.display = "flex";
      }
      else {
        li.style.display = "none";
      }
    })

    logTogglerBtn.dataset.expanded = isExpanded ? "false" : "true";
    logTogglerBtn.textContent = isExpanded ? "View more +" : "View less -";
  })

  
  // enabling edit mode for the task details 
  const editModeBtn = tasksDetailsContainer.querySelector('.edit-toggle-btn');

  // creating a new cloned btn to remove all the previous event handlers.
  const clonedBtn = editModeBtn.cloneNode(true);
  editModeBtn.replaceWith(clonedBtn);

  const newEditButton = tasksDetailsContainer.querySelector(".edit-toggle-btn");
  newEditButton.addEventListener("click", () => {
    isEditMode = true;
    enableEditing(tasksDetailsContainer, taskData);
  })
}


// task edit mode enabling ---
function enableEditing(tasksDetailsContainer, taskData){
  const editActionContainer = tasksDetailsContainer.querySelector('.task-edit-actions');
  editActionContainer.style.display = "block";

  // editable fields 
  const nameField = tasksDetailsContainer.querySelector('#task-details-task-name');
  const descField = tasksDetailsContainer.querySelector('#task-details-task-desc');
  const statusField = tasksDetailsContainer.querySelector("#task-status");

  nameField.readOnly = false;
  nameField.focus();
  descField.readOnly = false;
  statusField.disabled = false;


  // --------------cancel edit btn ------------------
  const oldCancelBtn = tasksDetailsContainer.querySelector('.cancel-edit-btn');
  const newCancelBtn = oldCancelBtn.cloneNode(true);
  oldCancelBtn.replaceWith(newCancelBtn);

  newCancelBtn.addEventListener("click", () => {

    isEditMode = false;
    nameField.readOnly = true;
    descField.readOnly = true;
    statusField.disabled = true;

    editActionContainer.style.display = "none";

    // resetting values
    if(nameField.value !== taskData.taskName) {
      nameField.value = taskData.taskName;
    }
    if(descField.value !== taskData.taskDesc) {
      descField.value = taskData.taskDesc;
    }
    if(statusField.value !== taskData.taskStatus) {
      statusField.value = "";
    }

  });


  // ------------save edit btn ---------------------
  const oldSaveChangesBtn = tasksDetailsContainer.querySelector('.save-changes-btn');
  const newSaveChangesBtn  = oldSaveChangesBtn.cloneNode(true);
  oldSaveChangesBtn.replaceWith(newSaveChangesBtn);

  newSaveChangesBtn.addEventListener("click", () => {
    isEditMode = false;

    const newTaskName = nameField.value;
    const newTaskDesc = descField.value;
    const newTaskStatus = statusField.value;
    console.log(newTaskName, newTaskDesc, newTaskStatus);

    // update local storage

    nameField.readOnly = true;
    descField.readOnly = true;
    statusField.disabled = true;

    editActionContainer.style.display = "none";
  })
}

// ------------------------delete tasks------------------------------
function deleteTask(taskItem){
  const deleteBtn = taskItem.querySelector('.task-delete-btn');
  deleteBtn.addEventListener("click", () => {
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskId = Number(taskItem.dataset.taskId);
    const taskToUpdate = tasks.find(task => task.taskId === taskId);

    console.log(taskToUpdate);


  })
}


// /////setting current date initially
const currentDate = document.querySelector(".current-date");
const today = new Date().toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});
currentDate.textContent = today;


// //////////////////////////////// new day function //////////////////////////
function onNewDay() {

  const currentUserName = localStorage.getItem("currentUser");
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  const today = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });


  let taskCreatedToday = false
  tasks.forEach(task => {
    if(task.startDate === today) {
      taskCreatedToday = true
      return;
    }
  })

  if(!taskCreatedToday) {
    // updating todays tasks container
    // const dailyTasksList = document.getElementById("daily-tasks-list");
    // dailyTasksList.innerHTML = "";

    const dailyTasksList = document.getElementById("daily-tasks-list");
    const todoTasksList = dailyTasksList.querySelector('.todo-tasks');
    const inProgressTasksList = dailyTasksList.querySelector('.inprogress-tasks');
    const doneTasksList = dailyTasksList.querySelector('.done-tasks');
    todoTasksList.innerHTML = "";
    inProgressTasksList.innerHTML = "";
    doneTasksList.innerHTML = "";
    
    const listCategories = dailyTasksList.querySelectorAll(".list-category");
    listCategories.forEach(lc => {
      lc.style.display = "none";
    })

    tasksSectionDescription.classList.remove("hide");
  }
  
  // changing date.
  const currentDate = document.querySelector(".current-date");
  currentDate.textContent = today;
}

function scheduleMidnightUpdate() {
  const now = new Date();
  const tomorrow = new Date().setHours(24, 0, 0, 0); // getting 12:00 AM time.

  const msUntilMidnight = tomorrow - now;
  setTimeout(() => {
    onNewDay(); // logic running at midnight
    setInterval(onNewDay, 24 * 60 * 60* 1000); // repeat every 24 hours
  }, msUntilMidnight)
}


// -----------------getting duration worked on each day and week(implentation withour chartjs)---------------------
const SCALING_FACTOR = 10; // only in development mode;

function getWorkingHoursForDay() {
  const workHoursPerDay = {};

  const currentUserName = localStorage.getItem("currentUser");
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  tasks.forEach(task => {
    task.timeLogs.forEach(log => {
      const currentDateKey = formateDate(new Date(log.startTime));
      const [h, m, s] = log.totalTime.split(":");
      const totalSeconds = Number(h) * 3600 + Number(m) * 60 + Number(s);
      
      if(!workHoursPerDay[currentDateKey]) {
        workHoursPerDay[currentDateKey] = 0;
      }

      workHoursPerDay[currentDateKey] += totalSeconds;
    })
  });

  Object.keys(workHoursPerDay).forEach(date => {
    workHoursPerDay[date] =  Math.round((workHoursPerDay[date] / 3600) * 100) / 100;;
  });


  return workHoursPerDay;
}


const workHoursPerDay = getWorkingHoursForDay();
console.log(workHoursPerDay);

const allDates = Object.keys(workHoursPerDay).sort();
const gridContainer = document.querySelector('.grid-container');


// getting maxY according to the exisiting max hours of any day
function getMaxYFromData(workHoursPerDay) {
  const allhours = Object.values(workHoursPerDay);
  const maxHours = Math.max(...allhours, 0);
  const withBuffer = Math.ceil(maxHours + 3);
  return Math.max(withBuffer,8);
}

const maxY = getMaxYFromData(workHoursPerDay);
createGraph(gridContainer, maxY, 14);


function createGraph(gridContainer, maxY, maxX = 14){
  
  // taking on extra row and column for labels
  maxX = maxX + 1;
  maxY = maxY + 1;

  gridContainer.style.gridTemplateRows = `repeat(${maxY}, minmax(10px, 50px))`;
  gridContainer.style.gridTemplateColumns = `repeat(${maxX},  minmax(10px, 50px))`;
  gridContainer.innerHTML = "";

  for(let y = maxY - 1; y >= 0; y--) {  //row-wise(from top to bottom)
    // console.log(y)

    for(let x = 0; x < maxX; x++) {    //col-wise(from left to right)
      const cell = document.createElement('div');
      // cell.classList.add('block');
      // cell.dataset.xy = `${x},${y}`;
      // gridContainer.appendChild(cell);
      

      // -----------y-axis-label ------------
      if(x === 0 && y !== 0) { 
        cell.textContent = `${y.toString()}h`;
        cell.classList.add("y-label");
      }else if (x === 0 && y === 0){ 
        // cell.textContent = "0m";
        // cell.classList.add("y-label");
        // cell.style.borderRight = "unset";

      // -----------x-axis-label ------------
      }else if(y === 0 && x !== 0){ 
        const dateIndex = x - 1;
        const label = allDates[dateIndex] || "";
        cell.textContent = label;

        cell.classList.add("x-label");

      
      // ---------actual block -------------
      } else if (x !== 0 && y !== 0) {
        cell.classList.add("block");
        cell.dataset.xy = `${x},${y}`;
      }

      gridContainer.appendChild(cell);
    }
  }
  
  // ---------graph ploting logic ---------------------------------
  allDates.forEach((date, x) => {
    // console.log("-------------------new date --------------------");

    const totalHours = workHoursPerDay[date];
    // console.log("totalhours",totalHours);

    // dev mode testing
    // const actualHours = totalHours * SCALING_FACTOR;
    // console.log(actualHours)
    // const fullBlocks = Math.ceil(actualHours);

    // getting full bar lenght, we have to loop untill this height
    const fullBlocks = Math.ceil(totalHours); 
    // console.log("fullblocks",fullBlocks);

    for(let y = 0; y < fullBlocks; y++) {
      // console.log("y value", y);

      let fillRatio = 1;

      // handle partial fill in lastblock
      if(y === fullBlocks - 1 && totalHours % 1 !== 0) {
        fillRatio = totalHours % 1; // remainder here will be the fill ratio
        console.log("fillratio", `${fillRatio * 100}%`)
      }

      const styleObj = {
        backgroundColor:"blueviolet",
        opacity: "0.7",
        width: "75%",
        height: `${fillRatio * 100}%`,
        borderTopLeftRadius: fillRatio === 1 ? "0px" : "4px",
        borderTopRightRadius: fillRatio === 1 ? "0px" : "4px"
      }

      createMarker(x, y, gridContainer, styleObj);
    }
  })
}

function createMarker(x, y, container, styleObj) {
  const cell = container.querySelector(`[data-xy='${x + 1},${y + 1}']`);
  if(!cell) return;

  const marker = document.createElement("div");
  marker.classList.add('marker-block');
  Object.assign(marker.style, styleObj);
  cell.appendChild(marker);
}


// /////////////////////////////////////////////////////////////////////////side bar navigations
const todayTaskListBtn = document.querySelector("#today-task-list-btn");
todayTaskListBtn.addEventListener("click", () =>{
  if(document.querySelector("#analytics-section").style.display === "flex") {
    document.querySelector("#analytics-section").style.display = "none";
  }

  if(document.querySelector("#all-tasks-section").style.display = "flex") {
    document.querySelector("#all-tasks-section").style.display = "none";
  }

  document.querySelector("#today-tasks-section").style.display = "flex";
})

const listAllTasksBtn = document.querySelector("#list-all-tasks-btn");
listAllTasksBtn.addEventListener("click", renderAllTasksList);

function renderAllTasksList(){
  // controling display
  if(document.querySelector("#analytics-section").style.display === "flex") {
    document.querySelector("#analytics-section").style.display = "none";
  }

  if(document.querySelector("#today-tasks-section").style.display = "flex"){
    document.querySelector("#today-tasks-section").style.display = "none"
  }
  document.querySelector("#all-tasks-section").style.display = "flex";

  // populating lists
  const mainTasksList = document.querySelector('.main-tasks-list');
  const todoTasksList = mainTasksList.querySelector('.todo-tasks');
  const inProgressTasksList = mainTasksList.querySelector('.inprogress-tasks');
  const doneTasksList = mainTasksList.querySelector('.done-tasks');

  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  todoTasksList.innerHTML = "";
  inProgressTasksList.innerHTML = "";
  doneTasksList.innerHTML = "";

  tasks.forEach(task => {
    if(task.taskStatus === "to-do") {
      renderTask(task, todoTasksList)
    }else if(task.taskStatus === "in-progress") {
      renderTask(task, inProgressTasksList)
    }else if(task.taskStatus === "done") {
      renderTask(task, doneTasksList)
    }
  })
}

const showAnalyticsBtn = document.querySelector("#analytics-btn");
showAnalyticsBtn.addEventListener("click", () => {

  if(document.querySelector("#all-tasks-section").style.display = "flex") {
    document.querySelector("#all-tasks-section").style.display = "none";
  }
  if(document.querySelector("#today-tasks-section").style.display = "flex"){
    document.querySelector("#today-tasks-section").style.display = "none"
  }
  document.querySelector("#analytics-section").style.display = "flex"; 

})
















// //////////////////////////////////////////////analytics using chart.js///////////////////////////////////////////////
// const showAnalyticsBtn = document.querySelector("#analytics-btn");

// // adding listener for date changes
// // document.getElementById("datePicker").addEventListener("change", function () {
// //   const currentUserName = localStorage.getItem('currentUser');
// //   const currentUser = users.find(u => u.username === currentUserName);
// //   const tasks = currentUser?.tasks || [];

// //   // getting data to render chart
// //   const selectedDate = this.value;
// //   const newData = getTaskDurationForDate(tasks, selectedDate);
// //   renderTaskChart(newData);
// // });

// showAnalyticsBtn.addEventListener("click", () => {

//   if(document.querySelector("#all-tasks-section").style.display = "flex") {
//     document.querySelector("#all-tasks-section").style.display = "none";
//   }
//   if(document.querySelector("#today-tasks-section").style.display = "flex"){
//     document.querySelector("#today-tasks-section").style.display = "none"
//   }
//   document.querySelector("#analytics-section").style.display = "flex"; 

//   const currentUserName = localStorage.getItem('currentUser');
//   const currentUser = users.find(u => u.username === currentUserName);
//   const tasks = currentUser?.tasks || [];
  
//   // initial chart rendering for today's date
//   const today = new Date().toLocaleDateString();
//   // document.querySelector('#datePicker').value = today;

//   // getting data to render chart
//   const initialData = getTaskDurationForDate(tasks, today);
//   // renderTaskChart(initialData);
// })

// // -------------------getting duration worked for each task by date--------------
// function getTaskDurationForDate(tasks, selectedDate) {
//   const targetDate = new Date(selectedDate).toLocaleDateString();
//   const taskDurations = {};

//   tasks.forEach(task => {
//    task.timeLogs.forEach(log => {
//     const logDate = new Date(log.startTime).toLocaleDateString();

//     if(logDate === targetDate) {
//       const [hrs, mins, secs] = log.totalTime.split(":");
//       const totalSeconds = Number(hrs) * 3600 + Number(mins) * 60 + Number(secs);

//       if(!taskDurations[task.taskName]) {
//         taskDurations[task.taskName] = 0
//       }
//       taskDurations[task.taskName] += totalSeconds;
//     }
//    })
//   })

//   return Object.entries(taskDurations).map(([task, secs]) => ({
//     task: task,
//     seconds: secs
//   }))
// }

// // -----------chart rendering-----------------------
// let dailyTaskChart = null;
// function renderTaskChart(taskAnalytics){
  
//   const graphArea = document.getElementById('dailyTaskChart').getContext('2d');
//   if(dailyTaskChart) dailyTaskChart.destroy();

//   const dataValues = taskAnalytics.map(task => task.seconds);

//   dailyTaskChart = new Chart(graphArea, {
//     type: "bar",
//     data: {
//       labels: taskAnalytics.map(task => task.task),
//       datasets: [
//         {
//           label:"Hours Spent on Each Task (hh mm ss)",
//           data : taskAnalytics.map(task => task.seconds),
//           backgroundColor: 'rgba(98, 0, 115, 0.81)'
//         }
//       ]
//     },

//     options:{
//       scales: {
//         y: {
//           beginAtZero: true,
//           ticks: {
//             autoSkip: false,
//             callback: function(value) {
//               if(dataValues.includes(value)) {
//                 const [hrs, mins, secs]  = convertSecondsToTimeFormat(value).split(':');
//                 return `${hrs}h ${mins}m ${secs}s`
//               }
//               return '';
//             },
//             stepSize: 1,
//             autoSkip: false,
//             min: Math.min(...dataValues),
//             max: Math.min(...dataValues)
//           }
//         }
//       }
//     }
//   })
// }
