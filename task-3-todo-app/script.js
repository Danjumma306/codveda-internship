const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const save = () => localStorage.setItem('tasks', JSON.stringify(tasks));

const renderTasks = () => {
    pendingList.innerHTML = '';
    completedList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');

        li.innerHTML = `
            <label class="task-content">
                <input type="checkbox" 
                       ${task.completed ? 'checked' : ''} 
                       onclick="toggleTask(${index})">
                
                <span class="${task.completed ? 'completed' : ''}">
                    ${task.text}
                </span>
            </label>
            <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
        `;

        if (task.completed) {
            completedList.appendChild(li);
        } else {
            pendingList.appendChild(li);
        }
    });
};

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!todoInput.value.trim()) return;

    tasks.push({ text: todoInput.value, completed: false });
    todoInput.value = '';
    save();
    renderTasks();
});

window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    save();
    renderTasks();
};

window.deleteTask = (index) => {
    tasks.splice(index, 1);
    save();
    renderTasks();
};

renderTasks();