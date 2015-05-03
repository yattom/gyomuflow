import web

urls = (
    '/hello', 'hello',
    '/', 'drawing'
)
app = web.application(urls, globals())


class hello:

    def GET(self, name):
        if not name:
            name = 'World'
        return 'Hello, ' + name + '!'


class drawing:

    def GET(self):
        render = web.template.render('templates/')
        return render.index()


if __name__ == "__main__":
    app.run()
