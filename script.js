// localStorage.clear();

// creating new task pop up..
const createTaskPopupButton = document.getElementById("create-task-popup-btn");
const taskInputpopup = document.querySelector(".task-input-container");
const createTaskButton = document.getElementById("create-task-button");

const tasksSectionDescription = document.getElementById("tasks-section-desc");

// timer section 
const timerSection = document.querySelector(".timer-section");
const ongoingTaskName = document.querySelector(".ongoing-task-name");
const hoursText = document.querySelector(".hours");
const minutesText = document.querySelector(".minutes");
const secondsText = document.querySelector(".seconds");
const timerBtn = document.querySelector(".timer-btn");


let intervalId = null;
let timerStatus = "stopped";
let seconds = 0;
let minutes = 0;
let hours = 0;

let startTime = null;
let currentTaskItem = null;


// getting users form localStorage.
let users = JSON.parse(localStorage.getItem("users")) || [];
console.log(users);

// signup
document.querySelector('#signup-btn').addEventListener("click", () => {
  const username = document.querySelector("#signup-username").value;
  const password = document.querySelector("#signup-password").value;

  const newUser = {
    userId: Date.now(),
    username,
    password,
    tasks : []
  }
  users.push(newUser);

  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", username);

  const currentUser = localStorage.getItem('currentUser');
  if(currentUser) {
    document.querySelector("#auth-section").style.display = "none";
    document.querySelector(".main-page").style.display = "block"
  }else {
    document.querySelector("#auth-section").style.display = "block";
    document.querySelector(".main-page").style.display = "none"
  }

});

// login 
document.querySelector("#login-btn").addEventListener("click", () => {
  const username = document.querySelector("#login-username").value;
  const password = document.querySelector("#login-password").value;
  
  const user = users.find( u => u.username === username && u.password === password);
  
  if(!user){
    alert("invalid credentials");
    return;
  }

  localStorage.setItem("currentUser", username);
});


// loading page based on if user is logged in or not.
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = localStorage.getItem('currentUser');

  if(currentUser) {
    document.querySelector("#auth-section").style.display = "none";
    document.querySelector(".main-page").style.display = "block"
  }else {
    document.querySelector("#auth-section").style.display = "block";
    document.querySelector(".main-page").style.display = "none"
  }
})


const currentUserName = localStorage.getItem('currentUser');
const currentUser = users.find(u => u.username === currentUserName);


// getting saved tasks from localStorage.. 
const tasks = currentUser?.tasks || [];


// inital loading from local storage.
displayTasks();
function displayTasks() {
  const newTasksList = document.getElementById("new-tasks-list");
  newTasksList.innerHTML = "";
  
  tasks.forEach((task) => {
    renderTask(task);
  });

  if (tasks.length !== 0) {
    tasksSectionDescription.classList.add("hide");
  }
}

// creating new tasks ///////////////////////////////////////////////////
createTaskPopupButton.addEventListener("click", () => {
  taskInputpopup.classList.add("show");

  // const closeCreateTaskPopup = document.getElementById(
  //   "close-create-task-pop-up-btn"
  // );

  // closeCreateTaskPopup.addEventListener("click", () => {
  //   taskInputpopup.classList.remove("show");
  // });

});


if (createTaskButton) {
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
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });


    const newTask = {
      taskId: Date.now(),
      startDate: dateCreated,
      endDate: "",
      taskName: taskName,
      taskDesc: taskDesc,
      taskTag: taskTag,
      taskStatus: "not-started",
      timeLogs: [],
      taskTotalDuration: "",
    };

    tasks.push(newTask);

    currentUser.tasks = tasks;

    // storing to local storage.
    localStorage.setItem("users", JSON.stringify(users));

    // closing the popup
    taskInputpopup.classList.remove("show");
    if (tasksSectionDescription) {
      tasksSectionDescription.classList.add("hide");
    }

    // render newly created task.
    renderTask(newTask);
  });

}



