const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const API_KEY = 'sk-MqG01KtjBrCgK74aanMRT5zKOel9MKk8JOCZONWSaaEZVk2K';
const API_BASE_URL = 'https://api.iamhc.cn/v1';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// ==================== AI API CALL ====================

async function callAI(systemPrompt, userPrompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/completions`,
        {
          model: 'auto',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      console.log(`Attempt ${attempt}/${retries} failed: ${error.response?.data?.message || error.message}`);
      if (attempt < retries) await new Promise(r => setTimeout(r, attempt * 2000));
    }
  }
  throw new Error('AI API call failed after retries');
}

// ==================== API ENDPOINTS ====================

app.post('/api/generate-paragraph', async (req, res) => {
  try {
    const { language, difficulty } = req.body;
    
    if (!language || !['en', 'id'].includes(language)) {
      return res.status(400).json({ error: 'Invalid language. Use "en" or "id".' });
    }

    const difficultyLevel = difficulty || 'beginner';
    
    let complexityGuide = '';
    if (difficultyLevel === 'beginner') {
      complexityGuide = 'Use simple vocabulary, present tense, basic sentence structures. Avoid idioms, complex grammar, or formal expressions. Keep sentences short (10-15 words).';
    } else if (difficultyLevel === 'intermediate') {
      complexityGuide = 'Use moderate vocabulary, mix of tenses (past/present/future), compound sentences. Include some common idioms. Sentences can be 15-20 words.';
    } else {
      complexityGuide = 'Use advanced vocabulary, complex grammar structures, formal and informal expressions, idioms, passive voice, and cultural references. Sentences can be 20+ words.';
    }

    const systemPrompt = language === 'en' 
      ? `You are a Korean language teacher. Generate an interesting paragraph in English (3-5 sentences) suitable for Korean translation practice at ${difficultyLevel} level. ${complexityGuide} Topics: daily life, hobbies, culture, food, travel, work, relationships. Make it conversational and natural.`
      : `You are a Korean language teacher. Generate an interesting paragraph in Indonesian (3-5 sentences) suitable for Korean translation practice at ${difficultyLevel} level. ${complexityGuide} Topics: daily life, hobbies, culture, food, travel, work, relationships. Make it conversational and natural.`;

    const userPrompt = `Generate a new ${difficultyLevel} level paragraph for Korean translation practice.`;

    console.log(`Generating ${difficultyLevel} paragraph in ${language}`);
    const paragraph = await callAI(systemPrompt, userPrompt);

    res.json({ success: true, paragraph: paragraph.trim(), difficulty: difficultyLevel });

  } catch (error) {
    console.error('Generate paragraph error:', error.message);
    res.status(500).json({ error: 'Failed to generate paragraph: ' + error.message });
  }
});

app.post('/api/suggest-word', async (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || word.trim().length === 0) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const systemPrompt = 'You are a Korean language dictionary. When given a Korean word or partial word, provide: 1) The complete word, 2) English/Indonesian meaning, 3) Romanization (optional). Format: {"word": "한국어", "meaning": "Korean language", "pronunciation": "hangugeo"}. Respond ONLY with valid JSON.';

    const userPrompt = `Korean word: ${word}`;

    console.log(`Suggesting for word: ${word}`);
    const suggestion = await callAI(systemPrompt, userPrompt);

    try {
      const parsed = JSON.parse(suggestion.trim());
      res.json({ success: true, suggestion: parsed });
    } catch (e) {
      const lines = suggestion.split('\n').filter(l => l.trim());
      res.json({ 
        success: true, 
        suggestion: { 
          word: word, 
          meaning: lines[0] || 'Translation',
          pronunciation: lines[1] || ''
        } 
      });
    }

  } catch (error) {
    console.error('Suggest word error:', error.message);
    res.status(500).json({ error: 'Failed to get suggestion: ' + error.message });
  }
});

app.post('/api/evaluate-translation', async (req, res) => {
  try {
    const { originalText, userTranslation, sourceLang } = req.body;
    
    if (!originalText || !userTranslation) {
      return res.status(400).json({ error: 'Original text and user translation are required' });
    }

    const langName = sourceLang === 'en' ? 'English' : 'Indonesian';

    const systemPrompt = `You are an expert Korean language teacher. Evaluate a student's Korean translation and provide:
1. The student's translation (repeat it)
2. The correct Korean translation
3. Word-by-word breakdown of the correct translation (format: "Korean word: meaning and function")
4. Detailed explanation of what they did well and what needs improvement
5. Specific grammar corrections with explanations
6. Recommendations for improvement

IMPORTANT FORMATTING RULES:
- DO NOT use markdown tables (| :--- | :--- |)
- DO NOT use blockquotes (>)
- Use simple paragraphs, bullet points with hyphens (-), and numbered lists
- Use horizontal lines (---) to separate major sections
- Use double asterisks (**text**) for bold emphasis
- Use single asterisks (*text*) for italic emphasis
- For word breakdown, use format: "word: meaning" on separate lines
- Keep formatting clean and elegant

Be encouraging but honest. Provide detailed feedback in a structured format.`;

    const userPrompt = `Original ${langName} text:
${originalText}

Student's Korean translation:
${userTranslation}

Please evaluate this translation and provide comprehensive feedback.`;

    console.log('Evaluating translation');
    const evaluation = await callAI(systemPrompt, userPrompt);

    const sections = parseEvaluation(evaluation, userTranslation);

    res.json({ 
      success: true,
      ...sections
    });

  } catch (error) {
    console.error('Evaluate translation error:', error.message);
    res.status(500).json({ error: 'Failed to evaluate translation: ' + error.message });
  }
});

function parseEvaluation(evaluation, userTranslation) {
  const lines = evaluation.split('\n');
  let correctTranslation = '';
  let breakdown = '';
  let explanation = '';
  let grammarCorrections = '';
  let recommendations = '';
  let currentSection = '';

  for (const line of lines) {
    const lower = line.toLowerCase();
    
    if (lower.includes('correct translation') || lower.includes('accurate translation') || lower.includes('proper translation')) {
      currentSection = 'correct';
      continue;
    } else if (lower.includes('word-by-word') || lower.includes('breakdown') || lower.includes('word breakdown')) {
      currentSection = 'breakdown';
      continue;
    } else if (lower.includes('explanation') || lower.includes('analysis') || lower.includes('assessment')) {
      currentSection = 'explanation';
      continue;
    } else if (lower.includes('grammar') || lower.includes('grammatical')) {
      currentSection = 'grammar';
      continue;
    } else if (lower.includes('recommendation') || lower.includes('suggestion') || lower.includes('tips')) {
      currentSection = 'recommendations';
      continue;
    }

    const content = line.trim();
    if (content.length === 0) continue;

    switch (currentSection) {
      case 'correct':
        if (content && !content.match(/^(correct|accurate|proper)/i)) {
          correctTranslation += content + '\n';
        }
        break;
      case 'breakdown':
        breakdown += content + '\n';
        break;
      case 'explanation':
        explanation += content + '\n';
        break;
      case 'grammar':
        grammarCorrections += content + '\n';
        break;
      case 'recommendations':
        recommendations += content + '\n';
        break;
      default:
        if (!correctTranslation && content.match(/[\uAC00-\uD7AF]/)) {
          correctTranslation += content + '\n';
        } else {
          explanation += content + '\n';
        }
    }
  }

  if (!correctTranslation.trim()) {
    correctTranslation = 'Translation provided above';
  }
  if (!breakdown.trim()) {
    breakdown = 'No breakdown available';
  }
  if (!explanation.trim()) {
    explanation = evaluation;
  }
  if (!grammarCorrections.trim()) {
    grammarCorrections = 'Please review the explanation section for grammar details.';
  }
  if (!recommendations.trim()) {
    recommendations = '- Keep practicing Korean sentence structure\n- Study more vocabulary\n- Practice daily for best results';
  }

  return {
    userTranslation: userTranslation,
    correctTranslation: correctTranslation.trim(),
    breakdown: breakdown.trim(),
    explanation: explanation.trim(),
    grammarCorrections: grammarCorrections.trim(),
    recommendations: recommendations.trim()
  };
}

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`Korean Journal Learning Server`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`===========================================`);
});
