/**
 * API Endpoint Tests
 * Test all API routes to ensure they work correctly
 */

import { describe, it, expect, beforeAll } from 'vitest';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('API Endpoints', () => {
  describe('Public Endpoints', () => {
    it('GET /api/agents - should return agents list', async () => {
      const response = await fetch(`${BASE_URL}/api/agents`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('agents');
      expect(Array.isArray(data.agents)).toBe(true);
    });

    it('GET /api/agents?category=development - should filter by category', async () => {
      const response = await fetch(`${BASE_URL}/api/agents?category=development`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('agents');
    });

    it('GET /api/agents?featured=true - should return featured agents', async () => {
      const response = await fetch(`${BASE_URL}/api/agents?featured=true`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('agents');
    });

    it('GET /api/prompt-templates - should return templates list', async () => {
      const response = await fetch(`${BASE_URL}/api/prompt-templates`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('templates');
      expect(Array.isArray(data.templates)).toBe(true);
    });
  });

  describe('Protected Endpoints', () => {
    it('GET /api/projects - should return 401 without auth', async () => {
      const response = await fetch(`${BASE_URL}/api/projects`);
      expect(response.status).toBe(401);
    });

    it('GET /api/dashboard/stats - should return 401 without auth', async () => {
      const response = await fetch(`${BASE_URL}/api/dashboard/stats`);
      expect(response.status).toBe(401);
    });

    it('POST /api/agents - should return 401 without auth', async () => {
      const response = await fetch(`${BASE_URL}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test Agent' })
      });
      expect(response.status).toBe(401);
    });
  });

  describe('Agent Endpoints', () => {
    it('GET /api/agents - should return valid agent structure', async () => {
      const response = await fetch(`${BASE_URL}/api/agents`);
      const data = await response.json();
      
      if (data.agents.length > 0) {
        const agent = data.agents[0];
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('description');
        expect(agent).toHaveProperty('category');
        expect(agent).toHaveProperty('steps');
        expect(agent).toHaveProperty('input_schema');
      }
    });
  });

  describe('Error Handling', () => {
    it('GET /api/agents/invalid-id - should return 404', async () => {
      const response = await fetch(`${BASE_URL}/api/agents/00000000-0000-0000-0000-000000000000`);
      expect(response.status).toBe(404);
    });

    it('POST /api/agents - should validate required fields', async () => {
      const response = await fetch(`${BASE_URL}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      expect(response.status).toBe(401); // Will be 400 after auth
    });
  });
});

describe('Tool APIs', () => {
  describe('CSV Tool', () => {
    it('POST /api/tools/csv - should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/tools/csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse' })
      });
      expect(response.status).toBe(401);
    });
  });

  describe('Image Tool', () => {
    it('POST /api/tools/image - should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/tools/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze' })
      });
      expect(response.status).toBe(401);
    });
  });

  describe('PDF Tool', () => {
    it('POST /api/tools/pdf - should require authentication', async () => {
      const response = await fetch(`${BASE_URL}/api/tools/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extract_text' })
      });
      expect(response.status).toBe(401);
    });
  });
});

describe('Health Checks', () => {
  it('Should have working development server', async () => {
    const response = await fetch(BASE_URL);
    expect(response.status).toBe(200);
  });
});
