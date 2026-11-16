# Riyaj Chaulagain | Portfolio

My personal portfolio site, built by hand with plain HTML, CSS and JavaScript. It covers my experience, projects, competitions, skills and education.

**Live site:** [riyajchaulagain.com.np](https://riyajchaulagain.com.np)

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black)
![Lenis](https://img.shields.io/badge/Lenis-smooth%20scroll-111111)
![No build step](https://img.shields.io/badge/build-none-lightgrey)

## Overview

A single-page, responsive portfolio with an editorial design. It has no framework and no build step: one `index.html`, one stylesheet, and one script. The only outside dependencies are Google Fonts and the Lenis smooth-scroll library, both loaded from a CDN.

**Sections:** Hero · Highlights · About · Organizations · Experience · Selected work (case studies with photo galleries) · More projects · Competitions and community · Skills · Education · Contact

## Features

- **Light and dark themes.** The site follows your system theme on the first visit. The toggle remembers your choice in `localStorage`, and switches with a circular reveal through the View Transitions API where the browser supports it. A small inline script sets the theme before the page paints, so there is no flash of the wrong theme.
- **Project carousels.** Each case study has a gallery with autoplay (only while it is on screen), previous and next buttons, thumbnails, a progress bar, captions, and drag or swipe.
- **Lightbox.** Click a photo to enlarge it. Arrow keys, Escape and touch swipes work in the lightbox.
- **Scroll animations.** Lenis smooth scrolling, staggered word-by-word headings, block reveals with `IntersectionObserver`, a hero photo parallax, and an About paragraph that fills in word by word as you read.
- **Small touches.** Magnetic buttons that respond to a mouse pointer, an auto-scrolling logo strip of organizations, and a footer that slides out from behind the page.
- **Responsive.** Breakpoints at 980, 860, 640 and 440 px, and a full-screen menu on mobile.
- **Accessible.** A skip-to-content link, ARIA labels on carousels and controls, keyboard support, and reduced-motion handling for the hero photo drift.
- **Résumé.** The résumé PDF is linked from the hero section.

## Tech stack

HTML5, CSS3 (custom properties, media queries, View Transitions), vanilla JavaScript (ES6, `IntersectionObserver`, `requestAnimationFrame`), [Lenis](https://github.com/darkroomengineering/lenis), and Google Fonts (Newsreader, Schibsted Grotesk, IBM Plex Mono).

## Project structure

```
├── index.html     page content and markup
├── style.css      design tokens, themes, layout, responsive rules
├── main.js        scrolling, reveals, carousels, lightbox, theme toggle
└── assets/
    ├── Riyaj_Chaulagain_Resume.pdf
    └── img/       profile, project and organization images
```

## Run locally

No install is needed. Clone the repo and open `index.html`, or serve the folder with any static server:

```bash
git clone https://github.com/riyajclgn123/Portfolio--HTML-CSS-and-Javascript-.git
cd Portfolio--HTML-CSS-and-Javascript-
python -m http.server 8000      # then open http://localhost:8000
```

## Author

**Riyaj Chaulagain**, Computer Science student at Southeastern Louisiana University

- GitHub: [riyajclgn123](https://github.com/riyajclgn123)
- Portfolio: [riyajchaulagain.com.np](https://riyajchaulagain.com.np)
