<template>
  <div class="max-w-7xl mx-auto p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
    <h1 class="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-6 border-b pb-3">Gestor de Tareas FullStack</h1>

    <div class="flex flex-wrap justify-around text-center mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl shadow-inner">
      <div v-for="(count, status) in summary" :key="status" class="p-2 w-1/3">
        <p class="text-xs uppercase font-medium text-gray-500 dark:text-gray-400">{{ status }}</p>
        <p class="text-2xl font-bold" :class="status === 'todo' ? 'text-red-500' : status === 'doing' ? 'text-yellow-500' : 'text-green-500'">{{ count }}</p>
      </div>
    </div>

    <div class="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-xl shadow-md">
      <h2 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-3">Añadir Nueva Tarea</h2>
      <div class="flex flex-col md:flex-row gap-3">
        <input 
          v-model="newTaskTitle"
          @keyup.enter="createTask"
          class="flex-grow p-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          type="text" 
          placeholder="Título de la nueva tarea (Requerido)"
        />
        <button 
          @click="createTask"
          :disabled="!newTaskTitle.trim() || isLoading"
          class="px-5 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition duration-150"
        >
          {{ isLoading ? 'Creando...' : 'Crear Tarea' }}
        </button>
      </div>
      <p v-if="error" class="text-red-500 mt-2 text-sm">{{ error }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <TaskColumn
        title="Por Hacer (to do)"
        status-key="todo"
        :tasks="tasks.filter(t => t.status === 'todo')"
        @change-status="changeTaskStatus"
        @delete-task="deleteTask"
      />

      <TaskColumn
        title="En Progreso (doing)"
        status-key="doing"
        :tasks="tasks.filter(t => t.status === 'doing')"
        @change-status="changeTaskStatus"
        @delete-task="deleteTask"
      />

      <TaskColumn
        title="Terminado (done)"
        status-key="done"
        :tasks="tasks.filter(t => t.status === 'done')"
        @change-status="changeTaskStatus"
        @delete-task="deleteTask"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import TaskColumn from './components/TaskColumn.vue';

const API_URL = 'http://localhost:3000/tasks';

const tasks = ref([]);
const newTaskTitle = ref('');
const summary = ref({ todo: 0, doing: 0, done: 0 });
const isLoading = ref(false);
const error = ref(null);

async function apiFetch(url, options = {}) {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }

    if (options.method !== 'DELETE' && response.status !== 204) {
      return await response.json();
    }
  } catch (err) {
    error.value = 'Ocurrió un error: ' + err.message;
    console.error(err);
    throw err; 
  } finally {
    isLoading.value = false;
  }
}

async function fetchTasks() {
  try {
    const data = await apiFetch(API_URL);
    tasks.value = data || [];
    fetchSummary();
  } catch (e) {
  }
}

async function createTask() {
  if (!newTaskTitle.value.trim()) return;

  const payload = { title: newTaskTitle.value.trim() };
  
  try {
    const newTask = await apiFetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    tasks.value.push(newTask);
    newTaskTitle.value = '';
    fetchSummary();
  } catch (e) {
  }
}

async function changeTaskStatus(taskId, newStatus) {
  const url = `${API_URL}/${taskId}/status`;
  
  try {
    const updatedTask = await apiFetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const index = tasks.value.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks.value[index].status = updatedTask.status;
    }
    fetchSummary();
  } catch (e) {
  }
}

async function deleteTask(taskId) {
  const url = `${API_URL}/${taskId}`;
  
  try {
    await apiFetch(url, {
      method: 'DELETE'
    });

    tasks.value = tasks.value.filter(t => t.id !== taskId);
    fetchSummary();
  } catch (e) {
  }
}

async function fetchSummary() {
  try {
    const data = await apiFetch('http://localhost:3000/tasks/summary');
    summary.value = data;
  } catch (e) {
  }
}

onMounted(() => {
  fetchTasks();
});
</script>