from flask import Flask, request, jsonify
from drivers import Sqlite3Driver

app = Flask(__name__)


@app.route("/", methods=['get'])
def index():
  return jsonify("Hello world!")

@app.route("/ping", methods=['get'])
def ping():
  return "hi"

if(__name__ == "__main__"):
  app.run()