# My Data Atelier

Note: This homepage has already been deployed to establishedyet.github.io and xushibo.me

`My Data Atelier` is a static personal homepage built for the Vibe Coding assignment. It combines a Monet-inspired visual style, profile presentation, CSV-based personal data visualization, and lightweight interactive surprises.

The site is designed for static hosting such as GitHub Pages. There is no build step and the current page no longer depends on a Python backend.

## Current Features

- Monet-inspired UI based on the color mood of *Woman with a Parasol*, with references to *Water Lilies* and *Impression, Sunrise*.
- Light and dark theme switching.
- Profile section with a representative image, click-to-cycle image candidates, and two embedded tabs: `Identity` and `Intro`.
- `Identity` displays four vertically stacked information blocks: name/nickname, age, institute, and major.
- `Intro` reads `Q&A.csv` and cycles through `My Favorite ___` question-answer pairs in order.
- Data Visualization section with three static CSV charts:
  - GitHub contributions: GitHub-style contribution grid, 7 cells per week column, month/day ticks, hover tooltip.
  - Daily steps: scrollable vertical bar chart with sparse axis ticks and hover tooltip.
  - Annual songs of 2025: horizontal bar chart using `times` as bar length, author subtitles, playing-count axis, hover tooltip.
- Interaction section with two full-width tools:
  - Colorful Scraps: samples colors from a default or uploaded image, injects colorful blocks from both sides, and applies a temporary liquid-glass blur while the blocks fall.
  - Song Recommender: randomly picks a song from `songs.csv` and enables a `Play` button that opens the song URL.
- Footer with project credit and a `Back to top` button.

## File Structure

- `index.html`: Page structure for Profile, Data Visualization, Interaction, and footer.
- `css/styles.css`: Monet-style visual system, responsive layout, tabs, charts, buttons, tooltips, and animation styles.
- `js/site-data.js`: Static configuration for profile text, image candidates, CSV paths, and the default surprise image.
- `js/main.js`: Runtime logic for rendering the page, reading static CSV files, parsing data, drawing charts, switching profile tabs, cycling images, theme switching, and interactions.
- `contribution.csv`: GitHub contribution log.
- `steps.csv`: Daily step log.
- `songs.csv`: Annual song list; `times` controls horizontal bar length and `url` powers the `Play` button.
- `Q&A.csv`: Intro question-answer pairs.
- `images/`: Profile image candidates. `images/figure0.jpg` is the default profile image.
- `surprise/`: Default palette source image for Colorful Scraps.
- `server.py`: Legacy backend from an earlier iteration. It is not required by the current static version.
- `contri_getter.py`, `csv_songs.py`, `csvchanger.py`, `csvhealper.py`: Optional data-preparation helper scripts. They are not required to run the website.
- `tab_demo.jpg`: Reference sketch used during UI iteration.

## Local Preview

Do not open `index.html` directly if you need CSV loading. Browser security rules can block `fetch()` under `file://`.

Run a static server from the project root:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/
```

On Windows, if `python` is not available, try:

```bash
py -m http.server 8000
```


