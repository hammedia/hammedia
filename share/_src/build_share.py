#!/usr/bin/env python3
"""공유 선반 md → html 생성기.

원본(SSoT)은 _src/*.md 카드다. share/*.html 은 보기본(파생)이다.
쓰는 법: _src 안의 md를 고친 뒤  python3 build_share.py  실행 — 그게 전부다.

이 스크립트는 절대 push 하지 않는다. 로컬 html 재생성까지만.
게시(push)·발송은 언제나 햄PD 게이트다 (이 저장소 AGENTS.md).

md 문법 (이 선반 전용, 최소한만):
  frontmatter: slug / title (h1, <br> 허용) / head_title (탭 제목) / date_line
  ## 제목      → 섹션 제목
  ### 제목     → 카드 (다음 ##/### 전까지의 문단이 카드 본문)
  - 목록      → ul (연속 줄은 같은 항목에 이어붙음)
  **굵게**    → <b>
  빈 줄       → 문단 구분
"""
import glob
import html as html_mod
import os
import re

os.chdir(os.path.dirname(os.path.abspath(__file__)))

TEMPLATE_PATH = "../_template.html"


def inline(s: str) -> str:
    s = html_mod.escape(s, quote=False)
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    # [보이는 글](주소) → 링크. 주소는 따옴표만 막고 그대로 쓴다
    s = re.sub(
        r"\[([^\]]+)\]\(([^)\s]+)\)",
        lambda m: f'<a href="{html_mod.escape(m.group(2), quote=True)}">{m.group(1)}</a>',
        s,
    )
    return s


def parse(path: str):
    raw = open(path, encoding="utf-8").read()
    m = re.match(r"\A---\n(.*?)\n---\n(.*)\Z", raw, re.DOTALL)
    if not m:
        raise SystemExit(f"frontmatter 없음: {path}")
    meta = {}
    for line in m.group(1).splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    return meta, m.group(2).strip()


def render_body(text: str) -> str:
    out = []
    card_open = False
    list_open = False
    para: list[str] = []

    def flush_para():
        nonlocal para
        if para:
            out.append(f"          <p>{inline(' '.join(para))}</p>")
            para = []

    def close_list():
        nonlocal list_open
        if list_open:
            out.append("          </ul>")
            list_open = False

    def close_card():
        nonlocal card_open
        flush_para()
        if card_open:
            out.append("          </div>")
            card_open = False

    for line in text.splitlines():
        s = line.rstrip()
        if s.startswith("## "):
            close_list(); close_card()
            out.append(f"          <h2>{inline(s[3:])}</h2>")
        elif s.startswith("### "):
            close_list(); close_card()
            out.append('          <div class="share-card">')
            out.append(f"            <h3>{inline(s[4:])}</h3>")
            card_open = True
        elif s.startswith("- "):
            flush_para()
            if not list_open:
                out.append("          <ul>")
                list_open = True
            out.append(f"            <li>{inline(s[2:])}</li>")
        elif s == "":
            flush_para()
            close_list()
        elif list_open:
            out[-1] = out[-1][:-5] + " " + inline(s.strip()) + "</li>"
        else:
            para.append(s.strip())
    close_list(); close_card()
    return "\n".join(out)


def build(md_path: str, template: str) -> str:
    meta, body_md = parse(md_path)
    body = render_body(body_md)
    # 카드 본문은 <p> 그대로 두되 카드 안 문단은 스타일이 .share-card p 로 잡힌다
    page = template
    page = page.replace("문서 제목 | HAM MEDIA 공유 선반", f"{meta['head_title']} | HAM MEDIA 공유 선반")
    page = page.replace("<h1>문서 제목</h1>", f"<h1>{meta['title']}</h1>")
    page = page.replace('<p class="share-date">2026-07-07</p>', f'<p class="share-date">{meta["date_line"]}</p>')
    content = (
        body
        + "\n\n          "
        + '<p class="share-note">이 문서는 링크로만 전달하는 임시 공유 문서입니다.</p>'
    )
    page = re.sub(
        r'<section class="share-content">.*?</section>',
        '<section class="share-content">\n' + content + "\n        </section>",
        page,
        flags=re.DOTALL,
    )
    out_path = f"../{meta['slug']}.html"
    open(out_path, "w", encoding="utf-8").write(page)
    return out_path


def main():
    template = open(TEMPLATE_PATH, encoding="utf-8").read()
    # 카드 스타일이 템플릿에 없으면 주입한다 (템플릿은 손대지 않는다)
    if ".share-card" not in template:
        card_css = """
      .share-card {
        margin: 0 0 18px;
        padding: 18px 20px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: rgba(126, 181, 232, .07);
      }

      .share-card h3 {
        margin: 0 0 8px;
        font-size: 18px;
      }

      .share-card p {
        margin: 0;
        color: var(--muted);
        font-size: 16px;
      }

      .share-content li {
        margin-bottom: 10px;
      }
"""
        template = template.replace("      .share-note {", card_css + "\n      .share-note {")
    for md_path in sorted(glob.glob("*.md")):
        out = build(md_path, template)
        print("생성:", out)


if __name__ == "__main__":
    main()
