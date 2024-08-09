def installApp(conn):
    try:
        cursor = conn.cursor()
        with open("./db/db.sql", 'r') as sql_file:
            sql_script = sql_file.read()
        cursor.executescript(sql_script)
        conn.commit()
        conn.close()
        return {
            "status": 200,
            "message": "App installed successfully!"
        }
    except Exception as e:
        print("Error: \n", e, "\n")
        return {
            "status": 500,
            "message": "Internal Server Error: Can't initiate app installation at the moment!"
        }