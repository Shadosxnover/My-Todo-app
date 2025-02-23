import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function TodoApp() {
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('tasks');
        return saved ? JSON.parse(saved) : { todo: [], doing: [], done: [] };
    });
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [dueDate, setDueDate] = useState(null);
    const [category, setCategory] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    const filteredTasks = (taskList) => {
        return taskList.filter(task => 
            task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const addTask = (e) => {
        e.preventDefault();
        if (newTask.trim() === '') return;
        
        const task = {
            id: Date.now(),
            text: newTask,
            priority: taskPriority,
            dueDate,
            category,
            created: new Date()
        };

        setTasks(prev => ({
            ...prev,
            todo: [...prev.todo, task]
        }));
        setNewTask('');
        setTaskPriority('medium');
        setDueDate(null);
        setCategory('');
        inputRef.current.focus();
    };

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

    const TaskCard = ({ task, listName }) => (
        <motion.li
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 rounded-lg shadow-lg ${
                getPriorityColor(task.priority)
            } ${listName === 'done' ? 'opacity-75 line-through' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, task.id, listName)}
        >
            <div className="flex flex-col space-y-2">
                <div className="flex justify-between items-start">
                    <span className="text-lg font-medium">{task.text}</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => startEditing(task)}
                            className="p-1 hover:bg-opacity-80 rounded"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={() => deleteTask(task.id, listName)}
                            className="p-1 hover:bg-opacity-80 rounded"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
                {task.category && (
                    <span className="text-sm bg-gray-700 px-2 py-1 rounded-full w-fit">
                        {task.category}
                    </span>
                )}
                {task.dueDate && (
                    <span className={`text-sm ${
                        isOverdue(task.dueDate) ? 'text-red-400' : 'text-gray-300'
                    }`}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                )}
            </div>
        </motion.li>
    );

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'bg-red-900/50',
            medium: 'bg-yellow-900/50',
            low: 'bg-green-900/50'
        };
        return colors[priority] || colors.medium;
    };

    const isOverdue = (date) => {
        return new Date(date) < new Date() && date;
    };

    const TaskList = ({ title, tasks, listName }) => (
        <div
            className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg shadow-lg overflow-y-auto max-h-[70vh]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, listName)}
        >
            <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
            <ul className="space-y-4">
                <AnimatePresence>
                    {filteredTasks(tasks).map(task => (
                        <TaskCard key={task.id} task={task} listName={listName} />
                    ))}
                </AnimatePresence>
            </ul>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <header className="p-8 bg-gray-800/50 backdrop-blur">
                <h1 className="text-4xl font-bold text-center mb-8">Task Manager</h1>
                <div className="max-w-4xl mx-auto space-y-4">
                    <form onSubmit={addTask} className="flex flex-col space-y-4">
                        <input
                            ref={inputRef}
                            className="w-full px-4 py-3 text-lg bg-gray-700/50 backdrop-blur border-2 border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-all"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="What needs to be done?"
                        />
                        <div className="flex flex-wrap gap-4">
                            <select
                                value={taskPriority}
                                onChange={(e) => setTaskPriority(e.target.value)}
                                className="bg-gray-700/50 rounded-lg p-2"
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                            <DatePicker
                                selected={dueDate}
                                onChange={setDueDate}
                                placeholderText="Set due date"
                                className="bg-gray-700/50 rounded-lg p-2"
                            />
                            <input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder="Category"
                                className="bg-gray-700/50 rounded-lg p-2"
                            />
                        </div>
                    </form>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700/50 rounded-lg"
                    />
                </div>
            </header>
            <div className="flex-grow flex flex-col items-center p-8 space-y-8">
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