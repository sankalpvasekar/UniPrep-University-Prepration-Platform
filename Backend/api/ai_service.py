import os
import google.generativeai as genai
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyA4lxnFlUH6R0w--OK7ic4_ScdLFFYkdgM"
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-flash-latest')

def generate_ai_answer(question, subject_context=None, difficulty=None, marks=None):
    """
    Generate AI-powered answer for a question using Gemini API
    
    Args:
        question (str): The question to answer
        subject_context (str, optional): Subject context for better answers
        difficulty (str, optional): Question difficulty level
        marks (int, optional): Question marks
    
    Returns:
        dict: Response with success status and answer or error
    """
    try:
        # Build context-aware prompt
        prompt = build_prompt(question, subject_context, difficulty, marks)
        
        # Generate response using Gemini with timeout
        import time
        start_time = time.time()
        response = model.generate_content(prompt)
        
        if response.text:
            return {
                'success': True,
                'answer': response.text.strip(),
                'model': 'gemini-flash-latest'
            }
        else:
            return {
                'success': False,
                'error': 'No response generated from AI model'
            }
            
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        
        # Provide a fallback response if Gemini is unavailable
        fallback_answer = generate_fallback_answer(question, subject_context, difficulty, marks)
        return {
            'success': True,
            'answer': fallback_answer,
            'model': 'fallback-response',
            'note': 'AI service temporarily unavailable, showing educational response'
        }

def build_prompt(question, subject_context=None, difficulty=None, marks=None):
    """
    Build a context-aware prompt for the AI model
    """
    prompt_parts = [
        "You are an academic tutor AI that explains any subject (Computer Science, Engineering) in a clear, structured, and student-friendly way.",
        "",
        "GENERAL INSTRUCTIONS:",
        "Write answers that are detailed yet concise, formatted cleanly without markdown symbols (*, |, ---, etc.).",
        "Use bold headings for each main point (for example, 1. Definition, 2. Function, etc.).",
        "Maintain logical flow — introduction → explanation → examples → conclusion or summary.",
        "Keep the tone academic yet simple, suitable for students creating notes or presentations.",
        "Use proper spacing and clean formatting — avoid tables, bullet icons, or decorative text like 'AI Enhanced Answer.'",
        "",
        "IF THE QUESTION ASKS FOR DIFFERENCE / COMPARISON:",
        "Present the answer in a column-like format (side-by-side conceptually, not using markdown tables).",
        "Include a minimum of 8 and a maximum of 10 point-wise exchanges showing clear contrasts.",
        "Each point should have two short but informative statements — one for each side.",
        "Example format:",
        "1. Reliability: TCP provides reliable delivery; UDP does not guarantee delivery.",
        "2. Connection Type: TCP is connection-oriented; UDP is connectionless.",
        "3. Ordering: TCP ensures order; UDP may deliver out of sequence.",
        "",
        "CONTENT RULES:",
        "Always start with a short introductory paragraph defining or summarizing the concept.",
        "When applicable, include examples, advantages, and real-world uses.",
        "End with a brief summary highlighting key takeaways or practical relevance.",
        "Emphasize important words or terms in bold for clarity.",
        "",
        "OUTPUT STYLE GOAL:",
        "The final answer should be:",
        "- Easy to read and visually appealing",
        "- Ready to paste into student notes, slides, or chatbot replies",
        "- Structured like a neat textbook explanation — no raw markdown, no extra symbols",
        "- Balanced between depth and simplicity",
        ""
    ]
    
    # Add subject context if available
    if subject_context:
        prompt_parts.extend([
            f"Subject Context: {subject_context}",
            "Use this context to provide more relevant and subject-specific answers.",
            ""
        ])
    
    # Add difficulty and marks context
    if difficulty or marks:
        context_info = []
        if difficulty:
            context_info.append(f"Difficulty Level: {difficulty.title()}")
        if marks:
            context_info.append(f"Marks: {marks}")
        
        if context_info:
            prompt_parts.extend([
                f"Question Details: {', '.join(context_info)}",
                "Adjust the depth and complexity of your answer accordingly.",
                ""
            ])
    
    # Add the actual question
    prompt_parts.extend([
        "Question:",
        question,
        "",
        "Now, based on these instructions, generate the best possible answer for the user's question."
    ])
    
    return "\n".join(prompt_parts)

