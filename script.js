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
  loginSection.style.display = "flex";

  document.querySelector("#login-username").value = "";
  document.querySelector("#login-password").value = "";
});

toSignupLink.addEventListener("click", () => {
  loginSection.style.display = "none";
  signupSection.style.display = "flex";

  document.getElementById("signup-username").value = "";
  document.getElementById("signup-email").value = "";
  document.getElementById("signup-password").value = "";
});

// signup 
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;  

    const emailExists = users.find(u => u.email === email);
    const usernameExists = users.find(u => u.username === username);
    if(emailExists){
        alert("Email already registered!");
        return;
    }
    if(usernameExists){
        alert("Username already taken!");
        return;
    }

    const newUser = {
      userId: Date.now(),
      username,
      email,
      password,
      tasks : []
    };
    users.push(newUser);
    
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", username);
    
    // when the user is logged in
    const currentUserName = localStorage.getItem('currentUser');
    if(currentUserName) {
      signupSection.style.display = "none";
      appSection.style.display = "block";

      document.getElementById("signup-username").value = "";
      document.getElementById("signup-password").value = "";
      document.getElementById("signup-email").value = "";
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

    document.querySelector("#login-username").value = "";
    document.querySelector("#login-password").value = "";
    displayTasks();
});

// logout 
document.querySelector("#logout-btn").addEventListener("click", () => {
 
  localStorage.removeItem("currentUser");
  appSection.style.display = "none";
  loginSection.style.display = "flex";
});


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
  // todoTasksList.innerHTML = "";
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
  });

  
  // convert object back to array and render
  Object.values(uniqueTasksObj).forEach(task => {
    if(task.taskStatus === "to-do") {
      renderTask(task, todoTasksList);
    }else if(task.taskStatus === "in-progress") {
      renderTask(task, inProgressTasksList)
    }else if(task.taskStatus === "done") {
      renderTask(task, doneTasksList)
    }else {
      console.log("not getting in");
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
    buttonLabel = "Begin Work Session";
  }else {
    buttonLabel = "Resume Work Session";
  }

  // formatting based on task status
  let timerBtn;
  // let taskTag;
  let statusStyle;

  if(task.taskStatus === "to-do") {
    statusStyle = 'status-todo';
    timerBtn = `
      <button class="start-timer-btn action-btn pd-l">
        <i class="bi bi-stopwatch-fill"></i>
        <span class="start-timer-btn-text">${buttonLabel}</span>
      </button>
    `;
  } else if(task.taskStatus === "in-progress") {
    statusStyle = 'status-inprogress';
    timerBtn = `
      <button class="start-timer-btn action-btn pd-l">
        <i class="bi bi-stopwatch-fill"></i>
        <span class="start-timer-btn-text">${buttonLabel}</span>
      </button>
    `;
  } else {
    statusStyle = 'status-done';
    timerBtn = `
      <button class="start-timer-btn action-btn pd-l" style="display:none">
        <i class="bi bi-stopwatch-fill"></i>
        <span class="start-timer-btn-text">${buttonLabel}</span>
      </button>
    `;
  }

  // if(task.taskTag === "") {
  //   taskTag = `
  //     <div class="task-tags-container">
  //       <p>task-tag: </p>
  //       <span>-- -- --</span>
  //     </div>
  //   `;
  // }else {
  //   taskTag =  `
  //     <div class="task-tags-container">
  //       <p>task-tag: </p>
  //       <span class="task-tag">${task.taskTag}</span>
  //     </div>
  //   `;
  // }

  //  <div class="list-item-text-section">
  //         <h4 class="task-name">${task.taskName}</h4>
  //         <p class="task-total">${totalTimeText}</p>
  //         <p class="task-status">task-status: ${task.taskStatus}</p>
  //         ${taskTag}
  //     </div>


  // setting innerHTML
  li.innerHTML = `
    <div class="task-info">
      <div class="list-item-text-section">
        <div class="task-header">
          <h4 class="task-name">${task.taskName}</h4>
          <span class="task-status ${statusStyle}">${task.taskStatus}</span>
        </div>
        <div class="task-time-details">
          <div class="item-time">
            <i class="fas fa-clock"></i>
            <p class="task-total">${totalTimeToDisplay}</p>
          </div>
        </div>
        <div class="task-tags-container">
          <p>Tags:</p>
        <span class="task-tag">${task.taskTag}</span>
        </div>
      </div>
      <div class="list-item-buttons-section">
           ${timerBtn}
          <button class="task-details-btn action-btn pd-l" id="task-details-btn">
            <i class="fas fa-eye"></i>
          </button>
          <button class="task-delete-btn action-btn pd-l">
            <i class="bi bi-trash3"></i>
          </button>
      </div>
    </div>
  `;

  containerElement.appendChild(li);

  // attach timers
  showTimer(li);

  // show taskDetails 
  showTaskDetails(li);

  // delete tasks 
  deleteTask(li);
}


// /////////////////////////////////////////////////////////////////////////////////show timer ///////////
function showTimer(taskItem) {
  const startTimerBtn = taskItem.querySelector(".start-timer-btn");
  startTimerBtn.addEventListener("click", (e) => {

    // check if the clicked task is from all days task list
    const parentSection = taskItem.closest("section");
    if(parentSection && parentSection.id === "all-tasks-section"){
      showSection("today-tasks-section");
    }

    // open timer
    if(!timerSection.classList.contains("show")) {
      timerSection.classList.add('show');
    }

    // setting current task to update
    currentTaskItem = taskItem;
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;

    const taskId = Number(taskItem.dataset.taskId);

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
    currentTaskItem = null;
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

      if(taskToUpdate.taskStatus !== "in-progress") {
        taskToUpdate.taskStatus = "in-progress";
      }
      
      currentUser.tasks = tasks;
      localStorage.setItem("users", JSON.stringify(users));

      const taskStatusLabel = currentTaskItem.querySelector('.task-status');
      taskStatusLabel.textContent = `${taskToUpdate.taskStatus}`;
      
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

      const currentTaskButtonLabel = currentTaskItem.querySelector('.start-timer-btn-text');
      currentTaskButtonLabel.textContent = `Resume Work Session`;

      // render the current day tasks
      // displayTasks();
      
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

      const currentTaskButtonLabel = currentTaskItem.querySelector('.start-timer-btn-text');
      currentTaskButtonLabel.textContent = `Resume Work Session`;

      if(timerSection.classList.contains("show")) {
        timerSection.classList.remove('show');
        currentTaskItem = null;
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

function addUpdatedAndRemoveExisitingTaskItem(container, taskItem) {

  const dailyTasksList = container.closest('#daily-tasks-list');
  const taskId = Number(taskItem.dataset.taskId);

  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks;

  const taskToUpdate = tasks.find(task => task.taskId === taskId);
  // if(taskToUpdate.taskStatus === "in-progress") {
  //   taskItem.querySelector('#task-status').style.display = "inline-block";
  // }else if(taskToUpdate.taskStatus === "done") {
  //   taskItem.querySelector('#task-status').style.display = "none";
  // }

  // appending to appropriate list
  if(!container.querySelector(`[data-task-id="${taskId}"]`)) {
    // container.append(currentTaskItem);
    container.appendChild(taskItem);
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
      taskTotalContainer.textContent = `${hrs}h ${mins}m ${secs}s`;
    }else if(taskToUpdate.taskStatus === "done"){
      taskTotalContainer.textContent = `${hrs}h ${mins}m ${secs}s`;
    }
  })
}


// /////////////////////////////////////////////////////////////////////////////////////showing task details/////
let isEditMode = false;
let currentDisplayedTaskId = null;
function showTaskDetails(taskItem) {
  // console.log("came back here again | came back here again | came back here again");

  const taskDetailsBtn = taskItem.querySelector(".task-details-btn");
  const tasksDetailSection = taskDetailsBtn.closest('.tasks-management-container').querySelector('.tasks-details-section');
  taskDetailsBtn.addEventListener("click", () => {
    // console.log("called called called called callled ");

    const taskId = Number(taskItem.dataset.taskId);

    // returning early to avoid re-population of already shown task.
    if(tasksDetailSection.classList.contains("show") && currentDisplayedTaskId === taskId && !isEditMode) {
      // console.log("already shown");
      return;
    }

    // setting current displayed task id
    currentDisplayedTaskId = taskId;

    // show the section 
    if(!tasksDetailSection.classList.contains("show") && !isEditMode) {
      tasksDetailSection.classList.add("show");
    }

    // getting the task from local storage.
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    const tasks = currentUser?.tasks;
    const currentTask = tasks.find(task => task.taskId === taskId);


    // populate with the current task details.
    if(!isEditMode) {
      const taskDetails = populateTaskDetails(currentTask);
      tasksDetailSection.innerHTML = "";
      tasksDetailSection.appendChild(taskDetails);
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
          currentDisplayedTaskId = null;
        }else {
          alert("you are currently editing a task, save changes made or cancel to proceed from edit mode!");
          return;
        }
      });
  });
}

function populateTaskDetails(currentTask) {
  console.log("func called", currentTask);

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
          <button class="edit-toggle-btn action-btn">Edit mode</button>
          <button class="tasks-details-section-close-btn action-btn">x</button>
        </div>
      </div>
      <div class="task-details-content">
        <div class="task-detail-group">
          <label>Name:</label>
          <input type="text" class="input" id="task-details-task-name" value="${currentTask.taskName}" readonly>
        </div>
        <div class="task-detail-group">
          <label>Description:</label>
          <textarea class="input desc-input" id="task-details-task-desc" readonly>${currentTask.taskDesc}</textarea>
        </div>
        <div class="task-detail-group">
          <label>Status:</label>
          <div class="task-detail-status-group">
            <span id="task-details-task-status" class="task-detail-text">${currentTask.taskStatus}</span>
              <select class="task-status-select-box" id="task-status" style="display: none;">
                <option value="in-progress">🔄 In Progress</option>
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
          <div class="task-detail-status-group">
            ${currentTask.taskTag === "" ? `<span>-- -- --</span>` : `<span class="task-tag">${currentTask.taskTag}</span>` }
          </div>
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
        <button class="action-btn w-100 save-changes-btn">save changes</button>
        <button class="action-btn w-100 cancel-edit-btn">Cancel</button>
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
  };
  console.log("original task data",originalTaskData);

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
      const selectedValue = taskStatusDropdown.value;
      taskStatusField.textContent = selectedValue;
      
      if(selectedValue === "done"){
        taskEndDateField.textContent = formateDate(new Date());
      }else {
        taskEndDateField.textContent = "-- -- --";
      }
      
    });
  }

  // savebtn onclick updates 
  const saveChangesBtn = tasksDetailsContainer.querySelector('.save-changes-btn');

  // replace with clone
  const newSaveBtn = saveChangesBtn.cloneNode(true);
  saveChangesBtn.replaceWith(newSaveBtn);
  newSaveBtn.addEventListener("click", () => {

    const hasChanged = 
      taskNameField.value !== originalTaskData.taskName ||
      taskDescField.value !== originalTaskData.taskDesc ||
      taskStatusField.textContent !== originalTaskData.taskStatus;

    // dont allow saving if no changes are made.
    if(!hasChanged) {
      alert("No changes made.");
      return;
    }

    // proceed when updates are made.
    isEditMode = false;
    editActionsContainer.style.display = "none";

    // task name 
    taskNameField.readOnly = true;
    taskNameField.classList.remove("input-edit-mode");
    taskNameField.blur();
    if(taskNameField.value !== originalTaskData.taskName) {
      currentTask.taskName = taskNameField.value;
      console.log("name changed", currentTask)
    }


    // task desc
    taskDescField.readOnly = true;
    taskDescField.classList.remove("input-edit-mode");
    if(taskDescField.value !== originalTaskData.taskDesc) {
      currentTask.taskDesc = taskDescField.value;
      console.log("desc changed", currentTask)
    }
    
    // task status
    if(originalTaskData.taskStatus === "in-progress") {
      taskStatusDropdown.style.display = "none";
      taskStatusDropdown.style.border = "1px solid #ccc";

      if(taskStatusField.textContent !== originalTaskData.taskStatus) {
        currentTask.taskStatus = taskStatusField.textContent;
        currentTask.endDate = taskEndDateField.textContent;
        console.log("status changed", currentTask)
      }
    }

    // saving to local storage 
    localStorage.setItem("users", JSON.stringify(users));
    console.log("new updated task",currentTask);
    alert("task is successfully updated");

    const allTasksSection = tasksDetailsContainer.closest("#all-tasks-section");
    if(allTasksSection) {
      renderAllTasksList();
    }
    const todayTasksSection = tasksDetailsContainer.closest("#today-tasks-section");
    if(todayTasksSection) {
      displayTasks();
    }

  });

  // cancelbtn onclick updates
  const cancelEditsBtn = tasksDetailsContainer.querySelector('.cancel-edit-btn');
  const newCancelBtn = cancelEditsBtn.cloneNode(true);
  cancelEditsBtn.replaceWith(newCancelBtn);

  newCancelBtn.addEventListener("click", () => {
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
      taskStatusDropdown.value = "in-progress";
      taskStatusField.textContent = originalTaskData.taskStatus;
      taskEndDateField.textContent = "-- -- --";
    }

  });
} 

