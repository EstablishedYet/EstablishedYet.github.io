# Personal Homepage Scaffold

This is the initial code scaffold built from the assignment brief. Personal copy, image captions, and real data are still meant to be completed later.

The current interface follows the color and texture direction of Monet's *Woman with a Parasol*: pale blue sky, creamy whites, grassy greens, soft violet shadows, and warm peach accents. The background uses broad impressionist color fields, while the foreground keeps a translucent veil layer so text and data remain readable.

## File Structure

- `index.html`: Page structure with profile, data visualization, and interactive surprise sections.
- `css/styles.css`: Responsive layout, theme styling, visualization placeholders, and interaction styles.
- `js/site-data.js`: The main entry point for later profile details, representative image settings, visualization data, and surprise messages.
- `js/main.js`: Renders the page from `site-data.js`, reads static CSV files, and handles theme switching, the profile selector, visualization panels, and the surprise interaction.
- `server.py`: Legacy local backend from an earlier iteration. It is no longer required for the GitHub Pages/static version.

The profile section includes compact horizontal tabs built into the inside top-left edge of the profile panel. The tabs switch between `Identity` and `Intro` while sharing the panel border like notebook dividers.

## Where To Add Content

For later edits, start with `js/site-data.js`:

```js
window.HOMEPAGE_DATA = {
  site: {
    title: ""
  },
  profile: {
    sectionTitle: "",
    nickname: "",
    major: "",
    grade: "",
    intro: [],
    image: {
      src: "",
      alt: "",
      caption: ""
    }
  },
  visualization: {
    title: "",
    summary: "",
    sources: {
      githubContributions: {
        csv: "contribution.csv",
        unit: "contributions",
        items: []
      },
      dailySteps: {
        csv: "steps.csv",
        unit: "steps",
        items: []
      },
      annualSongs2025: {
        csv: "songs.csv",
        unit: "",
        items: []
      }
    }
  },
  easterEgg: {
    messages: []
  }
};
```

The profile section title is displayed in an independent heading panel above both the image and the profile text card.

The data visualization section is split into three static CSV panels:

- `githubContributions`: Reads every row in `contribution.csv`, rendered as a GitHub-style grid with 7 cells per week column.
- `dailySteps`: Reads `steps.csv`, rendered as vertical bars.
- `annualSongs2025`: Reads `songs.csv`, rendered as horizontal bars.

The browser reads CSV files directly from the deployed static files. For local preview, use any static server:

```bash
python -m http.server 8000
```

Then open `http://127.0.0.1:8000`. GitHub Pages works the same way: keep `contribution.csv`, `steps.csv`, `songs.csv`, and `Q&A.csv` in the repository so the page can fetch them as static assets.

When data is available, each normalized `items` entry follows this general shape:

```js
{
  label: "",
  value: 0,
  note: ""
}
```

Supported CSV columns:

- GitHub contributions: `date,count`, `date,contributions`, `date,amount`, or `date,value`
- Daily steps: `date,steps`, `date,count`, `date,amount`, or `date,value`
- Annual songs: `name,times`, `song,amount`, `song,plays`, `song,count`, or `song,value`

Opening `index.html` directly may still show the scaffold, but browser security rules can block `fetch()` under `file://`. Use a local static server or GitHub Pages for reliable CSV loading.
