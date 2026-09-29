from services.memory import create_memory_bank, store_memory


print("Creating NovaPay engineering memory bank...")
create_memory_bank()

memories = [

    # =========================
    # ARCHITECTURE DECISIONS
    # =========================

    (
        """
        NovaPay selected PostgreSQL for the Payment Service.

        Reason:
        Payment transactions require strong consistency and reliable
        transactional guarantees.

        MongoDB was evaluated but rejected for this service because
        transactional integrity was the primary requirement.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay selected Redis for caching frequently accessed user
        and payment metadata.

        Reason:
        The data is read frequently and can tolerate short periods
        of cache staleness.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay chose asynchronous messaging between Payment Service
        and Notification Service.

        Reason:
        Payment completion should not depend on notification delivery
        latency.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay introduced an API gateway in front of internal services.

        Reason:
        Centralized authentication, rate limiting, request tracing,
        and routing were easier to maintain at the gateway layer.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay decided to keep the Order Service database separate
        from the Payment Service database.

        Reason:
        Each service should own its transactional data and avoid
        tight database coupling.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay selected object storage for large analytics exports.

        Reason:
        Large generated reports did not need to be stored in the
        transactional database.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay adopted structured JSON logging across backend services.

        Reason:
        Consistent logs made searching, correlation, and automated
        incident analysis easier.
        """,
        "Architecture Decision"
    ),

    (
        """
        NovaPay added correlation IDs to requests crossing services.

        Reason:
        Distributed requests were difficult to trace without a shared
        identifier across service logs.
        """,
        "Architecture Decision"
    ),

    # =========================
    # PRODUCTION INCIDENTS
    # =========================

    (
        """
        Incident: Payment API experienced severe latency.

        The team initially increased Payment Service replicas,
        but latency did not improve.

        Investigation identified database connection pool exhaustion
        as the root cause.

        The database connection pool was increased from 100 to 250,
        which resolved the incident.
        """,
        "Production Incident"
    ),

    (
        """
        Incident: Notification delivery was delayed.

        Investigation showed that Notification Service was processing
        messages synchronously and a slow external provider was
        blocking workers.

        The team introduced asynchronous processing and retry queues.
        """,
        "Production Incident"
    ),

    (
        """
        Incident: Order Service experienced repeated database timeouts.

        Investigation showed that several expensive queries were
        missing appropriate indexes.

        Adding indexes for the highest-frequency queries reduced
        database execution time significantly.
        """,
        "Production Incident"
    ),

    (
        """
        Incident: Analytics dashboard became unavailable during a
        large report generation job.

        The report workload consumed resources on the same system
        serving interactive analytics requests.

        The team moved large report generation to a separate worker.
        """,
        "Production Incident"
    ),

    (
        """
        Incident: API gateway rejected legitimate traffic during
        a promotional event.

        The rate limit was configured using assumptions from normal
        traffic rather than expected promotional traffic.

        The team adjusted limits and added monitoring for rejected
        requests.
        """,
        "Production Incident"
    ),

    (
        """
        Incident: User Service returned stale profile information.

        Investigation showed that an invalidation event was not
        reaching the Redis cache consistently.

        The team added cache invalidation monitoring and retry logic.
        """,
        "Production Incident"
    ),

    # =========================
    # LESSONS LEARNED
    # =========================

    (
        """
        Lesson learned:

        When Payment Service latency increases suddenly, check
        database connection pool utilization before scaling service
        replicas.
        """,
        "Lesson Learned"
    ),

    (
        """
        Lesson learned:

        External notification providers should not block the main
        payment or order processing path.
        """,
        "Lesson Learned"
    ),

    (
        """
        Lesson learned:

        Database performance incidents should be investigated using
        query latency and execution plans before adding application
        replicas.
        """,
        "Lesson Learned"
    ),

    (
        """
        Lesson learned:

        Heavy background workloads should be isolated from
        latency-sensitive user-facing workloads.
        """,
        "Lesson Learned"
    ),

    (
        """
        Lesson learned:

        Rate limits should be based on realistic peak traffic
        scenarios rather than only average production traffic.
        """,
        "Lesson Learned"
    ),

    (
        """
        Lesson learned:

        Cache invalidation should have observable success and failure
        signals instead of being treated as an invisible background
        operation.
        """,
        "Lesson Learned"
    ),

    # =========================
    # ARCHITECTURE REVIEWS
    # =========================

    (
        """
        Architecture review:

        The team reviewed whether PostgreSQL should be replaced by
        MongoDB for the Payment Service.

        Decision:
        Keep PostgreSQL.

        Reason:
        Payment transactions continue to require strong consistency
        and reliable transactional guarantees.
        """,
        "Architecture Review"
    ),

    (
        """
        Architecture review:

        The team evaluated whether Analytics Service should follow
        the same database choice as Payment Service.

        The team concluded that architectural decisions should be
        based on service-specific requirements rather than copied
        from another service.
        """,
        "Architecture Review"
    ),

    (
        """
        Architecture review:

        The team reviewed synchronous versus asynchronous notification
        delivery.

        Asynchronous delivery was retained because notification
        failures should not block core transaction processing.
        """,
        "Architecture Review"
    ),

    (
        """
        Architecture review:

        The team reviewed the API gateway rate-limiting strategy.

        The review concluded that limits should account for both
        normal traffic and known traffic spikes.
        """,
        "Architecture Review"
    ),

    (
        """
        Architecture review:

        The team reviewed database ownership between Order Service
        and Payment Service.

        Separate ownership was retained to reduce coupling and keep
        service boundaries clear.
        """,
        "Architecture Review"
    ),
]


print(f"Seeding {len(memories)} engineering memories...")

for i, (content, context) in enumerate(memories, 1):
    store_memory(content, context=context)
    print(f"[{i}/{len(memories)}] Stored {context}")

print("\n========================================")
print("       NOVAPAY SEED COMPLETE")
print("========================================")
print(f"Total memories stored: {len(memories)}")