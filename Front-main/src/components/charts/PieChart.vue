<template>
  <v-chart 
    :option="chartOptions" 
    style="width: 100%; height: 400px;" 
    ref="chartRef"
    :class="{'dashboard-pie-chart': isInDashboard}" 
  />
</template>

<script>
import { defineComponent, watch, ref, onMounted, onUnmounted } from 'vue';
import { use } from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import VChart from 'vue-echarts';

use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export default defineComponent({
  name: 'PieChart',
  components: { VChart },
  props: {
    statistics: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const chartRef = ref(null);

    const chartOptions = ref({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        top: '5%',
        left: 'center',
        orient: 'horizontal',
        textStyle: {
          color: '#333',
          fontSize: 13,
        },
      },
      color: ['#5a189a', '#e0aaff', '#9d4edd', '#10002b', '#73C0DE'],
      series: [
        {
          name: 'Task Statistics',
          type: 'pie',
          radius: '50%',
          data: [],
          label: {
            color: '#333',
            fontSize: 12,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });

    // Watch for statistics updates
    watch(
      () => props.statistics,
      (newStatistics) => {
        chartOptions.value.series[0].data = newStatistics.map((stat) => {
          let modifiedStatus = stat.status;
          if (modifiedStatus === 'termine') modifiedStatus = 'Terminé';
          else if (modifiedStatus === 'pas commence') modifiedStatus = 'Pas commencé';
          else if (modifiedStatus === 'annule') modifiedStatus = 'Annulé';
          else if (modifiedStatus === 'en cours') modifiedStatus = 'En cours';

          return {
            value: stat.count,
            name: modifiedStatus,
          };
        });
      },
      { immediate: true }
    );

    // Resize chart on window resize
    const handleResize = () => {
      if (chartRef.value) {
        chartRef.value.resize();
      }
    };

    onMounted(() => {
      window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
    });

    return { chartOptions, chartRef };
  },
});
</script>

<style scoped>
.dashboard-pie-chart {
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}
</style>
