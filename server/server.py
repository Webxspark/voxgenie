from flask import Flask, request, jsonify
from drivers import Sqlite3Driver
from methods.ping import checkAppInteg
from methods.installer import installApp
from flask_bcrypt import Bcrypt
import random
app = Flask(__name__)
sqliteDriver = Sqlite3Driver("./db/app.voice.genie")

@app.route("/", methods=['get', 'post'])
def index():
  return jsonify("Hello world!")

@app.route("/ping", methods=['post'])
def ping():
  conn = sqliteDriver.connect()
  return checkAppInteg(conn)

@app.route("/eula-accept", methods=['post'])
def installer():
  conn = sqliteDriver.connect()
  installationCheck = checkAppInteg(conn)
  if installationCheck['status'] != 404:
    return(jsonify({
      "status": 400,
      "message": "VoxGenie is already installed on this machine! [Can't initiate installer]"
    }))
  return(jsonify(installApp(conn)))

@app.route("/accounts/signup", methods=['post'])
def signup():
  conn = sqliteDriver.connect()
  cursor = sqliteDriver.cursor(conn)
  email = request.form['email']
  password = request.form['secret']
  # validate if both email and password are provided
  if not email or not password:
    return(jsonify({
      "status": 400,
      "message": "Email and password are required!"
    }))
  # validate email
  if "@" not in email or "." not in email:
    return(jsonify({
      "status": 400,
      "message": "Invalid email! Please provide a valid email address."
    }))
  # check if email exists
  cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
  user = cursor.fetchone()
  if user:
    return(jsonify({
      "status": 400,
      "message": "User already exists!"
    }))
  # create user
  username = email.split("@")[0]
  bcrypt = Bcrypt(app)
  password = bcrypt.generate_password_hash(password).decode('utf-8')
  # generate random tag for user starting with WXP_(some random 10 integers)
  tag = "WXP_" + str(random.randint(1000000000, 9999999999))
  sql = "INSERT INTO users (username, email, password, tag) VALUES (?, ?, ?, ?)"
  cursor.execute(sql, (username, email, password, tag))
  conn.commit()
  return(jsonify({
    "status": 200,
    "message": "User created successfully!"
  }))

if(__name__ == "__main__"):
  app.run()