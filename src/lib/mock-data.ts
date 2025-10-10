export const user = {
    name: 'Alex Doe',
    email: 'alex.doe@example.com',
};

export const readinessScore = {
    total: 78,
    aptitude: 85,
    coding: 72,
    softSkills: 75,
};

export const upcomingTests = [
    { id: 'apt-101', title: 'Quantitative Aptitude - Test 1', type: 'Aptitude', date: '2024-08-15' },
    { id: 'cod-203', title: 'Data Structures - Arrays', type: 'Coding', date: '2024-08-18' },
    { id: 'apt-102', title: 'Logical Reasoning - Advanced', type: 'Aptitude', date: '2024-08-20' },
];

export const aptitudeTests = [
    { id: 'quant-basics', title: 'Quantitative Aptitude Basics', questions: 15, duration: 20 },
    { id: 'logical-1', title: 'Logical Reasoning I', questions: 20, duration: 25 },
    { id: 'verbal-ability', title: 'Verbal Ability', questions: 25, duration: 20 },
    { id: 'data-interpretation', title: 'Data Interpretation', questions: 10, duration: 15 },
];

export const aptitudeQuestions = [
    {
        question: "If a car travels at 60 km/h, how far will it travel in 2.5 hours?",
        options: ["120 km", "150 km", "180 km", "140 km"],
        answer: "150 km"
    },
    {
        question: "What is the next number in the series: 2, 5, 10, 17, 26, ...?",
        options: ["35", "37", "39", "41"],
        answer: "37"
    },
    {
        question: "Choose the word that is most nearly the opposite of 'ephemeral'.",
        options: ["transient", "permanent", "fleeting", "short-lived"],
        answer: "permanent"
    }
];

export const codingProblems = [
    { id: 'two-sum', title: 'Two Sum', difficulty: 'Easy', category: 'Arrays' },
    { id: 'reverse-linked-list', title: 'Reverse Linked List', difficulty: 'Easy', category: 'Linked List' },
    { id: 'binary-tree-inorder', title: 'Binary Tree Inorder Traversal', difficulty: 'Medium', category: 'Trees' },
    { id: 'lru-cache', title: 'LRU Cache', difficulty: 'Hard', category: 'Data Structures' },
];

export const problemDetails = {
    'two-sum': {
        title: 'Two Sum',
        difficulty: 'Easy',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
        example: "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1]."
    }
};

export const softSkills = [
    { id: 'communication', name: 'Communication', selfAssesment: 8, mentorRating: 9 },
    { id: 'teamwork', name: 'Teamwork & Collaboration', selfAssesment: 7, mentorRating: 7 },
    { id: 'problem-solving', name: 'Problem Solving', selfAssesment: 9, mentorRating: 8 },
    { id: 'leadership', name: 'Leadership', selfAssesment: 6, mentorRating: null },
    { id: 'adaptability', name: 'Adaptability', selfAssesment: 8, mentorRating: 8 },
];

export const weakAreas = [
    "Dynamic Programming",
    "Time complexity analysis",
    "System Design fundamentals",
    "Speaking concisely during interviews"
];

export const leaderboardData = [
  { rank: 1, name: 'Priya Sharma', score: 92, optedIn: true },
  { rank: 2, name: 'Rohan Gupta', score: 88, optedIn: true },
  { rank: 3, name: 'Alex Doe', score: 78, optedIn: true },
  { rank: 4, name: 'Sana Khan', score: 75, optedIn: true },
  { rank: 5, name: 'User 5', score: 72, optedIn: false },
  { rank: 6, name: 'Ben Carter', score: 68, optedIn: true },
];

export const batchProgress = {
    averageScore: 75,
    aptitude: [
        { month: 'Jan', average: 65 }, { month: 'Feb', average: 68 }, { month: 'Mar', average: 72 }, { month: 'Apr', average: 78 }, { month: 'May', average: 82 }, { month: 'Jun', average: 85 }
    ],
    coding: [
        { month: 'Jan', average: 55 }, { month: 'Feb', average: 60 }, { month: 'Mar', average: 62 }, { month: 'Apr', average: 68 }, { month: 'May', average: 70 }, { month: 'Jun', average: 72 }
    ],
    softSkills: [
        { month: 'Jan', average: 70 }, { month: 'Feb', average: 71 }, { month: 'Mar', average: 72 }, { month: 'Apr', average: 74 }, { month: 'May', average: 74 }, { month: 'Jun', average: 75 }
    ]
};

export const adminQuestions = [
    { id: 'q1', text: "What is the complexity of binary search?", category: 'Aptitude', type: 'MCQ'},
    { id: 'q2', text: "Explain the concept of polymorphism.", category: 'Coding', type: 'Theory'},
    { id: 'q3', text: "A train 100m long is running at the speed of 30 km/hr. Find the time taken...", category: 'Aptitude', type: 'MCQ'},
];
