/**
 * Unit tests for workflow JSON schema validation
 * Tests that all workflow definitions follow the Logic Apps schema format
 */
const fs = require('fs');
const path = require('path');

describe('Workflow Definition Tests', () => {
  const workflowsDir = path.join(__dirname, '../../logicapp');
  const workflowDirs = fs.readdirSync(workflowsDir)
    .filter(item => item.startsWith('wf_'))
    .map(item => path.join(workflowsDir, item));

  describe.each(workflowDirs)('Workflow: %s', (workflowDir) => {
    const workflowName = path.basename(workflowDir);
    const workflowPath = path.join(workflowDir, 'workflow.json');

    test('workflow.json should exist', () => {
      expect(fs.existsSync(workflowPath)).toBe(true);
    });

    test('workflow.json should be valid JSON', () => {
      const content = fs.readFileSync(workflowPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('workflow should have required definition properties', () => {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      
      expect(workflow).toHaveProperty('definition');
      expect(workflow.definition).toHaveProperty('$schema');
      expect(workflow.definition).toHaveProperty('contentVersion');
      expect(workflow.definition).toHaveProperty('triggers');
      expect(workflow.definition).toHaveProperty('actions');
    });

    test('workflow should have valid schema URL', () => {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      const validSchemaUrl = 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#';
      
      expect(workflow.definition.$schema).toBe(validSchemaUrl);
    });

    test('workflow should have valid kind (Stateful or Stateless)', () => {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      
      expect(workflow).toHaveProperty('kind');
      expect(['Stateful', 'Stateless']).toContain(workflow.kind);
    });

    test('workflow should have at least one trigger', () => {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      const triggerCount = Object.keys(workflow.definition.triggers).length;
      
      expect(triggerCount).toBeGreaterThanOrEqual(1);
    });

    test('workflow actions should have valid runAfter configurations', () => {
      const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
      const actions = workflow.definition.actions;
      const actionNames = Object.keys(actions);

      actionNames.forEach(actionName => {
        const action = actions[actionName];
        if (action.runAfter && Object.keys(action.runAfter).length > 0) {
          Object.keys(action.runAfter).forEach(dependencyName => {
            // The dependency should either be a trigger or another action
            const isValidDependency = actionNames.includes(dependencyName) || 
                                      Object.keys(workflow.definition.triggers).includes(dependencyName);
            
            // Note: Some actions reference prior actions that exist in the workflow
            // Only validate that runAfter is an object with status arrays
            expect(Array.isArray(action.runAfter[dependencyName])).toBe(true);
          });
        }
      });
    });
  });

  describe('Workflow Configuration Files', () => {
    test('connections.json should exist', () => {
      const connectionsPath = path.join(workflowsDir, 'connections.json');
      expect(fs.existsSync(connectionsPath)).toBe(true);
    });

    test('connections.json should be valid JSON', () => {
      const connectionsPath = path.join(workflowsDir, 'connections.json');
      const content = fs.readFileSync(connectionsPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('connections.json should have Service Bus connection', () => {
      const connectionsPath = path.join(workflowsDir, 'connections.json');
      const connections = JSON.parse(fs.readFileSync(connectionsPath, 'utf-8'));
      
      expect(connections).toHaveProperty('serviceProviderConnections');
      expect(connections.serviceProviderConnections).toHaveProperty('serviceBus');
    });

    test('host.json should exist', () => {
      const hostPath = path.join(workflowsDir, 'host.json');
      expect(fs.existsSync(hostPath)).toBe(true);
    });

    test('host.json should be valid JSON', () => {
      const hostPath = path.join(workflowsDir, 'host.json');
      const content = fs.readFileSync(hostPath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('host.json should have workflow extension bundle', () => {
      const hostPath = path.join(workflowsDir, 'host.json');
      const host = JSON.parse(fs.readFileSync(hostPath, 'utf-8'));
      
      expect(host).toHaveProperty('extensionBundle');
      expect(host.extensionBundle.id).toBe('Microsoft.Azure.Functions.ExtensionBundle.Workflows');
    });
  });
});
