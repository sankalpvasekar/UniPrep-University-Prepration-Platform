export const questions = {
  easy: [
    { 
      question: "What is a stack and explain its basic operations?", 
      year: 2023,
      topic: "Data Structures",
      marks: 5,
      answer: "A stack is a linear data structure that follows LIFO (Last In First Out) principle. Basic operations: push (add element), pop (remove element), peek (view top element), isEmpty (check if empty)."
    },
    { 
      question: "Explain arrays with example and time complexity of operations.", 
      year: 2022,
      topic: "Data Structures",
      marks: 4,
      answer: "Array is a collection of elements stored in contiguous memory locations. Example: int arr[5] = {1,2,3,4,5}. Access: O(1), Search: O(n), Insertion/Deletion: O(n)."
    },
    { 
      question: "What is the difference between linear and non-linear data structures?", 
      year: 2023,
      topic: "Data Structures",
      marks: 3,
      answer: "Linear: Elements arranged sequentially (arrays, linked lists, stacks, queues). Non-linear: Elements not in sequence (trees, graphs). Linear has single level, non-linear has multiple levels."
    },
    { 
      question: "Explain the concept of linked lists and their types.", 
      year: 2022,
      topic: "Data Structures",
      marks: 6,
      answer: "Linked list is a linear data structure where elements are stored in nodes. Types: Singly linked, Doubly linked, Circular linked. Each node contains data and pointer to next node."
    }
  ],
  medium: [
    { 
      question: "Implement a binary search tree with insertion and search operations.", 
      year: 2022,
      topic: "Trees",
      marks: 8,
      answer: "BST is a binary tree where left child < parent < right child. Insertion: Compare with root, go left if smaller, right if larger. Search: Similar comparison process. Time complexity: O(log n) average, O(n) worst."
    },
    { 
      question: "Explain hash tables and different collision handling techniques.", 
      year: 2021,
      topic: "Hashing",
      marks: 10,
      answer: "Hash table uses hash function to map keys to array indices. Collision handling: 1) Chaining (linked list at each index), 2) Open addressing (linear probing, quadratic probing, double hashing)."
    },
    { 
      question: "Compare and contrast different sorting algorithms (Bubble, Quick, Merge).", 
      year: 2023,
      topic: "Sorting",
      marks: 12,
      answer: "Bubble: O(n²) time, O(1) space, stable. Quick: O(n log n) average, O(n²) worst, O(log n) space, unstable. Merge: O(n log n) time, O(n) space, stable. Quick is fastest in practice."
    },
    { 
      question: "Explain the concept of dynamic programming with an example.", 
      year: 2022,
      topic: "Algorithms",
      marks: 10,
      answer: "DP solves complex problems by breaking them into simpler subproblems. Example: Fibonacci sequence. Instead of recalculating, store results in table. Time: O(n), Space: O(n) or O(1)."
    }
  ],
  hard: [
    { 
      question: "Explain Dijkstra's algorithm for shortest path and analyze its complexity.", 
      year: 2023,
      topic: "Graph Algorithms",
      marks: 15,
      answer: "Dijkstra finds shortest path from source to all vertices in weighted graph. Uses priority queue, greedy approach. Time: O((V+E)log V) with binary heap, O(V²) with array. Space: O(V)."
    },
    { 
      question: "Write Kruskal's algorithm for minimum spanning tree with example.", 
      year: 2021,
      topic: "Graph Algorithms",
      marks: 12,
      answer: "Kruskal's MST: Sort edges by weight, add edges that don't form cycle. Uses Union-Find data structure. Time: O(E log E), Space: O(V). Example: Connect cities with minimum cost roads."
    },
    { 
      question: "Design and implement LRU Cache with O(1) operations.", 
      year: 2023,
      topic: "System Design",
      marks: 20,
      answer: "LRU Cache: HashMap + Doubly Linked List. HashMap stores key->node mapping. DLL maintains access order. Get: O(1) - move to head. Put: O(1) - add to head, remove tail if full."
    },
    { 
      question: "Explain time and space complexity analysis with Big O notation examples.", 
      year: 2022,
      topic: "Algorithm Analysis",
      marks: 10,
      answer: "Big O describes worst-case performance. O(1): constant, O(log n): logarithmic, O(n): linear, O(n²): quadratic, O(2^n): exponential. Space complexity measures extra memory used."
    }
  ],
};
