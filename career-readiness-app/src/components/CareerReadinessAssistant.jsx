import React, { useState, useEffect } from 'react';
import { Brain, MessageSquare, Lightbulb, Users, Code, TrendingUp, Award, ChevronRight, BarChart3, Target, Sparkles, Save, Download, Mail, LogIn, UserPlus, LogOut, User } from 'lucide-react';

const CareerReadinessAssistant = () => {
  const [currentStep, setCurrentStep] = useState('welcome');
  const [assessmentData, setAssessmentData] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [results, setResults] = useState(null);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [saveStatus, setSaveStatus] = useState('');
  const [pastAssessments, setPastAssessments] = useState([]);
  
  // API Configuration - Replace with your actual backend URL
  const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your backend URL

  const skillCategories = [
    {
      id: 'problemSolving',
      name: 'Problem Solving',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          q: 'When faced with a complex problem, I typically:',
          options: [
            { text: 'Break it down into smaller, manageable parts', points: 5 },
            { text: 'Look for similar problems I have solved before', points: 4 },
            { text: 'Ask for help immediately', points: 2 },
            { text: 'Feel overwhelmed and procrastinate', points: 1 }
          ]
        },
        {
          q: 'How do you approach debugging or troubleshooting?',
          options: [
            { text: 'Systematically test hypotheses and isolate issues', points: 5 },
            { text: 'Use trial and error until something works', points: 3 },
            { text: 'Search online for solutions', points: 3 },
            { text: 'Give up and move to something else', points: 1 }
          ]
        },
        {
          q: 'Rate your ability to think critically and analyze information:',
          options: [
            { text: 'Excellent - I question assumptions and evaluate evidence', points: 5 },
            { text: 'Good - I try to look at different perspectives', points: 4 },
            { text: 'Average - I accept information at face value', points: 2 },
            { text: 'Needs improvement', points: 1 }
          ]
        }
      ]
    },
    {
      id: 'communication',
      name: 'Communication',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          q: 'How comfortable are you presenting ideas to a group?',
          options: [
            { text: 'Very comfortable - I enjoy public speaking', points: 5 },
            { text: 'Comfortable with preparation', points: 4 },
            { text: 'Somewhat nervous but manage', points: 3 },
            { text: 'Very uncomfortable', points: 1 }
          ]
        },
        {
          q: 'How would you describe your written communication skills?',
          options: [
            { text: 'Excellent - Clear, concise, and professional', points: 5 },
            { text: 'Good - Can convey ideas effectively', points: 4 },
            { text: 'Average - Sometimes struggle with clarity', points: 2 },
            { text: 'Need significant improvement', points: 1 }
          ]
        },
        {
          q: 'In team discussions, you typically:',
          options: [
            { text: 'Actively contribute and listen to others', points: 5 },
            { text: 'Speak when I have something important to add', points: 4 },
            { text: 'Prefer to listen rather than speak', points: 2 },
            { text: 'Rarely participate', points: 1 }
          ]
        }
      ]
    },
    {
      id: 'creativity',
      name: 'Creativity & Innovation',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      questions: [
        {
          q: 'How often do you come up with new ideas or approaches?',
          options: [
            { text: 'Frequently - I love brainstorming and innovating', points: 5 },
            { text: 'Often - When given the opportunity', points: 4 },
            { text: 'Occasionally - Prefer proven methods', points: 2 },
            { text: 'Rarely - Stick to what works', points: 1 }
          ]
        },
        {
          q: 'When facing constraints, you:',
          options: [
            { text: 'See them as challenges that spark creativity', points: 5 },
            { text: 'Find workarounds when possible', points: 4 },
            { text: 'Feel limited but try to adapt', points: 2 },
            { text: 'Feel stuck and frustrated', points: 1 }
          ]
        },
        {
          q: 'Rate your ability to think outside the box:',
          options: [
            { text: 'Excellent - I often challenge conventional thinking', points: 5 },
            { text: 'Good - Can be creative when needed', points: 4 },
            { text: 'Average - Prefer traditional approaches', points: 2 },
            { text: 'Limited - Struggle with abstract thinking', points: 1 }
          ]
        }
      ]
    },
    {
      id: 'teamwork',
      name: 'Teamwork & Collaboration',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          q: 'How do you handle disagreements in a team?',
          options: [
            { text: 'Listen to all views and find common ground', points: 5 },
            { text: 'Express my opinion but compromise', points: 4 },
            { text: 'Avoid conflict and go with majority', points: 2 },
            { text: 'Insist on my way or withdraw', points: 1 }
          ]
        },
        {
          q: 'In group projects, you typically:',
          options: [
            { text: 'Take initiative and coordinate efforts', points: 5 },
            { text: 'Contribute actively to assigned tasks', points: 4 },
            { text: 'Complete my part independently', points: 3 },
            { text: 'Rely on others to lead', points: 1 }
          ]
        },
        {
          q: 'Rate your ability to give and receive constructive feedback:',
          options: [
            { text: 'Excellent - Welcome feedback and give it tactfully', points: 5 },
            { text: 'Good - Can handle most feedback well', points: 4 },
            { text: 'Average - Sometimes take it personally', points: 2 },
            { text: 'Difficult - Prefer to avoid feedback', points: 1 }
          ]
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Aptitude',
      icon: Code,
      color: 'from-indigo-500 to-purple-500',
      questions: [
        {
          q: 'How comfortable are you learning new technologies?',
          options: [
            { text: 'Very comfortable - Love learning new tools', points: 5 },
            { text: 'Comfortable - Can adapt with some effort', points: 4 },
            { text: 'Somewhat challenging but manage', points: 3 },
            { text: 'Very difficult - Prefer familiar tools', points: 1 }
          ]
        },
        {
          q: 'Rate your ability to understand technical concepts:',
          options: [
            { text: 'Excellent - Grasp concepts quickly', points: 5 },
            { text: 'Good - Understand with study and practice', points: 4 },
            { text: 'Average - Need significant time to learn', points: 2 },
            { text: 'Struggle with technical material', points: 1 }
          ]
        },
        {
          q: 'How do you stay updated with industry trends?',
          options: [
            { text: 'Actively follow blogs, courses, and communities', points: 5 },
            { text: 'Regularly read articles and updates', points: 4 },
            { text: 'Occasionally check when needed', points: 2 },
            { text: 'Rarely keep up with trends', points: 1 }
          ]
        }
      ]
    },
    {
      id: 'adaptability',
      name: 'Adaptability & Learning',
      icon: TrendingUp,
      color: 'from-red-500 to-pink-500',
      questions: [
        {
          q: 'How do you respond to sudden changes in plans?',
          options: [
            { text: 'Embrace change and adjust quickly', points: 5 },
            { text: 'Adapt after some initial adjustment', points: 4 },
            { text: 'Find it stressful but manage', points: 2 },
            { text: 'Strongly prefer stability and routine', points: 1 }
          ]
        },
        {
          q: 'When you make a mistake, you:',
          options: [
            { text: 'Analyze it, learn, and improve quickly', points: 5 },
            { text: 'Acknowledge it and try not to repeat it', points: 4 },
            { text: 'Feel discouraged for a while', points: 2 },
            { text: 'Dwell on it or blame circumstances', points: 1 }
          ]
        },
        {
          q: 'Rate your growth mindset and willingness to learn:',
          options: [
            { text: 'Excellent - Always seeking to grow and improve', points: 5 },
            { text: 'Good - Open to learning opportunities', points: 4 },
            { text: 'Average - Learn when necessary', points: 2 },
            { text: 'Limited - Prefer to use existing skills', points: 1 }
          ]
        }
      ]
    }
  ];

  const careerPaths = {
    'Software Engineer': {
      skills: { technical: 5, problemSolving: 5, adaptability: 4 },
      description: 'Design, develop, and maintain software applications',
      growth: 'High',
      avgSalary: '$95k - $150k'
    },
    'Data Scientist': {
      skills: { technical: 5, problemSolving: 5, creativity: 4 },
      description: 'Analyze complex data to drive business decisions',
      growth: 'Very High',
      avgSalary: '$100k - $160k'
    },
    'Product Manager': {
      skills: { communication: 5, problemSolving: 4, teamwork: 5 },
      description: 'Define product strategy and coordinate development',
      growth: 'High',
      avgSalary: '$110k - $170k'
    },
    'UX/UI Designer': {
      skills: { creativity: 5, communication: 4, technical: 3 },
      description: 'Create intuitive and beautiful user experiences',
      growth: 'High',
      avgSalary: '$80k - $130k'
    },
    'Business Analyst': {
      skills: { problemSolving: 4, communication: 5, technical: 3 },
      description: 'Bridge business needs with technical solutions',
      growth: 'Moderate',
      avgSalary: '$75k - $120k'
    },
    'DevOps Engineer': {
      skills: { technical: 5, problemSolving: 5, adaptability: 5 },
      description: 'Automate and optimize software delivery processes',
      growth: 'Very High',
      avgSalary: '$100k - $155k'
    },
    'Marketing Specialist': {
      skills: { creativity: 5, communication: 5, adaptability: 4 },
      description: 'Develop and execute marketing strategies',
      growth: 'Moderate',
      avgSalary: '$60k - $100k'
    },
    'Project Manager': {
      skills: { communication: 5, teamwork: 5, problemSolving: 4 },
      description: 'Plan, execute, and deliver projects successfully',
      growth: 'Moderate',
      avgSalary: '$85k - $130k'
    }
  };

  // Backend API Functions
  const apiCall = async (endpoint, method = 'GET', data = null) => {
    try {
      const token = user?.token;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { body: JSON.stringify(data) })
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Authentication Functions
  const handleLogin = async (email, password) => {
    try {
      const data = await apiCall('/auth/login', 'POST', { email, password });
      setUser(data.user);
      setShowAuth(false);
      setSaveStatus('Login successful!');
      loadPastAssessments(data.user.token);
    } catch (error) {
      setSaveStatus('Login failed. Please check credentials.');
    }
  };

  const handleSignup = async (name, email, password, role = 'student') => {
    try {
      const data = await apiCall('/auth/signup', 'POST', { name, email, password, role });
      setUser(data.user);
      setShowAuth(false);
      setSaveStatus('Account created successfully!');
    } catch (error) {
      setSaveStatus('Signup failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPastAssessments([]);
    setSaveStatus('Logged out successfully');
  };

  // Save Assessment to Backend
  const saveAssessment = async (assessmentResults) => {
    if (!user) {
      setSaveStatus('Please login to save your results');
      setShowAuth(true);
      return;
    }

    try {
      setSaveStatus('Saving...');
      const data = await apiCall('/assessments', 'POST', {
        userId: user.id,
        results: assessmentResults,
        timestamp: new Date().toISOString()
      });
      setSaveStatus('✓ Assessment saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
      loadPastAssessments(user.token);
    } catch (error) {
      setSaveStatus('✗ Failed to save assessment');
    }
  };

  // Load Past Assessments
  const loadPastAssessments = async (token) => {
    try {
      const data = await apiCall('/assessments/user', 'GET');
      setPastAssessments(data.assessments || []);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    }
  };

  // Export to PDF (simulated - would need backend PDF generation)
  const exportToPDF = async () => {
    if (!user) {
      setSaveStatus('Please login to export');
      return;
    }
    
    setSaveStatus('Generating PDF...');
    try {
      // In real implementation, call backend to generate PDF
      const response = await fetch(`${API_BASE_URL}/assessments/export-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ results })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-assessment-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      setSaveStatus('✓ PDF downloaded!');
    } catch (error) {
      setSaveStatus('✗ Export failed');
    }
  };

  // Email Results
  const emailResults = async (recipientEmail) => {
    try {
      await apiCall('/assessments/email', 'POST', {
        email: recipientEmail,
        results: results
      });
      setSaveStatus('✓ Results sent via email!');
    } catch (error) {
      setSaveStatus('✗ Failed to send email');
    }
  };

  const calculateResults = (answers) => {
    const scores = {};
    let totalScore = 0;
    let maxScore = 0;

    skillCategories.forEach(category => {
      let categoryScore = 0;
      let categoryMax = 0;

      category.questions.forEach((_, idx) => {
        const answer = answers[`${category.id}-${idx}`];
        if (answer !== undefined) {
          categoryScore += answer;
          categoryMax += 5;
        }
      });

      scores[category.id] = {
        score: categoryScore,
        max: categoryMax,
        percentage: categoryMax > 0 ? Math.round((categoryScore / categoryMax) * 100) : 0
      };

      totalScore += categoryScore;
      maxScore += categoryMax;
    });

    const overallPercentage = Math.round((totalScore / maxScore) * 100);

    const careerMatches = Object.entries(careerPaths).map(([career, data]) => {
      let matchScore = 0;
      let weights = 0;

      Object.entries(data.skills).forEach(([skill, importance]) => {
        const skillScore = scores[skill]?.percentage || 0;
        matchScore += skillScore * importance;
        weights += importance * 100;
      });

      const matchPercentage = Math.round(matchScore / weights * 100);

      return {
        career,
        match: matchPercentage,
        ...data
      };
    }).sort((a, b) => b.match - a.match);

    const feedback = generateFeedback(scores);

    return {
      scores,
      overallPercentage,
      careerMatches,
      feedback,
      totalScore,
      maxScore
    };
  };

  const generateFeedback = (scores) => {
    const feedback = {};

    Object.entries(scores).forEach(([skillId, data]) => {
      const category = skillCategories.find(c => c.id === skillId);
      const percentage = data.percentage;

      let level, advice, strengths;

      if (percentage >= 80) {
        level = 'Excellent';
        strengths = `Your ${category.name.toLowerCase()} skills are outstanding!`;
        advice = `Continue to mentor others and take on leadership opportunities in this area. Consider advanced certifications or specializations.`;
      } else if (percentage >= 60) {
        level = 'Good';
        strengths = `You have solid ${category.name.toLowerCase()} abilities.`;
        advice = `Focus on real-world applications and challenging projects to elevate to expert level. Seek feedback from peers and mentors.`;
      } else if (percentage >= 40) {
        level = 'Developing';
        strengths = `Your ${category.name.toLowerCase()} skills show potential.`;
        advice = `Dedicate focused practice time. Take online courses, work on projects, and actively seek opportunities to develop this skill.`;
      } else {
        level = 'Needs Improvement';
        strengths = `This is an area for growth.`;
        advice = `Start with fundamentals. Consider structured learning through courses, bootcamps, or mentorship programs. Practice regularly.`;
      }

      feedback[skillId] = { level, strengths, advice, percentage };
    });

    return feedback;
  };

  const handleAnswer = (points) => {
    const category = skillCategories[Math.floor(currentQuestion / 3)];
    const questionIndex = currentQuestion % 3;
    const key = `${category.id}-${questionIndex}`;

    setAssessmentData({ ...assessmentData, [key]: points });

    if (currentQuestion < skillCategories.length * 3 - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const finalResults = calculateResults({ ...assessmentData, [key]: points });
      setResults(finalResults);
      setCurrentStep('results');
      
      // Auto-save if user is logged in
      if (user) {
        saveAssessment(finalResults);
      }
    }
  };

  const AuthModal = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <button onClick={() => setShowAuth(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {authMode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:border-indigo-500 outline-none"
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-4 focus:border-indigo-500 outline-none"
          />
          
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full p-3 border-2 border-gray-200 rounded-lg mb-6 focus:border-indigo-500 outline-none"
          />

          <button
            onClick={() => authMode === 'login' 
              ? handleLogin(formData.email, formData.password)
              : handleSignup(formData.name, formData.email, formData.password)
            }
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </button>

          <p className="text-center mt-4 text-gray-600">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              {authMode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    );
  };

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center relative">
        {/* Auth Button */}
        <div className="absolute top-6 right-6">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Login / Sign Up
            </button>
          )}
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl">
            <Sparkles className="w-16 h-16 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          AI Career Readiness Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover your strengths, identify areas for growth, and find your perfect career path
        </p>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Skill Assessment</h3>
            <p className="text-sm text-gray-600">Evaluate 6 core competencies</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <Target className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Career Matching</h3>
            <p className="text-sm text-gray-600">AI-powered career recommendations</p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl">
            <Award className="w-12 h-12 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-800 mb-2">Save & Track Progress</h3>
            <p className="text-sm text-gray-600">Access results anytime, anywhere</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentStep('assessment')}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center mx-auto gap-2"
        >
          Start Assessment
          <ChevronRight className="w-5 h-5" />
        </button>
        <p className="text-sm text-gray-500 mt-6">Takes approximately 5-7 minutes</p>
        
        {user && pastAssessments.length > 0 && (
          <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-700 font-medium">
              You have {pastAssessments.length} saved assessment{pastAssessments.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
      {showAuth && <AuthModal />}
    </div>
  );

  const AssessmentScreen = () => {
    const category = skillCategories[Math.floor(currentQuestion / 3)];
    const questionIndex = currentQuestion % 3;
    const question = category.questions[questionIndex];
    const CategoryIcon = category.icon;
    const progress = ((currentQuestion + 1) / (skillCategories.length * 3)) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto pt-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`bg-gradient-to-br ${category.color} p-3 rounded-xl`}>
                    <CategoryIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{category.name}</h2>
                    <p className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {skillCategories.length * 3}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl text-gray-800 font-medium mb-6">{question.q}</h3>
              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option.points)}
                    className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                        {option.text}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ResultsScreen = () => {
    const getScoreColor = (percentage) => {
      if (percentage >= 80) return 'text-green-600';
      if (percentage >= 60) return 'text-blue-600';
      if (percentage >= 40) return 'text-yellow-600';
      return 'text-red-600';
    };

    const getScoreBg = (percentage) => {
      if (percentage >= 80) return 'bg-green-500';
      if (percentage >= 60) return 'bg-blue-500';
      if (percentage >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 pb-12">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full mb-4">
              <Award className="w-5 h-5" />
              <span className="font-semibold">Assessment Complete</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Your Career Readiness Report</h1>
            <p className="text-gray-600">Comprehensive analysis of your skills and career recommendations</p>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {!user && (
                <button
                  onClick={() => setShowAuth(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Results
                </button>
              )}
              {user && (
                <>
                  <button
                    onClick={() => saveAssessment(results)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Again
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      const email = prompt('Enter email address:');
                      if (email) emailResults(email);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                    Email Results
                  </button>
                </>
              )}
            </div>
            
            {saveStatus && (
              <div className={`mt-4 p-3 rounded-lg ${saveStatus.includes('✓') ? 'bg-green-100 text-green-700' : saveStatus.includes('✗') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {saveStatus}
              </div>
            )}
          </div>

          {/* Overall Score */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-8 mb-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Overall Readiness Score</h2>
              <div className="flex items-center justify-center gap-8">
                <div className="relative">
                  <svg className="transform -rotate-90 w-40 h-40">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="white"
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${results.overallPercentage * 4.4} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold">{results.overallPercentage}%</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl mb-2">
                    Score: {results.totalScore} / {results.maxScore}
                  </p>
                  <p className="text-white/90">
                    {results.overallPercentage >= 80 && "Outstanding! You're highly career-ready."}
                    {results.overallPercentage >= 60 && results.overallPercentage < 80 && "Great job! You're on the right track."}
                    {results.overallPercentage >= 40 && results.overallPercentage < 60 && "Good foundation with room to grow."}
                    {results.overallPercentage < 40 && "Focus on skill development for career success."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Skill Breakdown
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {skillCategories.map(category => {
                const CategoryIcon = category.icon;
                const score = results.scores[category.id];
                return (
                  <div key={category.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-br ${category.color} p-2 rounded-lg`}>
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{category.name}</h3>
                        <p className="text-sm text-gray-500">{score.score} / {score.max} points</p>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(score.percentage)}`}>
                        {score.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${getScoreBg(score.percentage)} h-2 rounded-full transition-all`}
                        style={{ width: `${score.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Career Matches */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Recommended Career Paths
            </h2>
            <div className="space-y-4">
              {results.careerMatches.slice(0, 5).map((career, idx) => (
                <div
                  key={idx}
                  className="border-2 border-gray-100 rounded-xl p-6 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-gray-300">#{idx + 1}</span>
                        <h3 className="text-xl font-bold text-gray-800">{career.career}</h3>
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {career.match}% Match
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{career.description}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600 font-medium">
                          📈 Growth: {career.growth}
                        </span>
                        <span className="text-blue-600 font-medium">
                          💰 Salary: {career.avgSalary}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${career.match}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Feedback */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              Personalized Development Plan
            </h2>
            <div className="space-y-6">
              {Object.entries(results.feedback).map(([skillId, data]) => {
                const category = skillCategories.find(c => c.id === skillId);
                const CategoryIcon = category.icon;
                return (
                  <div key={skillId} className="border-l-4 border-indigo-500 pl-6 py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CategoryIcon className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-800">{category.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        data.percentage >= 80 ? 'bg-green-100 text-green-700' :
                        data.percentage >= 60 ? 'bg-blue-100 text-blue-700' :
                        data.percentage >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {data.level}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{data.strengths}</p>
                    <p className="text-gray-600 text-sm bg-indigo-50 p-4 rounded-lg">
                      <strong className="text-indigo-700">Recommendation:</strong> {data.advice}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentStep('welcome');
                setCurrentQuestion(0);
                setAssessmentData({});
                setResults(null);
              }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans">
      {currentStep === 'welcome' && <WelcomeScreen />}
      {currentStep === 'assessment' && <AssessmentScreen />}
      {currentStep === 'results' && <ResultsScreen />}
      {showAuth && <AuthModal />}
    </div>
  );
};

export default CareerReadinessAssistant;
