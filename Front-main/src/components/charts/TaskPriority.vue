<template>
  <div class="priorite">
    <!-- Graphique des priorités -->
    <div id="taskPriority" style="width: 100%; height: 290px;"></div>
    <p v-if="!taskData || taskData.length === 0">
      Aucune donnée à afficher pour cette semaine.
    </p>
      <button @click="goToPreviousWeek" class="arrow-button">
        <i class="fas fa-arrow-left"></i>
      </button>
  <button @click="goToNextWeek" class="arrow-button">
        <i class="fas fa-arrow-right"></i>
      </button>
  </div>  

</template>

<script>
import * as echarts from "echarts";
import axios from "axios";

function getCurrentWeekNumber() {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (currentDate - startOfYear + 86400000) / 86400000;
  return Math.ceil(pastDaysOfYear / 7);
}

export default {
  name: "TaskPriority",
  data() {
    return {
      taskData: [], // Données de l'API
      selectedWeek: null, // Semaine actuellement sélectionnée
      currentYear: null, // Année actuelle
      maxWeeks: 52, // Nombre total de semaines dans une année
    };
  },
  mounted() {
    // Calculer la semaine et l'année courantes
    this.currentYear = new Date().getFullYear();
    this.selectedWeek = getCurrentWeekNumber();

    // Charger les données de la semaine actuelle
    this.fetchTaskPriorityData();
  },
  methods: {
    goToPreviousWeek() {
      if (this.selectedWeek > 1) {
        this.selectedWeek -= 1;
      } else if (this.selectedWeek === 1) {
        this.selectedWeek = this.maxWeeks;
        this.currentYear -= 1;
      }
      this.fetchTaskPriorityData();
    },

    goToNextWeek() {
      if (this.selectedWeek < this.maxWeeks) {
        this.selectedWeek += 1;
      } else if (this.selectedWeek === this.maxWeeks) {
        this.selectedWeek = 1;
        this.currentYear += 1;
      }
      this.fetchTaskPriorityData();
    },

    fetchTaskPriorityData() {
      axios
        .get("http://localhost:3000/api/statistiques/tasks-by-priority", {
          params: {
            year: this.currentYear,
            week: this.selectedWeek,
          },
        })
        .then((response) => {
          this.taskData = response.data;
          this.renderChart();
        })
        .catch((error) => {
          console.error("Erreur lors de la récupération des données :", error);
        });
    },

    renderChart() {
  const chartDom = document.getElementById("taskPriority");
  const myChart = echarts.init(chartDom);

  // Correspondance entre les jours en anglais et en français
  const daysTranslation = {
    "Monday": "Lundi",
    "Tuesday": "Mardi",
    "Wednesday": "Mercredi",
    "Thursday": "Jeudi",
    "Friday": "Vendredi",
    "Saturday": "Samedi",
    "Sunday": "Dimanche"
  };

  // Définition de daysOfWeek
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const priorities = ["urgent", "important", "moins important"];

  const seriesData = priorities.map((priority) => {
    return {
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      type: "bar",
      data: daysOfWeek.map((day) => {
        const task = this.taskData.find(
          (t) => t.day_of_week === day && t.priority === priority
        );
        return task ? task.task_count : 0; // 0 si aucune tâche
      }),
      barWidth: "10%", // Ajuster la largeur des barres pour les espacer
      itemStyle: {
       
        color:
          priority === "urgent"
            ? "#3c096c"
            : priority === "important"
            ? "#7b2cbf"
            : "#e0aaff",
      },
    };
  });
  
 
  const option = {
     grid: {
    bottom: "0%", // Ajoute une marge en bas
    left: "5%",
    right: "5%",
    top: "35%",
    containLabel: true, // S'assure que les labels restent visibles
  },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: priorities.map((p) => p.charAt(0).toUpperCase() + p.slice(1)),
      top: "10%",
    },
    xAxis: {
      type: "category",
      data: daysOfWeek.map(day => daysTranslation[day] || day), // Remplace les jours par leur traduction
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: "value",
      interval: 1,
    },
    series: seriesData,
  };

  myChart.setOption(option);
},

  },
};
</script>

<style scoped>
.chart-header {
  display: flex;
  align-items: center;
  justify-content: center;

}
.priorite{
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
  background-color:#fff;
  height: 400px;
  max-width: 600px;
  padding-left: 50px;
  padding-right:50px ;
}
.chart-title {
  text-align: center;
  font-weight: 900;
  font-size: 28px;
  color: rgb(82, 26, 122);
  margin-bottom: 20px;
}

.arrow-button {
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 10px;
}

.arrow-button i {
  color: rgb(82, 26, 122);
}

.arrow-button:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}
</style>
