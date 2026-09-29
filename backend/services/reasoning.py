import os

from openai import OpenAI

from backend.services.memory import recall_memory


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

MODEL = os.getenv("OPENAI_MODEL", "gpt-5.6-luna")


# ---------------------------------------------------------
# RELEVANCE RANKING
# ---------------------------------------------------------

def relevance_score(memory_text, problem, current_context):
    """
    Rank a Hindsight memory according to how relevant it is
    to the current engineering investigation.

    Hindsight retrieves candidate memories.
    RECALL then selects the memories that actually matter.
    """

    text = memory_text.lower()

    query_text = f"{problem} {current_context}".lower()

    score = 0

    # -----------------------------------------------------
    # 1. General keyword overlap
    # -----------------------------------------------------

    keywords = set(
        word.strip(".,:;()[]{}\"'")
        for word in query_text.split()
        if len(word.strip(".,:;()[]{}\"'")) > 3
    )

    for keyword in keywords:
        if keyword in text:
            score += 1

    # -----------------------------------------------------
    # 2. Strong engineering concepts
    # -----------------------------------------------------

    important_phrases = [
        "payment api",
        "payment service",
        "connection pool",
        "pool exhaustion",
        "database connection",
        "database",
        "latency",
        "replicas",
        "scaling",
        "postgresql",
        "mongodb",
        "transactional consistency",
        "analytics service",
        "analytical workloads",
    ]

    for phrase in important_phrases:

        if phrase in query_text and phrase in text:
            score += 4

    return score


# ---------------------------------------------------------
# CURATE HINDSIGHT MEMORIES
# ---------------------------------------------------------

def get_relevant_memories(memories, problem, current_context):
    """
    Convert Hindsight's large recall result into a small,
    useful evidence set for the current investigation.
    """

    scored_memories = []

    for memory in memories:

        score = relevance_score(
            memory.text,
            problem,
            current_context
        )

        if score > 0:

            scored_memories.append(
                (score, memory)
            )

    # Highest relevance first
    scored_memories.sort(
        key=lambda item: item[0],
        reverse=True
    )

    # Keep only the strongest memories
    top_memories = scored_memories[:5]

    return [
        memory
        for score, memory in top_memories
    ]


# ---------------------------------------------------------
# LLM RECOMMENDATION
# ---------------------------------------------------------

def generate_llm_recommendation(
    problem,
    current_context,
    evidence,
    fallback_recommendation
):
    """
    Use the LLM to synthesize historical Hindsight evidence
    with the current engineering context.

    The fallback recommendation protects the demo if the
    LLM is unavailable.
    """

    if not os.getenv("OPENAI_API_KEY"):
        return fallback_recommendation

    evidence_text = "\n\n".join(
        f"- {item}" for item in evidence[:5]
    )

    prompt = f"""
You are RECALL, an AI engineering agent with persistent
organizational memory.

Your job is to help engineers make decisions using historical
engineering experience without blindly copying old decisions.

CURRENT PROBLEM:
{problem}

CURRENT CONTEXT:
{current_context}

RELEVANT HISTORICAL EXPERIENCE FROM HINDSIGHT:
{evidence_text}

BASELINE ENGINEERING RECOMMENDATION:
{fallback_recommendation}

Instructions:

1. Use historical evidence as experience, not absolute truth.
2. Compare the historical situation with the current context.
3. Identify which historical lessons are actually relevant.
4. Ignore unrelated historical memories.
5. If current constraints differ, explicitly explain why an old
   decision should not be copied directly.
6. Do not invent incidents, metrics, architecture decisions,
   or facts that are not present in the evidence.
7. Give a concise engineering recommendation.
8. Mention the most relevant historical lesson.
9. Keep the answer practical and actionable.

Return only the recommendation in 2-4 short paragraphs.
"""

    try:

        response = client.responses.create(
            model=MODEL,
            input=prompt
        )

        return response.output_text.strip()

    except Exception as error:

        print(
            f"LLM unavailable, using fallback: {error}"
        )

        return fallback_recommendation


# ---------------------------------------------------------
# MAIN REASONING FLOW
# ---------------------------------------------------------

