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
