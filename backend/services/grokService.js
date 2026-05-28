/**
 * =============================================================================
 * QUERY.IN - GEMINI LLM SERVICE
 * =============================================================================
 * Handles all communication with the Gemini API for query synthesis.
 * All calls originate from the backend only - API key never exposed to frontend.
 *
 * Uses direct REST API calls to ensure correct API version (v1) is used.
 *
 * PIPELINE STAGES:
 * 1. Sanity Check - Evaluate linguistic coherence, reject gibberish
 * 2. Context Synthesis - Inject FAQ context + query, use low temperature
 * 3. Return response to controller for frontend handling
 *
 * @module services/grokService
 */

const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0-pro';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1/models';

const getModelUrl = (modelName) => `${GEMINI_BASE_URL}/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * STAGE 1: Sanity Check
 * Sends the user's query to Gemini to evaluate if it's coherent English.
 * Rejects keyboard mashing, random characters, or gibberish.
 *
 * @param {string} query - The user's raw query text
 * @returns {Object} { isValid: boolean, reason?: string }
 */
const sanityCheck = async (query) => {
  const sanityPrompt = `You are a linguistic coherence checker. Your ONLY job is to determine if the following text is meaningful English or gibberish/keyboard mashing.

Evaluate the text below and respond with ONLY one word:
- If the text appears to be valid, meaningful English (even if poorly phrased), respond with: VALID
- If the text appears to be random characters, keyboard mashing, pure gibberish, or completely incomprehensible, respond with: INVALID

Text to evaluate:
"${query}"

Your response (VALID or INVALID):`;

  try {
    const response = await axios.post(
      getModelUrl(GEMINI_MODEL),
      {
        contents: [
          {
            parts: [{ text: sanityPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 5,
          temperature: 0.1,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase();

    if (result === 'INVALID') {
      return {
        isValid: false,
        reason: 'Unable to understand your query. Please try phrasing it properly.',
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('Gemini sanity check error:', error.response?.data || error.message);
    return { isValid: true };
  }
};

/**
 * STAGE 2: Deep Context Synthesis
 * Synthesizes an answer using Gemini with the full FAQ knowledge base as context.
 * Uses strict low temperature (0.1) to minimize hallucinations.
 *
 * @param {string} query - The user's query
 * @param {Array} faqContext - Array of FAQ documents to inject as context
 * @returns {string} The synthesized answer
 */
const synthesizeAnswer = async (query, faqContext) => {
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

  try {
    const response = await axios.post(
      getModelUrl(GEMINI_MODEL),
      {
        contents: [
          {
            parts: [{ text: synthesisPrompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.1,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (error) {
    console.error('Gemini synthesis error:', error.response?.data || error.message);
    return null;
  }
};

/**
 * Main Gemini Service Entry Point
 * Executes the full pipeline: Sanity Check -> Context Synthesis
 *
 * @param {string} query - The intern's query
 * @param {Array} faqContext - FAQ documents for context injection
 * @returns {Object} { success, answer?, error?, stage: 'sanity'|'synthesis' }
 */
const getGrokResponse = async (query, faqContext = []) => {
  if (!GEMINI_API_KEY) {
    return { success: false, error: 'Gemini API is not configured.', stage: 'config' };
  }

  const sanity = await sanityCheck(query);
  if (!sanity.isValid) {
    return { success: false, error: sanity.reason, stage: 'sanity' };
  }

  const answer = await synthesizeAnswer(query, faqContext);
  if (!answer) {
    return { success: false, error: 'Unable to generate an answer.', stage: 'synthesis' };
  }

  return { success: true, answer, stage: 'complete' };
};

module.exports = { getGrokResponse, sanityCheck, synthesizeAnswer };