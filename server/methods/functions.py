import json
import os
import threading
import ctypes
class VoxGenie:
    
    SYSTEM_USAGE = None
    SYSTEM_USAGE_THREAD = None
    SYSTEM_USAGE_PROCESS_STARTED = False

    def __init__(self, conn = None, session = None) -> None:
        if conn is None:
            raise ValueError("A SQLITE connection is required to initialize VoxGenie functions!")
        if session is None:
            raise ValueError("A session object is required to initialize VoxGenie functions!")
        self.conn = conn
        self.session = session
    def validateSession(self, session, request = None) -> dict:
        if 'token' not in session and 'tag' not in session:
            return {
                "status": 400,
                "message": "Oops! You are not logged in!",
                "action": "__redir(login)"
            }
        if request is None:
            raise ValueError("A `request` object is required to validate the session!")
        
        token = session['token']
        # authenticate token
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM sessions WHERE session = ?", (token,))
        currentSession = cursor.fetchone()
        if currentSession:
            user_agent = currentSession[3]
            ip = currentSession[4]
            browser = currentSession[5]
            # get user agent and ip address, and browser
            cUser_agent = request.user_agent
            cIp = request.remote_addr
            cBrowser = cUser_agent.browser
            mismatches = 0
            if cUser_agent != user_agent:
                mismatches += 1
            if cIp != ip:
                mismatches += 1
            if cBrowser != browser:
                mismatches += 1
            if mismatches > 2:
                # delete session
                cursor.execute("DELETE FROM sessions WHERE session = ?", (token,))
                self.conn.commit()
                session.clear()
                return {
                    "status": 401,
                    "message": "Session has expired! Please login to continue."
                }
            return {
                "status": 200,
                "message": "session authenticated!"
            }
    # history functions (add, remove, get)
    def History_add(self, prompt, output, speaker = False, voice = False, request = None):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        if speaker == False and voice == False:
            return {
                "status": 400,
                "message": "Either speaker or voice must be provided!"
            }
        cursor = self.conn.cursor()
        token = self.session['token']
        tag = self.session['tag']
        pushObj = {
            "prompt": prompt,
        }
        if speaker != False:
            pushObj['speaker'] = speaker
        if voice != False:
            pushObj['voice'] = voice
        
        json_string = json.dumps(pushObj)
        cursor.execute("INSERT INTO history(tag, prompt, output) VALUES (?, ?, ?)", (tag, json_string, output))
        self.conn.commit()
        return {
            "status": 200,
            "message": "Prompt added to history!"
        }
    def History_remove(self, output, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        token = self.session['token']
        tag = self.session['tag']
        cursor.execute("DELETE FROM history WHERE output = ? AND tag = ?", (output, tag))
        self.conn.commit()
        try:
            # remove file from disk
            os.remove("./output/" + output)
        except Exception as e:
            print(e)
        return {
            "status": 200,
            "message": "Prompt removed from history!"
        }
    def History_get(self, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("SELECT * FROM history WHERE tag = ?", (tag,))
        history = cursor.fetchall()
        return {
            "status": 200,
            "history": history
        }
    
    # voice functions (add, remove, get)
    def Voice_add(self, label: str, files: list):
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("INSERT INTO voices(tag, files, label) VALUES (?, ?, ?)", (tag, json.dumps(files), label))
        self.conn.commit()
        return {
            "status": 200,
            "message": "Voice trained successfully! You can now use it to generate prompts."
        }
    
    def Voice_getAllVoiceFiles(self, id, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("SELECT * FROM voices WHERE id = ? AND tag = ?", (id, tag))
        voice = cursor.fetchone()
        if voice:
            files = json.loads(voice[2])
            # append the path to the files ("trained-voices" directory)
            for i in range(len(files)):
                files[i] = "./trained-voices/" + files[i]
            return {
                "status": 200,
                "files": files,
                "voice": voice[3]
            }
        else:
            return {
                "status": 400,
                "message": "Voice not found!"
            }

    def Voice_remove(self, id: any, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        tag = self.session['tag']
        # get voice files
        cursor.execute("SELECT * FROM voices WHERE id = ? AND tag = ?", (id, tag))
        voice = cursor.fetchone()
        if voice:
            files = json.loads(voice[2])
            for file in files:
                try:
                    os.remove("./trained-voices/" + file)
                except Exception as e:
                    print(e)
        else:
            return {
                "status": 400,
                "message": "Voice not found!"
            }
        cursor.execute("DELETE FROM voices WHERE id = ? AND tag = ?", (id, tag))
        self.conn.commit()
        return {
            "status": 200,
            "message": "Voice removed successfully!"
        }
    def Voice_get(self):
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("SELECT * FROM voices WHERE tag = ?", (tag,))
        voices = cursor.fetchall()
        return {
            "status": 200,
            "voices": voices
        }
    
    def Voice_edit(self, id: any, label: str, files: list, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("SELECT * FROM voices WHERE id = ? AND tag = ?", (id, tag))
        voice = cursor.fetchone()
        if voice:
            prev_files = json.loads(voice[2])
            for file in files:
                if file not in prev_files:
                    prev_files.append(file)
            cursor.execute("UPDATE voices SET files = ?, label = ? WHERE id = ? AND tag = ?", (json.dumps(prev_files), label, id, tag))
            self.conn.commit()
            return True
        else:
            return {
                "status": 400,
                "message": "Voice not found!"
            }
    
    def Voice_sf_remove(self, id: any, file, request):
        if self.validateSession(self.session, request)['status'] != 200:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue."
            }
        cursor = self.conn.cursor()
        tag = self.session['tag']
        cursor.execute("SELECT * FROM voices WHERE id = ? AND tag = ?", (id, tag))
        voice = cursor.fetchone()
        if voice:
            files = json.loads(voice[2])
            if file in files:
                files.remove(file)
                cursor.execute("UPDATE voices SET files = ? WHERE id = ? AND tag = ?", (json.dumps(files), id, tag))
                self.conn.commit()
                # remove file from disk ("trained-voices" directory)
                try:
                    os.remove("./trained-voices/" + file)
                except Exception as e:
                    print(e)

                return {
                    "status": 200,
                    "message": "File removed successfully!"
                }
            else:
                return {
                    "status": 400,
                    "message": "File not found!"
                }
        else:
            return {
                "status": 400,
                "message": "Voice not found!"
            }
    
    # System usage functions
    def get_system_usage(self) -> dict | None:
        print(self.SYSTEM_USAGE)
        return self.SYSTEM_USAGE
    
    def updateSysUsage(self):
        import psutil
        import GPUtil
        import time
        while True:
            # Get CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)
            
            # Get RAM usage
            ram_usage = psutil.virtual_memory()
            ram_total = ram_usage.total / (1024 ** 3)  # Convert bytes to GB
            ram_used = ram_usage.used / (1024 ** 3)  # Convert bytes to GB
            ram_percentage = ram_usage.percent

            # Get GPU usage
            gpus = GPUtil.getGPUs()
            gpu_info = []
            for gpu in gpus:
                gpu_info.append({
                    "GPU Name": gpu.name,
                    "GPU Load": gpu.load * 100,
                    "GPU Free Memory": gpu.memoryFree,
                    "GPU Used Memory": gpu.memoryUsed,
                    "GPU Total Memory": gpu.memoryTotal,
                    "GPU Temperature": gpu.temperature
                })
            self.SYSTEM_USAGE = {
            "cpu_usage": cpu_usage,
            "ram_total": ram_total,
            "ram_used": ram_used,
            "ram_percentage": ram_percentage,
            "gpu_info": gpu_info
            }
            time.sleep(1)
    def start_sys_usage_update(self):
        print("Attempting to start system usage update thread...")
        thread = threading.Thread(target=self.updateSysUsage, daemon=True)
        thread.start()
        print(f"System usage update thread started with ID: {thread.ident}")
        self.SYSTEM_USAGE_THREAD = thread
        self.SYSTEM_USAGE_PROCESS_STARTED = True
    
    def stop_sys_usage_update(self):
        self.SYSTEM_USAGE = None
        print("Attempting to stop system usage update thread...")
        if not self.SYSTEM_USAGE_THREAD.is_alive():
            return
        exc = ctypes.py_object(SystemExit)
        res = ctypes.pythonapi.PyThreadState_SetAsyncExc(ctypes.c_long(self.SYSTEM_USAGE_THREAD.ident), exc)
        if res == 0:
            raise ValueError("Invalid thread ID")
        elif res > 1:
            ctypes.pythonapi.PyThreadState_SetAsyncExc(self.SYSTEM_USAGE_THREAD.ident, None)
            raise SystemError("PyThreadState_SetAsyncExc failed")
        self.SYSTEM_USAGE_THREAD = None
        self.SYSTEM_USAGE_PROCESS_STARTED = False
        self.SYSTEM_USAGE = None
        print("System usage update thread stopped!")