def analyze_incident(
    problem,
    current_context=""
):

    # -----------------------------------------------------
    # 1. Ask Hindsight for historical experience
    # -----------------------------------------------------

    query = f"""
Problem:
{problem}

Current Context:
{current_context}

Find relevant historical engineering decisions,
incidents, outcomes, failed approaches, and lessons.
"""

    memories = recall_memory(query)

    # -----------------------------------------------------
    # 2. No memories found
    # -----------------------------------------------------

    if not memories:

        return {
            "problem": problem,
            "current_context": current_context,
            "recommendation": (
                "No relevant historical experience found."
            ),
            "evidence": []
        }

    # -----------------------------------------------------
    # 3. Rank and curate memories
    # -----------------------------------------------------

    relevant_memories = get_relevant_memories(
        memories,
        problem,
        current_context
    )

    evidence = [
        memory.text
        for memory in relevant_memories
    ]

    # -----------------------------------------------------
    # 4. If ranking produced nothing useful
    # -----------------------------------------------------

    if not evidence:

        return {
            "problem": problem,
            "current_context": current_context,
            "recommendation": (
                "Historical memories were found, but none "
                "were sufficiently relevant to this investigation."
            ),
            "evidence": []
        }

    # -----------------------------------------------------
    # 5. Combine evidence for deterministic reasoning
    # -----------------------------------------------------

    combined_evidence = " ".join(
        evidence
    ).lower()

    problem_lower = problem.lower()

    context_lower = current_context.lower()

    # -----------------------------------------------------
    # 6. Detect Analytics Context Override
    # -----------------------------------------------------

    analytics_scenario = (
        "analytics" in problem_lower
        or "analytics" in context_lower
    )

    different_from_payment = (
        "no transactional consistency"
        in context_lower

        or
        "does not require transactional consistency"
        in context_lower

        or
        "analytical workloads"
        in context_lower
    )

    if (
        analytics_scenario
        and
        different_from_payment
    ):

        fallback_recommendation = (
            "Do not directly reuse the Payment Service "
            "architecture decision for the Analytics Service. "
            "Historical memory shows that PostgreSQL was selected "
            "for Payment because strong transactional consistency "
            "and reliable transactional guarantees were required. "
            "The current Analytics Service has different "
            "requirements and does not require transactional "
            "consistency. Evaluate its database architecture "
            "based on its own workload, query patterns, data volume, "
            "and analytical requirements rather than copying the "
            "Payment Service design."
        )

    # -----------------------------------------------------
    # 7. Payment API Latency Scenario
    # -----------------------------------------------------

    elif (
        "payment" in problem_lower

        and
        "latency" in problem_lower

        and
        "connection pool" in combined_evidence

        and
        "exhaustion" in combined_evidence
    ):

        scaling_failed = (
            "replicas" in combined_evidence

            and
            (
                "did not improve"
                in combined_evidence

                or
                "unsuccessful"
                in combined_evidence
            )
        )

        pool_increase_worked = (
            "100 to 250"
            in combined_evidence

            or
            "increasing the database connection pool"
            in combined_evidence
        )

        if (
            scaling_failed
            and
            pool_increase_worked
        ):

            fallback_recommendation = (
                "Do not immediately increase Payment Service "
                "replicas. A similar latency incident occurred "
                "previously, and scaling replicas did not improve "
                "the problem. The root cause was database connection "
                "pool exhaustion. Increasing the database connection "
                "pool from 100 to 250 resolved the incident. "
                "Check current database connection pool utilization "
                "first."
            )

        else:

            fallback_recommendation = (
                "Relevant Payment Service history was found. "
                "Check database connection pool utilization and "
                "investigate database performance before scaling "
                "application replicas."
            )

    # -----------------------------------------------------
    # 8. Generic Historical Reasoning
    # -----------------------------------------------------

    else:

        fallback_recommendation = (
            "Relevant historical engineering experience was found. "
            "Review the recalled evidence against the current "
            "context before taking action. Previous decisions "
            "should not be copied blindly when current requirements "
            "differ."
        )

    # -----------------------------------------------------
    # 9. LLM synthesis
    # -----------------------------------------------------

    recommendation = generate_llm_recommendation(
        problem=problem,
        current_context=current_context,
        evidence=evidence,
        fallback_recommendation=fallback_recommendation
    )

    # -----------------------------------------------------
    # 10. Return curated evidence to frontend
    # -----------------------------------------------------

    return {
        "problem": problem,
        "current_context": current_context,
        "recommendation": recommendation,
        "evidence": evidence
    }