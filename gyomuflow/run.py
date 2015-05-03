import web
import json
import urllib
from codecs import open

urls = (
    '/', 'drawing'
)
app = web.application(urls, globals())


class drawing:

    def GET(self):
        render = web.template.render('templates/')
        return render.index()

    def POST(self):
        # FIXME: I'm not too sure if multibyte data works with this
        raw = web.data()
        parsed = json.loads(raw)
        name = parsed['name']
        with open('data/' + urllib.quote(name, safe=''), 'w', encoding='utf8') as f:
            f.write(raw)


if __name__ == "__main__":
    app.run()