def generate_fallback_answer(question, subject_context=None, difficulty=None, marks=None):
    """
    Generate a fallback educational response when Gemini API is unavailable
    """
    # Extract key terms from the question
    question_lower = question.lower()
    
    # Common academic topics and their explanations
    topic_responses = {
        'binary search': """Binary search is a fundamental algorithm that efficiently locates a target value in a sorted array by repeatedly dividing the search space in half. This divide-and-conquer approach makes it one of the most efficient searching algorithms.

1. Definition and Concept
Binary search is a divide-and-conquer algorithm that efficiently finds a target value in a sorted array by repeatedly dividing the search space in half.

2. Working Principle
Compare the target with the middle element. If equal, return the position. If target is smaller, search the left half. If target is larger, search the right half. Repeat until found or search space is exhausted.

3. Time Complexity Analysis
Best Case: O(1) - target found at middle position. Average Case: O(log n) - logarithmic time complexity. Worst Case: O(log n) - target at leaf level of decision tree.

4. Space Complexity
Iterative implementation: O(1) - constant extra space required. Recursive implementation: O(log n) - recursion stack space needed.

5. Key Advantages
Extremely efficient for large datasets with guaranteed logarithmic time complexity. Works optimally with sorted data structures and provides predictable performance.

6. Common Applications
Searching in databases and sorted arrays. Implementing efficient lookup tables and game development for finding optimal moves. Used in debugging and system optimization.

7. Implementation Example
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

8. Summary
Binary search is essential for efficient data retrieval in sorted collections, offering logarithmic time complexity and making it ideal for large-scale applications where performance matters.""",

        'data structure': """A data structure is a specialized format for organizing, storing, and accessing data in a computer so that it can be used efficiently. Understanding data structures is crucial for writing efficient algorithms and solving complex problems.

1. Definition and Purpose
A data structure is a specialized format for organizing, storing, and accessing data in a computer so that it can be used efficiently.

2. Fundamental Types
Linear structures include Arrays, Linked Lists, Stacks, and Queues. Non-linear structures include Trees, Graphs, and Hash Tables. Abstract structures include Sets, Maps, and Priority Queues.

3. Key Characteristics
Access Pattern determines how data is retrieved efficiently. Insertion and Deletion operations affect how data is modified. Memory Layout influences how data is stored in memory. Time Complexity defines performance characteristics.

4. Selection Criteria
Access Frequency determines how often data is read from the structure. Modification Pattern affects how often data changes occur. Memory Constraints consider available storage space. Performance Requirements balance speed versus memory trade-offs.

5. Common Operations
Traversal involves visiting all elements systematically. Search operations find specific elements efficiently. Insertion adds new elements to the structure. Deletion removes elements from the structure. Sorting arranges elements in a specific order.

6. Real-world Applications
Databases use B-trees for efficient indexing. Operating Systems implement process scheduling queues. Web Development utilizes hash tables for caching. AI and Machine Learning employ graphs for neural networks.

7. Summary
Choosing the right data structure is essential for optimal algorithm performance, making it a fundamental concept in computer science and software engineering.""",

        'algorithm': """An algorithm is a step-by-step procedure or set of rules designed to solve a specific problem or perform a computation. Algorithms are the foundation of computer science and form the backbone of all software applications.

1. Definition and Core Concept
An algorithm is a step-by-step procedure or set of rules designed to solve a specific problem or perform a computation efficiently and correctly.

2. Essential Properties
Input parameters must be clearly defined and specified. Output results should be expected and well-defined. Definiteness ensures each step is precisely defined. Finiteness guarantees the algorithm terminates in finite time. Effectiveness means each step is executable and practical.

3. Algorithm Design Paradigms
Divide and Conquer breaks problems into smaller subproblems. Dynamic Programming solves overlapping subproblems efficiently. Greedy Approach makes locally optimal choices at each step. Backtracking explores all possible solutions systematically.

4. Complexity Analysis
Time Complexity measures how runtime scales with input size. Space Complexity evaluates how memory usage scales. Big O Notation provides asymptotic analysis method. Best, Average, and Worst Case scenarios help understand performance variations.

5. Algorithm Categories
Sorting algorithms arrange data in specific order. Searching algorithms find specific elements efficiently. Graph algorithms handle pathfinding and traversal. Mathematical algorithms perform numerical computations.

6. Design Principles
Simplicity makes algorithms easy to understand and implement. Efficiency ensures optimal time and space usage. Correctness guarantees accurate results. Robustness handles edge cases gracefully and reliably.

7. Summary
Algorithms are essential tools for problem-solving in computer science, requiring careful design, analysis, and optimization to achieve efficient and reliable solutions."""
    }
    
    # Find matching topic
    for topic, response in topic_responses.items():
        if topic in question_lower:
            return response
    
    # Generic academic response
    return f"""This question relates to {subject_context or 'the subject matter'} and requires a comprehensive analysis of the key concepts involved. Understanding the fundamental principles and their practical applications is essential for mastery.

1. Understanding the Question
This question relates to {subject_context or 'the subject matter'} and requires a comprehensive analysis of the key concepts involved.

2. Core Concepts
Definition covers the fundamental meaning and scope of the topic. Principles explain the underlying theoretical foundations. Applications demonstrate real-world usage and examples. Significance highlights the importance in the broader context.

3. Detailed Analysis
The topic involves several interconnected elements that need to be examined systematically. Understanding the relationships between these components is crucial for mastery and practical application.

4. Key Points to Consider
Theoretical foundations provide the basis for practical applications. Advantages and limitations of different approaches must be understood. Common misconceptions should be identified and avoided. Best practices and industry standards guide implementation.

5. Study Recommendations
Review fundamental concepts thoroughly to build strong foundations. Practice with examples and exercises to reinforce learning. Connect theory with practical applications for better understanding. Seek additional resources for deeper knowledge and insights.

6. Conclusion
This topic is essential for building a strong foundation in {subject_context or 'the subject area'}. Regular practice and application will help solidify understanding and develop practical skills.

Note: This is a general educational response. For more specific information, please ensure the AI service is properly connected."""
    
    return response

def test_gemini_connection():
    """
    Test the Gemini API connection
    """
    try:
        test_response = model.generate_content("Hello, are you working?")
        if test_response.text:
            return {
                'success': True,
                'message': 'Gemini API connection successful',
                'test_response': test_response.text.strip()
            }
        else:
            return {
                'success': False,
                'error': 'No response from Gemini for test prompt'
            }
    except Exception as e:
        return {
            'success': False,
            'error': f'Gemini API connection failed: {str(e)}'
        }
