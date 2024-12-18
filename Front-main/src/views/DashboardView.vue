<template>
 <div class="dashboard">
    <div class="welcome ">
        <WelcomeMessage />
    </div> 
    <TaskOverview :taskCount="taskCount" />
  <!-- Cards Section -->
  <div class="cards-container">
  <!-- Carte 1: Total des tâches -->
  <StatCard 
    title="Réalisation moyenne" 
    style="background-color:#240046 ;" 
    endpoint="http://localhost:3000/api/tasks/average-completion-time" 
  />
  <!-- Carte 2: Achèvement du jour -->
  <StatCard 
    title="Achèvement du jour" 
    style="background-color:#3c096c ;" 
    endpoint="http://localhost:3000/api/tasks/completed-percentage" 
  />
  <!-- Carte 3: Tâches à venir -->
  <StatCard 
    title="Urgence du jour" 
    style="background-color:#5a189a ;" 
    endpoint="http://localhost:3000/api/tasks/urgent-ratio" 
  />

  <!-- Carte 4: Urgence du jour -->
 <StatCard 
    title="Tâches à venir" 
    style="background-color:#7b2cbf ;" 
    endpoint="http://localhost:3000/api/tasks/upcoming-total" 
  />
</div>
<div class="container">
  <div class="row justify-content-center">
    <!-- TodayTasks Component -->
    <div class="col-12 col-lg-5 mb-4 d-flex justify-content-center">
      <TodayTasks :tasks="tasksArray" />
    </div>

    <!-- PieChart Component -->
    <div class="col-12 col-lg-3 mb-4 d-flex justify-content-center">
      <PieChart :statistics="taskStatistics" class="dashboard-pie-chart" />
    </div>

    <!-- TaskPriority Component -->
    <div class="col-12 col-lg-4 mb-4 d-flex justify-content-center">
      <TaskPriority />
    </div>
  </div>
    <div class="row">
       
        <div class="col-12 col-md-12">
            <TaskBoard /> 
        </div>
    </div>
  </div>
  </div>
</template>

<script>
import WelcomeMessage from '@/components/WelcomeMessage.vue';
import TaskOverview from '@/components/TaskOverview.vue';
import TodayTasks from '@/components/TodayTasks.vue';
import TaskBoard from '@/components/TaskBoard.vue';
import PieChart from "@/components/charts/PieChart.vue";
import StatCard from "@/components/charts/StatCard.vue";
import TaskPriority from "@/components/charts/TaskPriority.vue";

import axios from 'axios';
axios.defaults.withCredentials = true; // Assure que les cookies de session sont envoyés
export default {

    name: 'DashboardView',
    components: { TaskOverview, TodayTasks, WelcomeMessage, StatCard,TaskBoard, TaskPriority, PieChart,  },
    data() {
        return {
            show: false,
            taskCount: 0, // Default task count
            taskStatistics: [],
        };
    },
    methods: {
    async fetchStatistics() {
      try {
        const response = await axios.get("http://localhost:3000/api/statistiques/today", { withCredentials: true });
        this.taskStatistics = response.data || [];
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques :", error);
      }
    },

    },

 
    mounted() {
    // Fetch task count
    axios
        .get('http://localhost:3000/api/tasks/today', {
            withCredentials: true 
        })
        .then((response) => {
            this.taskCount = response.data.taskCount; // Assign the fetched count
        })
        .catch((error) => {
            console.error('Error fetching task count:', error);
        });
        this.fetchStatistics();
},
};

</script>

<style>
.dashboard{
    background-color:rgba(235, 234, 234, 0.708) ;
}
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  width: 80%;
  margin-left:300px;
  margin-bottom: 60px;
} 


</style>
