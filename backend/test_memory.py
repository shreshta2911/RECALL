from services.memory import (
    create_memory_bank,
    store_memory,
    recall_memory
)

# --------------------------------------------------
# 1. Create the NovaPay engineering memory bank
# --------------------------------------------------

print("Creating memory bank...")

create_memory_bank()


# --------------------------------------------------
# 2. Store an architecture decision
# --------------------------------------------------

print("Storing architecture decision...")

store_memory(
    """
    NovaPay selected PostgreSQL for the Payment Service.

    The team chose PostgreSQL because payment transactions require
    strong consistency and reliable transactional guarantees.

    MongoDB was evaluated but rejected because PostgreSQL was
    considered a better fit for transactional integrity.
    """,
    context="Architecture Decision"
)


# --------------------------------------------------
# 3. Store a production incident and lesson
# --------------------------------------------------

print("Storing production incident...")

store_memory(
    """
    Incident: NovaPay Payment API experienced severe latency.

    The team initially increased the number of Payment Service
    replicas, but the latency did not improve.

    Investigation showed that the real root cause was database
    connection pool exhaustion.

    The team increased the database connection pool from 100 to 250,
    which resolved the latency problem.

    Lesson learned: For the Payment Service, when latency suddenly
    increases, check database connection pool utilization before
    scaling service replicas.
    """,
    context="Production Incident and Lesson"
)


# --------------------------------------------------
# 4. Recall relevant engineering history
# --------------------------------------------------

print("Recalling engineering memory...")

memories = recall_memory(
    """
    The Payment API has high latency.
    What happened the last time NovaPay had a similar problem,
    what was the root cause, and what fixed it?
    """
)


# --------------------------------------------------
# 5. Display the recalled memories
# --------------------------------------------------

print("\n========================================")
print("        RECALL RESULT")
print("========================================")

print("Number of memories:", len(memories))

for i, memory in enumerate(memories, 1):

    print(f"\n--- MEMORY {i} ---")

    print(memory.text)


print("\n========================================")
print("              DONE")
print("========================================")