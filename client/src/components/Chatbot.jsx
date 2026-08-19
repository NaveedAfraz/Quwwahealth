import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi';
import quwwaLogo from '../assets/images/header.png';

const Chatbot = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatContainerRef = useRef(null);

  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').replace(/['"]/g, '');
  const genAI = new GoogleGenerativeAI(apiKey);

  // Pre-defined FAQ questions and answers
  const faqData = {
    "What is Quwwa Health?": "Quwwa Health is a wellness company helping schools promote student health through PE, fitness assessments, nutrition, and wellness programs.",
    "Tell me about the Alpro Health & Fitness Program.": "It's our flagship school program that combines structured PE sessions, student fitness assessments, healthy lifestyle education, and sports coaching.",
    "How does your school health program work?": "We assess each child's physical health through age-appropriate fitness tests and provide schools and parents with detailed health report cards.",
    "What are the benefits for schools?": "Our program supports NEP 2020, improves student health, builds school reputation, and requires minimal school effort—we handle staff, tools, and training.",
    "What makes Quwwa Health different?": "We offer end-to-end wellness solutions aligned with WHO standards, including data-backed assessments, certified staff, and custom programs.",
    "What kind of health assessments do you do for kids?": "We check BMI, posture, strength, endurance, balance, flexibility, and more—depending on the child's age group.",
    "What does the student fitness report include?": "It includes physical fitness scores, growth markers, and personalized recommendations for improvement.",
    "How often are assessments conducted?": "Either once or twice a year, based on the school's chosen package.",
    "What parameters are tracked in the report card?": "BMI, endurance, strength, flexibility, balance, posture, and sport skills (for senior classes).",
    "Can you explain your PE and sports program?": "We provide regular PE classes, multi-sport sessions, and certified sports coaching aligned with global standards like SHAPE America.",
    "What is the cost per student?": "It varies depending on the package and number of assessments. For more info Email us at info@quwwahealth.com or call +91 8770922310.",
    "What age groups do you cover?": "Our programs cover Nursery to Class 12 with age-appropriate structure.",
    "Do you provide equipment and staff?": "Yes, all coaching staff and equipment are provided by Quwwa Health.",
    "What sports do you offer coaching for?": "Football, Cricket, Table Tennis, Athletics, Yoga, Judo, Karate, and more—depending on school interest.",
    "Do you organize inter-school events?": "Yes, we plan and execute sports days, tournaments, and branded fitness events.",
    "How can our school host a sports day with Quwwa Health?": "Just contact us—we'll manage the entire event from planning to execution.",
    "Are your coaches certified?": "Absolutely. All our coaches are certified professionals trained to work with children.",
    "What is your healthy canteen initiative?": "We guide schools to build clean, balanced menus and promote healthy eating habits through awareness activities.",
    "Do you help schools plan menus?": "Yes, our team includes nutritionists who assist in designing healthy canteen options.",
    "Can students learn about nutrition?": "Yes, we conduct nutrition workshops, awareness campaigns, and sugar awareness programs.",
    "Is there a sugar awareness program?": "Yes! We visually display sugar content in common foods and educate kids on making better choices.",
    "How does this help improve academics?": "Fit and active students have better focus, memory, and academic performance.",
    "Will this support NEP 2020 guidelines?": "100%. Our programs are built to align with NEP 2020's focus on holistic student development.",
    "Do you provide data to share with parents?": "Yes, each child's fitness report is shared with both school and parents.",
    "Do you offer sponsorship opportunities?": "Yes, brands can sponsor events, camps, or school-wide programs with logo visibility and engagement.",
    "Can brands partner with Quwwa Health?": "Absolutely! We welcome CSR-aligned partners looking to support school wellness.",
    "How does CSR align with your programs?": "Our programs meet CSR goals for health, education, and child development—plus measurable impact reports.",
    "What kind of holiday camps do you run?": "Our camps blend fitness, creativity, sports, and life skills into fun, safe summer or winter break programs.",
    "What activities are included in summer camp?": "Multi-sport games, DIY crafts, team challenges, yoga, fitness circuits, and creative workshops.",
    "How can we book a holiday camp at our school?": "Just drop us a message—we'll handle planning, staffing, and setup for your school.",
    "How do we get started?": "Book a demo or call us directly. We'll customize the program for your school.",
    "Can I see a sample report?": "Yes! We'll send you a digital sample upon request. Email us at info@quwwahealth.com or call +91 8770922310.",
    "Do you visit the school or run online programs?": "We provide on-site implementation for physical assessments and coaching.",
    "How do we schedule a demo?": "Email us at info@quwwahealth.com or call +91 8770922310 to schedule one today."
  };

  // Suggested questions to show initially
  const suggestedQuestions = [
    "What is Quwwa Health?",
    "Tell me about the Alpro Health & Fitness Program.",
    "How does your school health program work?"
  ];

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Prevent background page from scrolling when chat is open on mobile
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    if (window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleContainerWheel = (e) => {
    e.stopPropagation();
    const el = chatContainerRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isAtTop = scrollTop <= 0 && e.deltaY < 0;
    const isAtBottom = (scrollTop + clientHeight >= scrollHeight - 1) && e.deltaY > 0;
    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  };

  const appendContactInfo = (text) => {
    const contactSuffix = " For more info Email us at info@quwwahealth.com or call +91 8770922310.";
    if (text.includes("info@quwwahealth.com") || text.includes("+91 8770922310") || text.includes("8770922310")) {
      return text;
    }
    return `${text}${contactSuffix}`;
  };

  const findFuzzyFAQ = (query) => {
    const cleanQuery = query.trim().toLowerCase().replace(/[?.,!]/g, '');
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return null;

    let bestKey = null;
    let maxMatches = 0;

    Object.keys(faqData).forEach(key => {
      const cleanKey = key.toLowerCase();
      let matches = 0;
      words.forEach(word => {
        if (cleanKey.includes(word)) {
          matches++;
        }
      });
      if (matches > maxMatches) {
        maxMatches = matches;
        bestKey = key;
      }
    });

    return bestKey ? faqData[bestKey] : null;
  };

  const generateFallbackResponse = (query) => {
    const cleanQuery = query.toLowerCase().trim();
    
    // 1. Try fuzzy FAQ lookup
    const fuzzyMatch = findFuzzyFAQ(query);
    if (fuzzyMatch) return fuzzyMatch;
    
    // 2. Greetings
    if (/\b(hi|hello|hey|greetings|hii+|hey+)\b/.test(cleanQuery)) {
      return "Hello! How can I help you today? I'm here to answer any questions about our physical education programs, student fitness assessments, nutrition workshops, or events.";
    }
    
    // 3. Pricing / Cost
    if (/\b(cost|price|fees|pricing|package|charge|pay)\b/.test(cleanQuery)) {
      return "Our program costs depend on the school size and the package selected (e.g., number of assessments per year). We can customize a package that fits your school's needs perfectly.";
    }
    
    // 4. Contact / Details
    if (/\b(contact|phone|call|email|address|reach|office|number)\b/.test(cleanQuery)) {
      return "You can reach us directly for any queries, demo scheduling, or partnerships. We are always happy to help!";
    }
    
    // 5. Programs / Fitness / Sports
    if (/\b(program|pe|sports|fitness|coach|assess|report|test|card|health)\b/.test(cleanQuery)) {
      return "We offer age-appropriate PE curricula, student fitness assessments (measuring BMI, strength, flexibility, etc.), and specialized sports coaching sessions for football, cricket, and more.";
    }
    
    // 6. Nutrition / Canteen / Food
    if (/\b(nutrition|canteen|food|sugar|diet|eat)\b/.test(cleanQuery)) {
      return "Our healthy canteen initiative helps schools build balanced menus, and we conduct interactive nutrition workshops and sugar awareness displays for students.";
    }
    
    // 7. Camps
    if (/\b(camp|summer|winter|holiday|break)\b/.test(cleanQuery)) {
      return "Our holiday camps combine sports coaching, physical training, and creative workshops during school breaks. We can organize and run these directly at your school campus.";
    }
    
    // 8. General fallback options to rotate
    const generalFallbacks = [
      "Could you please specify if you're interested in our school PE classes, student health report cards, or nutrition programs?",
      "I want to make sure I give you the best information. Are you asking about our school packages, event organization, or coaching staff?",
      "We help schools promote healthy active lifestyles through assessments, PE coaching, and canteen menu design. Let me know what specific area you'd like to learn more about."
    ];
    
    const index = cleanQuery.length % generalFallbacks.length;
    return generalFallbacks[index];
  };

  const callGroqFallback = async (prompt) => {
    const groqKey = (import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY || '').replace(/['"]/g, '');
    if (!groqKey) {
      throw new Error('Groq API Key not configured');
    }
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  };

  const withTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
    ]);
  };

  const getBotResponse = async (query) => {
    const cleanQuery = query.trim().toLowerCase().replace(/[?.,!]/g, '');

    // 1. Check exact FAQ match
    const exactFaqKey = Object.keys(faqData).find(key => {
      return key.trim().toLowerCase().replace(/[?.,!]/g, '') === cleanQuery;
    });
    if (exactFaqKey) {
      return faqData[exactFaqKey];
    }

    // 2. Check fuzzy FAQ match (only for queries >= 4 chars)
    if (query.trim().length >= 4) {
      const fuzzyMatch = findFuzzyFAQ(query);
      if (fuzzyMatch) {
        return fuzzyMatch;
      }
    }

    // 3. Check keyword categories
    // Greetings
    if (/\b(hi|hello|hey|greetings|hii+|hey+)\b/.test(cleanQuery)) {
      return "Hello! How can I help you today? I'm here to answer any questions about our physical education programs, student fitness assessments, nutrition workshops, or events.";
    }
    
    // Pricing / Cost
    if (/\b(cost|price|fees|pricing|package|charge|pay)\b/.test(cleanQuery)) {
      return "Our program costs depend on the school size and the package selected (e.g., number of assessments per year). We can customize a package that fits your school's needs perfectly.";
    }
    
    // Contact / Details
    if (/\b(contact|phone|call|email|address|reach|office|number)\b/.test(cleanQuery)) {
      return "You can reach us directly for any queries, demo scheduling, or partnerships. Email us at info@quwwahealth.com or call +91 8770922310.";
    }
    
    // Programs / Fitness / Sports
    if (/\b(program|pe|sports|fitness|coach|assess|report|test|card|health)\b/.test(cleanQuery)) {
      return "We offer age-appropriate PE curricula, student fitness assessments (measuring BMI, strength, flexibility, etc.), and specialized sports coaching sessions for football, cricket, and more.";
    }
    
    // Nutrition / Canteen / Food
    if (/\b(nutrition|canteen|food|sugar|diet|eat)\b/.test(cleanQuery)) {
      return "Our healthy canteen initiative helps schools build balanced menus, and we conduct interactive nutrition workshops and sugar awareness displays for students.";
    }
    
    // Camps
    if (/\b(camp|summer|winter|holiday|break)\b/.test(cleanQuery)) {
      return "Our holiday camps combine sports coaching, physical training, and creative workshops during school breaks. We can organize and run these directly at your school campus.";
    }

    // 4. Fall back to AI with a streamlined system prompt
    const systemPrompt = `You are the Quwwa Health Assistant, a helpful AI assistant for Quwwa Health.
Quwwa Health helps schools promote student health through:
- Physical Education (PE) programs and specialized sports coaching.
- Student fitness assessments and health report cards.
- Healthy canteen menu design and nutrition workshops.
- Summer/winter holiday camps.

Instructions:
- Answer the user's question concisely, professionally, and in a friendly tone.
- If the user asks for contact information, always provide: Email us at info@quwwahealth.com or call +91 8770922310.

User's question: ${query}`;

    try {
      console.time("Groq AI Call");
      const text = await withTimeout(callGroqFallback(systemPrompt), 4000);
      console.timeEnd("Groq AI Call");
      return text;
    } catch (groqError) {
      console.error('Groq API error, trying Gemini:', groqError);
      try {
        console.time("Gemini AI Call");
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        const result = await withTimeout(model.generateContent(systemPrompt), 4000);
        const response = await result.response;
        const text = response.text();
        console.timeEnd("Gemini AI Call");
        return text;
      } catch (geminiError) {
        console.error('Gemini AI error:', geminiError);
        // Fallback to rotating general suggestions
        const generalFallbacks = [
          "Could you please specify if you're interested in our school PE classes, student health report cards, or nutrition programs?",
          "I want to make sure I give you the best information. Are you asking about our school packages, event organization, or coaching staff?",
          "We help schools promote healthy active lifestyles through assessments, PE coaching, and canteen menu design. Let me know what specific area you'd like to learn more about."
        ];
        const index = cleanQuery.length % generalFallbacks.length;
        return generalFallbacks[index];
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const responseText = await getBotResponse(currentInput);
      setMessages((prev) => [...prev, { sender: 'bot', text: appendContactInfo(responseText) }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: appendContactInfo("I'm sorry, I encountered an issue. Please try again or email us at info@quwwahealth.com.") }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question) => {
    setInput(question);
    const userMessage = { sender: 'user', text: question };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const responseText = await getBotResponse(question);
      setMessages((prev) => [...prev, { sender: 'bot', text: appendContactInfo(responseText) }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: appendContactInfo("I'm sorry, I encountered an issue. Please try again or email us at info@quwwahealth.com.") }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Bubble */}
      <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#54BD95] text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-transform transform hover:scale-105 active:scale-95"
          aria-label={isOpen ? "Close chat" : "Open chat"}
        >
          {isOpen ? <FiX size={26} /> : <FiMessageSquare size={26} />}
        </button>
      </div>

      {/* Chat Window */}
      <div
        onWheel={handleContainerWheel}
        className={`fixed bottom-20 right-3 left-3 sm:left-auto sm:right-8 sm:bottom-28 z-50 sm:w-96 max-w-full bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[calc(100vh-6.5rem)] sm:max-h-[600px] overflow-hidden overscroll-contain transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-[#54BD95] p-3.5 sm:p-4 rounded-t-2xl flex items-center justify-between gap-3 text-white flex-shrink-0 select-none">
          <div className="flex items-center gap-3">
            <img src={quwwaLogo} alt="Quwwa Health" className="h-8 bg-white p-1 rounded-md object-contain" />
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg leading-tight">Quwwa Health Assistant</h3>
              <p className="text-xs text-green-100">Powered by Gemini</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center justify-center"
            aria-label="Close chat window"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          onWheel={handleContainerWheel}
          className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 min-h-[200px] max-h-[50vh] sm:max-h-[380px] overscroll-contain"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="flex justify-start">
            <div className="max-w-[85%] px-4 py-2.5 rounded-2xl bg-gray-100 text-[#191A15] text-sm sm:text-base rounded-bl-none">
              Hello! I am the Quwwa Health assistant. How can I help you today?
            </div>
          </div>

          {/* Suggested Questions */}
          {showSuggestions && messages.length === 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-gray-500 font-medium">Quick questions:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="block w-full text-left px-3 py-2 text-xs sm:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm sm:text-base ${
                  msg.sender === 'bot'
                    ? 'bg-gray-100 text-[#191A15] rounded-bl-none'
                    : 'bg-[#54BD95] text-white rounded-br-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-[#A6A6A6] px-4 py-2.5 rounded-2xl rounded-bl-none text-sm">
                Typing...
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm border-transparent focus:outline-none focus:ring-2 focus:ring-[#54BD95]"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-[#54BD95] text-white p-2.5 sm:p-3 rounded-full hover:bg-green-600 disabled:bg-gray-300 transition-colors flex-shrink-0"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <FiSend size={18} />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot; 