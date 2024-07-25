window.onload = function () {
    var KEY = "task_key";
    var Storage = {
        set: function (value) {
            localStorage.setItem(KEY, JSON.stringify(value));
        },
        get: function () {
            var data = localStorage.getItem(KEY);
            return data ? JSON.parse(data) : [];
        },
    };
    var tasks = Storage.get();
    var currentPage = 1;
    var tasksPerPage = 5;
    function $(id) {
        return document.getElementById(id);
    }
    function showMessage(message, isError) {
        if (isError === void 0) { isError = false; }
        var messageEl = $("message");
        messageEl.textContent = message;
        messageEl.className = "message ".concat(isError ? "error" : "success");
        setTimeout(function () {
            messageEl.textContent = "";
            messageEl.className = "message";
        }, 3000);
    }
    function renderTasks() {
        var taskListEl = $("task-list");
        var searchTerm = $("search").value.toLowerCase();
        var filterValue = $("filter").value;
        var filteredTasks = tasks.filter(function (task) {
            var matchesSearch = task.title.toLowerCase().indexOf(searchTerm) !== -1;
            var matchesFilter = filterValue === "0" ||
                (filterValue === "1" && task.isCompleted) ||
                (filterValue === "-1" && !task.isCompleted);
            return matchesSearch && matchesFilter;
        });
        var startIndex = (currentPage - 1) * tasksPerPage;
        var paginatedTasks = filteredTasks.slice(startIndex, startIndex + tasksPerPage);
        taskListEl.innerHTML = paginatedTasks
            .map(function (task) { return "\n        <li class=\"task-item ".concat(task.isCompleted ? "completed" : "", "\">\n          <span>").concat(task.title, "</span>\n          <div>\n            <button onclick=\"toggleTask('").concat(task.id, "')\" aria-label=\"").concat(task.isCompleted ? "Mark as incomplete" : "Mark as complete", "\">\n              <i class=\"fas fa-").concat(task.isCompleted ? "times" : "check", "\"></i>\n            </button>\n            <button onclick=\"deleteTask('").concat(task.id, "')\" aria-label=\"Delete task\">\n              <i class=\"fas fa-trash\"></i>\n            </button>\n          </div>\n        </li>\n      "); })
            .join("");
        renderPagination(filteredTasks.length);
    }
    function renderPagination(totalTasks) {
        var paginationEl = $("pagination-controls");
        var totalPages = Math.ceil(totalTasks / tasksPerPage);
        var paginationHTML = "";
        for (var i = 1; i <= totalPages; i++) {
            paginationHTML += "<button onclick=\"changePage(".concat(i, ")\" ").concat(i === currentPage ? 'class="active"' : "", ">").concat(i, "</button>");
        }
        paginationEl.innerHTML = paginationHTML;
    }
    function addTask(event) {
        event.preventDefault();
        var titleEl = $("task-title");
        var statusEl = $("task-status");
        var newTask = {
            id: Date.now().toString(),
            title: titleEl.value,
            isCompleted: statusEl.value === "Complete",
        };
        tasks.push(newTask);
        Storage.set(tasks);
        renderTasks();
        showMessage("Task added successfully");
        closeModal();
    }
    function toggleTask(id) {
        for (var i = 0; i < tasks.length; i++) {
            if (tasks[i].id === id) {
                tasks[i].isCompleted = !tasks[i].isCompleted;
                Storage.set(tasks);
                renderTasks();
                break;
            }
        }
    }
    function deleteTask(id) {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        Storage.set(tasks);
        renderTasks();
        showMessage("Task deleted successfully");
    }
    function clearTasks() {
        if (confirm("Are you sure you want to clear all tasks?")) {
            tasks = [];
            Storage.set(tasks);
            renderTasks();
            showMessage("All tasks cleared");
        }
    }
    function changePage(page) {
        currentPage = page;
        renderTasks();
    }
    function openModal() {
        var modal = $("task-modal");
        modal.style.display = "block";
    }
    function closeModal() {
        var modal = $("task-modal");
        modal.style.display = "none";
        $("add-task-form").reset();
    }
    // Event Listeners
    $("open-modal").onclick = openModal;
    $("close-modal").onclick = closeModal;
    $("add-task-form").onsubmit = addTask;
    $("clear-tasks").onclick = clearTasks;
    $("search").oninput = renderTasks;
    $("filter").onchange = renderTasks;
    // Initial render
    renderTasks();
    // Global functions for inline event handlers
    window.toggleTask = toggleTask;
    window.deleteTask = deleteTask;
    window.changePage = changePage;
};
