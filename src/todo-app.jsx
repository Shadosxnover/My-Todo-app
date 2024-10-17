import React, { useState, useRef, useEffect } from 'react';

function TodoApp() {
    const [tasks, setTasks] = useState({
        todo: [],
        doing: [],
        done: []
    });
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    function handleInputChange(e) {
        setNewTask(e.target.value);
    }

    function addTask(e) {
        e.preventDefault();
        if (newTask.trim() === '') return;
        setTasks(prev => ({
            ...prev,
            todo: [...prev.todo, { id: Date.now(), text: newTask }]
        }));
        setNewTask('');
        inputRef.current.focus();
    }

    function deleteTask(id, list) {
        setTasks(prev => ({
            ...prev,
            [list]: prev[list].filter(task => task.id !== id)
        }));
    }

    function startEditing(task) {
        setEditingTask(task);
    }

    function handleEditChange(e) {
        setEditingTask(prev => ({ ...prev, text: e.target.value }));
    }

    function finishEditing(list) {
        setTasks(prev => ({
            ...prev,
            [list]: prev[list].map(task =>
                task.id === editingTask.id ? editingTask : task
            )
        }));
        setEditingTask(null);
    }

    function onDragStart(e, id, sourceList) {
        e.dataTransfer.setData('taskId', id);
        e.dataTransfer.setData('sourceList', sourceList);
    }

    function onDragOver(e) {
        e.preventDefault();
    }

    function onDrop(e, targetList) {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('taskId');
        const sourceList = e.dataTransfer.getData('sourceList');

        if (sourceList !== targetList) {
            setTasks(prev => {
                const task = prev[sourceList].find(t => t.id === parseInt(taskId));
                return {
                    ...prev,
                    [sourceList]: prev[sourceList].filter(t => t.id !== parseInt(taskId)),
                    [targetList]: [...prev[targetList], task]
                };
            });
        }
    }

    function clearFinishedTasks() {
        setTasks(prev => ({ ...prev, done: [] }));
    }

    const TaskList = ({ title, tasks, listName }) => (
        <div
            className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg overflow-y-auto max-h-[70vh]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, listName)}
        >
            <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
            <ul className="space-y-4">
                {tasks.map(task => (
                    <li
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id, listName)}
                        className={`p-4 rounded-lg ${listName === 'doing'
                                ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                                : 'bg-gray-700'
                            } ${listName === 'done' ? 'line-through text-gray-500' : ''
                            }`}
                    >
                        {editingTask && editingTask.id === task.id ? (
                            <input
                                value={editingTask.text}
                                onChange={handleEditChange}
                                onBlur={() => finishEditing(listName)}
                                className="w-full bg-gray-600 px-2 py-1 rounded"
                                autoFocus
                            />
                        ) : (
                            <span className="text-lg">{task.text}</span>
                        )}
                        {listName !== 'done' && (
                            <button
                                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={() => startEditing(task)}
                            >
                                Edit
                            </button>
                        )}
                        <button
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            onClick={() => deleteTask(task.id, listName)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold text-center py-8 bg-gray-800 animate-pulse">
                Todo App
            </h1>
            <div className="flex-grow flex flex-col items-center p-8 space-y-8">
                <form onSubmit={addTask} className="w-full max-w-2xl">
                    <input
                        ref={inputRef}
                        className="w-full px-4 py-3 text-lg bg-gray-700 border-2 border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-all duration-300 ease-in-out"
                        type="text"
                        placeholder="Enter a task..."
                        value={newTask}
                        onChange={handleInputChange}
                    />
                </form>
                <div className="w-full flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <TaskList title="To-do's" tasks={tasks.todo} listName="todo" />
                    <TaskList title="Currently Doing" tasks={tasks.doing} listName="doing" />
                    <TaskList title="Finished" tasks={tasks.done} listName="done" />
                </div>
                {tasks.done.length > 0 && (
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all"
                        onClick={clearFinishedTasks}
                    >
                        Clear All Finished Tasks
                    </button>
                )}
            </div>
        </div>
    );
}

export default TodoApp;