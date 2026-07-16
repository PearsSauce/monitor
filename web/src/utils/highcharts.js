import { resolveChartLocale } from './chartLocale'

export const configureHighcharts = (highcharts) => {
  const locale = resolveChartLocale()
  highcharts.setOptions({
    global: {
      useUTC: false
    },
    lang: {
      locale
    }
  })
  return locale
}
