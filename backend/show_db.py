import sqlite3
import sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('app/pets.db')
cursor = conn.cursor()

print("=== 表结构 ===")
cursor.execute("PRAGMA table_info(pets)")
for col in cursor.fetchall():
    print(f"{col[1]}: {col[2]}")

print("\n=== 所有数据 ===")
cursor.execute("SELECT * FROM pets")
for row in cursor.fetchall():
    print(row)

conn.close()
