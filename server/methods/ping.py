import sqlite3
def checkAppInteg(conn = None):
    if conn == None:
        raise Exception("Ping function expects a SQLite3 connection!")
    # check if app is already installed
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM ping")
        conn.close()
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