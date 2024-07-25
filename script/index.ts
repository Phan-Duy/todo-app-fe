window.onload = () => {
  const KEY = "task_key";

  type TTask = {
    id: string;
    title: string;
    isCompleted: boolean;
  };

  const Storage = {
    set: (value: TTask[]) => {
      localStorage.setItem(KEY, JSON.stringify(value));
    },
    get: (): TTask[] => {
      const data = localStorage.getItem(KEY);
      return data ? JSON.parse(data) : [];
    },
  };

  let tasks = Storage.get();
  let currentPage = 1;
  const tasksPerPage = 5;

  function $(id: string) {
    return document.getElementById(id);
  }

  function showMessage(message: string, isError = false) {
    const messageEl = $("message") as HTMLDivElement;
    messageEl.textContent = message;
    messageEl.className = `message ${isError ? "error" : "success"}`;
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "message";
    }, 3000);
  }

  function renderTasks() {
    const taskListEl = $("task-list") as HTMLUListElement;
    const searchTerm = ($("search") as HTMLInputElement).value.toLowerCase();
    const filterValue = ($("filter") as HTMLSelectElement).value;

    const filteredTasks = tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().indexOf(searchTerm) !== -1;
      const matchesFilter =
        filterValue === "0" ||
        (filterValue === "1" && task.isCompleted) ||
        (filterValue === "-1" && !task.isCompleted);
      return matchesSearch && matchesFilter;
    });

    const startIndex = (currentPage - 1) * tasksPerPage;
    const paginatedTasks = filteredTasks.slice(
      startIndex,
      startIndex + tasksPerPage
    );

    taskListEl.innerHTML = paginatedTasks
      .map(
        (task) => `
        <li class="task-item ${task.isCompleted ? "completed" : ""}">
          <span>${task.title}</span>
          <div>
            <button onclick="toggleTask('${task.id}')" aria-label="${
          task.isCompleted ? "Mark as incomplete" : "Mark as complete"
        }">
              <i class="fas fa-${task.isCompleted ? "times" : "check"}"></i>
            </button>
            <button onclick="deleteTask('${task.id}')" aria-label="Delete task">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </li>
      `
      )
      .join("");

    renderPagination(filteredTasks.length);
  }

  function renderPagination(totalTasks: number) {
    const paginationEl = $("pagination-controls") as HTMLElement;
    const totalPages = Math.ceil(totalTasks / tasksPerPage);

    let paginationHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<button onclick="changePage(${i})" ${
        i === currentPage ? 'class="active"' : ""
      }>${i}</button>`;
    }

    paginationEl.innerHTML = paginationHTML;
  }

  function addTask(event: Event) {
    event.preventDefault();
    const titleEl = $("task-title") as HTMLInputElement;
    const statusEl = $("task-status") as HTMLSelectElement;

    const newTask: TTask = {
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

  function toggleTask(id: string) {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].isCompleted = !tasks[i].isCompleted;
        Storage.set(tasks);
        renderTasks();
        break;
      }
    }
  }

  function deleteTask(id: string) {
    tasks = tasks.filter((t) => t.id !== id);
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

  function changePage(page: number) {
    currentPage = page;
    renderTasks();
  }

  function openModal() {
    const modal = $("task-modal") as HTMLElement;
    modal.style.display = "block";
  }

  function closeModal() {
    const modal = $("task-modal") as HTMLElement;
    modal.style.display = "none";
    ($("add-task-form") as HTMLFormElement).reset();
  }

  // Event Listeners
  $("open-modal")!.onclick = openModal;
  $("close-modal")!.onclick = closeModal;
  $("add-task-form")!.onsubmit = addTask;
  $("clear-tasks")!.onclick = clearTasks;
  $("search")!.oninput = renderTasks;
  $("filter")!.onchange = renderTasks;

  // Initial render
  renderTasks();

  // Global functions for inline event handlers
  (window as any).toggleTask = toggleTask;
  (window as any).deleteTask = deleteTask;
  (window as any).changePage = changePage;
};
