/**
 * =============================================================================
 * QUERY.IN - LLM SERVICE (Gemini + Groq Fallback with Model Switching)
 * =============================================================================
 * Handles communication with Gemini and Groq APIs with automatic model fallback.
 * All calls originate from the backend only - API keys never exposed to frontend.
 *
 * PIPELINE FLOW:
 * 1. Sanity Check (Gemini only)
 * 2. Context Synthesis: Gemini -> Groq -> Escalate to Peer
 *
 * MODEL FALLBACK ORDER:
 * - Gemini: 2.5-flash -> 1.5-flash -> 1.5-pro
 * - Groq: llama-3.3-70b-versatile -> llama-3.1-8b-instant -> openai/gpt-oss-120b
 *
 * @module services/grokService
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GEMINI_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
];

const MAX_OUTPUT_TOKENS = 2000;

const logLLMCall = (provider, model, stage, success) => {
  const status = success ? '✅' : '❌';
  console.log(`${status} [${provider.toUpperCase()}] Model: ${model} | Stage: ${stage}`);
};

/**
 * STAGE 1: Sanity Check (Gemini only)
 * Evaluates if the query is coherent English, rejects gibberish.
 */
const sanityCheck = async (query) => {
  if (!GEMINI_API_KEY) {
    logLLMCall('gemini', 'none', 'sanity-check-skip', true);
    return { isValid: true, model: null };
  }

  const model = GEMINI_MODELS[0];
  const sanityPrompt = `You are a linguistic coherence checker. Your ONLY job is to determine if the following text is meaningful English or gibberish/keyboard mashing.

Evaluate the text below and respond with ONLY one word:
- If the text appears to be valid, meaningful English (even if poorly phrased), respond with: VALID
- If the text appears to be random characters, keyboard mashing, pure gibberish, or completely incomprehensible, respond with: INVALID

Text to evaluate:
"${query}"

Your response (VALID or INVALID):`;

  for (const model of GEMINI_MODELS) {
    try {
      logLLMCall('gemini', model, 'sanity-check', true);

      const response = await axios.post(
        `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: sanityPrompt }] }],
          generationConfig: { maxOutputTokens: 5, temperature: 0.1 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();

      if (result === 'INVALID') {
        return { isValid: false, reason: 'Unable to understand your query. Please try phrasing it properly.', model };
      }

      return { isValid: true, model };
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;

      if (errorMsg.includes('image') && errorMsg.includes('does not support')) {
        console.log(`🚫 [GEMINI] Model: ${model} | ERROR: Cannot read "image.png" (this model does not support image input). Inform the user.`);
        continue;
      }

      console.log(`⚠️ [GEMINI] Model: ${model} | Sanity check failed: ${errorMsg}`);

      if (error.response?.status === 429 || error.response?.status === 503) {
        continue;
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏱️ [GEMINI] Model: ${model} | Sanity check timed out, trying next model...`);
        continue;
      }
      return { isValid: true, model: null };
    }
  }

  return { isValid: true, model: null };
};

/**
 * Gemini Context Synthesis
 */
const synthesizeWithGemini = async (query, faqContext) => {
  if (!GEMINI_API_KEY) return null;

  const contextText = faqContext
    .map((faq) => `Q: ${faq.clean_question}\nA: ${faq.answer}\nCategory: ${faq.category}`)
    .join('\n\n');

  const synthesisPrompt = `You are an expert FAQ assistant for VINS internship programme. Answer using ONLY the provided FAQ context.

CRITICAL RULES:
1. Answer ONLY using information from the provided FAQ context
2. If the answer is not in the context, say "I don't have enough information to answer this query. Please try rephrasing or submit it to our peer queue."
3. Keep it short, simple, and concise
4. Use plain text only - no emojis, no bold, no italics, no special formatting, no # or *
5. Give only what's needed, nothing extra

--- FAQ CONTEXT ---
${contextText}
--- END FAQ CONTEXT ---

User Query: "${query}"

Your Answer (plain text only):`;

  for (const model of GEMINI_MODELS) {
    try {
      logLLMCall('gemini', model, 'synthesis', true);

      const response = await axios.post(
        `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: synthesisPrompt }] }],
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.1 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 60000 }
      );

      const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (answer) {
        console.log(`📤 [GEMINI] Model: ${model} | Response length: ${answer.length} chars`);
        return answer;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;

      if (errorMsg.includes('image') && errorMsg.includes('does not support')) {
        console.log(`🚫 [GEMINI] Model: ${model} | ERROR: Cannot read "image.png" (this model does not support image input). Inform the user.`);
        continue;
      }

      console.log(`⚠️ [GEMINI] Model: ${model} | Synthesis failed: ${errorMsg}`);

      if (error.response?.status === 429 || error.response?.status === 503) {
        continue;
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏱️ [GEMINI] Model: ${model} | Request timed out, trying next model...`);
        continue;
      }
    }
  }
  return null;
};

