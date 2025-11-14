import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TypingTrainer = () => {
  const [lessonText, setLessonText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errors, setErrors] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  // Metrics
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [score, setScore] = useState(0);
  const [avgWpm, setAvgWpm] = useState(0);
  const [avgAccuracy, setAvgAccuracy] = useState(100);
  const [avgScore, setAvgScore] = useState(0);
  
  // Letter tracking
  const [letterStats, setLetterStats] = useState<Record<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    confidence: number;
    calibrated: boolean;
  }>>({});
  const [activeLetters, setActiveLetters] = useState(['e', 't', 'a', 'o', 'i', 'n']);
  const [focusLetter, setFocusLetter] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Phonetic patterns for generating pseudo-words
  const consonants = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const allLetters = [...consonants, ...vowels];

  // Initialize letter stats
  useEffect(() => {
    const initialStats: Record<string, {
      count: number;
      totalTime: number;
      avgTime: number;
      confidence: number;
      calibrated: boolean;
    }> = {};
    activeLetters.forEach(letter => {
      initialStats[letter] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        confidence: 0,
        calibrated: false
      };
    });
    setLetterStats(initialStats);
    generateLesson();
  }, []);

  // Generate pseudo-word
  const generateWord = (letters: string[], focusLetter: string | null = null) => {
    const availableConsonants = letters.filter(l => consonants.includes(l));
    const availableVowels = letters.filter(l => vowels.includes(l));
    
    if (availableConsonants.length === 0 || availableVowels.length === 0) {
      return letters[Math.floor(Math.random() * letters.length)].repeat(2);
    }

    let word = '';
    const length = 3 + Math.floor(Math.random() * 4); // 3-6 chars
    
    // If we have a focus letter, ensure it appears
    if (focusLetter && Math.random() > 0.3) {
      word += focusLetter;
    }
    
    for (let i = word.length; i < length; i++) {
      if (i % 2 === 0) {
        word += availableConsonants[Math.floor(Math.random() * availableConsonants.length)];
      } else {
        word += availableVowels[Math.floor(Math.random() * availableVowels.length)];
      }
    }
    
    return word;
  };

  // Generate lesson text
  const generateLesson = () => {
    const words: string[] = [];
    const wordCount = 20;
    
    // Determine focus letter (slowest letter)
    let slowestLetter: string | null = null;
    let maxTime = 0;
    Object.entries(letterStats).forEach(([letter, stats]) => {
      if (stats.calibrated && stats.avgTime > maxTime) {
        maxTime = stats.avgTime;
        slowestLetter = letter;
      }
    });
    
    setFocusLetter(slowestLetter);
    
    for (let i = 0; i < wordCount; i++) {
      words.push(generateWord(activeLetters, slowestLetter));
    }
    
    setLessonText(words.join(' '));
    setUserInput('');
    setCurrentPosition(0);
    setErrors(0);
    setIsActive(false);
  };

  // Start typing
  const startTyping = () => {
    setIsActive(true);
    setStartTime(Date.now());
    inputRef.current?.focus();
  };

  // Calculate metrics
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // minutes
        const charsTyped = userInput.length;
        const wordsTyped = charsTyped / 5;
        const currentWpm = Math.round(wordsTyped / timeElapsed);
        const currentAccuracy = Math.round(((charsTyped - errors) / charsTyped) * 100) || 100;
        const currentScore = Math.max(0, Math.round(currentWpm * (currentAccuracy / 100) * activeLetters.length / 5));
        
        setWpm(currentWpm || 0);
        setAccuracy(currentAccuracy);
        setScore(currentScore);
      }, 100);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, startTime, userInput, errors, activeLetters.length]);

  // Handle typing
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (!isActive) {
      startTyping();
    }

    // Check for errors
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      const expectedChar = lessonText[value.length - 1];
      
      if (newChar !== expectedChar) {
        setErrors(prev => prev + 1);
      } else {
        // Track letter timing
        const letterTime = Date.now() - (startTime || Date.now());
        setLetterStats(prev => {
          const updated = { ...prev };
          if (updated[expectedChar]) {
            updated[expectedChar].count += 1;
            updated[expectedChar].totalTime += letterTime;
            updated[expectedChar].avgTime = updated[expectedChar].totalTime / updated[expectedChar].count;
            updated[expectedChar].calibrated = true;
            updated[expectedChar].confidence = Math.min(1, updated[expectedChar].count / 50);
          }
          return updated;
        });
      }
    }
    
    setUserInput(value);
    setCurrentPosition(value.length);
    
    // Check if lesson is complete
    if (value === lessonText) {
      setIsActive(false);
      
      // Update averages
      setAvgWpm(prev => prev ? (prev + wpm) / 2 : wpm);
      setAvgAccuracy(prev => prev ? (prev + accuracy) / 2 : accuracy);
      setAvgScore(prev => prev ? (prev + score) / 2 : score);
      
      // Check if we should add new letters
      const allConfident = Object.values(letterStats).every(s => s.confidence > 0.8);
      if (allConfident && activeLetters.length < allLetters.length) {
        const remaining = allLetters.filter(l => !activeLetters.includes(l));
        if (remaining.length > 0) {
          const newLetter = remaining[0];
          setActiveLetters(prev => [...prev, newLetter]);
          setLetterStats(prev => ({
            ...prev,
            [newLetter]: { count: 0, totalTime: 0, avgTime: 0, confidence: 0, calibrated: false }
          }));
        }
      }
      
      setTimeout(() => generateLesson(), 1500);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number, isFocus: boolean = false) => {
    if (isFocus) return 'bg-orange-500';
    if (confidence === 0) return 'bg-gray-400';
    if (confidence < 0.3) return 'bg-red-500';
    if (confidence < 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Render text with cursor
  const renderText = () => {
    return lessonText.split('').map((char, idx) => {
      let className = 'text-2xl ';
      
      if (idx < currentPosition) {
        className += userInput[idx] === char ? 'text-green-600' : 'text-red-600 bg-red-100';
      } else if (idx === currentPosition) {
        className += 'bg-blue-200 border-l-2 border-blue-600';
      } else {
        className += 'text-gray-400';
      }
      
      return <span key={idx} className={className}>{char}</span>;
    });
  };

  const chartData = Object.entries(letterStats)
    .filter(([_, stats]) => stats.calibrated)
    .map(([letter, stats]) => ({
      letter: letter.toUpperCase(),
      confidence: Math.round(stats.confidence * 100),
      samples: stats.count
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-900">Adaptive Typing Trainer</h1>
        <p className="text-center text-gray-600 mb-8">Master touch typing through intelligent practice</p>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Speed (WPM)</div>
            <div className="text-3xl font-bold text-blue-600">{wpm}</div>
            <div className="text-sm text-gray-500 mt-1">
              Avg: {Math.round(avgWpm)} 
              <span className={wpm >= avgWpm ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                {wpm >= avgWpm ? '▲' : '▼'} {Math.abs(wpm - avgWpm)}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Accuracy (%)</div>
            <div className="text-3xl font-bold text-green-600">{accuracy}</div>
            <div className="text-sm text-gray-500 mt-1">
              Avg: {Math.round(avgAccuracy)}
              <span className={accuracy >= avgAccuracy ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                {accuracy >= avgAccuracy ? '▲' : '▼'} {Math.abs(accuracy - avgAccuracy)}
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm text-gray-500 mb-1">Score</div>
            <div className="text-3xl font-bold text-purple-600">{score}</div>
            <div className="text-sm text-gray-500 mt-1">
              Avg: {Math.round(avgScore)}
              <span className={score >= avgScore ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                {score >= avgScore ? '▲' : '▼'} {Math.abs(score - avgScore)}
              </span>
            </div>
          </div>
        </div>

        {/* Text board */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-4 min-h-32 leading-relaxed">
            {renderText()}
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleTyping}
            onFocus={startTyping}
            placeholder={!isActive ? "Click or press Enter to start..." : ""}
            className="w-full p-4 border-2 border-indigo-300 rounded-lg text-lg focus:outline-none focus:border-indigo-500"
            disabled={userInput === lessonText && isActive === false}
          />
        </div>

        {/* Letter confidence */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Active Letters</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {activeLetters.map(letter => {
              const stats = letterStats[letter] || { confidence: 0, calibrated: false };
              const isFocus = letter === focusLetter;
              return (
                <div
                  key={letter}
                  className={`${getConfidenceColor(stats.confidence, isFocus)} text-white font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg relative`}
                  title={isFocus ? 'Focus letter (appears frequently)' : `Confidence: ${Math.round(stats.confidence * 100)}%`}
                >
                  {letter.toUpperCase()}
                  {!stats.calibrated && <span className="absolute -top-1 -right-1 text-yellow-300">?</span>}
                  {isFocus && <span className="absolute -top-1 -right-1 text-yellow-300">!</span>}
                </div>
              );
            })}
            {allLetters.filter(l => !activeLetters.includes(l)).slice(0, 5).map(letter => (
              <div
                key={letter}
                className="bg-gray-200 text-gray-400 font-bold text-xl w-12 h-12 flex items-center justify-center rounded-lg"
                title="Not yet unlocked"
              >
                {letter.toUpperCase()}
              </div>
            ))}
          </div>

          {focusLetter && letterStats[focusLetter] && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-4">
              <h3 className="font-bold text-orange-900 mb-2">Focus Letter: {focusLetter.toUpperCase()}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Confidence</div>
                  <div className="font-bold text-lg">{Math.round(letterStats[focusLetter].confidence * 100)}%</div>
                </div>
                <div>
                  <div className="text-gray-600">Samples</div>
                  <div className="font-bold text-lg">{letterStats[focusLetter].count}</div>
                </div>
                <div>
                  <div className="text-gray-600">Avg Time</div>
                  <div className="font-bold text-lg">{Math.round(letterStats[focusLetter].avgTime)}ms</div>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div>
              <h3 className="font-bold mb-2 text-gray-700">Letter Confidence Levels</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <XAxis dataKey="letter" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.samples} samples)`,
                      'Confidence'
                    ]}
                  />
                  <Bar dataKey="confidence" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Legend</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-400 rounded flex items-center justify-center text-white font-bold">A</div>
              <div>Non-calibrated (not typed yet)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">A</div>
              <div>Low confidence (needs practice)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">A</div>
              <div>Medium confidence</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold">A</div>
              <div>High confidence (well learned)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold relative">
                A<span className="absolute -top-1 -right-1 text-yellow-300">!</span>
              </div>
              <div>Focus letter (increased frequency)</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded flex items-center justify-center font-bold">A</div>
              <div>Not yet unlocked</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={generateLesson}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition"
          >
            New Lesson
          </button>
        </div>
      </div>
    </div>
  );
};

export default TypingTrainer;

