import sqlite3

class Sqlite3Driver:
    def __init__(self, database_name: str) -> None:
        self.db = database_name
    
    def connect(self) -> any:
        return sqlite3.connect(self.db)
    
    def disconnect(self, conn):
        return conn.close()
    
    def cursor(self, conn):
        return conn.cursor()