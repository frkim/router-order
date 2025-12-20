/**
 * Functional tests for API definitions
 * Tests OpenAPI specifications for the APIs
 */
const fs = require('fs');
const path = require('path');

describe('Order Process API Tests', () => {
  const apiPath = path.join(__dirname, '../../api/order-process/openapi.yaml');
  
  test('openapi.yaml should exist', () => {
    expect(fs.existsSync(apiPath)).toBe(true);
  });

  test('API should have required OpenAPI structure', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('openapi:');
    expect(apiContent).toContain('info:');
    expect(apiContent).toContain('paths:');
  });

  test('API should define process-order operation', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('operationId: process-order');
  });

  test('API should require subscription key authentication', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('apiKeyHeader');
    expect(apiContent).toContain('Ocp-Apim-Subscription-Key');
  });

  test('API should define Order_Process_Request schema', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('Order_Process_Request');
    expect(apiContent).toContain('$ref:');
  });
});

describe('Stock Management API Tests', () => {
  const apiPath = path.join(__dirname, '../../api/stock-management/openapi.yaml');
  
  test('openapi.yaml should exist', () => {
    expect(fs.existsSync(apiPath)).toBe(true);
  });

  test('API should have required OpenAPI structure', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('openapi:');
    expect(apiContent).toContain('info:');
    expect(apiContent).toContain('paths:');
  });

  test('API should define get-router-stock operation', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('operationId: get-router-stock');
  });

  test('API should require model parameter', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('name: model');
    expect(apiContent).toContain('required: true');
  });

  test('API should define Stock_Status_Response schema', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('Stock_Status_Response');
    expect(apiContent).toContain('inventory');
    expect(apiContent).toContain('items');
  });

  test('API should require subscription key authentication', () => {
    const apiContent = fs.readFileSync(apiPath, 'utf-8');
    
    expect(apiContent).toContain('securitySchemes');
    expect(apiContent).toContain('apiKeyHeader');
  });
});