////////////////////////////////////////////////////////////////delete task function///////
function deleteTask(taskItem){
  const deleteBtn = taskItem.querySelector('.task-delete-btn');
  deleteBtn.addEventListener("click", () => {
    
    // getting tasks of current user form local storage
    const currentUserName = localStorage.getItem('currentUser');
    const currentUser = users.find(u => u.username === currentUserName);
    if(!currentUser) {
      return;
    }
   
    // // removing task
    const tasks = currentUser?.tasks || [];
    const taskId = Number(taskItem.dataset.taskId);
    const updatedTasks = tasks.filter(task => task.taskId !== taskId);
    console.log(taskItem, updatedTasks)

    // // saving back to local storage
    currentUser.tasks = updatedTasks;
    localStorage.setItem("users", JSON.stringify(users));
    alert("task deleted successfully!");
    
    //updating dom
    // also close any task details section if it is open while deleting.
    if(currentDisplayedTaskId === taskId) {
      const tasksDetailSection = taskItem.closest(".tasks-management-container").querySelector(".tasks-details-section");
      console.log(tasksDetailSection);

      if(tasksDetailSection.classList.contains("show")) {
        tasksDetailSection.classList.remove("show");
        currentDisplayedTaskId = null;
        isEditMode = false;
      }
    }

    taskItem.remove();
  });
}

