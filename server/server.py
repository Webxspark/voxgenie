from flask import Flask, request, jsonify
from drivers import Sqlite3Driver
from methods.ping import checkAppInteg
from methods.installer import installApp

app = Flask(__name__)
sqliteDriver = Sqlite3Driver("./db/app.voice.genie")

@app.route("/", methods=['get'])
def index():
  return jsonify("Hello world!")

@app.route("/ping", methods=['get'])
def ping():
  conn = sqliteDriver.connect()
  return checkAppInteg(conn)

@app.route("/eula-accept", methods=['get'])
def installer():
  conn = sqliteDriver.connect()
  installationCheck = checkAppInteg(conn)
  if installationCheck['status'] != 404:
    return(jsonify({
      "status": 400,
      "message": "VoxGenie is already installed on this machine! [Can't initiate installer]"
    }))
  return(jsonify(installApp(conn)))

if(__name__ == "__main__"):
  app.run()