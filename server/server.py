from flask import Flask, request, jsonify, session
from drivers import Sqlite3Driver
from methods.ping import checkAppInteg, validateToken
from methods.installer import installApp
from flask_bcrypt import Bcrypt
from flask_session import Session
import random
import datetime

app = Flask(__name__)

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_FILE_DIR'] = './.flask_session/'
app.secret_key = "WXP_FS_voxGenie2024"

Session(app)
sqliteDriver = Sqlite3Driver("./db/app.voice.genie")

@app.route("/", methods=['get', 'post'])
def index():
  return jsonify("Hello world!")

@app.route("/ping", methods=['post'])
def ping():
  conn = sqliteDriver.connect()
  appIntgCheckRes = checkAppInteg(conn, session)
  if appIntgCheckRes['status'] == 200:
    sessionDetails = validateToken(session['token'], conn, request)
    return(jsonify(sessionDetails))
  else:
    if request.form['token']:
      sessionDetails = validateToken(request.form['token'], conn, request)
      if sessionDetails['status'] == 200:
        session['token'] = request.form['token']
      return(jsonify(sessionDetails))
  return(jsonify(appIntgCheckRes))

@app.route("/eula-accept", methods=['post'])
def installer():
  conn = sqliteDriver.connect()
  installationCheck = checkAppInteg(conn, session)
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
      "message": "Sorry! An account with this email address already exists."
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
    "message": "Account created successfully! Loggin in.."
  }))

@app.route("/accounts/login", methods=['post'])
def login():
  # validate if session exists
  if 'token' in session:
    return(jsonify({
      "status": 400,
      "message": "Oops! You are already logged in!"
    }))
  
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
  if not user:
    return(jsonify({
      "status": 400,
      "message": "No account found with this email address! Signup to create an account."
    }))
  # check if password is correct
  bcrypt = Bcrypt(app)
  if bcrypt.check_password_hash(user[3], password):
    # create session and return token
    userTag = user[4]
    # generate 
    expiryDate = datetime.datetime.now() + datetime.timedelta(days=365)
    token = bcrypt.generate_password_hash(userTag + str(expiryDate)).decode('utf-8')
    userAgent = request.user_agent
    ip = request.remote_addr
    browser = userAgent.browser
    # save session
    sql = "INSERT INTO sessions(session, tag, user_agent, ip, browser) VALUES (?, ?, ?, ?, ?)"
    cursor.execute(sql, (token, userTag, str(userAgent), ip, browser))
    conn.commit()
    conn.close()
    session['token'] = token
    return(jsonify({
      "status": 200,
      "message": "Logged in successfully!",
      "token": token,
      "tag": userTag
    }))
  return(jsonify({
    "status": 400,
    "message": "Invalid password! Please provide the correct password."
  }))

@app.route("/accounts/logout", methods=['post'])
def logout():
  # validate if session exists
  if 'token' not in session:
    return(jsonify({
      "status": 400,
      "message": "Oops! You are not logged in!"
    }))
  conn = sqliteDriver.connect()
  cursor = sqliteDriver.cursor(conn)
  cursor.execute("DELETE FROM sessions WHERE session = ?", (session['token'],))
  conn.commit()
  conn.close()
  session.clear()
  return(jsonify({
    "status": 200,
    "message": "Logged out successfully!"
  }))

@app.route('/app/history', methods=['post', 'put'])
def history():
  if 'token' not in session:
    return(jsonify({
      "status": 401,
      "message": "Unauthorized! Please login to continue."
    }))
  
  conn = sqliteDriver.connect()
  cursor = sqliteDriver.cursor(conn)
  token = session['token']
  sessionDetails = validateToken(token, conn, request)
  if sessionDetails['status'] != 200:
    return(jsonify(sessionDetails))
  # user tag will be sent in the request (put)
  if request.method == 'PUT':
    userTag = request.form['tag']
    prompt = request.form['prompt']
    cursor.execute("SELECT * FROM users WHERE tag = ?", (userTag,))
    user = cursor.fetchone()
    if not user:
      return(jsonify({
        "status": 404,
        "message": "User not found!"
      }))
    #insert into history
    sql = "INSERT INTO history (tag, prompt) VALUES (?, ?)"
    cursor.execute(sql, (userTag, prompt))
    conn.commit()
    return(jsonify({
      "status": 200,
      "message": "Prompt saved successfully!"
    }))
  
  if request.method == "POST":
    cursor.execute("SELECT * FROM history WHERE tag = ?", (sessionDetails['tag'],))
    history = cursor.fetchall()
    return(jsonify({
      "status": 200,
      "history": history
    }))

if(__name__ == "__main__"):
  app.run()