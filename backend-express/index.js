const express = require('express');
const cors = require('cors'); 
const app = express();

app.use(cors());
app.use(express.json()); 

const VALID_STATUSES = ['todo', 'doing', 'done'];
let tasks = [
    { id: 1, title: 'Implementar 8 Endpoints API', status: 'doing' },
    { id: 2, title: 'Integrar Frontend Vue', status: 'todo' },
    { id: 3, title: 'Crear documentación y video', status: 'done' }
];
let nextId = 4; 

app.get('/', (req, res) => {
    res.send('API de Gestión de Tareas activa. Servidor FullStack listo.');
});

app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const newTask = { 
        id: nextId++, 
        title, 
        description: description || 'Sin descripción.', 
        status: 'todo'
    };
    
    tasks.push(newTask);
    res.status(201).json(newTask); 
});

app.get('/tasks', (req, res) => {
    const { status } = req.query; 
    
    if (status) {
        const lowerCaseStatus = status.toLowerCase();
        if (!VALID_STATUSES.includes(lowerCaseStatus)) {
            return res.status(400).json({ message: `Invalid status provided. Must be one of: ${VALID_STATUSES.join(', ')}` });
        }
        const filteredTasks = tasks.filter(t => t.status === lowerCaseStatus);
        res.json(filteredTasks);
    } else {
        res.json([...tasks]); 
    }
});

app.get('/tasks/summary', (req, res) => {
    const summary = { todo: 0, doing: 0, done: 0 };

    tasks.forEach(task => {
        if (VALID_STATUSES.includes(task.status)) {
            summary[task.status]++;
        }
    });

    res.json(summary); 
});

app.get('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
});

app.put('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });
    
    const { title, description, status } = req.body;
    
    if (!title || description === undefined || !status) {
        return res.status(400).json({ message: 'Title, description, and status are required to replace the entire task.' });
    }
    
    const lowerCaseStatus = status.toLowerCase();
    if (!VALID_STATUSES.includes(lowerCaseStatus)) {
        return res.status(400).json({ message: `Invalid status provided. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    tasks[taskIndex] = { 
        id: taskId, 
        title, 
        description, 
        status: lowerCaseStatus 
    };
    
    res.json(tasks[taskIndex]);
});

app.patch('/tasks/:id/status', (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status field is required for PATCH operation.' }); 
    }
    
    const lowerCaseStatus = status.toLowerCase();
    
    if (!VALID_STATUSES.includes(lowerCaseStatus)) {
        return res.status(400).json({ 
            message: `Status must be one of: ${VALID_STATUSES.join(', ')}` 
        });
    }

    task.status = lowerCaseStatus;
    res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const initialLength = tasks.length;
    
    tasks = tasks.filter(t => t.id !== taskId);
    
    if (tasks.length === initialLength) {
        return res.status(404).json({ message: 'Task not found' }); 
    }
    
    res.json({ message: 'Task deleted successfully' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de API de Tareas activo en http://localhost:${PORT}`);
});