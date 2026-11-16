# The Data Chronicles

Interactive comic-book portfolio of Nanda Kishor Sajeev. Built with plain HTML, CSS and JavaScript, using three.js for the 3D scene. There is no build step.

## What is in this folder

| Path | What it is |
|---|---|
| `index.html` | Front door. Sends visitors to version 2. |
| `v2/` | Version 2: the white living room, the box of books, the ocean balcony. This is the main site. |
| `site/` | Version 1: the bookshelf. Version 2 reuses its text, page layouts, pictures and character, so **both folders must be published together**. |
| `.nojekyll` | Tells GitHub Pages to serve the files exactly as they are. |

## Changing the content

All text lives in one file: `site/js/content.js`. The top of that file lists every kind of block a page can use. Both versions read from it, so one edit updates both.

- **Add a project:** copy the two pages marked `FILE 05` in *The Project Files*, paste them after it and change the text.
- **Add a picture:** put the file in `site/assets/` and reference it as `assets/your-file.png`.
- **Placeholders:** search `content.js` for `todo` to find everything still to be filled in.

## Running it on your computer

The site must be served by a web server. Opening `index.html` by double-clicking does not work, because browsers block JavaScript modules loaded from disk.

On Windows, double-click `start-site.bat`. It starts the server and opens the site. Keep its window open while you use the site.

Or, from this folder:

```bash
python -m http.server 5178
```

Then open `http://localhost:5178/`.

## Publishing on GitHub Pages

1. Create a repository on GitHub and push this folder to it.
2. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, pick the `main` branch and the `/ (root)` folder, and save.
3. After a minute or two the site is live at `https://<your-username>.github.io/<repository-name>/`.

## Where the code is

| File | Job |
|---|---|
| `site/js/content.js` | All text and links |
| `site/js/pages.js` | How a page of the open book is laid out |
| `site/js/art.js` | The comic illustrations |
| `site/js/character.js` | The 3D character |
| `site/js/ball.js` | The ball's physics |
| `site/js/main.js` | Version 1 scene: shelf, books, opening, page turns |
| `v2/js/room.js` | Version 2 room: walls, balcony, plants, the box |
| `v2/js/main.js` | Version 2 scene: books in the box, opening, page turns |
| `site/styles.css`, `v2/v2.css` | Styles |

`v2/js/main.js` was produced from `site/js/main.js`. A fix to how books open or pages turn has to be made in both files.

three.js and the fonts load from public CDNs (jsDelivr and Google Fonts), so the site needs an internet connection.
