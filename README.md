# PAGNI-medical-tests-aggregator

In a shprt period of time I had the "pleasure" to visit many and **different** doctors in the hospital PAGNI. Each visit consisted of a new blood test. So, each doctor had to examine the huge load of those blood tests in order to track the history of my health condition. The more the tests, the more difficult for the new doctor (but also me) to accurately grasp a clear picture of my health.

This desktop app aims to support doctors to track the progress multiple blood tests' results across time, in an intuitive and usable way. Using this app, even the patients themselves could have a better understanding of their health condition.

![pagni-medical-tests-aggregator-showcase](https://github.com/gtopsis/PAGNI-medical-tests-aggregator/assets/11655698/8f059725-b06c-402d-bf28-34dafb15f98a)

`PAGNI-medical-tests-aggregator` app:

1. parses multiple blood tests files (PDF format) with a specified format defined from the hospital PAGNI
2. groups extracted health data by specified health terms (i.e. HCT, HCMC)
3. visualizes using usable charts the progress of each health term across time

## Technologies

<p float="left">
    <img src="./README-images/vue.svg"  width="80px" height="80px" alt="Vue">
    <img src="./README-images/vite.svg"  width="80px" height="80px" alt="Vite">
    <img src="./README-images/electron.svg"  width="80px" height="80px" alt="Electron framework">
</p>

With the help of [_electron-vite-vue_](https://github.com/electron-vite/electron-vite-vue) project (simple `Electron` + `Vue` + `Vite` boilerplate)
