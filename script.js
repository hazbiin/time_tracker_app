// getting users form localStorage. 
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
    
    // const user = users.find( u => u.username === username);
    // if(user) {
    //     alert("user already exists!");
    //     return;
    // }

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", username);
    
    // when the user is logged in
    const currentUserName = localStorage.getItem('currentUser');
    if(currentUserName) {
      signupSection.style.display = "none";
      appSection.style.display = "block";
      displayTasks();
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
    displayTasks();
});

// logout 
document.querySelector("#logout-btn").addEventListener("click", () => {
 
  localStorage.removeItem("currentUser");
  appSection.style.display = "none";
  loginSection.style.display = "block";
})


// /////////////////////////////////////////////////////////////////////////////////////task timer management////
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


// ////////////////////////////////////////////////////////////////////////doc reload funciton/////////////////
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


// ////////////////////////////////////////////////////////////////////////////task displaying function from local storage on reloads/////////
function displayTasks() {
  const dailyTasksList = document.getElementById("daily-tasks-list");
  const todoTasksList = dailyTasksList.querySelector('.todo-tasks');
  const inProgressTasksList = dailyTasksList.querySelector('.inprogress-tasks');
  const doneTasksList = dailyTasksList.querySelector('.done-tasks');
  todoTasksList.innerHTML = "";
  inProgressTasksList.innerHTML = "";
  doneTasksList.innerHTML = "";


  // getting today date strings..
  const today = new Date().toLocaleDateString();
  const formatedTodayDate = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });


  // getting saved tasks from localStorage.. 
  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks || [];


  // filtering tasks created at today.
  const createdTodayTasks = tasks.filter(task => {
    return task.createdAt === formatedTodayDate;
  });
  // console.log("task created today",createdTodayTasks);


  // filtering tasks which is logged today.
  const loggedTodayTasks = tasks.filter(task => {
    const filteredTask = task.timeLogs.some(log => {
      const logDate = new Date(log.startTime).toLocaleDateString();
      return logDate === today;
    });

    return filteredTask;
  })
  // console.log("logged today tasks",loggedTodayTasks);


  // getting unique tasks from both filtered tasks ..
  const uniqueTasksObj = {};
  const mergedTasks = [...createdTodayTasks, ...loggedTodayTasks];
  mergedTasks.forEach(task => {
    uniqueTasksObj[task.taskId] = task;
  })


  // convert object back to array and render
  Object.values(uniqueTasksObj).forEach(task => {
    if(task.taskStatus === "to-do") {
      renderTask(task, todoTasksList);
    }else if(task.taskStatus === "in-progress") {
      renderTask(task, inProgressTasksList)
    }else if(task.taskStatus === "done") {
      renderTask(task, doneTasksList)
    }
  })
}


// //////////////////////////////////////////////////////////////////////////////////////create new task function//////
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