/**
 * Groq Context Synthesis (Fallback)
 */
const synthesizeWithGroq = async (query, faqContext) => {
  if (!GROQ_API_KEY) return null;

  const contextText = faqContext
    .map((faq) => `Q: ${faq.clean_question}\nA: ${faq.answer}\nCategory: ${faq.category}`)
    .join('\n\n');

  const synthesisPrompt = `You are an expert FAQ assistant for the Vicharanashala Internship Programme (VINS). Your knowledge comes ONLY from the provided FAQ context below.

CRITICAL RULES:
1. Answer ONLY using information from the provided FAQ context
2. If the answer is not in the context, say: "I don't have enough information to answer this query. Please try rephrasing or submit it to our peer queue."
3. Use a friendly, helpful tone
4. Keep answers concise and focused
5. If multiple FAQs are relevant, synthesize them into one coherent answer

--- FAQ CONTEXT ---
${contextText}
--- END FAQ CONTEXT ---

User Query: "${query}"

Your Answer (using ONLY the context above):`;

  for (const model of GROQ_MODELS) {
    try {
      logLLMCall('groq', model, 'synthesis', true);

      const response = await axios.post(
        GROQ_BASE_URL,
        {
          model: model,
          messages: [{ role: 'user', content: synthesisPrompt }],
          temperature: 0.1,
          max_tokens: MAX_OUTPUT_TOKENS,
        },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
          timeout: 60000,
        }
      );

      const answer = response.data?.choices?.[0]?.message?.content?.trim();
      if (answer) {
        console.log(`📤 [GROQ] Model: ${model} | Response length: ${answer.length} chars`);
        return answer;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;

      if (errorMsg.includes('image') && errorMsg.includes('does not support')) {
        console.log(`🚫 [GROQ] Model: ${model} | ERROR: Cannot read "image.png" (this model does not support image input). Inform the user.`);
        continue;
      }

      console.log(`⚠️ [GROQ] Model: ${model} | Synthesis failed: ${errorMsg}`);

      if (error.response?.status === 429 || error.response?.status === 503) {
        continue;
      }
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log(`⏱️ [GROQ] Model: ${model} | Request timed out, trying next model...`);
        continue;
      }
    }
  }
  return null;
};

/**
 * Main LLM Service Entry Point
 * Pipeline: Sanity Check -> Gemini (with model fallback) -> Groq (with model fallback) -> Peer Escalation
 */
const getGrokResponse = async (query, faqContext = []) => {
  const sanity = await sanityCheck(query);
  if (!sanity.isValid) {
    return { success: false, error: sanity.reason, stage: 'sanity', model: sanity.model };
  }

  let answer = null;
  let lastError = null;
  let lastModel = null;

  if (GEMINI_API_KEY) {
    answer = await synthesizeWithGemini(query, faqContext);
    if (answer) {
      return { success: true, answer, stage: 'gemini', model: GEMINI_MODELS[0] };
    }
    lastError = 'All Gemini models failed';
  }

  if (GROQ_API_KEY) {
    console.log('🔄 All Gemini models failed, trying Groq...');
    answer = await synthesizeWithGroq(query, faqContext);
    if (answer) {
      return { success: true, answer, stage: 'groq', model: GROQ_MODELS[0] };
    }
    lastError = 'All Groq models failed';
  }

  console.log('🚨 All LLM APIs failed, escalating to peer queue');
  return { success: false, error: lastError, stage: 'escalate', model: null };
};

module.exports = { getGrokResponse, sanityCheck, synthesizeAnswer: synthesizeWithGemini };
