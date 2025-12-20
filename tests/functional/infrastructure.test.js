/**
 * Functional tests for Infrastructure as Code (Bicep)
 * Tests the Bicep templates for proper structure and configuration
 */
const fs = require('fs');
const path = require('path');

describe('Infrastructure Tests', () => {
  const infraDir = path.join(__dirname, '../../infra');
  
  describe('Main Bicep Template', () => {
    const mainBicepPath = path.join(infraDir, 'main.bicep');
    
    test('main.bicep should exist', () => {
      expect(fs.existsSync(mainBicepPath)).toBe(true);
    });

    test('main.bicep should define required parameters', () => {
      const content = fs.readFileSync(mainBicepPath, 'utf-8');
      
      expect(content).toContain('param environmentName string');
      expect(content).toContain('param location string');
      expect(content).toContain('param apimPublisherEmail string');
      expect(content).toContain('param apimPublisherName string');
    });

    test('main.bicep should deploy all required modules', () => {
      const content = fs.readFileSync(mainBicepPath, 'utf-8');
      
      expect(content).toContain("module workflowStorage './modules/storage.bicep'");
      expect(content).toContain("module serviceBus './modules/servicebus.bicep'");
      expect(content).toContain("module applicationInsights './modules/application-insights.bicep'");
      expect(content).toContain("module apiManagement './modules/apim.bicep'");
      expect(content).toContain("module logicApp './modules/logic-app.bicep'");
    });

    test('main.bicep should configure role assignments', () => {
      const content = fs.readFileSync(mainBicepPath, 'utf-8');
      
      expect(content).toContain('sb-sender-role-assignment');
      expect(content).toContain('sb-receiver-role-assignment');
      expect(content).toContain('Azure Service Bus Data Sender');
      expect(content).toContain('Azure Service Bus Data Receiver');
    });

    test('main.bicep should target subscription scope', () => {
      const content = fs.readFileSync(mainBicepPath, 'utf-8');
      
      expect(content).toContain("targetScope = 'subscription'");
    });
  });

  describe('Module Files', () => {
    const modulesDir = path.join(infraDir, 'modules');
    const requiredModules = [
      'apim.bicep',
      'application-insights.bicep',
      'logic-app.bicep',
      'role-assignment.bicep',
      'servicebus.bicep',
      'storage.bicep'
    ];

    test.each(requiredModules)('module %s should exist', (moduleName) => {
      const modulePath = path.join(modulesDir, moduleName);
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    test('logic-app.bicep should configure workflow app settings', () => {
      const logicAppPath = path.join(modulesDir, 'logic-app.bicep');
      const content = fs.readFileSync(logicAppPath, 'utf-8');
      
      expect(content).toContain('APP_KIND');
      expect(content).toContain('workflowApp');
      expect(content).toContain('Microsoft.Azure.Functions.ExtensionBundle.Workflows');
    });

    test('servicebus.bicep should configure topics and subscriptions', () => {
      const serviceBusPath = path.join(modulesDir, 'servicebus.bicep');
      const content = fs.readFileSync(serviceBusPath, 'utf-8');
      
      expect(content).toContain('topic-customer-orders');
      expect(content).toContain('topic-router-orders');
      expect(content).toContain('notification');
      expect(content).toContain('sub-order-stock');
      expect(content).toContain('sub-order-router');
      expect(content).toContain('sub-tech-schedule');
    });

    test('servicebus.bicep should configure subscription filters', () => {
      const serviceBusPath = path.join(modulesDir, 'servicebus.bicep');
      const content = fs.readFileSync(serviceBusPath, 'utf-8');
      
      expect(content).toContain('InstockFalseFilter');
      expect(content).toContain('InstockTrueFilter');
      expect(content).toContain('CorrelationFilter');
    });
  });

  describe('Parameters File', () => {
    const paramsPath = path.join(infraDir, 'main.parameters.json');
    
    test('main.parameters.json should exist', () => {
      expect(fs.existsSync(paramsPath)).toBe(true);
    });

    test('main.parameters.json should be valid JSON', () => {
      const content = fs.readFileSync(paramsPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('main.parameters.json should have required parameters', () => {
      const params = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));
      
      expect(params.parameters).toHaveProperty('environmentName');
      expect(params.parameters).toHaveProperty('location');
      expect(params.parameters).toHaveProperty('apimPublisherEmail');
      expect(params.parameters).toHaveProperty('apimPublisherName');
    });
  });

  describe('Abbreviations File', () => {
    const abbrsPath = path.join(infraDir, 'abbreviations.json');
    
    test('abbreviations.json should exist', () => {
      expect(fs.existsSync(abbrsPath)).toBe(true);
    });

    test('abbreviations.json should be valid JSON', () => {
      const content = fs.readFileSync(abbrsPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('abbreviations.json should define required abbreviations', () => {
      const abbrs = JSON.parse(fs.readFileSync(abbrsPath, 'utf-8'));
      
      expect(abbrs).toHaveProperty('logicApp');
      expect(abbrs).toHaveProperty('insightsComponents');
      expect(abbrs).toHaveProperty('storageAccountWorkflows');
      expect(abbrs).toHaveProperty('serviceBusNamespace');
      expect(abbrs).toHaveProperty('apiManagementService');
    });
  });
});
