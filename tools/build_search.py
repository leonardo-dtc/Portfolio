#!/usr/bin/env python3
"""Build v2/data/search.json from the v2 HTML.

The HTML is the source of truth. Every element carrying a `data-search`
attribute becomes one entry: its kind is the attribute's value ("Project",
"Résumé", "Work", "Page"), its title is the first heading inside it, its
snippet is the first paragraph, and its URL is the page plus the element's
id. Every page also contributes one "Page" entry from its <title> and
<meta name="description">.

    python3 tools/build_search.py            # writes v2/data/search.json
    python3 tools/build_search.py --check    # exits 1 if the file is stale
"""
import html, json, os, re, sys
from html.parser import HTMLParser

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v2')
OUT = os.path.join(ROOT, 'data', 'search.json')
HEADINGS = {'h1', 'h2', 'h3', 'h4'}
SKIP = {'script', 'style', 'template', 'dialog'}


class Page(HTMLParser):
    def __init__(self, url):
        super().__init__(convert_charrefs=True)
        self.url = url
        self.title = ''
        self.desc = ''
        self.items = []
        self._stack = []          # open tags
        self._open = []           # open data-search records: [depth, record]
        self._text_target = None  # ('title'|'heading'|'para', record)
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self._stack.append(tag)
        if tag in SKIP:
            self._skip += 1
            return
        if self._skip:
            return
        if tag == 'meta' and a.get('name') == 'description':
            self.desc = a.get('content', '').strip()
        if tag == 'title':
            self._text_target = ('title', None)
        if 'data-search' in a:
            rec = {'k': a['data-search'] or 'Page', 'id': a.get('id', ''), 't': '', 's': '', 'tag': tag}
            self._open.append([len(self._stack), rec])
        if self._open:
            rec = self._open[-1][1]
            if tag == 'a' and 'index__link' in a.get('class', '') and a.get('href'):
                rec['href'] = a['href']
            if tag in HEADINGS and not rec['t']:
                self._text_target = ('heading', rec)
            elif tag == 'p' and rec['t'] and not rec['s'] and 'sr-only' not in a.get('class', ''):
                self._text_target = ('para', rec)
            elif tag == 'span' and 'index__title' in a.get('class', '') and not rec['t']:
                self._text_target = ('heading', rec)
            elif tag == 'span' and 'index__cat' in a.get('class', '') and rec['t'] and not rec['s']:
                self._text_target = ('para', rec)

    def handle_endtag(self, tag):
        if tag in SKIP and self._skip:
            self._skip -= 1
        if self._text_target and tag in HEADINGS | {'p', 'title', 'span'}:
            self._text_target = None
        while self._open and self._open[-1][0] == len(self._stack) and self._stack and self._stack[-1] == tag:
            depth, rec = self._open.pop()
            self._finish(rec)
        if self._stack and self._stack[-1] == tag:
            self._stack.pop()
        else:
            # tolerate stray closers
            for i in range(len(self._stack) - 1, -1, -1):
                if self._stack[i] == tag:
                    del self._stack[i:]
                    break

    def handle_data(self, data):
        if not self._text_target or self._skip:
            return
        kind, rec = self._text_target
        if kind == 'title':
            self.title += data
        elif kind == 'heading':
            rec['t'] += data
        elif kind == 'para':
            rec['s'] += data

    def _finish(self, rec):
        t = clean(rec['t'])
        if not t:
            return
        s = clean(rec['s'])
        if len(s) > 160:
            s = s[:157].rsplit(' ', 1)[0] + '…'
        if rec.get('href'):
            u = os.path.normpath(os.path.join(self.url or '.', rec['href'])).replace(os.sep, '/')
            if u == '.':
                u = ''
            elif '#' not in u and not u.endswith('/'):
                u += '/'
            u = u.replace('/#', '/#') if '/#' in u else u.replace('#', '/#') if '#' in u and '/#' not in u else u
        else:
            u = self.url + ('#' + rec['id'] if rec['id'] and rec['tag'] not in ('main', 'article') or (rec['tag'] == 'article' and rec['k'] == 'Résumé') else '')
        self.items.append({'t': t, 'k': rec['k'], 's': s, 'u': u})


def clean(s):
    return re.sub(r'\s+', ' ', html.unescape(s or '')).strip()


def build():
    items = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in ('assets', 'data')]
        if 'index.html' not in filenames:
            continue
        rel = os.path.relpath(dirpath, ROOT).replace(os.sep, '/')
        url = '' if rel == '.' else rel + '/'
        with open(os.path.join(dirpath, 'index.html'), encoding='utf-8') as f:
            p = Page(url)
            p.feed(f.read())
        title = clean(p.title).replace(' · Leonardo Carvalho', '')
        items.append({'t': title, 'k': 'Page', 's': clean(p.desc), 'u': url})
        items.extend(p.items)
    # stable order: pages first (Home first), then by kind then title
    order = {'Page': 0, 'Project': 1, 'Résumé': 2, 'Work': 3}
    items.sort(key=lambda i: (order.get(i['k'], 9), i['u'] != '', i['t'].lower()))
    seen, out = set(), []
    for i in items:
        key = (i['t'].lower(), i['u'])
        if key in seen:
            continue
        seen.add(key); out.append(i)
    return {'generated_from': 'v2/**/index.html', 'count': len(out), 'items': out}


if __name__ == '__main__':
    data = build()
    text = json.dumps(data, ensure_ascii=False, indent=1) + '\n'
    if '--check' in sys.argv:
        try:
            cur = open(OUT, encoding='utf-8').read()
        except FileNotFoundError:
            cur = ''
        sys.exit(0 if cur == text else 1)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(text)
    print('wrote %s (%d entries)' % (os.path.relpath(OUT), data['count']))