function renderTask(task) {
      const newTasksList = document.getElementById("new-tasks-list");
      
      // creating task list item.
      const li = document.createElement("li");
      li.className = "task-list-item";
      li.setAttribute("data-task-id", task.taskId);

      let totalTimeToDisplay;
      if (task.taskTotalDuration === "") {
        totalTimeToDisplay = "00h 00min 00secs";
      } else {
        const [hrs, mins, secs] = task.taskTotalDuration.split(":");
        totalTimeToDisplay = `${hrs}h ${mins}min ${secs}secs`;
      }


      let buttonLabel;
      if(task.timeLogs.length === 0) {
        buttonLabel = "Begin Your Work Session"
      }else {
        buttonLabel = "Resume Your Work Session"
      }
      

      li.innerHTML = `
        <div class="task-info">
            <div class="list-item-text-section">
                <h4 class="task-name">${task.taskName}</h4>
                <p class="task-total">${totalTimeToDisplay}</p>
            </div>
            <div class="list-item-buttons-section">
                <button class="start-timer-btn">
                    ${buttonLabel}
                </button>
                <button class="task-edit-btn" id="edit-btn">
                    <i class="bi bi-three-dots-vertical "></i>
                </button>
            </div>
        </div>
      `;


      if (task.taskName !== "") {
        newTasksList.appendChild(li);
      }

      // attaching timer for the tasks.
      // attachTimerListenerTo(li);

      showTimer(li);
}


function showTimer(taskItem) {
  
  const startTimerBtn = taskItem.querySelector(".start-timer-btn");
  startTimerBtn.addEventListener("click", (e) => {

    if(!timerSection.classList.contains("show")) {
      timerSection.classList.add('show');
    }

    // setting current task to update
    currentTaskItem = taskItem;
    

    // dom updates and necessary changes on btn click.
    const taskId = Number(currentTaskItem.dataset.taskId);
    const taskToUpdate = tasks.find(task => task.taskId === taskId);


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


timerBtn.addEventListener("click", (e) => {

  const taskId = Number(currentTaskItem.dataset.taskId);
  const taskToUpdate = tasks.find(task => task.taskId === taskId);

  if(timerStatus === "stopped"){
    
      // getting start time.
      startTime = new Date();

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
      console.log("task time logs ------->>", taskToUpdate.timeLogs);


      // summing all the time logs///////
      let allTimeLogsTotalSeconds = 0;
      taskToUpdate.timeLogs.forEach(log => {
          const [hrs, mins, secs] = log.totalTime.split(':');
          allTimeLogsTotalSeconds += (Number(hrs) * 3600) + (Number(mins) * 60) + Number(secs);
      });
      
      // total task duration /////////////////////////////////////////////////////////
      taskToUpdate.taskTotalDuration = convertSecondsToTimeFormat(allTimeLogsTotalSeconds);
      console.log("task total duration ------->>", convertSecondsToTimeFormat(allTimeLogsTotalSeconds));


      // updating local storage 
      currentUser.tasks = tasks;
      localStorage.setItem("users", JSON.stringify(users));


      const taskTotal = currentTaskItem.querySelector(".task-total");
      const [hrs,mins,secs] = taskToUpdate.taskTotalDuration.split(':');
      taskTotal.textContent = `${hrs}h ${mins}min ${secs}secs`;


      const currentTaskButtonLable = currentTaskItem.querySelector('.start-timer-btn');
      currentTaskButtonLable.textContent = `Resume Your Work Session`;

      //  //

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
    }
  });


function convertSecondsToTimeFormat(totalSeconds) {
  let hrs = Math.floor(totalSeconds / 3600); // becuase 1 hr == 3600 seconds
  let mins = Math.floor((totalSeconds % 3600) / 60); // we wanna check how many seconds is left from total seconds after substracting hours, then we check how many full minutes we get form the reminaing seconds.
  let secs = totalSeconds % 60; // checking how many remaining seconds we get after taking full minutes.
  
  return `${formatWithLeadingZeros(hrs)}:${formatWithLeadingZeros(mins)}:${formatWithLeadingZeros(secs)}`;
}
  
function formatWithLeadingZeros(val) {
  return val < 10 ? `0${val}` : val;
}

const taskListBtn = document.querySelector("#task-list-btn");
taskListBtn.addEventListener("click", () =>{
  if(document.querySelector("#analytics-section").style.display === "block") {
    document.querySelector("#analytics-section").style.display = "none";
    document.querySelector(".main-content").style.display = "flex";
  }
})

// //////////////////////////////////analytics///////////////////////////////////////////////
const showAnalyticsBtn = document.querySelector("#analytics-btn");

let dailyTaskChart = null;

showAnalyticsBtn.addEventListener("click", () => {
  document.querySelector(".main-content").style.display = "none";
  document.querySelector("#analytics-section").style.display = "block"; 

  // initial chart rendering for today's date
  const today = new Date().toISOString().split('T')[0];
  document.querySelector('#datePicker').value = today;
  const initialData = getTaskHoursForDate(tasks, today);
  console.log(initialData)
  renderTaskChart(initialData);
  
})


// adding listener for date changes
document.getElementById("datePicker").addEventListener("change", function () {
  const selectedDate = this.value;
  const newData = getTaskHoursForDate(tasks, selectedDate);
  renderTaskChart(newData);

});


function getTaskHoursForDate(tasks, selectedDate){
  const targetDate = new Date(selectedDate).toLocaleDateString();
  const taskDurations = {};

  tasks.forEach(task => {

    console.log(task.taskName)
    task.timeLogs.forEach(log => {
      const logDate = new Date(log.startTime).toLocaleDateString();

      if(logDate === targetDate) {
        const [hrs, mins, secs] = log.totalTime.split(':');
        const totalSeconds = Number(hrs) * 3600 + Number(mins) * 60 + Number(secs);

        if(!taskDurations[task.taskName]){
          taskDurations[task.taskName] = 0;
        }

        taskDurations[task.taskName] += totalSeconds;
      }
    })
  })

  // console.log(taskDurations)
  return Object.entries(taskDurations).map(([task, secs]) => ({
    task,
    hours: (secs/ 3600)
  }))
}




function renderTaskChart(taskAnalytics){
  const ctx = document.getElementById('dailyTaskChart').getContext('2d');
  if(dailyTaskChart) dailyTaskChart.destroy();
  
  dailyTaskChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: taskAnalytics.map(t => t.task),
      datasets: [
        {
          label:"Hours Spent on Each Task",
          data : taskAnalytics.map(t => t.hours),
          backgroundColor: "rgba(73, 70, 80, 0.6)"
        }
      ]
    },
    options:{
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return value + "h"
            }
          }
        }
      }
    }


  })

  

}



