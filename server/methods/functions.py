import json
import os
class VoxGenie:
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
    def Voice_remove(self, id: any):
        cursor = self.conn.cursor()
        tag = self.session['tag']
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
    