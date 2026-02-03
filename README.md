# Jerome Romero

**Self-taught Frontend Developer | Philippines**

[![Profile Views](https://komarev.com/ghpvc/?username=bootlifexu&label=Profile%20Views&color=0e75b6&style=flat-square)](https://github.com/bootlifexu)
[![Email](https://img.shields.io/badge/Email-romerojerome82%40gmail.com-red?style=flat-square&logo=gmail)](mailto:romerojerome82@gmail.com)

---

## About Me

Passionate frontend developer with a keen interest in creating interactive and performant web applications. I combine creativity with code to build practical solutions that enhance user experiences.

**Currently working on:** [Interactive Music Visualizer](https://github.com/BootlifeXu/Interactive-Music-Visualizer)

**Learning focus:** Full-stack development, performance optimization, and interactive web applications

---

## Chrome Extension: Website Automation Starter

This repository now includes a minimal Chrome extension that lets you run JSON-defined automation steps on the active tab.

### How to Load in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this repository folder.
4. Pin the extension to the toolbar for quick access.

### Example Steps

The popup ships with a starter script. You can customize it using the supported actions:
`wait`, `waitFor`, `click`, `type`, `scroll`, `focus`, `setValue`, `highlight`, `paste`, `keySequence`.

### Looping + CSV-driven runs

- **Loop count** repeats the step list for each CSV row (or once if no CSV is loaded).
- **CSV import** lets you feed per-row data into steps using template variables like `{{row.name}}`,
  `{{value}}` (first column), and `{{index}}`.

```json
[
  { "action": "wait", "ms": 1000 },
  { "action": "highlight", "selector": "input, textarea", "durationMs": 800 },
  { "action": "waitFor", "selector": "input[type='search']", "timeoutMs": 5000 },
  { "action": "paste", "selector": "input[type='search']", "text": "{{value}}" },
  { "action": "keySequence", "keys": ["Enter"], "delayMs": 150 },
  { "action": "scroll", "y": 600, "behavior": "smooth" }
]
```

---

## Tech Stack

**Frontend**  
![HTML5](https://img.shields.io/badge/-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/-CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/-React-61DAFB?style=flat-square&logo=react&logoColor=black)

**Backend & Database**  
![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![MySQL](https://img.shields.io/badge/-MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)

**Tools & Platforms**  
![Linux](https://img.shields.io/badge/-Linux-FCC624?style=flat-square&logo=linux&logoColor=black)
![Nginx](https://img.shields.io/badge/-Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![Google Cloud](https://img.shields.io/badge/-Google%20Cloud-4285F4?style=flat-square&logo=google-cloud&logoColor=white)
![Figma](https://img.shields.io/badge/-Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)
![Photoshop](https://img.shields.io/badge/-Photoshop-31A8FF?style=flat-square&logo=adobe-photoshop&logoColor=white)

---

## Connect With Me

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/httpjerome-romero-12600a182)
[![CodePen](https://img.shields.io/badge/-CodePen-000000?style=flat-square&logo=codepen&logoColor=white)](https://codepen.io/@jerome06)
[![Stack Overflow](https://img.shields.io/badge/-Stack%20Overflow-FE7A16?style=flat-square&logo=stack-overflow&logoColor=white)](https://stackoverflow.com/users/24491534)
[![LeetCode](https://img.shields.io/badge/-LeetCode-FFA116?style=flat-square&logo=leetcode&logoColor=black)](https://www.leetcode.com/leetcode_011)
[![HackerRank](https://img.shields.io/badge/-HackerRank-2EC866?style=flat-square&logo=hackerrank&logoColor=white)](https://www.hackerrank.com/@romerojerome82)
[![CodeChef](https://img.shields.io/badge/-CodeChef-5B4638?style=flat-square&logo=codechef&logoColor=white)](https://www.codechef.com/users/deft_gift_71)

---

## GitHub Statistics

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/top-langs?username=bootlifexu&show_icons=true&locale=en&layout=compact&theme=default&hide_border=true" alt="Top Languages" />
</p>

<p align="center">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=bootlifexu&theme=default&hide_border=true" alt="GitHub Streak" />
</p>

---

<p align="center">
  <i>Open to collaboration and new opportunities. Let's build something amazing together!</i>
</p>

![Snake animation](https://raw.githubusercontent.com/taozhi8833998/taozhi8833998/output/github-contribution-grid-snake-dark.svg)
