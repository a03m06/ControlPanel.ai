from database import get_connection


def main():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT NOW();")
            result = cur.fetchone()

    print("Database connection successful!")
    print("Database time:", result[0])


if __name__ == "__main__":
    main()