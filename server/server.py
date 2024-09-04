print("\nStarting VoxGenie server...")
import os
import random
import datetime
from flask import Flask, request, jsonify, session, Response, send_from_directory
from drivers import Sqlite3Driver
from methods.ping import checkAppInteg, validateToken
from methods.installer import installApp
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask_cors import CORS
from methods.functions import *
from TTS.api import TTS
from flask_socketio import SocketIO, send, emit
import torch
import threading
import psutil
import GPUtil
import time
import eventlet
import eventlet.wsgi
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_FILE_DIR'] = './.flask_session/'
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
app.secret_key = "WXP_FS_voxGenie2024"
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)
Session(app)
CORS(app)

sqliteDriver = Sqlite3Driver("./db/app.voice.genie")
#get device
device = "cuda" if torch.cuda.is_available() else "cpu"
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to(device)
@app.route("/genie", methods=['get', 'post'])
def index():
  return jsonify("Hello world!")

@app.route("/genie/ping", methods=['post'])
def ping():
  conn = sqliteDriver.connect()
  appIntgCheckRes = checkAppInteg(conn, session)
  if appIntgCheckRes['status'] == 200:
    sessionDetails = validateToken(session['token'], conn, request)
    return(jsonify(sessionDetails))
  elif appIntgCheckRes['status'] == 404:
    return jsonify(appIntgCheckRes)
  else:
    if request.form['token']:
      sessionDetails = validateToken(request.form['token'], conn, request)
      if sessionDetails['status'] == 200:
        session['token'] = request.form['token']
      return(jsonify(sessionDetails))
  return(jsonify(appIntgCheckRes))

@app.route("/genie/eula-accept", methods=['post'])
def installer():
  conn = sqliteDriver.connect()
  installationCheck = checkAppInteg(conn, session)
  if installationCheck['status'] != 404:
    return(jsonify({
      "status": 400,
      "message": "VoxGenie is already installed on this machine! [Can't initiate installer]"
    }))
  return(jsonify(installApp(conn)))

@app.route("/genie/accounts/signup", methods=['post'])
def signup():
   # validate if session exists
  if 'token' in session:
    return(jsonify({
      "status": 400,
      "message": "Oops! You are already logged in!",
      "action": "__redir(dashboard)"
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
    "message": "Account created successfully! Login to continue.",
  }))