//////////////////////////////////////////////////////////////////////////////////////render task function//////////
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
      <select id="task-status" class="task-status-select-box" style="display:none" >
        <option value="" selected>Mark as</option>
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
      <select id="task-status" class="task-status-select-box">
        <option value="" selected>Mark as</option>
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
      <select id="task-status" style="display:none" class="task-status-select-box">
        <option value="" selected>Mark as</option>
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
          <button class="task-delete-btn">delete</button>
      </div>
    </div>
  `;
  containerElement.appendChild(li);

  // attach timers
  showTimer(li);

  // show taskDetails 
  showTaskDetaitls(li);

  // change task status 
  updateTaskStatus(li);

  // delete tasks 
  deleteTask(li);
}


// /////////////////////////////////////////////////////////////////////////////////show timer ///////////
function showTimer(taskItem) {
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

////////////////////////////////////////////////////////////////////////main timer btn functionality////
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
      }));

      
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


// /////////////////////////////////////////////////////////////////////////////////task status updation////////
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
      taskTotalContainer.textContent = `time spent until now: ${hrs}h ${mins}m ${secs}s`;
    }else if(taskToUpdate.taskStatus === "done"){
      taskTotalContainer.textContent = `total task duration: ${hrs}h ${mins}m ${secs}s`;
    }
  })
}


// /////////////////////////////////////////////////////////////////////////////////////showing task details/////
let isEditMode = false;
// let currentDisplayedTaskId = null;

function showTaskDetaitls(taskItem) {

  const taskDetailsBtn = taskItem.querySelector(".task-details-btn");
  const tasksDetailSection = taskDetailsBtn.closest('.tasks-management-container').querySelector('.tasks-details-section');
  taskDetailsBtn.addEventListener("click", () => {

    // task details open 
    if(!tasksDetailSection.classList.contains("show")) {
      if(!isEditMode) {
        tasksDetailSection.classList.add('show');
      }
    }

    // getting the task from local storage.
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskId = Number(taskItem.dataset.taskId);
    const currentTask = tasks.find(task => task.taskId === taskId);


    // populate with the current task details.
    if(!isEditMode) {
      const taskDetails = populateTaskDetails(currentTask);
      tasksDetailSection.innerHTML = "";
      tasksDetailSection.appendChild(taskDetails);
      currentDisplayedTaskId = currentTask.taskId;

      // if(currentDisplayedTaskId !== currentTask.taskId) {
      // }
    }
    else {
      alert("you are currently editing a task, save or cancel to proceed!");
      return;
    }
    
    
    // ----------------------managing buttons inside the task details section----------
    const logTogglerBtn = tasksDetailSection.querySelector('.time-log-toggler-btn');
    const logListItems = tasksDetailSection.querySelectorAll('.loglist-item');

    // show only first 3 initially, hide the rest, control the btn display
    if(logListItems.length > 3) {
      logListItems.forEach((li, index) => {
        if(index >= 3) li.style.display = "none";
      });

      logTogglerBtn.style.display = "inline-block";
    }else {
      logTogglerBtn.style.display = "none";
    }

    // log list toggler button
    let isExpanded = false;
    logTogglerBtn.addEventListener("click", () => {
      if(!isExpanded) {
        // Expand: show all items
        logListItems.forEach(li => li.style.display = "grid");
        logTogglerBtn.textContent = "- view less";
        isExpanded = true;
      }else {
        // Collapse: show only first 3
        logListItems.forEach((li, index) => {
          li.style.display = index < 3 ? "grid" : "none";
        });
        logTogglerBtn.textContent = "+ view more";
        isExpanded = false;
      }
    });
    
    // enable edit mode
    const editBtn = tasksDetailSection.querySelector(".edit-toggle-btn");
    editBtn.addEventListener("click", () => {
      enableEditing(tasksDetailSection, currentTask);
    });

    // task details close 
    const tasksDetailSectionCloseBtn = tasksDetailSection.querySelector(".tasks-details-section-close-btn");
      tasksDetailSectionCloseBtn.addEventListener("click", () => {
        if(!isEditMode) {
          tasksDetailSection.classList.remove('show');
          // currentDisplayedTaskId = null;
        }else {
          alert("you are currently editing a task, save or cancel to proceed!");
          return;
        }
      });
  });
}

function populateTaskDetails(currentTask) {
  console.log("func called")
  console.log(currentTask);

  // formatting totaltime
  let totalTimeToDisplay;
  if (currentTask.taskTotalDuration === "") {
    totalTimeToDisplay = "00h 00m 00s";
  } else {
    const [hrs, mins, secs] = currentTask.taskTotalDuration.split(":");
    totalTimeToDisplay = `${hrs}h ${mins}m ${secs}s`;
  }

  // formatting timelog list
  function populateLogList(logs){
    if(logs.length > 0){

      const logItems = logs.map(tl => {
      const logDate = formateDate(new Date(tl.startTime))
      const logStartTime = new Date(tl.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:false});
      const logEndTime = new Date(tl.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12:false});

      const li = document.createElement("li");
      li.classList.add("loglist-item");
      li.innerHTML = `
        <div class="task-details-logdate">${logDate}</div>
        <div class="task-details-starttime">${logStartTime}</div>
        <div class="task-details-endtime">${logEndTime}</div>
        <div class="task-details-totaltime">${tl.totalTime}</div>
      `;
      return li.outerHTML;
      }).join("");
      
      return logItems;
    }else {

      const li = document.createElement("li");
      li.classList.add("loglist-item");
      li.innerHTML = `
        <div class="task-details-logdate">-- -- --</div>
        <div class="task-details-starttime">-- -- --</div>
        <div class="task-details-endtime">-- -- --</div>
        <div class="task-details-totaltime">-- -- --</div>
      `;
      
      return li.outerHTML;
    }
  }

  // populating whole task details
  const detailsWrapper = document.createElement("div");
  detailsWrapper.classList.add("tasks-details-container");
  detailsWrapper.innerHTML = `
      <div class="task-details-header">
        <div class="header-desc">
          <h3>Your Task Details</h3>
        </div>
        <div class="header-btns">
          <button class="edit-toggle-btn btn">Edit mode</button>
          <button class="btn tasks-details-section-close-btn">x</button>
        </div>
      </div>
      <div class="task-details-content">
        <div class="task-detail-group">
          <label>Name:</label>
          <input type="text" class="input" id="task-details-task-name" value="${currentTask.taskName}" readonly>
        </div>
        <div class="task-detail-group">
          <label>Description:</label>
          <textarea class="input desc-input" id="task-details-task-desc" readonly>${currentTask.taskDesc === "" ? "No description provided!" : currentTask.taskDesc}</textarea>
        </div>
        <div class="task-detail-group">
          <label>Status:</label>
          <div class="task-detail-status-group">
            <span id="task-details-task-status" class="task-detail-text">${currentTask.taskStatus}</span>
              <select class="task-status-select-box" id="task-status" style="display: none;">
                <option value="" selected disabled >Mark as</option>
                <option value="done"> ✅ Done</option>
              </select>
          </div>
        </div>
        <div class="task-detail-group">
          <label>Created-at:</label>
          <span id="task-details-task-createddate" class="task-detail-text">${currentTask.createdAt}</span>
        </div>
        <div class="task-detail-group">
          <div class="task-detail-date-group">
            <label>Start-date:</label>
            <span id="task-details-task-startdate" class="task-detail-text">${currentTask.startDate === "" ? "-- -- --" : currentTask.startDate}</span>
          </div>
          <div class="task-detail-date-group">
            <label>End-date:</label>
            <span id="task-details-task-enddate" class="task-detail-text">${ currentTask.endDate === "" ? "-- -- --" : currentTask.endDate}</span>
          </div>
        </div>                              
        <div class="task-detail-group">
          <label>Tags:</label>
          <ul id="task-details-task-tags" class="task-details-task-tags">
            <li class="task-tag">Css</li>
            <li class="task-tag">Grab project</li>
          </ul>
        </div>
        <div class="task-detail-group time-log-group">
          <label>Time-loglist:</label>
          <div class="task-detail-loglist-group">
            <button class="time-log-toggler-btn"> + view more</button>
            <div class="time-log-list-container">
              <div class="loglist-head">
              <div>log Date</div>
              <div>start time</div>
              <div>end time</div>
              <div>total time</div>
            </div>
            <ul id="task-details-task-timeloglist" class="loglist-list">
              ${populateLogList(currentTask.timeLogs)}
            </ul>
          </div>
        </div>
        <div class="task-detail-group">
          <label>Total-task-duration:</label>
          <span id="task-details-task-totalduration" class="task-detail-text task-detail-total">${totalTimeToDisplay}</span>
        </div>
      </div>
      </div>
      <div class="task-edit-actions" style="display: none;">
        <button class="btn w-100 save-changes-btn">save changes</button>
        <button class="btn w-100 cancel-edit-btn">Cancel</button>
      </div>
  `;

  return detailsWrapper;
}


function enableEditing(tasksDetailsContainer, currentTask){

  isEditMode = true;
  console.log(tasksDetailsContainer, currentTask);

  let originalTaskData = {
    taskName: currentTask.taskName,
    taskDesc: currentTask.taskDesc,
    taskStatus: currentTask.taskStatus,
    taskEndDate: currentTask.endDate
  }

  const editActionsContainer = tasksDetailsContainer.querySelector('.task-edit-actions');
  const taskNameField = tasksDetailsContainer.querySelector("#task-details-task-name");
  const taskDescField = tasksDetailsContainer.querySelector("#task-details-task-desc");

  const taskStatusDropdown = tasksDetailsContainer.querySelector(".task-status-select-box");
  const taskStatusField = tasksDetailsContainer.querySelector("#task-details-task-status");

  const taskEndDateField = tasksDetailsContainer.querySelector("#task-details-task-enddate");

  editActionsContainer.style.display = "flex";

  taskNameField.readOnly = false;
  taskNameField.classList.add("input-edit-mode");
  taskNameField.focus();
 
  taskDescField.readOnly = false;
  taskDescField.classList.add("input-edit-mode");

  if(originalTaskData.taskStatus === "in-progress") {
    taskStatusDropdown.style.display = "inline-block";
    taskStatusDropdown.style.border = "1px solid lightsalmon";

    // status change event
    taskStatusDropdown.addEventListener("change", () => {
      taskStatusField.textContent = taskStatusDropdown.value;
      taskEndDateField.textContent = formateDate(new Date());
    });
  }

  // savebtn onclick updates 
  const saveChangesBtn = tasksDetailsContainer.querySelector('.save-changes-btn');
  saveChangesBtn.addEventListener("click", () => {

    isEditMode = false;
    editActionsContainer.style.display = "none";


    taskNameField.readOnly = true;
    taskNameField.classList.remove("input-edit-mode");
    taskNameField.blur();
    currentTask.taskName = taskNameField.value;


    taskDescField.readOnly = true;
    taskDescField.classList.remove("input-edit-mode");
    currentTask.taskDesc = taskDescField.value;


    if(originalTaskData.taskStatus === "in-progress") {
      taskStatusDropdown.style.display = "none";
      taskStatusDropdown.style.border = "1px solid #ccc";
      taskStatusDropdown.value = "";

      currentTask.taskStatus = taskStatusField.textContent;
      currentTask.endDate = taskEndDateField.textContent;
    }

    // saving to local Storage
    localStorage.setItem("users", JSON.stringify(users));
    alert("task is successfully updated");


    // check where we are updating and update the appropriate list./////////////
    displayTasks();
    renderAllTasksList();

    

  })
  
  

  // cancelbtn onclick updates
  const cancelEditsBtn = tasksDetailsContainer.querySelector('.cancel-edit-btn');
  cancelEditsBtn.addEventListener("click", () => {

    isEditMode = false;

    editActionsContainer.style.display = "none";

    taskNameField.readOnly = true;
    taskNameField.classList.remove("input-edit-mode");
    taskNameField.blur();
    taskNameField.value = originalTaskData.taskName;

    taskDescField.readOnly = true;
    taskDescField.classList.remove("input-edit-mode");
    taskDescField.value = originalTaskData.taskDesc;

    if(originalTaskData.taskStatus === "in-progress") {
      taskStatusDropdown.style.display = "none";
      taskStatusDropdown.style.border = "1px solid #ccc";
      taskStatusDropdown.value = "";
      taskStatusField.textContent = originalTaskData.taskStatus;
      taskEndDateField.textContent = "-- -- --";
    }

  });
} 


// ////////////////////////////////////////////////////////////////delete task function///////
function deleteTask(taskItem){
  const deleteBtn = taskItem.querySelector('.task-delete-btn');
  deleteBtn.addEventListener("click", () => {
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    if(!currentUser) {
      return;
    }
   
    // removing task
    const tasks = currentUser?.tasks || [];
    const taskId = Number(taskItem.dataset.taskId);
    const updatedTasks = tasks.filter(task => task.taskId !== taskId);

    console.log(taskItem, updatedTasks)

    // saving back to local storage
    currentUser.tasks = updatedTasks;
    localStorage.setItem("users", JSON.stringify(users));
    
    // updating dom
    taskItem.remove();
  })
}


////////////////////////////////////////////////////////////////////// new day function /////
// setting current date initially
const currentDate = document.querySelector(".current-date");
const today = new Date().toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});
currentDate.textContent = today;

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


// /////////////////////////////////////////////////////////////////////////side bar navigations///
const todayTaskListBtn = document.querySelector("#today-task-list-btn");
todayTaskListBtn.addEventListener("click", () => {
  // controling display
  if(document.querySelector("#analytics-section").style.display === "flex") {
    document.querySelector("#analytics-section").style.display = "none";
  }
  if(document.querySelector("#all-tasks-section").style.display = "flex") {
    document.querySelector("#all-tasks-section").style.display = "none";
  }
  document.querySelector("#today-tasks-section").style.display = "flex";


  // populating lists
  displayTasks();
});

const listAllTasksBtn = document.querySelector("#list-all-tasks-btn");
listAllTasksBtn.addEventListener("click", renderAllTasksList);

function renderAllTasksList(){
  // controling display
  if(document.querySelector("#analytics-section").style.display === "flex") {
    document.querySelector("#analytics-section").style.display = "none";
  }
  if(document.querySelector("#today-tasks-section").style.display === "flex"){
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
  createGraph(gridContainer, maxY, 14);
})




// -----------------getting duration worked on each day and week(implentation withour chartjs)---------------------
// const SCALING_FACTOR = 10; // only in development mode;

function getWorkingHoursForDay() {
  const workHoursPerDay = {};

  const currentUserName = localStorage.getItem("currentUser");
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks || [];

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
// console.log(workHoursPerDay);

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
// createGraph(gridContainer, maxY, 14);

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
        const formatedXLabel = formateXAxisLabel(allDates[dateIndex]);

        // const label = allDates[dateIndex] || "";

        cell.textContent = formatedXLabel;

        cell.classList.add("x-label");

      // ---------actual block -------------
      } else if (x !== 0 && y !== 0) {
        cell.classList.add("block");
        cell.dataset.xy = `${x},${y}`;
        // cell.textContent = `${x},${y}`;
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
        // console.log("fillratio", `${fillRatio * 100}%`)
      }

      const styleObj = {
        backgroundColor:"blueviolet",
        opacity: "0.5",
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

function formateXAxisLabel(dateStr = "") {
  if(dateStr !== "") {
    const [day, month] = dateStr.split("-");

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${parseInt(day, 10)}`;
  }
}








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