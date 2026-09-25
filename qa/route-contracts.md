# Route Contract

| Route | Audience | Indexing | Canonical |
|---|---|---|---|
| `/` | Public | index,follow | `/` |
| `/offers` | Public | index,follow | `/offers` |
| `/offers/:slug` | Public published offer | index,follow | resolved offer URL |
| `/legal` | Public | index,follow | `/legal` |
| `/login` | Internal | noindex,nofollow | none |
| `/dashboard/*` | Internal | noindex,nofollow | none |
| `/q/*` | Private quotation | noindex,nofollow | none |

## Acceptance rules

- A non-published offer must never appear in public listing, sitemap, canonical metadata, or structured data.
- A private route must remain inaccessible without authorization even when its URL is known.
- Canonical URLs must use `https://market.yahala.co`; preview/staging hosts must not be canonical.
- Offer titles, descriptions, Open Graph image, and JSON-LD must be derived from the same published record.
