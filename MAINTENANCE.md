# HAM MEDIA Website Maintenance

This repository is the single web source of truth for `hammedia.co.kr`.

## Operating Rule

- Website changes for `hammedia.co.kr` are made in this repository.
- Internal planning notes, handoffs, drafts, research, and working documents stay outside this repository.
- Do not copy private working documents into this public website repository.
- Publication means: review the exact changed files, stage only those files, commit, then push after HamPD approval.
- Do not use broad staging such as `git add .`.
- Before pushing, verify the affected public pages locally or live as appropriate.

## Public Scope

This repository should contain only files that are safe to publish as part of the website.

Typical public files include:

- HTML pages
- CSS and JavaScript required by the website
- public images, video, PDFs, and other website assets
- `sitemap.xml`, `robots.txt`, and `CNAME`

Files that do not belong here:

- private notes
- working drafts
- handoff documents
- internal research
- unapproved materials
- temporary files

When in doubt, stop and ask before adding a file.

## Shared Shelf (`share/`)

- `share/` is a temporary link-only shelf for polished HTML documents that HamPD wants to send to a specific person or small group. It is not permanent site content.
- Never put sensitive information, customer information, internal paths, contracts, pricing documents, account details, or private working notes on this shelf.
- Every `share/` page must include `<meta name="robots" content="noindex, nofollow, noarchive">`.
- `share/` pages must never be added to `sitemap.xml`, and public pages must not link to `share/`.
- Do not add a `robots.txt` `Disallow` rule for `share/`: it can expose the path as a hidden area. Use page-level noindex, sitemap exclusion, and no internal links instead.
- The default shelf life is 10 days from the publish date. Use `YYYYMMDD-slug.html` filenames so the deletion window is visible.
- Codex should remind HamPD before deletion, ideally 2 days before expiry and again on the expiry day.
- Deletion is never automatic. Publishing, extending, and deleting each shared document requires a separate HamPD instruction.
- If a document should stay up longer than the short shelf window, move it to a proper public path such as the homepage, academy, portfolio, tools, or another permanent section instead of extending `share/` by habit.
- Remove finished shared documents instead of letting the shelf accumulate; check that the shelf can be emptied during quarterly maintenance.
- HamPD order phrase: "이 문서, 예쁜 HTML로 만들어서 매장 공유 선반(share)에 올려줘. 검색 안 걸리게 하고, 링크만 줘."
