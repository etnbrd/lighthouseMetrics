# lighthouseMetrics

A wrapper around lighthouse to measure the performance of a set of Urls, and compare the main metrics.
It makes a certain number of request to each url, to average over the network conditions, and smooth the results.

## Usage
```
lighthouseMetrics label1=https://url1 label2=https://url2 ...
```

## Options
```
-f, --format=csv|json  [default: csv] Format to use for the results output
-s, --samples=samples  [default: 30] Sample size for each url to test
--help                 show CLI help
--version              show CLI version
```