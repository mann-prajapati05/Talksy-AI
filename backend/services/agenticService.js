/**
 * Agentic Service — Node.js wrapper for FastAPI Agentic AI layer.
 *
 * Responsibilities:
 * - Call FastAPI endpoints
 * - Handle timeouts (120s for LLM calls)
 * - Handle network errors
 * - Validate responses
 * - Return clean data to controllers
 * - Auto-retry on 502/timeout to handle Render free tier cold starts
 */

import axios from 'axios';

let AGENTIC_SERVICE_URL = (process.env.AGENTIC_SERVICE_URL || 'http://localhost:8000').trim().replace(/\/+$/, '');
const TIMEOUT_MS = 120_000; // 120 seconds — LLM calls can be slow

// Retry configuration to handle Render free tier cold starts (up to 2 minutes)
const RETRY_ATTEMPTS = 8;
const RETRY_DELAY_MS = 15_000; // 15 seconds

/**
 * Helper to call an API function with automatic retries on 502 Bad Gateway or timeouts.
 */
async function callWithRetry(apiCallFn, retries = RETRY_ATTEMPTS, delay = RETRY_DELAY_MS) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await apiCallFn();
        } catch (err) {
            const is502 = err.response?.status === 502;
            const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
            const isNetworkError = !err.response && err.request; // Server didn't respond at all

            const shouldRetry = (is502 || isTimeout || isNetworkError) && attempt < retries;

            if (shouldRetry) {
                console.log(`[AgenticService] Request failed (${err.message || 'Network error'}). Render instance might be asleep. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw err;
        }
    }
}

/**
 * Start an agentic interview — generates the first question.
 *
 * @param {Object} data - Candidate/interview context
 * @returns {Promise<Object>} { success, next_question }
 */
export async function startInterview(data) {
    const url = `${AGENTIC_SERVICE_URL}/api/v1/interview/start`;
    console.log(`[AgenticService] start request to: ${url}`);

    const apiCall = async () => {
        const response = await axios.post(
            url,
            {
                role: data.role,
                experience: data.experience,
                mode: data.mode,
                skills: data.skills || '',
                projects: data.projects || '',
                exp: data.exp || '',
                resumeText: data.resumeText || '',
            },
            { timeout: TIMEOUT_MS }
        );

        console.log('[AgenticService] start response received successfully');

        if (!response.data || !response.data.success || !response.data.next_question) {
            throw new Error('Invalid response from agentic service');
        }

        return response.data;
    };

    try {
        return await callWithRetry(apiCall);
    } catch (err) {
        console.error('[AgenticService] start request failed permanently:', err.message);
        if (err.response) {
            console.error('[AgenticService] Error Response Status:', err.response.status);
            console.error('[AgenticService] Error Response Data:', err.response.data);
        }

        if (err.code === 'ECONNREFUSED') {
            throw new Error('Agentic AI service is unavailable. Please try again later.');
        }
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            throw new Error('Agentic AI service timed out. Please try again.');
        }
        if (err.response?.data?.detail) {
            throw new Error(`Agentic AI error: ${err.response.data.detail}`);
        }

        throw new Error('Failed to generate interview question. Please try again.');
    }
}

/**
 * Process a candidate answer — evaluates and generates next question.
 *
 * @param {Object} data
 * @returns {Promise<Object>} { success, next_question, evaluation, strategy, summary }
 */
export async function processAnswer(data) {
    const url = `${AGENTIC_SERVICE_URL}/api/v1/interview/answer`;
    console.log(`[AgenticService] answer request to: ${url}`);

    const apiCall = async () => {
        const response = await axios.post(
            url,
            {
                interviewId: data.interviewId || '',

                cur_question: data.cur_question,
                cur_answer: data.cur_answer,

                prev_summary: data.prev_summary || null,

                follow_up_allowed: data.follow_up_allowed || false,
                follow_up_context: data.follow_up_context || '',
                follow_up_cnt: data.follow_up_cnt || 0,
                follow_up_score: data.follow_up_score || 0,

                recent_topic: data.recent_topic || '',
                topic_coverage: data.topic_coverage || '',

                next_focus: data.next_focus || 'initial_assessment',
                next_topic: data.next_topic || '',
                next_difficulty: data.next_difficulty || 'easy',
                next_question_type: data.next_question_type || 'technical',

                candidate: data.candidate,
            },
            { timeout: TIMEOUT_MS }
        );

        console.log('[AgenticService] answer response received successfully');

        if (!response.data || !response.data.success) {
            throw new Error('Invalid response from agentic service');
        }

        return response.data;
    };

    try {
        return await callWithRetry(apiCall);
    } catch (err) {
        console.error('[AgenticService] answer request failed permanently:', err.message);
        if (err.response) {
            console.error('[AgenticService] Error Response Status:', err.response.status);
            console.error('[AgenticService] Error Response Data:', err.response.data);
        }

        if (err.code === 'ECONNREFUSED') {
            throw new Error('Agentic AI service is unavailable. Please try again later.');
        }
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
            throw new Error('Agentic AI service timed out. Please try again.');
        }
        if (err.response?.data?.detail) {
            throw new Error(`Agentic AI error: ${err.response.data.detail}`);
        }

        throw new Error('Failed to process answer. Please try again.');
    }
}
