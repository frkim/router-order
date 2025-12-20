/**
 * Unit tests for stock response schema validation
 */
const Ajv = require('ajv');
const fs = require('fs');
const path = require('path');

const stockResponseSchema = {
  type: 'object',
  properties: {
    inventory: {
      type: 'object',
      properties: {
        lastUpdated: { type: 'string' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              model: { type: 'string' },
              quantity: { type: 'integer' },
              status: { type: 'string', enum: ['In Stock', 'Out of Stock', 'Limited'] }
            },
            required: ['model', 'quantity', 'status']
          }
        }
      },
      required: ['lastUpdated', 'items']
    }
  },
  required: ['inventory']
};

describe('Stock Response Schema Validation Tests', () => {
  let ajv;
  let validate;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true });
    validate = ajv.compile(stockResponseSchema);
  });

  test('in-stock response should pass validation', () => {
    const inStockResponse = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../fixtures/stock-in-stock-response.json'), 'utf-8')
    );
    
    const isValid = validate(inStockResponse);
    expect(isValid).toBe(true);
  });

  test('out-of-stock response should pass validation', () => {
    const outOfStockResponse = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../fixtures/stock-out-of-stock-response.json'), 'utf-8')
    );
    
    const isValid = validate(outOfStockResponse);
    expect(isValid).toBe(true);
  });

  test('response with invalid status should fail validation', () => {
    const invalidResponse = {
      inventory: {
        lastUpdated: '2024-01-15T10:00:00Z',
        items: [
          {
            model: 'Pro Router V5',
            quantity: 10,
            status: 'Invalid Status' // Not in enum
          }
        ]
      }
    };
    
    const isValid = validate(invalidResponse);
    expect(isValid).toBe(false);
  });

  test('response missing required fields should fail validation', () => {
    const incompleteResponse = {
      inventory: {
        items: [] // missing lastUpdated
      }
    };
    
    const isValid = validate(incompleteResponse);
    expect(isValid).toBe(false);
  });
});