// /////////////////////////////////////////////////////////////////////////////////////////search functionality/////////
const searchBtn = document.getElementById("search-btn");
searchBtn.addEventListener("click", () => {

  // getting the search value
  const searchValue = document.getElementById("search-input").value.trim();


  // If search input is empty, do nothing or optionally show all tasks
  if (searchValue === "") {
    alert("enter a seach value and continue!")
    return;
  }

  // getting all tasks of current logged in user.
  const currentUserName = localStorage.getItem('currentUser');
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks || [];
  
  // filter tasks by tag
  const filteredTasks = tasks.filter(task => {
    return task.taskTag === searchValue;
  })

  // clearing the exisiting task ui
  const mainTasksList = document.querySelector('.main-tasks-list');
  const todoTasksList = mainTasksList.querySelector('.todo-tasks');
  const inProgressTasksList = mainTasksList.querySelector('.inprogress-tasks');
  const doneTasksList = mainTasksList.querySelector('.done-tasks');
  todoTasksList.innerHTML = "";
  inProgressTasksList.innerHTML = "";
  doneTasksList.innerHTML = "";

  // render only matching tasks
  filteredTasks.forEach(task => {
    if(task.taskStatus === "to-do") {
      renderTask(task, todoTasksList)
    }else if(task.taskStatus === "in-progress") {
      renderTask(task, inProgressTasksList)
    }else if(task.taskStatus === "done") {
      renderTask(task, doneTasksList)
    }
  });

});

