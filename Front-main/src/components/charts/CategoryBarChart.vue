<template>
  <div>
    <div class="chart-header">
     
      <span class="chart-title">Tâches par Categorie</span>
    
    </div>
    <div id="categoryTasksChart" style="width: 70%; height: 365px;"></div>
    <p v-if="!chartData || chartData.length === 0">
      Aucune donnée à afficher pour les catégories.
    </p>
  </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
  name: 'CategoryBarChart',
  props: {
    chartData: { // Récupère les données depuis le parent
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      chart: null, // Instance ECharts
    };
  },
  watch: {
    // Lorsque les données changent, recrée le graphique
    chartData(newData) {
      if (newData && newData.length > 0) {
        this.createChart(newData);
      }
    },
  },
  mounted() {
    if (this.chartData && this.chartData.length > 0) {
      this.createChart(this.chartData);
    }
  },
  methods: {
    createChart(data) {
      const chartDom = document.getElementById('categoryTasksChart');
      this.chart = echarts.init(chartDom);

      // Utilisation des données de la prop pour générer le graphique
      const options = this.generateChartOptions(data);
      this.chart.setOption(options);
    },
    generateChartOptions(data) {
      const categories = data.map(entry => entry.category.charAt(0).toUpperCase() + entry.category.slice(1));

      const categoryData = categories.reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {});

      data.forEach((entry) => {
        const category = entry.category.charAt(0).toUpperCase() + entry.category.slice(1);
        if (categoryData[category] !== undefined) {
          categoryData[category] = entry.task_count;
        }
      });

      return {
        xAxis: {
          max: 'dataMax',
        },
        yAxis: {
          type: 'category',
          data: categories,
          inverse: true,
        },
        series: [
          {
            name: 'Tâches',
            type: 'bar',
            data: Object.values(categoryData),
            label: {
              show: true,
              position: 'right',
              valueAnimation: true,
            },
            itemStyle: {
              color: '#9d4edd',
            },
          },
        ],
        grid: {
    bottom: "5%", // Ajoute une marge en bas
    left: "7%",
    right: "0%",
    top: "5%",
    containLabel: true, // S'assure que les labels restent visibles
  },
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} tâches',
        },
      };
    },
  },
};
</script>
<style>
.chart-header {
  display: flex;
  align-items: center;
  justify-content: center;

}
.chart-title {
  text-align: center;
  font-weight:600;
  font-size: 23px;
  color: #240046;
  
}
</style>