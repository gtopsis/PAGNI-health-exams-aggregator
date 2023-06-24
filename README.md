# PAGNI-health-exams-aggregator

After a lot of visits in the hospital PAGNI, I had the pleasure to conduct many blood tests. On each one of these visits, the doctor had to examine the huge load of those blood tests in order to track the history of my health condition. The more the tests, the more difficult for the new doctor to accurately understand that the health history is. Sometimes, I even had difficulty to evaluate my potential progress and have the full picture of my blood tests. 

This desktop app aims to support doctors to track the progress of a patient's blood tests across time, in an intuitive and usable way. Using this app, even a patient could have a better understanding of his health condition.

![pagni-health-exams-aggregator-showcase](https://github.com/gtopsis/PAGNI-health-exams-aggregator/assets/11655698/8f059725-b06c-402d-bf28-34dafb15f98a)

`PAGNI-health-exams-aggregator` app 1. parses multiple blood tests files (PDF format) with a specified format defined from the hospital PAGNI, 2. groups extracted health data by specified health terms (i.e. HCT, HCMC) and 3. visualizes using usable charts the progress of each health term across time.

## Technologies

<p float="left">
    <img src="./README-images/vue.svg"  width="80px" height="80px" alt="Vue">
    <img src="./README-images/vite.svg"  width="80px" height="80px" alt="Vite">
    <img src="./README-images/electron.svg"  width="80px" height="80px" alt="Electron framework">
</p>

With the help of [_electron-vite-vue_](https://github.com/electron-vite/electron-vite-vue) project (simple `Electron` + `Vue` + `Vite` boilerplate)
