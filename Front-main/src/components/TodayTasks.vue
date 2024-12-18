<template>
  <div class="today-tasks-card">
    <div class="header d-flex justify-content-between align-items-center">
      <h3 class="fw-bold">Tâches d’aujourd’hui</h3>
      <button class="add" @click="goToAddTask">+</button>
    </div>
    <div class="task-list">
       <!-- Afficher les tâches si elles existent -->
      <div>
    <TaskDisplay
     
      v-for="task in sortedTasks"
      :key="task.id"
      :task="task"
      :show-checkbox="true"
      @update-task="updateTaskStatus" 
      @delete-task="handleDeleteTask"
      @trigger-edit="openEditPopup" 
      @remove-task="removeTask" 
      @show-toast="showToast" 
    />
    <!-- Popup pour modifier une tâche -->
    <EditTask
      v-if="showEditPopup"
      :task="taskToEdit"
      @update-task="updateTaskStatus"
      @close="closeEditPopup"
    />
  </div>

<!-- Afficher le message alternatif si aucune tâche -->
<div v-if="tasks.length === 0" class="d-flex justify-content-center align-items-center gap-4 empty-column-message">
  <p class="text-muted message-container animated-message">
      Aucune tâche en vue?  <br>
    Lancez votre journée avec énergie et inspiration  ! 💪
  </p>
</div>




    <!-- Toast notification -->
    <div v-if="toastMessage" class="toast-container">
      <div class="toast-message">{{ toastMessage }}</div>
    </div>
    </div>
</div>
</template>

<script>
import TaskDisplay from "./TaskDisplay.vue";
import EditTask from './EditTask.vue';

import axios from 'axios';  // Import axios to make HTTP requests

export default {
  name: 'TodayTasks',
  components: {
    TaskDisplay,
    EditTask,
    
  },
  data() {
    return {
      showEditPopup: false,
      taskToEdit: null,
      taskCount: 0,
      tasks: [],
      toastMessage: "", // For the notification
    };
  },
  created() {
  axios.get('http://localhost:3000/api/tasks/today')
    .then(response => {
      this.taskCount = response.data.taskCount || 0; // Assurez-vous que taskCount est au moins 0
    })
    .catch(error => {
      console.error('Error fetching task count:', error);
      this.taskCount = 0; // En cas d'erreur, définissez taskCount à 0
    });
}
,
  mounted() {
    axios.get('http://localhost:3000/api/tasks', { withCredentials: true })

      .then(response => {
        this.tasks = response.data;
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  },
  computed: {
    sortedTasks() {
      return [
        ...this.tasks.filter(task => task.status !== 'termine'),
        ...this.tasks.filter(task => task.status === 'termine'),
      ];
    }
  },
  methods: {
    goToAddTask() {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
      this.$router.push({ path: '/add', query: { date: today } });
    },

    openEditPopup(task) {
      this.taskToEdit = task;
      this.showEditPopup = true;
    },
    closeEditPopup() {
      this.showEditPopup = false;
      this.taskToEdit = null;
    },

    updateTaskStatus(updatedTask) {
      const taskIndex = this.tasks.findIndex(task => task.id === updatedTask.id);
      if (taskIndex !== -1) {
        // Update the task's status locally
        this.tasks[taskIndex] = updatedTask;

      }
    },
    removeTask(taskId) {
      // Remove the task with the given ID from the local tasks array
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      this.showToast("Tâche supprimée et déplacée vers la corbeille !");
      this.$emit('task-deleted', this.tasks.length); // Pass the updated task count

    },
    showToast(message) {
      this.toastMessage = message;
      setTimeout(() => {
        this.toastMessage = ""; // Hide the toast after 3 seconds
      }, 7000);
    },
    
    handleDeleteTask(taskId) {
      // Remove the task locally from the array
      this.tasks = this.tasks.filter(task => task.id !== taskId);
      // Emit to parent (Dashboard) to update the task count
      this.$emit('task-deleted', this.tasks.length);
    },
  }
}
</script>

<style>
.today-tasks-card {
  
  border-radius: 12px;
  padding: 1rem;
  margin-left: 150px;
  margin-bottom: 30px;
  background: #fff;
  width: 80%;
  height: 400px;
  overflow-y: auto;
  scroll-behavior: smooth;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  color: #10002b;
}

.today-tasks-card::-webkit-scrollbar {
  width: var(--w-scrollbar, 8px); /* Default width */
  height: var(--w-scrollbar, 8px);
  border-radius: 9999px;
}

.task-list::-webkit-scrollbar {
  width: 8px;
}

.task-list::-webkit-scrollbar-thumb {
  background: hsl(0, 0%, 75%);
  border-radius: 4px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}


.dark-mode .today-tasks-card {
  background-color: rgb(55, 54, 56);
  box-shadow: 5px 18px 22px rgba(0, 0, 0, 0.324);
  border: none;
}

.dark-mode .header {
  color: hsl(268, 75%, 67%);
}

.dark-mode button.add {
  background-color: hsl(268, 75%, 67%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.task-list {
  max-height: 300px; 
  overflow-y: auto;
  margin-top: 1rem;
  text-align: left;
  padding-top: 1rem;  /* Adjust space between heading and first task */
}


button.add {
  background-color: #9d4edd;
  color: white;
  font-size: 25px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.3s ease;
}

button.add:hover {
  background: hsl(268, 70%, 60%);
  transform: scale(1.1);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

@media screen and (max-width: 768px) {
  .today-tasks-card {
    margin-left: 15px;
  }
}

/* Toast notification container */
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px; /* Align to the right side */
  z-index: 9999;
  width: auto; /* Let the width adjust to content */
  max-width: 350px; /* Set a max-width for a more compact look */
  padding: 10px;
}

/* Toast message styles */
.toast-message {
  background-color: #e4c1f9; /* Green background */
  color: #491784;
  padding: 12px 20px; /* Increased padding for better spacing */
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  animation: fadeInRight 0.5s ease-out; /* Adding animation */
}

/* Animation for toast */
@keyframes fadeInRight {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}


/* Responsive : Petits écrans */
@media screen and (max-width: 768px) {
  .tasks-container {
    flex-direction: column; /* Affiche les cartes les unes sous les autres */
  }

  .today-tasks-card {
    width: 100%; /* Chaque carte prend 100% de la largeur */
    margin-bottom: 1rem; /* Espacement entre les cartes */
  }
}

@media screen and (max-width: 480px) {
  .today-tasks-card {
    padding: 0.8rem; /* Réduit l'espacement intérieur */
    font-size: 0.9rem; /* Réduit légèrement la taille du texte */
  }
}
/* Animation pour faire apparaître le message */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Styles du conteneur du message */
.empty-column-message {
  font-family: 'Arial', sans-serif;
  text-align: center;
  margin-top: 10px;
  
  animation: fadeInUp 1s ease-out; /* Animation d'apparition */
}

/* Style du texte */
.message-container {
  font-size: 18px;
  color: #6c757d;
  font-weight: 300;
  line-height: 1.5;
}

/* Style des emojis */
.emoji {
  font-size: 30px;
  color: #28a745;
}

/* Texte gris clair */
.text-muted {
  color: #6c757d !important;
 
}


</style>