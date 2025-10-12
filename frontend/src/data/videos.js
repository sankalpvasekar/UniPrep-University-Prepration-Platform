export const videos = [
  // Physics
  { title: "Wave-Particle Duality and de Broglie Wavelength", url: "https://www.youtube.com/watch?v=7kb1VT0J3DE", duration: "1:45:30", views: "890K", instructor: "Dr. Amit Sharma", description: "Comprehensive explanation of wave-particle duality, de Broglie hypothesis, and quantum mechanics fundamentals.", difficulty: "Intermediate", rating: 4.7, topics: ["Quantum Mechanics", "Wave-Particle Duality", "de Broglie"], subject: "physics" },
  { title: "Laser Physics - He-Ne and Ruby Lasers", url: "https://www.youtube.com/watch?v=Xww8DSVpfNk", duration: "2:10:20", views: "650K", instructor: "Prof. Priya Menon", description: "Detailed study of laser construction, working principles, and energy level diagrams.", difficulty: "Advanced", rating: 4.8, topics: ["Lasers", "He-Ne Laser", "Ruby Laser"], subject: "physics" },
  { title: "Hall Effect and Semiconductor Physics", url: "https://www.youtube.com/watch?v=AcRCgyGMpI8", duration: "1:30:15", views: "520K", instructor: "Dr. Rajesh Kumar", description: "Understanding Hall effect, derivation of Hall voltage, and semiconductor applications.", difficulty: "Intermediate", rating: 4.6, topics: ["Hall Effect", "Semiconductors"], subject: "physics" },

  // Chemistry
  { title: "Organic Chemistry Fundamentals", url: "https://www.youtube.com/watch?v=GOFr3BnVwlE", duration: "2:30:45", views: "1.1M", instructor: "Prof. Sneha Desai", description: "Comprehensive coverage of organic chemistry including functional groups and reactions.", difficulty: "Beginner", rating: 4.7, topics: ["Organic Chemistry", "Functional Groups"], subject: "chemistry" },
  { title: "Electrochemistry and Batteries", url: "https://www.youtube.com/watch?v=1Jv4s3YqVnI", duration: "1:50:30", views: "720K", instructor: "Dr. Anil Patil", description: "Understanding electrochemical cells, Nernst equation, and batteries.", difficulty: "Intermediate", rating: 4.8, topics: ["Electrochemistry", "Batteries"], subject: "chemistry" },
  { title: "Chemical Bonding and Molecular Structure", url: "https://www.youtube.com/watch?v=QqjcCvzWwgw", duration: "2:05:20", views: "850K", instructor: "Prof. Meera Iyer", description: "Detailed study of chemical bonding theories and molecular structure.", difficulty: "Intermediate", rating: 4.6, topics: ["Chemical Bonding", "VSEPR"], subject: "chemistry" },

  // Mathematics
  { title: "Calculus - Differentiation and Integration", url: "https://www.youtube.com/watch?v=WUvTyaaNkzM", duration: "3:15:40", views: "1.5M", instructor: "Prof. Ramesh Gupta", description: "Complete guide to calculus covering limits, derivatives, and integration.", difficulty: "Beginner", rating: 4.9, topics: ["Calculus", "Differentiation", "Integration"], subject: "mathematics" },
  { title: "Linear Algebra - Matrices and Vectors", url: "https://www.youtube.com/watch?v=fNk_zzaMoSs", duration: "2:45:30", views: "980K", instructor: "Dr. Kavita Nair", description: "Comprehensive coverage of linear algebra including matrices and eigenvalues.", difficulty: "Intermediate", rating: 4.8, topics: ["Linear Algebra", "Matrices"], subject: "mathematics" },
  { title: "Differential Equations", url: "https://www.youtube.com/watch?v=p_di4Zn4wz4", duration: "2:20:15", views: "720K", instructor: "Prof. Suresh Reddy", description: "Understanding ordinary and partial differential equations.", difficulty: "Advanced", rating: 4.7, topics: ["Differential Equations", "ODE", "PDE"], subject: "mathematics" },

  // Mechanics
  { title: "Engineering Mechanics - Statics and Dynamics", url: "https://www.youtube.com/watch?v=7gf6YpdvVgI", duration: "2:50:30", views: "890K", instructor: "Prof. Vijay Kumar", description: "Comprehensive study of statics, dynamics, and force systems.", difficulty: "Beginner", rating: 4.7, topics: ["Statics", "Dynamics"], subject: "mechanics" },
  { title: "Strength of Materials", url: "https://www.youtube.com/watch?v=BHZALtqAjeM", duration: "2:15:45", views: "650K", instructor: "Dr. Anita Deshmukh", description: "Understanding stress, strain, and bending moments.", difficulty: "Intermediate", rating: 4.8, topics: ["Stress", "Strain"], subject: "mechanics" },

  // Basic Electrical Engg
  { title: "Basic Electrical Engineering - Complete Introduction", url: "https://www.youtube.com/watch?v=mc979OhitAg", duration: "2:45:30", views: "980K", instructor: "Prof. Rajesh Kumar", description: "Comprehensive introduction to basic electrical engineering.", difficulty: "Beginner", rating: 4.7, topics: ["DC Circuits", "Ohm's Law"], subject: "basic-electrical-engg" },
  { title: "AC Circuits and Phasor Analysis", url: "https://www.youtube.com/watch?v=6JL9gN0SzNk", duration: "1:55:20", views: "650K", instructor: "Dr. Priya Sharma", description: "Understanding AC circuits and phasor representation.", difficulty: "Intermediate", rating: 4.6, topics: ["AC Circuits", "Phasors"], subject: "basic-electrical-engg" },
  { title: "Transformers and Machines", url: "https://www.youtube.com/watch?v=UchitHGF4n8", duration: "1:30:15", views: "520K", instructor: "Prof. Amit Patel", description: "Detailed explanation of transformers and electrical machines.", difficulty: "Intermediate", rating: 4.8, topics: ["Transformers", "EMF"], subject: "basic-electrical-engg" },

  // Computer Networks (CN)
  { title: "Computer Networks - Complete Introduction", url: "https://www.youtube.com/watch?v=qiQR5rTSshw", duration: "3:20:45", views: "1.8M", instructor: "Prof. Arun Mehta", description: "Comprehensive introduction to computer networks covering OSI model and TCP/IP.", difficulty: "Beginner", rating: 4.9, topics: ["OSI Model", "TCP/IP"], subject: "cn" },
  { title: "Network Layer Protocols", url: "https://www.youtube.com/watch?v=AhOU2eOpmX0", duration: "2:15:30", views: "920K", instructor: "Dr. Neha Kapoor", description: "Detailed study of network layer protocols including IP addressing.", difficulty: "Intermediate", rating: 4.7, topics: ["IP Addressing", "Subnetting"], subject: "cn" },
  { title: "Transport Layer - TCP and UDP", url: "https://www.youtube.com/watch?v=uwoD5YsGACg", duration: "1:50:20", views: "780K", instructor: "Prof. Sandeep Joshi", description: "Understanding TCP and UDP protocols and flow control.", difficulty: "Intermediate", rating: 4.8, topics: ["TCP", "UDP"], subject: "cn" },

  // DBMS
  { title: "DBMS Fundamentals - Complete Course", url: "https://www.youtube.com/watch?v=ztHopE5Wnpc", duration: "3:45:30", views: "2.1M", instructor: "Prof. Ravi Shankar", description: "Comprehensive DBMS course covering ER diagrams and normalization.", difficulty: "Beginner", rating: 4.9, topics: ["ER Diagrams", "Normalization", "SQL"], subject: "dbms" },
  { title: "SQL Queries and Database Design", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY", duration: "2:30:45", views: "1.3M", instructor: "Dr. Pooja Agarwal", description: "Mastering SQL queries, joins, and database design.", difficulty: "Intermediate", rating: 4.8, topics: ["SQL Queries", "Joins"], subject: "dbms" },
  { title: "Transaction Management", url: "https://www.youtube.com/watch?v=P80Js_qClUE", duration: "2:10:20", views: "850K", instructor: "Prof. Vikram Singh", description: "Understanding ACID properties and concurrency control.", difficulty: "Advanced", rating: 4.7, topics: ["ACID", "Concurrency"], subject: "dbms" },

  // Operating Systems (OS)
  { title: "Operating Systems - Complete Introduction", url: "https://www.youtube.com/watch?v=vBURTt97EkA", duration: "3:30:40", views: "1.9M", instructor: "Prof. Suresh Kumar", description: "Comprehensive OS course covering processes and scheduling.", difficulty: "Beginner", rating: 4.9, topics: ["Processes", "Scheduling"], subject: "os" },
  { title: "Process Synchronization and Deadlocks", url: "https://www.youtube.com/watch?v=eKKc0d7kzww", duration: "2:20:30", views: "980K", instructor: "Dr. Anjali Verma", description: "Understanding synchronization and deadlock handling.", difficulty: "Intermediate", rating: 4.8, topics: ["Synchronization", "Deadlock"], subject: "os" },
  { title: "Memory Management", url: "https://www.youtube.com/watch?v=qdkxXygc3rE", duration: "2:05:15", views: "820K", instructor: "Prof. Ramesh Gupta", description: "Detailed study of paging and virtual memory.", difficulty: "Advanced", rating: 4.7, topics: ["Paging", "Virtual Memory"], subject: "os" },

  // DAA
  { title: "Algorithm Design Techniques", url: "https://www.youtube.com/watch?v=0IAPZzGSbME", duration: "3:10:45", views: "1.4M", instructor: "Prof. Amit Sharma", description: "Comprehensive coverage of algorithm design paradigms.", difficulty: "Intermediate", rating: 4.9, topics: ["Divide and Conquer", "Greedy", "DP"], subject: "daa" },
  { title: "Graph Algorithms", url: "https://www.youtube.com/watch?v=tWVWeAqZ0WU", duration: "2:35:30", views: "1.1M", instructor: "Dr. Priya Menon", description: "Detailed study of graph traversal and shortest path algorithms.", difficulty: "Intermediate", rating: 4.8, topics: ["BFS", "DFS", "Dijkstra"], subject: "daa" },
  { title: "NP-Completeness", url: "https://www.youtube.com/watch?v=e2cF8a5aAhE", duration: "2:15:20", views: "720K", instructor: "Prof. Rajesh Kumar", description: "Understanding P, NP, and NP-Complete problems.", difficulty: "Advanced", rating: 4.7, topics: ["P vs NP", "NP-Complete"], subject: "daa" },

  // TOC
  { title: "Theory of Computation - Automata", url: "https://www.youtube.com/watch?v=58N2N7zJGrQ", duration: "3:25:40", views: "980K", instructor: "Prof. Kavita Nair", description: "Complete TOC course covering finite automata and Turing machines.", difficulty: "Intermediate", rating: 4.8, topics: ["Finite Automata", "Turing Machines"], subject: "toc" },
  { title: "Regular Expressions and DFA", url: "https://www.youtube.com/watch?v=528Jc3q86F8", duration: "2:10:30", views: "720K", instructor: "Dr. Anil Patil", description: "Understanding regular expressions and finite automata.", difficulty: "Beginner", rating: 4.7, topics: ["Regular Expressions", "DFA", "NFA"], subject: "toc" },

  // Compiler Design
  { title: "Compiler Design - Complete Course", url: "https://www.youtube.com/watch?v=Qkwj65l_96I", duration: "3:40:30", views: "890K", instructor: "Prof. Sandeep Joshi", description: "Comprehensive compiler design covering lexical analysis and parsing.", difficulty: "Advanced", rating: 4.8, topics: ["Lexical Analysis", "Parsing"], subject: "compiler-design" },
  { title: "Parsing Techniques", url: "https://www.youtube.com/watch?v=54bo1qaHAfk", duration: "2:15:45", views: "620K", instructor: "Dr. Neha Kapoor", description: "Understanding top-down and bottom-up parsing.", difficulty: "Intermediate", rating: 4.7, topics: ["LL Parsing", "LR Parsing"], subject: "compiler-design" },

  // Computer Graphics
  { title: "Computer Graphics Fundamentals", url: "https://www.youtube.com/watch?v=01YSK5gIEYQ", duration: "2:50:30", views: "780K", instructor: "Prof. Arun Mehta", description: "Introduction to computer graphics, 2D/3D transformations, and rendering.", difficulty: "Beginner", rating: 4.7, topics: ["2D Transformations", "3D Graphics"], subject: "computer-graphics" },
  { title: "3D Graphics and Rendering", url: "https://www.youtube.com/watch?v=vLSphLtKQ0o", duration: "2:20:15", views: "650K", instructor: "Dr. Priya Sharma", description: "Advanced 3D graphics, lighting models, and rendering techniques.", difficulty: "Advanced", rating: 4.8, topics: ["Rendering", "Lighting", "Shading"], subject: "computer-graphics" },

  // Software Engineering
  { title: "Software Engineering - Complete Guide", url: "https://www.youtube.com/watch?v=uJpQUHWAHXE", duration: "3:15:40", views: "1.2M", instructor: "Prof. Ravi Shankar", description: "Comprehensive software engineering covering SDLC, design patterns, and testing.", difficulty: "Beginner", rating: 4.8, topics: ["SDLC", "Design Patterns", "Testing"], subject: "software-engineering" },
  { title: "Agile and Scrum Methodology", url: "https://www.youtube.com/watch?v=502ILHjX9EE", duration: "1:45:30", views: "890K", instructor: "Dr. Neha Kapoor", description: "Understanding Agile principles, Scrum framework, and sprint planning.", difficulty: "Intermediate", rating: 4.7, topics: ["Agile", "Scrum", "Sprint Planning"], subject: "software-engineering" },

  // Machine Learning
  { title: "Machine Learning - Complete Introduction", url: "https://www.youtube.com/watch?v=GwIo3gDZCVQ", duration: "4:10:30", views: "2.5M", instructor: "Prof. Andrew Ng", description: "Comprehensive ML course covering supervised, unsupervised learning, and neural networks.", difficulty: "Intermediate", rating: 4.9, topics: ["Supervised Learning", "Neural Networks"], subject: "machine-learning" },
  { title: "Deep Learning and Neural Networks", url: "https://www.youtube.com/watch?v=aircAruvnKk", duration: "3:20:45", views: "1.8M", instructor: "Dr. Ian Goodfellow", description: "Advanced deep learning covering CNNs, RNNs, and transformers.", difficulty: "Advanced", rating: 4.9, topics: ["Deep Learning", "CNN", "RNN"], subject: "machine-learning" },

  // Cloud Computing
  { title: "Cloud Computing Fundamentals", url: "https://www.youtube.com/watch?v=M988_fsOSWo", duration: "2:40:30", views: "920K", instructor: "Prof. Sandeep Joshi", description: "Introduction to cloud computing, AWS, Azure, and cloud services.", difficulty: "Beginner", rating: 4.7, topics: ["Cloud Computing", "AWS", "Azure"], subject: "cloud-computing" },
  { title: "Cloud Architecture and Deployment", url: "https://www.youtube.com/watch?v=3WIJ4axzFlU", duration: "2:15:20", views: "680K", instructor: "Dr. Amit Sharma", description: "Understanding cloud architecture, microservices, and deployment strategies.", difficulty: "Intermediate", rating: 4.8, topics: ["Microservices", "Deployment", "Scalability"], subject: "cloud-computing" },

  // Cyber Security
  { title: "Cyber Security Essentials", url: "https://www.youtube.com/watch?v=inWWhr5tnEA", duration: "2:50:45", views: "1.1M", instructor: "Prof. Rajesh Kumar", description: "Comprehensive cyber security covering cryptography, network security, and ethical hacking.", difficulty: "Intermediate", rating: 4.8, topics: ["Cryptography", "Network Security"], subject: "cyber-security" },
  { title: "Ethical Hacking and Penetration Testing", url: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", duration: "3:10:30", views: "890K", instructor: "Dr. Priya Menon", description: "Advanced ethical hacking techniques and penetration testing methodologies.", difficulty: "Advanced", rating: 4.9, topics: ["Ethical Hacking", "Penetration Testing"], subject: "cyber-security" },

  // Web Technologies
  { title: "Web Development - HTML, CSS, JavaScript", url: "https://www.youtube.com/watch?v=UB1O30fR-EE", duration: "4:20:30", views: "2.2M", instructor: "Prof. Arun Mehta", description: "Complete web development course covering HTML, CSS, JavaScript, and responsive design.", difficulty: "Beginner", rating: 4.9, topics: ["HTML", "CSS", "JavaScript"], subject: "web-technologies" },
  { title: "React and Modern Web Frameworks", url: "https://www.youtube.com/watch?v=Ke90Tje7VS0", duration: "3:30:45", views: "1.5M", instructor: "Dr. Neha Kapoor", description: "Advanced web development with React, Redux, and modern frameworks.", difficulty: "Intermediate", rating: 4.8, topics: ["React", "Redux", "Modern Frameworks"], subject: "web-technologies" },

  // NLP
  { title: "Natural Language Processing - Introduction", url: "https://www.youtube.com/watch?v=fOvTtapxa9c", duration: "3:05:40", views: "850K", instructor: "Prof. Kavita Nair", description: "Comprehensive NLP course covering text processing, sentiment analysis, and transformers.", difficulty: "Intermediate", rating: 4.8, topics: ["Text Processing", "Sentiment Analysis"], subject: "nlp" },
  { title: "Transformers and BERT", url: "https://www.youtube.com/watch?v=TQQlZhbC5ps", duration: "2:20:30", views: "620K", instructor: "Dr. Amit Sharma", description: "Advanced NLP with transformers, BERT, and GPT models.", difficulty: "Advanced", rating: 4.9, topics: ["Transformers", "BERT", "GPT"], subject: "nlp" },

  // Distributed Systems
  { title: "Distributed Systems Fundamentals", url: "https://www.youtube.com/watch?v=UEAMfLPZZhE", duration: "3:15:45", views: "780K", instructor: "Prof. Ravi Shankar", description: "Introduction to distributed systems, consistency models, and fault tolerance.", difficulty: "Advanced", rating: 4.8, topics: ["Distributed Systems", "Consistency"], subject: "distributed-systems" },
  { title: "Consensus Algorithms and Replication", url: "https://www.youtube.com/watch?v=tw3gsBms-f8", duration: "2:30:20", views: "550K", instructor: "Dr. Sandeep Joshi", description: "Understanding Paxos, Raft, and replication strategies.", difficulty: "Advanced", rating: 4.7, topics: ["Paxos", "Raft", "Replication"], subject: "distributed-systems" },

  // Project Management
  { title: "Project Management Essentials", url: "https://www.youtube.com/watch?v=ZKOL-rZ79gs", duration: "2:40:30", views: "920K", instructor: "Prof. Meera Iyer", description: "Comprehensive project management covering planning, execution, and risk management.", difficulty: "Beginner", rating: 4.7, topics: ["Project Planning", "Risk Management"], subject: "project-management" },
  { title: "Agile Project Management", url: "https://www.youtube.com/watch?v=thsFsPnUHRA", duration: "2:10:15", views: "680K", instructor: "Dr. Pooja Agarwal", description: "Understanding Agile project management and Scrum practices.", difficulty: "Intermediate", rating: 4.8, topics: ["Agile", "Scrum", "Sprint"], subject: "project-management" }
];
