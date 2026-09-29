from services.reasoning import analyze_incident


problem = """
Analytics Service needs a database.

Should we use PostgreSQL because NovaPay used PostgreSQL
for the Payment Service?
"""

current_context = """
This is the Analytics Service.

It is read-heavy, uses a flexible schema,
and strong transactional consistency is not required.
"""

result = analyze_incident(problem, current_context)

print("\n========================================")
print("       RECALL CONTEXT OVERRIDE")
print("========================================")

print("\nPROBLEM:")
print(result["problem"])

print("\nCURRENT CONTEXT:")
print(result["current_context"])

print("\nRECOMMENDATION:")
print(result["recommendation"])

print("\nHISTORICAL EVIDENCE:")

for i, evidence in enumerate(result["evidence"], 1):
    print(f"\n--- Evidence {i} ---")
    print(evidence)

print("\n========================================")