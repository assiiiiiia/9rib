<template>
<div class="task-overview" v-if="taskCount > 0">
  <div class="task-count">
    <i :class="['fa-solid', 'fa-bell', 'bell-icon', { ringing: isRinging }]"></i>
    <span>
      Vous avez 
      <span v-if="taskCount === 1">une tâche</span>
      <span v-else>{{ taskCount }} tâches</span>
      Aujourd'hui!
    </span>
    <button class="close-btn" @click="hideMessage">
      &times;
    </button>
  </div>
</div>

</template>


<script>
import axios from 'axios';
axios.defaults.withCredentials = true;

export default {
  data() {
    return {
      taskCount: 0,
      showMessage: true,
      isRinging: false // Contrôle de l'animation
    };
  },
  created() {
    axios.get('http://localhost:3000/api/tasks/today')
      .then(response => {
        this.taskCount = response.data.taskCount;
      })
      .catch(error => {
        console.error('Error fetching task count:', error);
      });
  },
  mounted() {
    this.isRinging = true;
    setTimeout(() => {
      this.isRinging = false;
    }, 5000); // Arrêter l'animation après 5 secondes
  },
  methods: {
    hideMessage() {
      this.showMessage = false;
    }, 
      goToAddTask() {
      this.$router.push('/add');
    },
  },
  goToAddTask(){

  }
};
</script>

<style scoped>
.task-overview {
  background-color: #fff;
  color: #10002b;
  padding: 0.2rem;
  border-radius: 12px;
  margin: 20px 150px 50px 300px;
  transition: transform 0.4s ease;
  width: 70%;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
}

/* Style en mode sombre */
.dark-mode .task-overview {
  background-color: rgb(55, 54, 56);
  color: rgba(209, 209, 209, 0.858);
}

.dark-mode .bell-icon {
  color: hsl(268, 75%, 67%);
}

.task-count {
  font-size: 1.2rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  white-space: nowrap; /* Prevent wrapping for the text */
}


.bell-icon {
  margin-right: 1rem;
  margin-left: 1rem;
  font-size: 1.7rem;
  cursor: pointer;
  color: #7b2cbf;
  transition: transform 0.1s ease-in-out;
}

/* Animation cloche qui "sonne" */
.ringing {
  animation: ring 0.5s ease-in-out infinite;
}

@keyframes ring {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
  75% {
    transform: rotate(-10deg);
  }
  100% {
    transform: rotate(0deg);
}
}
.close-btn {
  border: none;
  color: #a198ac;
  font-size: 1.8rem;
  background: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-left: auto; /* Move close button to the right */
}

.close-btn:hover {
  transform: translateY(-3px) scale(1.05);
  color: #491784;
}

  .small-img {
    width: 50%;  /* Adjust width to your preferred size */
    max-width: 300px;  /* Set a max-width to ensure it doesn't get too large */
    height: auto;
  }

  .hover-animate:hover {
    transform: scale(1.05) rotate(3deg);
    transition: all 0.3s ease;
  }

  .animate-fall {
    animation: fall 1s ease-in-out;
  }
 


  @keyframes fall {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  .welcome-text {
    opacity: 0;
    animation: fadeIn 1.5s forwards;
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

 
  .aucun{
    font-weight: bold;
    color: #491784;
    margin-top: 0;
  }
  .lead{
    color: black;
    font-weight: bold;
  }
  .dark-mode .aucun{
    color: hsl(268, 75%, 67%);;
  }
  .dark-mode .lead{
    color: #d1d1d1db;
  }



@media (max-width: 768px) {
  .task-overview {
    width: 80%; 
    margin: 20px auto; 
    padding: 0.8rem;
    font-size: 0.9rem; 

  .bell-icon {
    font-size: 1.5rem;
  }

  .close-btn {
    font-size: 1.5rem;
  }

  .add-btn {
    font-size: 1.6rem;
    width: 45px;
    height: 45px;
  }
}
}
@media (max-width: 480px) {
  .task-overview {
    width: 95%; 
    margin: 15px auto;
    font-size: 0.8rem;
    padding: 0.6rem;
  }

  .bell-icon {
    font-size: 1.2rem;
  }

  .close-btn {
    font-size: 1.2rem;
  }

  .add-btn {
    font-size: 1.4rem;
    width: 40px;
    height: 40px;
  }

  .aucun {
    font-size: 1rem;
  }

  .lead {
    font-size: 0.9rem;
  }
}
</style>