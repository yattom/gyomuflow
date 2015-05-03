import os
from paver.easy import task, sh


@task
def run():
    os.environ['PYTHONPATH'] = '.'
    sh('python gyomuflow/run.py')


@task
def devup():
    'run development supporting processes -- coffee, http server for test results, tail app.log'
    sh('screen screen tail -f app.log')
