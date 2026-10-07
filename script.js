let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {

    const taskName = document.getElementById("taskInput").value;
    const subject = document.getElementById("subjectInput").value;
    const category = document.getElementById("categoryInput").value;
    const priority = document.getElementById("priorityInput").value;
    const dueDate = document.getElementById("dueDateInput").value;

    if (taskName === "" || subject === "" || dueDate === "") {
        alert("Please fill in the required fields.");
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        subject: subject,
        category: category,
        priority: priority,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);

    saveTasks();

    clearForm();

    document.getElementById("taskInput").value = "";
    document.getElementById("subjectInput").value = "";
    document.getElementById("categoryInput").value = "";
    document.getElementById("priorityInput").value = "1";
    document.getElementById("dueDateInput").value = "";

    displayTasks();
}

function displayTasks(filter = "all") {

    const taskList = document.getElementById("taskList");
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const sortOption = document.getElementById("sortSelect").value;


    taskList.innerHTML = "";

    const today = new Date().toISOString().split("T")[0];

    function getDueDateText(dueDate) {

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const taskDate = new Date(dueDate);
    taskDate.setHours(0, 0, 0, 0);

    const difference =
        Math.round((taskDate - todayDate) / (1000 * 60 * 60 * 24));

    if (difference === 0) {
        return "Today";
    }

    if (difference === 1) {
        return "Tomorrow";
    }

    if (difference === -1) {
        return "Yesterday";
    }

    return dueDate;
}

    let filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchText)
    );

    if (filter === "pending") {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    if (filter === "completed") {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }

    if (filter === "overdue") {
        filteredTasks = filteredTasks.filter(task =>
            !task.completed && task.dueDate < today
        );
    }

    if (sortOption === "priorityHigh") {
    filteredTasks.sort((a, b) => b.priority - a.priority);
}

if (sortOption === "priorityLow") {
    filteredTasks.sort((a, b) => a.priority - b.priority);
}

if (sortOption === "dueSoon") {
    filteredTasks.sort((a, b) =>
        a.dueDate.localeCompare(b.dueDate)
    );
}

if (sortOption === "dueLate") {
    filteredTasks.sort((a, b) =>
        b.dueDate.localeCompare(a.dueDate)
    );
}

    if (filteredTasks.length === 0) {

    let message = "No tasks found.";

    if (filter === "pending") {
        message = "No pending tasks.";
    }

    if (filter === "completed") {
        message = "No completed tasks.";
    }

    if (filter === "overdue") {
        message = "No overdue tasks.";
    }

    if (searchText !== "") {
        message = "No tasks found matching your search.";
    }

    taskList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">✓</div>
            <h3>${message}</h3>
            <p>Your tasks will appear here.</p>
        </div>
    `;

    updateDashboard();
    updateStatistics();
    updateSubjectSummary();
    updateCategorySummary();

    return;
    }

    filteredTasks.forEach(task => {

        const taskDiv = document.createElement("div");

        taskDiv.className = "task";

        if (task.completed) {
            taskDiv.classList.add("completed");
        }

        let priorityText = "Low";

        if (task.priority == "2") {
            priorityText = "Medium";
        }

        if (task.priority == "3") {
            priorityText = "High";
        }

        let statusText = "Pending";

        if (task.completed) {
            statusText = "Completed";
        } else if (task.dueDate < today) {
            statusText = "Overdue";
        }

        taskDiv.innerHTML = `
            <h3>${task.name}</h3>

            <p><strong>Subject:</strong> ${task.subject}</p>

            <p><strong>Category:</strong> ${task.category}</p>

            <p>
            <strong>Priority:</strong> 
            <span class="priority-${priorityText.toLowerCase()}">
            ${priorityText}
            </span>
            </p>

            <p><strong>Due Date:</strong> ${getDueDateText(task.dueDate)}</p>

            <p><strong>Status:</strong> ${statusText}</p>

            <div class="task-buttons">

                <button onclick="completeTask(${task.id})">
                    ${task.completed ? "Mark Pending" : "Complete"}
                </button>

                <button onclick="editTask(${task.id})">
                    Edit
                </button>

                <button onclick="deleteTask(${task.id})">
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskDiv);
    });

    updateDashboard();
    updateStatistics();
    updateSubjectSummary();
    updateCategorySummary();
}

function completeTask(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
    }

    saveTasks();
    displayTasks();
}

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    displayTasks();
}

function updateDashboard() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = tasks.filter(task => !task.completed).length;

    const today = new Date().toISOString().split("T")[0];

    const overdue = tasks.filter(task =>
        !task.completed && task.dueDate < today
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;

    let progress = 0;

if (total > 0) {
    progress = Math.round((completed / total) * 100);
}

document.getElementById("progressText").textContent =
    progress + "%";

document.getElementById("progressFill").style.width =
    progress + "%";
}

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(task =>
        task.completed
    ).length;

    const pending = tasks.filter(task =>
        !task.completed
    ).length;

    const today = new Date().toISOString().split("T")[0];

    const overdue = tasks.filter(task =>
        !task.completed && task.dueDate < today
    ).length;

    document.getElementById("statsTotal").textContent = total;
    document.getElementById("statsCompleted").textContent = completed;
    document.getElementById("statsPending").textContent = pending;
    document.getElementById("statsOverdue").textContent = overdue;
}

