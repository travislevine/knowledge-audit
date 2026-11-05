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
    { n: 7, slug: "week-07", status: "planned", title: "Databases and SQL",
      summary: "Relational modelling, SQL from joins to aggregates, indexes and query plans, transactions and isolation, NoSQL trade-offs." },
    { n: 8, slug: "week-08", status: "planned", title: "Software engineering practice",
      summary: "Git workflows, testing strategy, CI/CD, containers, cloud basics, observability, and working in a team." },
    { n: 9, slug: "week-09", status: "planned", title: "System design and distributed systems",
      summary: "Scaling, caching, load balancing, queues, replication and sharding, consistency, idempotency, and designing for failure." },
    { n: 10, slug: "week-10", status: "planned", title: "The business of software, and review",
      summary: "How software companies work: roles, SLOs, incidents, technical debt, cost, build vs buy. Then a review week targeting your weakest areas." }
  ]
};
