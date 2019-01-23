const lighthouse = require('lighthouse')
const chromeLauncher = require('chrome-launcher')
const stat = require('d3-array')

const defaultLighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance'],
  },
}

const defaultAudits = [
  'first-contentful-paint',
  'first-meaningful-paint',
  'speed-index',
  'time-to-first-byte',
  'first-cpu-idle',
  'interactive',
]

const defaultChromeConfig = {
  chromeFlags: ['--no-sandbox', '--headless']
}

module.exports = async ({
  tests,
  samples,
  chromeConfig = defaultChromeConfig,
  lighthouseConfig = defaultLighthouseConfig,
  audits = defaultAudits,
}) => {

  const chrome = await chromeLauncher.launch(chromeConfig)
  chromeConfig.port = chrome.port;

  let results = []
  for (var i = 0; i < samples; i++) {
    console.error(`iteration ${ i }`)

    for (var j = 0; j < tests.length; j++) {
      const { url, label } = tests[j]
      const { lhr: result } = await lighthouse(
        url,
        chromeConfig,
        lighthouseConfig
      )
      console.error(`  ${ result.timing.total } — ${ label }`)

      const resultAudits = Object.assign(
        { label },
        ...audits.map(audit =>
          ({ [audit]: result.audits[audit].rawValue })
        )
      )

      results.push(resultAudits)
    }
  }

  results = results.sort((a, b) => a.label > b.label)

  const summaries = tests.map(({ label, url }) => {
    const samples = results.filter(r => r.label === label)

    return Object.assign(
      { label },
      ...audits.map(audit =>
        ({ [audit]: stat.mean(samples.map(r => r[audit])), })
      )
    )
  })

  const [ control, ...others ] = summaries

  const analyses = summaries.map(({ label, ...metrics }) => {
    return Object.assign(
      { label },
      ...audits.map(audit =>
        ({ [audit]: ((metrics[audit] / control[audit]) * 100) })
      )
    )
  })

  await chrome.kill()
  return {
    results,
    summaries,
    analyses
  }
}