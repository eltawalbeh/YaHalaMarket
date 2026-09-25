# Launch QA Checklist

## Public experience
- [ ] Home and offers list load on mobile without horizontal overflow.
- [ ] Search and destination filters produce useful empty states.
- [ ] Offer detail shows dates, nights, hotels, inclusions, prices, images, and inquiry CTA.
- [ ] Arabic RTL and English LTR layouts are readable.
- [ ] WhatsApp handoff opens a prefilled message with the reference ID.

## CMS and security
- [ ] Draft/review/published/expired/archived transitions work.
- [ ] Super Admin, Manager, and Staff permissions are enforced server-side.
- [ ] Dashboard and quotation links are not indexed.
- [ ] Audit events identify actor, action, entity, timestamp, and before/after values.
- [ ] No service-role keys or API secrets are shipped to the browser.

## SEO and accessibility
- [ ] Unique title, description, canonical, and social image per public route.
- [ ] Published offers only appear in sitemap.xml.
- [ ] robots.txt blocks private routes.
- [ ] Keyboard focus, labels, contrast, and skip link pass review.
- [ ] Images have meaningful alt text and dimensions to prevent layout shift.

## Release verification
- [ ] Production build succeeds.
- [ ] Lighthouse review completed on home, offers, and one offer detail.
- [ ] 404, legal, favicon, Open Graph, and Twitter metadata verified.
- [ ] Analytics and Search Console configured through environment/site config.
- [ ] Rollback commit/tag recorded before launch.
