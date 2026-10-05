# FumeSociety

A static storefront. The catalog is already `catalog/products.json` and the photographs in `catalog/images/`. Nothing has to be parsed, and there is no server to install.

## Host it

Upload this whole folder to any static host: Netlify, Cloudflare Pages, GitHub Pages, S3, or nginx. The entry file is `index.html`.

The pages are hash routes (`#/collection`, `#/product/...`), so the host does not need rewrites.

Opening `index.html` from the desktop will not load the catalog. Browsers block that fetch from a file on disk. The folder has to be served as a site.

`scripts/parse_catalog.py` is only for rebuilding the JSON from `catalog/FumeSociety-Product.pdf`. You do not run it to publish the site.
