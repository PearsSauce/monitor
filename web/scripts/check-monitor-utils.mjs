import assert from 'node:assert/strict'

import {
  getHostChartSeries,
  normalizeMonitorHosts,
  regionFlag
} from '../src/utils/monitor.js'
import {
  DEFAULT_CHART_LOCALE,
  normalizeChartLocale
} from '../src/utils/chartLocale.js'

const charts = {}
const result = normalizeMonitorHosts([
  {
    Host: {
      Name: 'UK-node-1',
      CPU: 'not-an-array',
      MemTotal: '2048',
      LogicalCores: '4'
    },
    State: {
      CPU: '42.5',
      MemUsed: '1024',
      DiskTotal: '4096',
      DiskUsed: '2048',
      NetInSpeed: 'invalid',
      NetOutSpeed: '512',
      NetInTransfer: '1024',
      NetOutTransfer: '2048',
      Disks: [
        {
          mount: '/',
          fs_type: 'ext4',
          total: '4096',
          used: '2048',
          used_percent: '50.25'
        }
      ]
    },
    TimeStamp: '95'
  },
  {
    Host: {
      Name: 'CN-pending'
    },
    TimeStamp: 0
  },
  {
    State: {
      CPU: 99
    }
  },
  null
], 100, 10, charts)

assert.deepEqual(result.areas, ['UK', 'CN'])
assert.equal(result.hosts.length, 2)
assert.equal(result.hosts[0].status, 1)
assert.equal(result.hosts[1].status, 0)
assert.equal(result.hosts[0].Host.MemTotal, 2048)
assert.deepEqual(result.hosts[0].Host.CPU, [])
assert.equal(result.hosts[0].State.CPU, 42.5)
assert.equal(result.hosts[0].State.NetInSpeed, 0)
assert.equal(result.hosts[0].State.NetOutSpeed, 512)
assert.equal(result.hosts[0].State.Disks[0].used_percent, 50.25)
assert.equal(result.hosts[1].Host.Platform, 'unknown')
assert.equal(result.hosts[1].State.TrafficResetDay, 1)

assert.equal(charts['UK-node-1'].cpu.length, 1)
assert.deepEqual(getHostChartSeries(charts, 'missing-node'), {
  cpu: [],
  mem: [],
  net_in: [],
  net_out: []
})
assert.equal(regionFlag('UK-node-1'), '🇬🇧')

const emptyResult = normalizeMonitorHosts({ bad: 'shape' }, 100, 10, {})
assert.deepEqual(emptyResult, { areas: [], hosts: [] })

assert.equal(normalizeChartLocale(''), DEFAULT_CHART_LOCALE)
assert.equal(normalizeChartLocale('zh'), 'zh-CN')
assert.equal(normalizeChartLocale('en'), 'en-US')
assert.equal(normalizeChartLocale('en_US'), 'en-US')
assert.equal(normalizeChartLocale('not a locale'), DEFAULT_CHART_LOCALE)
