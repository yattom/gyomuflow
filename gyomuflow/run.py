import web
import json
import urllib
from codecs import open

urls = (
    '/', 'index',
    '/drawing', 'drawing',
)
app = web.application(urls, globals())


class index:

    def GET(self):
        render = web.template.render('templates/')
        return render.index()


class drawing:

    def GET(self):
        params = web.input()
        name = params['name']
        try:
            with open('data/' + urllib.quote(name, safe=''), 'r', encoding='utf8') as f:
                return f.read()
        except IOError:
            raise web.notfound()

    def POST(self):
        # FIXME: I'm not too sure if multibyte data works with this
        raw = web.data()
        parsed = json.loads(raw)
        name = parsed['name']
        with open('data/' + urllib.quote(name, safe=''), 'w', encoding='utf8') as f:
            f.write(raw)


if __name__ == "__main__":
    app.run()
