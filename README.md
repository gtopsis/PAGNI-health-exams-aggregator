# PAGNI-medical-tests-aggregator

In a short period of time I had the "pleasure" to visit many and **different** doctors in the hospital PAGNI. Each visit consisted of a new blood test. So, each doctor had to examine the huge load of those blood tests in order to track the history of my health condition. The more the tests, the more difficult for the new doctor (but also me) to accurately grasp a clear picture of my health.

This desktop app aims to support doctors to track the progress multiple blood tests' results across time, in an intuitive and usable way. Using this app, even the patients themselves could have a better understanding of their health condition.

![pagni-medical-tests-aggregator-showcase](https://github.com/gtopsis/PAGNI-health-exams-aggregator/blob/main/README-images/app.png)

`PAGNI-medical-tests-aggregator` app:

1. parses multiple blood tests files (PDF format) with a specified format defined from the hospital PAGNI
2. groups extracted health data by specified medical tests (i.e. HCT, HCMC)
3. visualizes using usable charts the progress of each medical test across time

## Terminology

- Medical report: A file which contains many medical tests and their corresponding results.
- Medical test: an example is C-reactive protein (CRP) test.
- Medical Test result: an example is the result 0.75 mg/L for test CRP.

## Technologies

<p float="left">
    <img src="./README-images/vue.svg"  width="80px" height="80px" alt="Vue">
    <img src="./README-images/vite.svg"  width="80px" height="80px" alt="Vite">
    <img src="./README-images/electron.svg"  width="80px" height="80px" alt="Electron framework">
</p>

With the help of [_electron-vite-vue_](https://github.com/electron-vite/electron-vite-vue) project (simple `Electron` + `Vue` + `Vite` boilerplate)
