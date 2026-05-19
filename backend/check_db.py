import psycopg2
try:
    conn=psycopg2.connect(
        dbname="job_portal",
        user="postgres",
        password="281103",
        host="localhost",
        port="5432"
    )
    cur=conn.cursor()
    cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='jobs_jobquestion';")
    columns=cur.fetchall()
    print("Columns in jobs_jobquestion:")
    for col in columns:
        print(col[0])
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