// object to store timer states.
const timers = {};
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

//////toggling time logs ///////////j/
// const timeLogBtns = document.querySelectorAll(".time-log-btn");
// timeLogBtns.forEach((timeLogBtn) => {
//   timeLogBtn.addEventListener("click", () => {
//     console.log("herereeeeeee");

//     const timeLogContainer = timeLogBtn
//       .closest(".task-timelogs")
//       .querySelector(".time-log");
//     timeLogContainer.classList.toggle("show");

//     const textSpan = timeLogBtn.querySelector(".time-log-btn-text");
//     const icon = timeLogBtn.querySelector("i");

//     // Toggle text
//     if (textSpan.textContent.trim() === "Hide Time Logs") {
//       textSpan.textContent = "Show Time Logs";
//     } else {
//       textSpan.textContent = "Hide Time Logs";
//     }

//     // Toggle icon
//     icon.classList.toggle("bi-chevron-up");
//     icon.classList.toggle("bi-chevron-down");
//   });
// });




//////////////////////// to do soon ///////////

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




// what is actally boss asking , understand his concern and plan accordingly.
// his main concern is to keep recorde of what we have done, like a graph he wanna see, were our time went.
// example he is saying is slack.
// believe you can do this.


// what are we doing daily in slack .
// updating our status rihgt?
// includes code times, 
// includes line of code.



// //////////////////////////next important thing you wanna do, super higher priority////////////////
// 1) associate user with tasks, 
// ------- match user with there tasks ...
// what to do for it?

