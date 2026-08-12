/**
 * Agentic Service — Node.js wrapper for FastAPI Agentic AI layer.
 *
 * Responsibilities:
 * - Call FastAPI endpoints
 * - Handle timeouts (120s for LLM calls)
 * - Handle network errors
 * - Validate responses
 * - Return clean data to controllers
 */

import axios from 'axios';

const AGENTIC_SERVICE_URL = process.env.AGENTIC_SERVICE_URL || 'http://localhost:8000';
const TIMEOUT_MS = 120_000; // 120 seconds — LLM calls can be slow

/**
 * Start an agentic interview — generates the first question.
 *
 * @param {Object} data - Candidate/interview context
 * @param {string} data.role
 * @param {string} data.experience
 * @param {string} data.mode
 * @param {string} data.skills
 * @param {string} data.projects
 * @param {string} data.exp
 * @param {string} data.resumeText
 * @returns {Promise<Object>} { success, next_question }
 */
export async function startInterview(data) {
    console.log('[AgenticService] start request');

    try {
        const response = await axios.post(
            `${AGENTIC_SERVICE_URL}/api/v1/interview/start`,
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

        console.log('[AgenticService] start response received');

        if (!response.data || !response.data.success || !response.data.next_question) {
            throw new Error('Invalid response from agentic service');
        }

        return response.data;
    } catch (err) {
        console.error('[AgenticService] start request failed:', err.message);

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
 * @param {string} data.interviewId
 * @param {Object} data.cur_question
 * @param {string} data.cur_answer
 * @param {string|null} data.prev_summary
 * @param {boolean} data.follow_up_allowed
 * @param {string} data.follow_up_context
 * @param {number} data.follow_up_cnt
 * @param {number} data.follow_up_score
 * @param {string} data.recent_topic
 * @param {string} data.topic_coverage
 * @param {string} data.next_focus
 * @param {string} data.next_topic
 * @param {string} data.next_difficulty
 * @param {string} data.next_question_type
 * @param {Object} data.candidate - { role, experience, mode, skills, projects, exp, resumeText }
 * @returns {Promise<Object>} { success, next_question, evaluation, strategy, summary }
 */
export async function processAnswer(data) {
    console.log('[AgenticService] answer request');

    try {
        const response = await axios.post(
            `${AGENTIC_SERVICE_URL}/api/v1/interview/answer`,
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

        console.log('[AgenticService] answer response received');

        if (!response.data || !response.data.success) {
            throw new Error('Invalid response from agentic service');
        }

        return response.data;
    } catch (err) {
        console.error('[AgenticService] answer request failed:', err.message);

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
