// i need a time managment app.

// login
// first view calender of current month.
// choose date 

// iam planning a calender view
// first it shoulb be like blocks of calebder, it must wide into a whole a year callender.

// focused on current date, and can view future dates to scedule tasks, 
// old dates can be accessible, but cant do any edits, but we can see the insights of that day. 

// old day history,---?????
// list out tasks, 
// -- number based on task with highest time. , show percentages of each in a bar 



// add new task,   ------- create, edit, delete, 
// enter start time 
// end time 
// additional notes about the task
// total time

// allow user to categorize the task based on priority. 
// if there got any pending task in a day. add that task to the next day list and ask user if he wanna do that that day or any other day or discard it.



// future scheduled tasks, 
// give an option to add new tasks, 
// when that day occur, get notified about that task, 
// and put that task as higher priority in that day.



// on each new day user should get the insight about how he spend all his previous day.. 
// -- task spent with more time 
// -- least time 
// -- compare progress with previous day 
// -- just keep a standard for saying how productive his day was.


// he should be able to compare his own productivity on different days



// keep track of the tasks user is doing,
// ---- notice most done task
// ---- notice least done task 
// if the user doesnt do the most frequent task, he must be notifed to do, at the end of the day.


// collab and manage time. 
// group study 
// team work, 



// time tracker + task tracker
// learning- react - tag   in-progress --  ///timer start - timer stop///
// calendar view to view tasks and time of each date.

// task object 
let task = {
    name: "javascript",
    description: "jldklfksl",
    taskTag : studies,
    time: [
        {
            slot: 1,
            startTime: 5785,
            endTime: 590,
            totalTime: 78787
        },
        {
            slot: 2,
            startTime: 5785,
            endTime: 590,
            totalTime: 78787
        },
        {
            slot: 3,
            startTime: 5785,
            endTime: 590,
            totalTime: 78787
        },
    ],
    totalTime : 8989898,
    taskStatus : 'inprogress/ done'
}

// timer should be a seperate function.
// arguments, name of the task- to get it displayed while timer is ticking. 

// create tasks --- 
// name and description fields
// option to edit the name of the task.
// option to tag the task.

// completion note --- in progress or done --- allow user to mannually track it down.

// start doing --- timer should start --

// show timer in big view - with the the name of it.

// stop timer --
// then the start time and end time with its total time should list under the tasks.
// find some creative way to display it.

// add an option to mannuallly enter the start time and stop, if incase user missed to use the timer.
// add an option to make note of additional dialy stuffs, the user do.


// daily summary---
// at each morning -- just show a graph of each task with percentage of time spent for each task.
// if iam making a daily summary means, i can make use of it to mannually search each dates and see the status of that day.


// history---
// daily status history should persist.
// weekly insights, 
// monthly insights,


// seprate view of all the tasks.
// show all the task objects.
// default grouping is done by date.
// search bar, search by tags.
// show the total time of tasks in that particular searched tag.

// oru task eduthal 
// ath day vech time slots vech sum chyth kaanikenm.


// what are you gonna create?
// first i will allow user to create task...

// date view 
// task ----------- title,description,timer, in-progress/done., tag.



// edit button implementation.
// show the pop up 
// allow user to edit whatever he needs
// on clciking save button, we wanna check if there is a change for each task object property, 
// if there is change means update that, else keep no change. 