const clearSearchBtn = document.getElementById('clear-search-btn');
clearSearchBtn.addEventListener("click", () => {

  const searchInput = document.getElementById("search-input");
  searchInput.value = "";
  renderAllTasksList();
});


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
function showSection(sectionIdToShow) {
  const allSections = document.querySelectorAll("main section");

  allSections.forEach(section => {
    if(section.id === sectionIdToShow) {
      section.classList.add("show-section");
      section.classList.remove("hide-section");
    }else {
      section.classList.remove("show-section");
      section.classList.add("hide-section");
    }
  });
}
const todayTaskListBtn = document.querySelector("#today-task-list-btn");
todayTaskListBtn.addEventListener("click", () => {
  showSection("today-tasks-section");
  displayTasks();
});

const listAllTasksBtn = document.querySelector("#list-all-tasks-btn");
listAllTasksBtn.addEventListener("click", () => {
  showSection("all-tasks-section");
  renderAllTasksList();
});

const showAnalyticsBtn = document.querySelector("#analytics-btn");
showAnalyticsBtn.addEventListener("click", () => {
  showSection("analytics-section");

  // initial daily graph with no offset is loaded
  renderGraph(currentOffset);
  setActiveButton();
  setChartTitle();
});

function renderAllTasksList(){
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
      renderTask(task, todoTasksList);
    }else if(task.taskStatus === "in-progress") {
      renderTask(task, inProgressTasksList);
    }else if(task.taskStatus === "done") {
      renderTask(task, doneTasksList);
    }
  })
}