function updateSubjectSummary() {

    const subjectSummary = document.getElementById("subjectSummary");

    subjectSummary.innerHTML = "";

    const subjects = {};

    tasks.forEach(function(task) {

        if (task.subject) {

            const subjectName = task.subject.trim();
            const subjectKey = subjectName.toLowerCase();

            if (subjects[subjectKey]) {
                subjects[subjectKey].count++;
            } else {
                subjects[subjectKey] = {
                    name: subjectName,
                    count: 1
                };
            }

        }

    });

    for (let subject in subjects) {

        const subjectDiv = document.createElement("div");

        subjectDiv.className = "subject-summary-item";

        subjectDiv.innerHTML = `
            <span>${subjects[subject].name}</span>
            <strong>${subjects[subject].count} task(s)</strong>
        `;

        subjectSummary.appendChild(subjectDiv);
    }

    if (Object.keys(subjects).length === 0) {

        subjectSummary.innerHTML =
            "<p>No subjects available yet.</p>";
    }
}

function updateCategorySummary() {

    const categorySummary = document.getElementById("categorySummary");

    categorySummary.innerHTML = "";

    const categories = {};

    tasks.forEach(function(task) {

        if (task.category) {

            const categoryName = task.category.trim();
            const categoryKey = categoryName.toLowerCase();

            if (categories[categoryKey]) {
                categories[categoryKey].count++;
            } else {
                categories[categoryKey] = {
                    name: categoryName,
                    count: 1
                };
            }

        }

    });

    for (let category in categories) {

        const categoryDiv = document.createElement("div");

        categoryDiv.className = "subject-summary-item";

        categoryDiv.innerHTML = `
            <span>${categories[category].name}</span>
            <strong>${categories[category].count} task(s)</strong>
        `;

        categorySummary.appendChild(categoryDiv);
    }

    if (Object.keys(categories).length === 0) {

        categorySummary.innerHTML =
            "<p>No categories available yet.</p>";
    }
}

displayTasks();

function openTaskForm() {
    document.getElementById("taskForm").scrollIntoView({
        behavior: "smooth"
    });

    document.getElementById("taskInput").focus();
}

function clearForm() {
    document.getElementById("taskInput").value = "";
    document.getElementById("subjectInput").value = "";
    document.getElementById("categoryInput").value = "";
    document.getElementById("priorityInput").value = "1";
    document.getElementById("dueDateInput").value = "";
}

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    document.getElementById("taskInput").value = task.name;
    document.getElementById("subjectInput").value = task.subject;
    document.getElementById("categoryInput").value = task.category;
    document.getElementById("priorityInput").value = task.priority;
    document.getElementById("dueDateInput").value = task.dueDate;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    openTaskForm();
    displayTasks();
}

function showAllTasks() {
    displayTasks("all");
}

function showPendingTasks() {
    displayTasks("pending");
}

function showCompletedTasks() {
    displayTasks("completed");
}

function showOverdueTasks() {
    displayTasks("overdue");
}

function showDashboard() {
    displayTasks("all");
}

function showStatistics() {
    displayTasks("all");
    alert(
        "Total Tasks: " + tasks.length +
        "\nCompleted: " + tasks.filter(task => task.completed).length +
        "\nPending: " + tasks.filter(task => !task.completed).length
    );
}

function setActiveButton(buttonId) {

    document.querySelectorAll(".nav-item").forEach(function(button) {
        button.classList.remove("active");
    });

    const selectedButton = document.getElementById(buttonId);

    if (selectedButton) {
        selectedButton.classList.add("active");
    }
}


document.getElementById("dashboardBtn").addEventListener("click", function() {

    setActiveButton("dashboardBtn");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    displayTasks("all");
});


document.getElementById("myTasksBtn").addEventListener("click", function() {

    setActiveButton("myTasksBtn");

    displayTasks("all");

    document.getElementById("tasksSection").scrollIntoView({
        behavior: "smooth"
    });
});


document.getElementById("pendingBtn").addEventListener("click", function() {

    setActiveButton("pendingBtn");

    displayTasks("pending");

    document.getElementById("tasksSection").scrollIntoView({
        behavior: "smooth"
    });
});


document.getElementById("completedBtn").addEventListener("click", function() {

    setActiveButton("completedBtn");

    displayTasks("completed");

    document.getElementById("tasksSection").scrollIntoView({
        behavior: "smooth"
    });
});

document.getElementById("statisticsBtn").addEventListener("click", function() {

    setActiveButton("statisticsBtn");

    updateStatistics();

    document.getElementById("statisticsSection").scrollIntoView({
        behavior: "smooth"
    });
});

document.getElementById("overdueBtn").addEventListener("click", function() {

    setActiveButton("overdueBtn");

    displayTasks("overdue");

    document.getElementById("tasksSection").scrollIntoView({
        behavior: "smooth"
    });
});

function clearTaskView() {

    document.getElementById("searchInput").value = "";

    document.getElementById("sortSelect").value = "default";

    displayTasks("all");

    setActiveButton("myTasksBtn");
}

setActiveButton("dashboardBtn");