@app.route("/genie/accounts/login", methods=['post'])
def login():
  # validate if session exists
  if 'token' in session:
    return(jsonify({
      "status": 400,
      "message": "Oops! You are already logged in!",
      "action": "__redir(dashboard)"
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
    session['tag'] = userTag
    return(jsonify({
      "status": 200,
      "message": "Logged in successfully!",
      "data": {
        "token": token,
        "tag": userTag,
        "email": email,
        "username": user[1]
      }
    }))
  return(jsonify({
    "status": 400,
    "message": "Invalid password! Please provide the correct password."
  }))

@app.route("/genie/accounts/logout", methods=['post'])
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

@app.route('/genie/app/history', methods=['post', 'put'])
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
    if "limit" in request.form:
      limit = int(request.form['limit'])
      cursor.execute("SELECT * FROM history WHERE tag = ? ORDER BY id DESC LIMIT ?", (session['tag'], limit))
    else:
      cursor.execute("SELECT * FROM history WHERE tag = ? ORDER BY id DESC", (session['tag'],))
    history = cursor.fetchall()
    return(jsonify({
      "status": 200,
      "history": history
    }))
@app.route("/genie/app/history/remove", methods=['delete'])
def removeHistory():
  functions = VoxGenie(sqliteDriver.connect(), session)
  audio = request.form['audio']
  return jsonify(functions.History_remove(audio, request))

@app.route("/genie/app/voice", methods=['get', 'post'])
def voiceInference():
  functions = VoxGenie(sqliteDriver.connect(), session)
  if functions.validateSession(session, request)['status'] != 200:
    return(jsonify({
      "status": 401,
      "message": "Unauthorized! Please login to continue."
    }))
  prompt = request.form['prompt']
  speaker = False
  voice = False
  if "speaker" in request.form:
    speaker = request.form['speaker']
  if "voice" in request.form:
    voice = request.form['voice']

  if speaker != False:
    supportedSpeakers = ['Ana Florence']
    if speaker not in supportedSpeakers:
      return(jsonify({
        "status": 400,
        "message": "There is no speaker with this name. Please provide a valid speaker name."
      }))
  if voice != False:
    pass # to be implemented (check if voice id exists)

  if speaker != False:
    # check if output directory exists
    if not os.path.exists("./output/"):
      os.makedirs("./output/")
    outputFileName = str(random.randint(1000000000, 9999999999)) + ".wav"
    output = "./output/" + outputFileName
    print("\n\nGenerating voice...")
    try:
      tts.tts_to_file(
        text=prompt,
        file_path=output,
        speaker=speaker,
        language="en",
        split_sentences=True
      )
      print("Voice generated successfully!")
      functions.History_add(prompt, outputFileName, speaker, voice, request)
      torch.cuda.empty_cache()
      return {
        "status": 200,
        "message": "Voice generation completed!",
        "data": {
          "prompt": prompt,
          "speaker": speaker,
          "voice": voice,
          "output": outputFileName
        }
      }
    except Exception as e: 
        print(e)
        return(jsonify({
          "status": 400,
          "message": "An error occurred while generating the voice!"
        }))

@app.route("/genie/speakers/audio/sample", methods=['get'])
def anaFlorence():
  def stream():
    with open("./samples/output.wav", 'rb') as fwav:
      data = fwav.read(1024)
      while data:
        yield data
        data = fwav.read(1024)
  return Response(stream(), mimetype="audio/wav")

@app.route("/genie/xtts/train", methods=['post'])
def train():
  functions = VoxGenie(sqliteDriver.connect(), session)
  if functions.validateSession(session, request)['status'] != 200:
    return(jsonify({
      "status": 401,
      "message": "Unauthorized! Please login to continue."
    }))
  if "voiceLabel" not in request.form and "files" not in request.files:
    return(jsonify({
      "status": 400,
      "message": "Please provide a voice label and the training files."
    }))
    
  voiceLabel = request.form['voiceLabel']
  # get files from the request form (files is an array of files)
  files = request.files.getlist("files")
  # check if output directory exists
  if not os.path.exists("./trained-voices/"):
    os.makedirs("./trained-voices/")
  # upload files to the output directory with random names
  uploadedFiles = []
  for file in files:
    filename = str(random.randint(1000000000, 9999999999)) + ".wav"
    file.save(os.path.join("./trained-voices/", filename))
    uploadedFiles.append(filename)
  # train the model
  return jsonify(functions.Voice_add(voiceLabel, uploadedFiles))

@app.route("/genie/xtts/voices", methods=['get'])
def getVoices():
  functions = VoxGenie(sqliteDriver.connect(), session)
  if functions.validateSession(session, request)['status'] != 200:
    return(jsonify({
      "status": 401,
      "message": "Unauthorized! Please login to continue."
    }))
  return jsonify(functions.Voice_get())   

@app.route("/genie/outputs/<path:filename>", methods=['get'])
def download(filename):
  # check if file exists in the output directory
  if not os.path.exists("./output/" + filename):
    return(jsonify({
      "status": 404,
      "message": "File not found!"
    }))
  return send_from_directory("./output/", filename, as_attachment=True)

@app.route("/genie/tvo/<path:filename>", methods = ['get'])
def preview(filename):
  if not os.path.exists("./trained-voices/" + filename):
    return(jsonify({
      "status": 404,
      "message": "File not found!"
    }))
  return send_from_directory("./trained-voices/", filename, as_attachment=False)

@app.route("/genie/xtts/voice/remove", methods=['delete'])
def removeVoice():
  functions = VoxGenie(sqliteDriver.connect(), session)
  voice = request.form['voice']

def sysUpdateBGTask():
  functions = VoxGenie(sqliteDriver.connect(), session)

connectionCount = 0
bgProcessStarted = False
_tmp = VoxGenie(sqliteDriver.connect(), session)

def stream_system_usage():
    global _tmp
    global connectionCount
    global bgProcessStarted
    if bgProcessStarted == True: 
      return
    if(_tmp.SYSTEM_USAGE_PROCESS_STARTED == False):
      _tmp.start_sys_usage_update()
    whileRetries = 0
    while True:
        if(connectionCount == 0):
          whileRetries += 1
          print(f"No active connections! Retry count: {whileRetries}")
          if whileRetries > 3:
            bgProcessStarted = False
            _tmp.stop_sys_usage_update()
            break
        else:
          if whileRetries > 0:
            print("Connection found! Resuming system usage stream.")
            whileRetries = 0
        bgProcessStarted = True
        usage_data = _tmp.SYSTEM_USAGE
        if(usage_data is not None):
          socketio.emit('system_usage', usage_data)
        socketio.sleep(2)


@socketio.on('connect')
def handle_connect():
    global connectionCount
    connectionCount += 1
    print('-' * 25)
    print(f"Client has connected: {request.sid}")
    socketio.emit("connected", {"data": f"id: {request.sid} is connected"})
    print('-' * 25)
    # Start a thread to stream the data
    socketio.start_background_task(target=stream_system_usage)

@socketio.on('disconnect')
def handle_disconnect():
    global connectionCount
    connectionCount -= 1
    print('-' * 25)
    print("User disconnected")
    socketio.emit("disconnect", f"User {request.sid} disconnected")
    print('-' * 25)


if(__name__ == "__main__"):
  # app.run(debug=False)
  os.system("clear")
  print(f"Server running on port 5000\nENDPOINT: http://localhost:5000")
  socketio.run(app, debug=False)