// Get API key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Rate limiting and caching
let lastApiCall = 0;
const MIN_DELAY_BETWEEN_CALLS = 2000; // 2 seconds between API calls
const questionsCache = new Map();

export const generateQuestionsFromResume = async (resumeText) => {
  if (!API_KEY) {
    console.error('Gemini API key is not set in environment variables.');
    return {
      easy: ['Tell me about yourself.', 'What are your strengths?', 'Why do you want this job?'],
      medium: ['Describe a challenging project you worked on.', 'How do you handle stress?', 'What motivates you?'],
      hard: ['Where do you see yourself in 5 years?', 'What is your biggest weakness?', 'Why should we hire you?'],
    };
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  // Check cache first
  const cacheKey = resumeText.substring(0, 100); // Use first 100 chars as cache key
  if (questionsCache.has(cacheKey)) {
    console.log('🎯 Using cached questions');
    return questionsCache.get(cacheKey);
  }

  // Rate limiting - wait if we called API too recently
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < MIN_DELAY_BETWEEN_CALLS) {
    const waitTime = MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall;
    console.log(`⏳ Rate limiting: waiting ${waitTime}ms before API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }

  const prompt = `Based on the following resume text for a full-stack (React/Node.js) role, generate a set of 6 interview questions. The questions must be answerable within the following time limits: Easy questions in 20 seconds, Medium questions in 60 seconds, and Hard questions in 120 seconds. Categorize the questions into 'easy', 'medium', and 'hard' difficulties, with 2 questions for each category. Return the questions in a valid JSON object format like this: { "easy": ["q1", "q2"], "medium": ["q3", "q4"], "hard": ["q5", "q6"] }. Resume Text: --- ${resumeText} ---`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      maxOutputTokens: 2048,
    }
  };

  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Generating questions (attempt ${attempt}/${maxRetries})`);
      lastApiCall = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 5000; // Exponential backoff: 5s, 10s, 20s
        console.log(`⚠️ Rate limited (429). Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('API Error Response:', errorBody);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      const text = responseData.candidates[0].content.parts[0].text;
      
      // A more robust way to extract JSON from the AI's response
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonString = text.substring(startIndex, endIndex + 1);
          const questions = JSON.parse(jsonString);
          
          // Cache the successful result
          questionsCache.set(cacheKey, questions);
          console.log('✅ Questions generated and cached successfully');
          
          return questions;
      } else {
          throw new Error('Failed to find a valid JSON object in the AI response.');
      }

    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.log('🔄 All retries failed, using fallback questions');
        const fallbackQuestions = {
          easy: [
            'Tell me about yourself and your background.',
            'What interests you about this full-stack developer position?'
          ],
          medium: [
            'Describe a challenging project you worked on and how you overcame obstacles.',
            'Explain the difference between React state and props.'
          ],
          hard: [
            'How would you optimize the performance of a React application?',
            'Design a scalable architecture for a high-traffic web application.'
          ]
        };
        
        // Cache the fallback too
        questionsCache.set(cacheKey, fallbackQuestions);
        return fallbackQuestions;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  
  // This should never be reached, but just in case
  console.log('🔄 Unexpected end of function, using final fallback questions');
  const finalFallback = {
    easy: [
      'Tell me about yourself and your background.',
      'What interests you about this full-stack developer position?'
    ],
    medium: [
      'Describe a challenging project you worked on and how you overcame obstacles.',
      'Explain the difference between React state and props.'
    ],
    hard: [
      'How would you optimize the performance of a React application?',
      'Design a scalable architecture for a high-traffic web application.'
    ]
  };
  return finalFallback;
};

export const judgeAnswer = async (question, answer) => {
  if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.error('Gemini API key is not set.');
    return { score: 5, feedback: 'Could not judge answer due to missing API key.' };
  }

  const prompt = `A candidate was asked: "${question}". They answered: "${answer}". As a senior interviewer, rate this answer from 1-10 and provide brief feedback. Respond ONLY with valid JSON: {"score": number, "feedback": "text"}`;

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature: 0.3, 
      maxOutputTokens: 150,
      topK: 1,
      topP: 0.8
    },
  };

  const maxRetries = 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI judging attempt ${attempt}/${maxRetries}`);
      
      // Rate limiting for judging too
      const now = Date.now();
      const timeSinceLastCall = now - lastApiCall;
      if (timeSinceLastCall < MIN_DELAY_BETWEEN_CALLS) {
        const waitTime = MIN_DELAY_BETWEEN_CALLS - timeSinceLastCall;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      lastApiCall = Date.now();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.status === 429) {
        const waitTime = Math.pow(2, attempt) * 5000; // Exponential backoff: 5s, 10s, 20s
        console.log(`⚠️ Rate limited (429). Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();
      
      if (!responseData.candidates || !responseData.candidates[0] || !responseData.candidates[0].content) {
        throw new Error('Invalid response structure from API');
      }
      
      const text = responseData.candidates[0].content.parts[0].text;
      console.log('🤖 AI Response:', text);
      
      // More robust JSON extraction
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        const jsonString = text.substring(startIndex, endIndex + 1);
        const result = JSON.parse(jsonString);
        
        // Validate the result
        if (typeof result.score === 'number' && typeof result.feedback === 'string') {
          // Ensure score is within valid range
          result.score = Math.max(0, Math.min(10, Math.round(result.score)));
          console.log(`✅ AI judging successful: ${result.score}/10`);
          return result;
        } else {
          throw new Error('Invalid JSON structure in AI response');
        }
      } else {
        throw new Error('No valid JSON found in AI response');
      }

    } catch (error) {
      console.error(`❌ AI judging attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        // Final fallback - return a reasonable default
        console.log('🔄 Using fallback scoring...');
        const wordCount = answer.trim().split(/\s+/).length;
        const fallbackScore = Math.min(8, Math.max(2, Math.floor(wordCount / 10) + 3));
        
        return { 
          score: fallbackScore, 
          feedback: 'AI evaluation temporarily unavailable. Score based on answer length and completeness.' 
        };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
};
