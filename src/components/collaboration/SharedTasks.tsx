import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useCollaboration } from '../../contexts/CollaborationContext';

export const SharedTasks: React.FC = () => {
    const { tasks, addTask, toggleTask, deleteTask } = useCollaboration();
    const [newTask, setNewTask] = useState('');

    const handleAddTask = () => {
        if (newTask.trim()) {
            addTask(newTask);
            setNewTask('');
        }
    };

    return (
        <Card variant="glass" className="h-full flex flex-col p-4">
            <h3 className="text-xl font-bold text-white mb-4">Shared Task Board</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddTask();
                }}
                className="flex gap-2 mb-4"
            >
                <Input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    className="bg-black/20"
                />
                <Button type="submit" variant="primary" size="icon">
                    <Plus className="h-5 w-5" />
                </Button>
            </form>
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="flex items-center gap-3 p-3 rounded-md bg-black/20 hover:bg-black/40 transition-colors"
                    >
                        <button
                            onClick={() => toggleTask(task.id)}
                            className={`h-6 w-6 rounded-md border-2 flex-shrink-0
                                ${task.completed ? 'bg-primary border-primary' : 'border-gray-500'}
                                flex items-center justify-center transition-all`}
                        >
                            {task.completed && <Check className="h-4 w-4 text-white" />}
                        </button>
                        <p className={`flex-1 text-white/90 ${task.completed ? 'line-through text-white/50' : ''}`}>
                            {task.text}
                        </p>
                        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-500" onClick={() => deleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}; 