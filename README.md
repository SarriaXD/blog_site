# sarria.ca

Source for my personal website, [sarria.ca](https://sarria.ca).

It is a static site: HTML, one stylesheet and a few small scripts. No framework, no build step. The `/cars` page renders a Geely Xingyue L live in the browser with three.js (loaded from a CDN). Clone it and open `index.html`, or serve the folder:

```sh
python3 -m http.server 8000
```

Deployed on Vercel straight from the `master` branch.
