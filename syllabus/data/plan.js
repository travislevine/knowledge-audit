/* The syllabus plan: weeks, lessons, objectives and projects.
   Week pages, the overview page and the progress summary all read from this. */
window.SYLLABUS = {
  id: "syllabus",
  title: "CS Breadth Syllabus",
  hoursPerWeek: 10,
  weeks: [
    {
      n: 1, slug: "week-01", status: "ready",
      title: "How computers represent and run things",
      summary: "Bits, number bases, negative numbers, floating point, text encoding, and what the CPU actually does when your code runs.",
      objectives: [
        { id: "w1-o1", text: "Convert between binary, decimal and hexadecimal, and reason with powers of two" },
        { id: "w1-o2", text: "Explain two's complement and predict integer overflow" },
        { id: "w1-o3", text: "Explain why floating point is approximate and how to handle money and comparisons" },
        { id: "w1-o4", text: "Explain Unicode, code points and UTF-8, and diagnose garbled text" },
        { id: "w1-o5", text: "Describe the fetch-decode-execute cycle and the memory hierarchy" },
        { id: "w1-o6", text: "Explain compiling, interpreting, bytecode and JIT compilation" }
      ],
      lessons: [
        { id: "w1-l1", title: "Bits, bytes and number bases", minutes: 45 },
        { id: "w1-l2", title: "Negative numbers and overflow", minutes: 40 },
        { id: "w1-l3", title: "Floating point", minutes: 45 },
        { id: "w1-l4", title: "Text, Unicode and UTF-8", minutes: 40 },
        { id: "w1-l5", title: "Inside the CPU", minutes: 50 },
        { id: "w1-l6", title: "From source code to running program", minutes: 40 }
      ],
      checkpoints: 14,
      project: { title: "bitkit: number and text encodings from scratch", path: "syllabus/projects/week-01-bitkit" },
      quiz: "week-01-quiz",
      quizQuestions: 15
    },
    {
      n: 2, slug: "week-02", status: "ready",
      title: "Programming fundamentals and data structures",
      summary: "How values and references behave, recursion and the call stack, Big-O, and the core data structures behind every program.",
      objectives: [
        { id: "w2-o1", text: "Predict how values, references and mutation behave, including closures and scope" },
        { id: "w2-o2", text: "Write and trace recursive functions, and explain the call stack" },
        { id: "w2-o3", text: "Find the Big-O of code and compare growth rates" },
        { id: "w2-o4", text: "Explain dynamic arrays and linked lists, including amortized cost" },
        { id: "w2-o5", text: "Explain how hash tables work: hashing, collisions, load factor and resizing" },
        { id: "w2-o6", text: "Choose between stacks, queues, trees, heaps and hash maps for a problem" }
      ],
      lessons: [
        { id: "w2-l1", title: "Values, references, scope and closures", minutes: 45 },
        { id: "w2-l2", title: "Recursion and the call stack", minutes: 40 },
        { id: "w2-l3", title: "Big-O: how code scales", minutes: 45 },
        { id: "w2-l4", title: "Arrays and linked lists", minutes: 40 },
        { id: "w2-l5", title: "Hash tables", minutes: 45 },
        { id: "w2-l6", title: "Stacks, queues, trees and heaps", minutes: 50 }
      ],
      checkpoints: 14,
      project: { title: "Build your own data structures", path: "syllabus/projects/week-02-structures" },
      quiz: "week-02-quiz",
      quizQuestions: 15
    },
    {
      n: 3, slug: "week-03", status: "ready",
      title: "Algorithms",
      summary: "Binary search, sorting, graph traversal, shortest paths, and the main ways to design algorithms: divide and conquer, greedy and dynamic programming.",
      objectives: [
        { id: "w3-o1", text: "Implement binary search correctly using loop invariants" },
        { id: "w3-o2", text: "Explain insertion sort, merge sort and quicksort, their costs and stability" },
        { id: "w3-o3", text: "Represent graphs and choose between BFS and DFS" },
        { id: "w3-o4", text: "Find shortest paths with Dijkstra's algorithm and order tasks with topological sort" },
        { id: "w3-o5", text: "Recognize when to use divide and conquer, greedy or dynamic programming" }
      ],
      lessons: [
        { id: "w3-l1", title: "Binary search and invariants", minutes: 40 },
        { id: "w3-l2", title: "Sorting", minutes: 55 },
        { id: "w3-l3", title: "Graphs, BFS and DFS", minutes: 50 },
        { id: "w3-l4", title: "Shortest paths and dependency order", minutes: 45 },
        { id: "w3-l5", title: "Algorithm design: divide and conquer, greedy, dynamic programming", minutes: 60 }
      ],
      checkpoints: 13,
      project: { title: "Route planner: search, sort and shortest paths", path: "syllabus/projects/week-03-routes" },
      quiz: "week-03-quiz",
      quizQuestions: 15
    },
    {
      n: 4, slug: "week-04", status: "ready",
      title: "Operating systems and concurrency",
      summary: "What the kernel does, processes and scheduling, virtual memory, files and the shell, threads and race conditions, locks, and deadlock.",
      objectives: [
        { id: "w4-o1", text: "Explain what the kernel does, system calls, and how processes are created and managed" },
        { id: "w4-o2", text: "Explain how a scheduler shares the CPU, and the trade-offs between scheduling policies" },
        { id: "w4-o3", text: "Explain virtual memory, paging, page faults and the stack and heap" },
        { id: "w4-o4", text: "Use file descriptors, pipes, redirection, permissions and exit codes" },
        { id: "w4-o5", text: "Recognize race conditions and fix them with locks" },
        { id: "w4-o6", text: "Coordinate threads with condition variables and avoid deadlock" }
      ],
      lessons: [
        { id: "w4-l1", title: "What an operating system does", minutes: 45 },
        { id: "w4-l2", title: "Scheduling: sharing the CPU", minutes: 40 },
        { id: "w4-l3", title: "Memory: virtual memory and paging", minutes: 50 },
        { id: "w4-l4", title: "Files, the shell and permissions", minutes: 40 },
        { id: "w4-l5", title: "Threads and race conditions", minutes: 50 },
        { id: "w4-l6", title: "Coordination and deadlock", minutes: 50 }
      ],
      checkpoints: 14,
      project: { title: "Job runner: threads, locks and processes", path: "syllabus/projects/week-04-jobrunner" },
      quiz: "week-04-quiz",
      quizQuestions: 15
    },
    {
      n: 5, slug: "week-05", status: "ready",
      title: "Networking",
      summary: "The layer model, IP addresses and subnets, TCP and UDP, DNS, NAT and the path a packet takes, sockets and network debugging.",
      objectives: [
        { id: "w5-o1", text: "Explain the layer model and what encapsulation adds at each layer" },
        { id: "w5-o2", text: "Work with IPv4 addresses, CIDR, subnet masks and routing tables" },
        { id: "w5-o3", text: "Explain how TCP gives reliable ordered delivery, and when UDP is the better choice" },
        { id: "w5-o4", text: "Explain how DNS resolves a name, and read DNS records and TTLs" },
        { id: "w5-o5", text: "Explain NAT, DHCP, ARP and firewalls, and trace the path of a packet" },
        { id: "w5-o6", text: "Write socket code that frames messages correctly, and debug connections with standard tools" }
      ],
      lessons: [
        { id: "w5-l1", title: "Layers and packets", minutes: 40 },
        { id: "w5-l2", title: "IP addresses, subnets and routing", minutes: 50 },
        { id: "w5-l3", title: "TCP and UDP", minutes: 50 },
        { id: "w5-l4", title: "DNS", minutes: 40 },
        { id: "w5-l5", title: "Getting onto the internet: DHCP, ARP, NAT and firewalls", minutes: 40 },
        { id: "w5-l6", title: "Sockets and debugging", minutes: 45 }
      ],
      checkpoints: 14,
      project: { title: "Network toolkit: subnets, a chat server and DNS", path: "syllabus/projects/week-05-nettools" },
      quiz: "week-05-quiz",
      quizQuestions: 15
    },
    {
      n: 6, slug: "week-06", status: "ready",
      title: "The web, cryptography and security",
      summary: "HTTP and browsers, cookies and the same-origin policy, hashing and encryption, public keys and TLS, common web vulnerabilities, and authentication.",
      objectives: [
        { id: "w6-o1", text: "Read and write raw HTTP requests and responses, including caching and cookies" },
        { id: "w6-o2", text: "Explain the same-origin policy, CORS, and cookie security attributes" },
        { id: "w6-o3", text: "Choose correctly between hashing, MACs, encryption and encoding, and store passwords safely" },
        { id: "w6-o4", text: "Explain public-key cryptography, key exchange, certificates and the TLS handshake" },
        { id: "w6-o5", text: "Find and fix SQL injection, XSS, CSRF, path traversal and broken access control" },
        { id: "w6-o6", text: "Design authentication and sessions securely, and reason about threats" }
      ],
      lessons: [
        { id: "w6-l1", title: "HTTP in depth", minutes: 45 },
        { id: "w6-l2", title: "Browsers, origins and cookies", minutes: 40 },
        { id: "w6-l3", title: "Cryptography building blocks", minutes: 50 },
        { id: "w6-l4", title: "Public keys, certificates and TLS", minutes: 50 },
        { id: "w6-l5", title: "Web vulnerabilities", minutes: 55 },
        { id: "w6-l6", title: "Authentication and secure design", minutes: 40 }
      ],
      checkpoints: 14,
      project: { title: "Break it, then fix it: a vulnerable web app", path: "syllabus/projects/week-06-secure-app" },
      quiz: "week-06-quiz",
      quizQuestions: 15
    },
    {
      n: 7, slug: "week-07", status: "ready",
      title: "Databases and SQL",
      summary: "Relational modelling, SQL from joins to aggregates, indexes and query plans, transactions and isolation, databases in application code, and NoSQL trade-offs.",
      objectives: [
        { id: "w7-o1", text: "Design a normalized relational schema with keys and constraints" },
        { id: "w7-o2", text: "Write SQL with joins, grouping, subqueries and window functions" },
        { id: "w7-o3", text: "Explain how B-tree indexes work, and read a query plan" },
        { id: "w7-o4", text: "Explain ACID, isolation levels and the anomalies each one allows" },
        { id: "w7-o5", text: "Use a database safely from code: parameters, transactions, migrations, avoiding N+1" },
        { id: "w7-o6", text: "Choose between relational, document, key-value, wide-column and graph databases" }
      ],
      lessons: [
        { id: "w7-l1", title: "The relational model and schema design", minutes: 45 },
        { id: "w7-l2", title: "Querying with SQL", minutes: 55 },
        { id: "w7-l3", title: "Indexes and query plans", minutes: 45 },
        { id: "w7-l4", title: "Transactions and isolation", minutes: 50 },
        { id: "w7-l5", title: "Databases in application code", minutes: 40 },
        { id: "w7-l6", title: "Beyond relational: choosing a database", minutes: 40 }
      ],
      checkpoints: 14,
      project: { title: "Library database: queries, indexes and transactions", path: "syllabus/projects/week-07-library" },
      quiz: "week-07-quiz",
      quizQuestions: 15
    },
    {
      n: 8, slug: "week-08", status: "ready",
      title: "Software engineering practice",
      summary: "Git in depth, testing strategy, code review and refactoring, CI/CD and safe releases, containers and the cloud, and observability.",
      objectives: [
        { id: "w8-o1", text: "Use Git confidently: commits, branches, merging, rebasing and recovering from mistakes" },
        { id: "w8-o2", text: "Design a test suite: what to test at which level, test doubles, and judging test quality" },
        { id: "w8-o3", text: "Write readable code, refactor safely, and give and receive useful code review" },
        { id: "w8-o4", text: "Explain CI/CD pipelines and choose a safe release strategy" },
        { id: "w8-o5", text: "Explain containers, images and orchestration, and the main cloud service models" },
        { id: "w8-o6", text: "Instrument a service with logs, metrics and traces, and respond to incidents" }
      ],
      lessons: [
        { id: "w8-l1", title: "Git in depth", minutes: 45 },
        { id: "w8-l2", title: "Testing strategy", minutes: 50 },
        { id: "w8-l3", title: "Code quality, review and refactoring", minutes: 40 },
        { id: "w8-l4", title: "CI/CD and releasing safely", minutes: 45 },
        { id: "w8-l5", title: "Containers and the cloud", minutes: 50 },
        { id: "w8-l6", title: "Observability and incidents", minutes: 45 }
      ],
      checkpoints: 14,
      project: { title: "Ship it: tests that catch bugs, and production-ready helpers", path: "syllabus/projects/week-08-shipit" },
      quiz: "week-08-quiz",
      quizQuestions: 15
    },
    {
      n: 9, slug: "week-09", status: "ready",
      title: "System design and distributed systems",
      summary: "Scaling, load balancing, caching, queues, replication and sharding, consistency and failure handling, and designing a system end to end.",
      objectives: [
        { id: "w9-o1", text: "Scale a web application horizontally and estimate capacity with back-of-envelope numbers" },
        { id: "w9-o2", text: "Design a caching layer and handle invalidation, eviction and stampedes" },
        { id: "w9-o3", text: "Use queues for asynchronous work with at-least-once delivery and idempotent consumers" },
        { id: "w9-o4", text: "Explain replication, partitioning and consistent hashing, and their trade-offs" },
        { id: "w9-o5", text: "Design for failure with timeouts, retries, backoff, circuit breakers and rate limits" },
        { id: "w9-o6", text: "Work through a system design from requirements to bottlenecks" }
      ],
      lessons: [
        { id: "w9-l1", title: "Scaling a web application", minutes: 45 },
        { id: "w9-l2", title: "Caching", minutes: 45 },
        { id: "w9-l3", title: "Queues and asynchronous work", minutes: 40 },
        { id: "w9-l4", title: "Replication and partitioning", minutes: 50 },
        { id: "w9-l5", title: "Consistency, failure and resilience", minutes: 50 },
        { id: "w9-l6", title: "Designing a system end to end", minutes: 45 }
      ],
      checkpoints: 14,
      project: { title: "Distributed systems toolkit", path: "syllabus/projects/week-09-distkit" },
      quiz: "week-09-quiz",
      quizQuestions: 15
    },
    {
      n: 10, slug: "week-10", status: "ready",
      title: "The business of software, and review",
      summary: "How software teams plan and ship, reliability as a business decision, technical debt and architecture choices, metrics and cost, privacy and licensing, then a review of the whole syllabus.",
      objectives: [
        { id: "w10-o1", text: "Explain how product teams plan and deliver work, and the roles involved" },
        { id: "w10-o2", text: "Use SLOs and error budgets to balance reliability against speed, and run an incident review" },
        { id: "w10-o3", text: "Reason about technical debt, build-versus-buy and architecture decisions, and record them" },
        { id: "w10-o4", text: "Measure delivery with DORA metrics, avoid misleading metrics, and reason about cloud cost" },
        { id: "w10-o5", text: "Apply privacy, compliance and open-source licensing basics" },
        { id: "w10-o6", text: "Trace one request through every layer covered in this syllabus" }
      ],
      lessons: [
        { id: "w10-l1", title: "How software teams work", minutes: 40 },
        { id: "w10-l2", title: "Reliability as a business decision", minutes: 45 },
        { id: "w10-l3", title: "Technical debt and architecture decisions", minutes: 45 },
        { id: "w10-l4", title: "Measuring engineering and the cost of software", minutes: 40 },
        { id: "w10-l5", title: "Privacy, compliance and licensing", minutes: 35 },
        { id: "w10-l6", title: "Review: one request through the whole stack", minutes: 50 }
      ],
      checkpoints: 14,
      project: { title: "Capstone: a production-style URL shortener", path: "syllabus/projects/week-10-capstone" },
      quiz: "week-10-quiz",
      quizQuestions: 15
    }
  ]
};
