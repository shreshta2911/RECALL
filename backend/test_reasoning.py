from services.reasoning import analyze_incident


problem = """
Payment API latency is currently very high.
Should we increase the number of Payment Service replicas?
"""

current_context = """
This is the Payment Service.
Transactions require strong consistency.
"""

result = analyze_incident(problem, current_context)

print("\n========================================")
print("          RECALL REASONING")
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