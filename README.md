# My Data Atelier

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

## GitHub Pages Deployment

For a personal GitHub Pages repository such as `<username>.github.io`, place the project files in the repository root:

```text
index.html
README.md
css/
js/
images/
surprise/
contribution.csv
steps.csv
songs.csv
Q&A.csv
```

Then commit and push:

```bash
git add .
git commit -m "Deploy personal homepage"
git push
```

The site will be available at:

```text
https://<username>.github.io/
```

GitHub Pages serves the CSV files as static assets, so the frontend can read them directly with `fetch()`.

## Data Format

The frontend normalizes CSV rows into this shape:

```js
{
  label: "",
  value: 0,
  note: "",
  url: ""
}
```

Supported columns:

- GitHub contributions: `date,count`, `date,contributions`, `date,amount`, or `date,value`.
- Daily steps: `date,steps`, `date,count`, `date,amount`, or `date,value`.
- Annual songs: `name,times`, `song,amount`, `song,plays`, `song,count`, or `song,value`.
- Song author field: `author`, `artist`, `artists`, `note`, `notes`, or `description`.
- Song link field: `url`, `link`, `website`, or `spotify`.
- Intro Q&A: `query,answer`, `question,answer`, `prompt,response`, or `label,value`.

Current CSV files use:

```text
contribution.csv: date,amount
steps.csv: date,amount
songs.csv: name,author,times,url
Q&A.csv: query,answer
```

## Editing Content

Most personal content starts in `js/site-data.js`:

- Site title: `site.title`
- Profile identity: `profile.name`, `profile.nickname`, `profile.age`, `profile.institute`, `profile.major`
- Profile images: `profile.image.src` and `profile.image.candidates`
- CSV paths: `profile.favoriteQuestions.csv` and `visualization.sources.*.csv`
- Surprise default image: `easterEgg.image.src`

Chart data should be edited in the CSV files, not hard-coded into JavaScript.

## Notes

- Keep filename casing exactly the same when deploying to GitHub Pages. For example, `Q&A.csv` must match the path in `js/site-data.js`.
- If the page works locally but not on GitHub Pages, check that all CSV and image files were pushed and that the browser cache has refreshed.
- The old `server.py` can still serve a backend-style API, but the current homepage does not call it.