// //////////////////////////////////////////////////////////chart implementation without charting libraries//////
// getting duration worked on each day
function getWorkingHours(){
  const workHoursPerDay = {};

  const currentUserName = localStorage.getItem("currentUser");
  const currentUser = users.find(u => u.username === currentUserName);
  const tasks = currentUser?.tasks || [];

  tasks.forEach(task => {
    task.timeLogs.forEach(log => {

      // getting date key
      const date = new Date(log.startTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateKey = `${year}-${month}-${day}`;

      const [h, m, s] = log.totalTime.split(":");
      const totalSeconds = Number(h) * 3600 + Number(m) * 60 + Number(2);

      if(!workHoursPerDay[dateKey]){
        workHoursPerDay[dateKey] = 0;
      }

      workHoursPerDay[dateKey] += totalSeconds;
    });
  });

  Object.keys(workHoursPerDay).forEach(dateKey => {
    workHoursPerDay[dateKey] = Math.round((workHoursPerDay[dateKey] / 3600 )* 100) / 100;
  })

  return workHoursPerDay;
}

// helper function to get 14 days date keys
function get14DayWindowFromOffset(offset = 0) {

  // get today date object
  const today =  new Date();

  // move back or forward by offset 14- days blocks
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (today.getDate() - 1) % 14 + offset * 14);

  // creating 14 days dates
  const dateKeys = [];
  for(let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    dateKeys.push(key);
  }
  return dateKeys;
}

// helper funciton ot get 7 days date keys
function get7DayWeekFromOffset(offset = 0) {
  const today = new Date();

  // Get the current day index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = today.getDay();

  // Calculate how many days to go back to get Monday
  const diffToMonday = (currentDay + 6) % 7;

  // get monday of the week based on offset
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - diffToMonday + offset * 7);

  // create 7 days dates
  const weekDateKeys = [];
  for(let i = 0; i < 7; i++){
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2,"0");
    const d = String(date.getDate()).padStart(2,"0");
    const key = `${y}-${m}-${d}`;
    weekDateKeys.push(key);
  }
  return weekDateKeys;
}

// getting maxY according to the exisiting max hours of mapped data
function getMaxYFromMappedData(mappedData){
  const allhours = mappedData.map(data => {
    return data.hours
  });
  const maxHour = Math.max(...allhours, 0);
  const withBuffer = Math.ceil(maxHour + 3);

  return Math.max(withBuffer, 8);
}

// format xlabels based on the charts 
function formateXAxisLabel(dateStr) {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(`${year}-${month}-${day}`)

  if(currentView === "daily") {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const dayNumber = parseInt(day, 10);

    return `${monthNames[monthIndex]} ${dayNumber}`;

  }else {
    const day = date.getDay();
    const weekdayIndex = (day + 6) % 7;
    const weekNames = [
      "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
    ];

    return `${weekNames[weekdayIndex]}`;
  }
}

// creating graph layout
function createGraphLayout(gridContainer, yLabelsContainer, xLabelsContainer, maxY, dateChunk){

  // y axis labels
  yLabelsContainer.innerHTML = "";
  for(let i = 0; i <= maxY; i++) {
    const label = document.createElement("div");
    label.textContent = `${i.toString()}h`;
    yLabelsContainer.appendChild(label);
  }

  // x axis labels
  // xLabelsContainer.style.gridTemplateColumns = `${repeat( `${dateChunk.length}, 1fr)}`
  xLabelsContainer.style.gridTemplateColumns = `repeat(${dateChunk.length},1fr)`;
  xLabelsContainer.innerHTML = "";
  dateChunk.forEach(date => {
    const label = document.createElement("div");
    label.textContent = formateXAxisLabel(date);
    xLabelsContainer.appendChild(label);
  });

  // grid cells 
  gridContainer.innerHTML = "";
  gridContainer.style.gridTemplateRows = `repeat(${maxY},1fr)`;
  gridContainer.style.gridTemplateColumns = `repeat(${dateChunk.length},1fr)`;

  for(let y = maxY - 1; y >= 0; y--) {
    for(let x = 0; x < dateChunk.length; x++) {
      const cell = document.createElement("div");
      cell.classList.add("block");
      cell.dataset.xy = `${x},${y}`;
      gridContainer.appendChild(cell);
    }
  }
}

