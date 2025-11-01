<template>
  <div class="p-4 rounded-xl shadow-lg border" :class="columnClasses">
    <h2 class="text-xl font-bold mb-4 text-center border-b pb-2" :class="textClasses">{{ title }} ({{ tasks.length }})</h2>
    
    <div v-if="tasks.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-6">
      No hay tareas en esta columna.
    </div>

    <div v-for="task in tasks" :key="task.id" class="mb-3 p-4 rounded-lg bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600">
      <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ task.title }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ task.description }}</p>

      <div class="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-600">
        <!-- Botones de Cambio de Estado -->
        <button 
          v-if="statusKey !== 'todo'"
          @click="emitChangeStatus(task.id, 'todo')"
          class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition"
        >
          Mover a To Do
        </button>

        <button 
          v-if="statusKey !== 'doing'"
          @click="emitChangeStatus(task.id, 'doing')"
          class="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition"
        >
          Mover a Doing
        </button>
        
        <button 
          v-if="statusKey !== 'done'"
          @click="emitChangeStatus(task.id, 'done')"
          class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
        >
          Mover a Done
        </button>

        <button 
          @click="emitDeleteTask(task.id)"
          class="text-xs px-2 py-1 ml-auto bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  statusKey: {
    type: String,
    required: true,
    validator: (value) => ['todo', 'doing', 'done'].includes(value)
  },
  tasks: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['change-status', 'delete-task']);

function emitChangeStatus(taskId, newStatus) {
  emit('change-status', taskId, newStatus);
}

function emitDeleteTask(taskId) {
  emit('delete-task', taskId);
}

const columnClasses = computed(() => {
  switch (props.statusKey) {
    case 'todo':
      return 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-700';
    case 'doing':
      return 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-700';
    case 'done':
      return 'bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700';
    default:
      return 'bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-500';
  }
});

const textClasses = computed(() => {
  switch (props.statusKey) {
    case 'todo':
      return 'text-red-700 dark:text-red-300';
    case 'doing':
      return 'text-yellow-700 dark:text-yellow-300';
    case 'done':
      return 'text-green-700 dark:text-green-300';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
});
</script>