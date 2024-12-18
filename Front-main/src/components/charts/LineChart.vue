<template>
  <div>
    <!-- Titre avec flèches alignées au centre -->
    <div class="chart-header">
      <button @click="goToPreviousWeek" class="arrow-button">
        <i class="fas fa-arrow-left"></i>
      </button>
      <span class="chart-title">Tâches complétées - Semaine {{ selectedWeek }} ({{ currentYear }})</span>
      <button @click="goToNextWeek" class="arrow-button">
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <!-- Graphique -->
    <div id="weeklyTasksChart" style="width: 100%; height: 400px;"></div>
    <p v-if="!chartData || chartData.length === 0">
      Aucune donnée à afficher pour cette semaine.
    </p>
  </div>
</template>

<script>
import * as echarts from "echarts";

// Function to get the current week number
function getCurrentWeekNumber() {
  const currentDate = new Date();
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
  const pastDaysOfYear = (currentDate - startOfYear + 86400000) / 86400000;
  return Math.ceil(pastDaysOfYear / 7);
}

export default {
  name: "LineChart",
  props: {
    chartData: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chart: null, // ECharts instance
      selectedWeek: null, // Currently selected week
      currentYear: null, // Current year
      maxWeeks: 52, // Total number of weeks in a year
      refreshInterval: null, // Store interval ID for clearing
    };
  },
  mounted() {
    // Calculate the current week and year
    this.currentYear = new Date().getFullYear();
    this.selectedWeek = getCurrentWeekNumber();

    // Initialize the chart
    this.createChart();

    // Update the data for the current week
    this.updateWeekData();

    // Set interval to update the chart data automatically every 10 seconds (10000 ms)
    this.refreshInterval = setInterval(() => {
      this.updateWeekData();
    }, 10000); // Update every 10 seconds
  },
  beforeUnmount() {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  },
  methods: {
    // Go to the previous week
    goToPreviousWeek() {
      if (this.selectedWeek > 1) {
        this.selectedWeek -= 1;
      } else if (this.selectedWeek === 1) {
        this.selectedWeek = this.maxWeeks;
        this.currentYear -= 1;
      }
      this.updateWeekData();
    },

    // Go to the next week
    goToNextWeek() {
      if (this.selectedWeek < this.maxWeeks) {
        this.selectedWeek += 1;
      } else if (this.selectedWeek === this.maxWeeks) {
        this.selectedWeek = 1;
        this.currentYear += 1;
      }
      this.updateWeekData();
    },

    // Create the chart
    createChart() {
      const chartDom = document.getElementById("weeklyTasksChart");
      this.chart = echarts.init(chartDom);

      // Set initial chart options with empty data
      const options = this.generateChartOptions([], this.selectedWeek, this.currentYear);
      this.chart.setOption(options);
    },

    // Update data for the selected week
    updateWeekData() {
      // Filter data for the selected week and year
      const filteredData = this.chartData.filter(
        (entry) =>
          entry.week_number === this.selectedWeek && entry.year === this.currentYear
      );

      // Generate chart options
      const options = this.generateChartOptions(filteredData, this.selectedWeek, this.currentYear);

      // Update the chart
      if (this.chart) {
        this.chart.setOption(options);
      }
    },

    // Generate chart options for ECharts
    generateChartOptions(data, weekNumber, year) {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      const weekData = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };

      // Fill weekData with available data
      data.forEach((entry) => {
        if (entry.day_of_week && entry.completed_tasks !== undefined) {
          weekData[entry.day_of_week] = entry.completed_tasks;
        }
      });

      return {
        xAxis: {
          type: "category",
          data: days,
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: `Semaine ${weekNumber} (${year})`,
            data: Object.values(weekData),
            type: "line",
            color: "#5a189a",
            smooth: true,
          },
        ],
        tooltip: {
          trigger: "axis",
        },
        title: {
          text: "",
        },
      };
    },
  },
  watch: {
    // Watch for changes in chartData and update accordingly
    chartData: {
      handler() {
        this.updateWeekData();
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>

<style scoped>
/* Ajouter un style pour les flèches */
.chart-header {
  display: flex;
  align-items: center;
  justify-content: center;

}

.chart-title {
  text-align: center;
  font-weight:700;
  font-size: 23px;
  color: #240046;
  
}

.arrow-button {
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 20px;
}

.arrow-button i {
  color:   #240046; 
 
}

.arrow-button:hover {
  background-color: #f0f0f0;
  border-radius: 50%;
}
</style>
