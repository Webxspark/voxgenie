import sqlite3
import datetime
def checkAppInteg(conn = None, session = None):
    if conn == None:
        raise Exception("Ping function expects a SQLite3 connection!")
    if session == None:
        raise Exception("Ping function expects a Flask session!")
    # check if app is already installed
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM ping")
        
        # check if user is logged in
        if "token" not in session:
            return {
                "status": 401,
                "message": "Unauthorized! Please login to continue.",
                "action": "__init_login()"
            }
        return {
            "status": 200,
            "message": "pong!"
        }
    except sqlite3.OperationalError:
        return {
            "status": 404,
            "message": "VoxGenie is not installed on this machine. Please accept the EULA to get started with the installation.",
            "action": "__init_req()"
        }

def validateToken(token, conn, request):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM sessions WHERE session = ?", (token,))
    session = cursor.fetchone()
    # get expires, user_agent, ip, browser
    if session:
        user_agent = session[3]
        ip = session[4]
        browser = session[5]

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
        
        if mismatches >2:
            # delete session
            cursor.execute("DELETE FROM sessions WHERE session = ?", (token,))
            conn.commit()
            
            session.clear()
            return {
                "status": 401,
                "message": "Session has expired! Please login to continue."
            }
        return {
            "status": 200,
            "message": "pong!"
        }
    return {
        "status": 401,
        "message": "Unauthorized! Please login to continue."
    }
