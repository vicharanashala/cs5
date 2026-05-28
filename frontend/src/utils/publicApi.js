/**
 * =============================================================================
 * QUERY.IN - PUBLIC API UTILITY
 * =============================================================================
 * Separate Axios instance for public routes that don't require authentication.
 * Does NOT attach JWT token and does NOT redirect on 401.
 *
 * Use this for:
 * - GET /api/faqs (public FAQ listing)
 * - Public information endpoints
 *
 * For authenticated requests, use the default `api` export from api.js
 *
 * @module utils/publicApi
 */

import axios from 'axios';

const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default publicApi;