function createMarker(x, y, gridContainer, styleObj) {
  const cell = gridContainer.querySelector(`[data-xy='${x},${y}']`);
  if(!cell) return;

  const marker = document.createElement("div");
  marker.classList.add("marker-block");
  Object.assign(marker.style, styleObj);
  cell.appendChild(marker);
}

function plotMarkers(gridContainer,mappedData){
  mappedData.forEach((data, x) => {
    const totalHours = data.hours;
    const fullBlocks = Math.ceil(totalHours);

    for(let y = 0; y < fullBlocks; y++) {
      let fillRatio = 1;
      if(y === fullBlocks - 1 && totalHours % 1 !== 0) {
        fillRatio = totalHours % 1;
      }

      const styleObj = {
        height:`${fillRatio * 100}%`,
        background:`black`,
        opacity: "0.7",
        width: "75%",
        borderTopLeftRadius: fillRatio === 1 ? "0px" : "4px",
        borderTopRightRadius: fillRatio === 1 ? "0px" : "4px"
      };

      createMarker(x, y, gridContainer, styleObj);
    }
  });
}

// /////////////////////////////////////////////////final grpah rendering funciton/////////////
let currentOffset = 0;
let currentView = "daily";
const dailyChartToggleBtn = document.getElementById('daily-chart-toggle-btn');
const weeklyChartToggleBtn = document.getElementById('weekly-chart-toggle-btn');
const previousBtn = document.getElementById('previous-btn');
const nextBtn = document.getElementById('next-btn');

function renderGraph(offset){
  // graph data
  const workHours = getWorkingHours();

  const dateChunk = currentView === "weekly" 
    ? get7DayWeekFromOffset(offset)
    : get14DayWindowFromOffset(offset);

  const mappedData = dateChunk.map(date => ({
    date,
    hours: workHours[date] || 0
  }));
  console.log("current graph mapped data",mappedData);

  // graph layout
  const maxY = getMaxYFromMappedData(mappedData);
  const gridArea = document.querySelector('.grid-area');
  const yLabels = document.querySelector('.y-labels');
  const xLabels = document.querySelector('.x-labels');

  // createGraphlayout
  createGraphLayout(gridArea, yLabels, xLabels, maxY, dateChunk);
  plotMarkers(gridArea, mappedData);

  // disable the next btn when offset is 0
  nextBtn.disabled = (offset === 0);

  // updating current period label
  const currentPeriod = document.getElementById('current-period');
  const start = formatDateLabel(dateChunk[0]);
  const end = formatDateLabel(dateChunk[dateChunk.length - 1]);
  currentPeriod.textContent = `${start} - ${end}`;
 
} 

function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(+year, +month - 1, +day); // Constructs date in local time zone at midnight
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

function setActiveButton() {
  if(currentView === "daily") {
    dailyChartToggleBtn.classList.add("active-view");
    weeklyChartToggleBtn.classList.remove("active-view");
  }else {
    weeklyChartToggleBtn.classList.add("active-view");
    dailyChartToggleBtn.classList.remove("active-view");
  } 
}

function setChartTitle(){
  const chartTitle = document.getElementById('chart-title');
  const chartSubTitle = document.getElementById("chart-subtitle");

  if(currentView === "daily") {
    chartTitle.textContent = "Daily Task Time Distribution";
    chartSubTitle.textContent = "Hours spent on tasks throughtout the day";
  }else {
    chartTitle.textContent = "Weekly Task Time Overview";
    chartSubTitle.textContent = "Total hours worked each day of the week";
  }
}

dailyChartToggleBtn.addEventListener("click", () => {
  currentView = "daily";
  currentOffset = 0;
  setActiveButton();
  setChartTitle();
  renderGraph(currentOffset);
});

weeklyChartToggleBtn.addEventListener("click", () => {
  currentView = "weekly";
  currentOffset = 0;
  setActiveButton();
  setChartTitle();
  renderGraph(currentOffset);
});

previousBtn.addEventListener("click", () => {
  currentOffset -= 1;
  renderGraph(currentOffset);
});

nextBtn.addEventListener("click", () => {
  if(currentOffset < 0) {
    currentOffset += 1;
    renderGraph(currentOffset);
  }
});




////////////////////////////////////////////analytics using chart.js///////////////////////////////////////////////
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