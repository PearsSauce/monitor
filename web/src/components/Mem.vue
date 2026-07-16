<script setup>
import highcharts from 'highcharts'
import moment from 'moment'
import {onMounted, onUnmounted, ref, watch} from 'vue'
import {useI18n} from "vue-i18n";
import {configureHighcharts} from '@/utils/highcharts'

const { t } = useI18n()
const props = defineProps({
  data: {
    type: Array
  },
  max: {
    type: Number
  }
})

const chartRef = ref()
const chart = ref(null)

const chartData = (data) => (data || []).slice(-60)

const formatUnit = (value) => {
  return t('chart-memory')+': ' + formatMemSize(value)
}
const formatMemSize = (size) => {
  let num = size
  let unit = 'B'
  if (num >= 1024) {
    num = num / 1024
    unit = 'KB'
  }
  if (num >= 1024) {
    num = num / 1024
    unit = 'MB'
  }

  if (num >= 1024) {
    num = num / 1024
    unit = 'GB'
  }

  if (String(num).includes('.')) {
    return num.toFixed(2) + unit
  }

  return num.toFixed(0) + unit
}


const formatMemUnitSize = (size) => {
  let num = size
  let unit = 'B'
  if (num >= 1024) {
    num = num / 1024
    unit = 'KB'
  }
  if (num >= 1024) {
    num = num / 1024
    unit = 'MB'
  }

  if (num >= 1024) {
    num = num / 1024
    unit = 'GB'
  }

  if (String(num).includes('.')) {
    return num.toFixed(0) + unit
  }

  return num.toFixed(0) + unit
}

const options = ref({
  chart: {
    type: "area",
    style: {
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Roboto, PingFang SC, Noto Sans CJK, WenQuanYi Micro Hei, Microsoft YaHei",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white"
    },
    borderWidth: 0,
    // margin: [0, -8, 0, -8],
    backgroundColor: "#00000000"
  },
  title: {
    text: null
  },
  xAxis: {
    title: {
      text: null
    },
    type: "datetime",
  },
  yAxis: {
    title: {
      text: null
    },
    labels: {
      formatter: function () {
        return formatMemUnitSize(this.value)
      }
    },
    max: props.max,
    tickAmount: 6
  },
  tooltip: {
    formatter: function () {
      var d = new Date(this.x);
      var s = '<span style="font-weight: 400;font-size: 13px;">' + moment(d).format('HH:mm:ss') + '</span>';
      s += '<br/><span style="font-weight: 600;font-size: 15px;">' + formatUnit(this.point.y) + '</span>';
      return s;
    },
    backgroundColor: '#fff',
    borderColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1
  },
  plotOptions: {
    series: {
      boostThreshold: 1000,
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: true
          }
        }
      }
    }
  },
  series: [{
    color: '#5541b8',
    fillColor: '#5541b820',
    data: chartData(props.data),
    showInLegend: false,
    pointInterval: 1000
  }],
  credits: {
    enabled: false
  }
})

const updateOptions = (data) => {
  if (!chart.value || !data) return
  const series = chart.value.series[0]
  series.addPoint(data, true, series.data.length >= 60)
}

const setSeriesData = (data) => {
  if (!chart.value) return
  chart.value.series[0].setData(chartData(data), true, false, false)
}

onMounted(() => {
  configureHighcharts(highcharts)
  options.value.chart.renderTo = chartRef.value
  chart.value = highcharts.chart(options.value);
})

onUnmounted(() => {
  chart.value?.destroy()
  chart.value = null
})

watch(() => props.data, setSeriesData, { deep: true })
watch(() => props.max, (max) => {
  if (!chart.value) return
  chart.value.yAxis[0].update({ max }, true)
})

defineExpose({
  updateOptions,
  options
})
</script>

<template>
  <div class="name">{{ $t('chart-memory') }}</div>
  <div ref="chartRef" class="card-bg-chart"></div>
</template>

<style scoped lang="scss">
.name {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}
.card-bg-chart {
  width: 100%;
  height: 150px;
}
</style>
