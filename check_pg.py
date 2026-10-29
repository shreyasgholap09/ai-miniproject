import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="shreyas",
        dbname="lost_and_found_db"
    )
    cur = conn.cursor()
    cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")
    tables = [t[0] for t in cur.fetchall()]
    print("[SUCCESS] PostgreSQL database 'lost_and_found_db' is connected!")
    print(f"[SUCCESS] Active tables: {', '.join(tables)}")
    conn.close()
except Exception as e:
    print(f"[ERROR] Database connection failed: {e}")
