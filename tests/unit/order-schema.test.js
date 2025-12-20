/**
 * Unit tests for order schema validation
 * Tests that order payloads conform to the expected schema
 */
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// Define the order schema based on workflow definition
const orderSchema = {
  type: 'object',
  properties: {
    order: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        orderDate: { type: 'string' },
        customer: {
          type: 'object',
          properties: {
            accountType: { type: 'string' },
            companyName: { type: 'string' },
            contactPerson: {
              type: 'object',
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string' },
                jobTitle: { type: 'string' }
              },
              required: ['firstName', 'lastName', 'email', 'jobTitle']
            },
            billingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' }
              },
              required: ['street', 'city', 'postalCode', 'country']
            }
          },
          required: ['accountType', 'companyName', 'contactPerson', 'billingAddress']
        },
        contractDetails: {
          type: 'object',
          properties: {
            contractId: { type: 'string' },
            servicePlan: { type: 'string' },
            commitmentPeriod: { type: 'string' },
            monthlyFee: { type: 'number' }
          },
          required: ['contractId', 'servicePlan', 'commitmentPeriod', 'monthlyFee']
        },
        product: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            model: { type: 'string' },
            version: { type: 'string' },
            features: {
              type: 'array',
              items: { type: 'string' }
            },
            quantity: { type: 'integer' },
            unitPrice: { type: 'integer' }
          },
          required: ['type', 'model', 'version', 'features', 'quantity', 'unitPrice']
        },
        delivery: {
          type: 'object',
          properties: {
            method: { type: 'string' },
            trackingNumber: { type: 'string' },
            estimatedDeliveryDate: { type: 'string' },
            deliveryAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                postalCode: { type: 'string' },
                country: { type: 'string' }
              },
              required: ['street', 'city', 'postalCode', 'country']
            },
            deliveryInstructions: { type: 'string' }
          },
          required: ['method', 'trackingNumber', 'estimatedDeliveryDate', 'deliveryAddress', 'deliveryInstructions']
        },
        payment: {
          type: 'object',
          properties: {
            method: { type: 'string' },
            poNumber: { type: 'string' },
            totalPrice: { type: 'integer' },
            installationFee: { type: 'integer' },
            discount: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                amount: { type: 'integer' },
                description: { type: 'string' }
              },
              required: ['type', 'amount', 'description']
            }
          },
          required: ['method', 'poNumber', 'totalPrice', 'installationFee', 'discount']
        }
      },
      required: ['orderId', 'orderDate', 'customer', 'contractDetails', 'product', 'delivery', 'payment']
    }
  },
  required: ['order']
};

describe('Order Schema Validation Tests', () => {
  let ajv;
  let validate;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    validate = ajv.compile(orderSchema);
  });

  test('valid order should pass validation', () => {
    const validOrder = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../fixtures/valid-order.json'), 'utf-8')
    );
    
    const isValid = validate(validOrder);
    expect(isValid).toBe(true);
    expect(validate.errors).toBeNull();
  });

  test('order missing required fields should fail validation', () => {
    const invalidOrder = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../fixtures/invalid-order-missing-fields.json'), 'utf-8')
    );
    
    const isValid = validate(invalidOrder);
    expect(isValid).toBe(false);
    expect(validate.errors).not.toBeNull();
    expect(validate.errors.length).toBeGreaterThan(0);
  });

  test('empty order object should fail validation', () => {
    const emptyOrder = {};
    
    const isValid = validate(emptyOrder);
    expect(isValid).toBe(false);
    expect(validate.errors).toContainEqual(
      expect.objectContaining({
        keyword: 'required',
        params: { missingProperty: 'order' }
      })
    );
  });

  test('order with invalid types should fail validation', () => {
    const orderWithInvalidTypes = {
      order: {
        orderId: 12345, // should be string
        orderDate: '2024-01-15',
        customer: 'invalid', // should be object
        contractDetails: {},
        product: {},
        delivery: {},
        payment: {}
      }
    };
    
    const isValid = validate(orderWithInvalidTypes);
    expect(isValid).toBe(false);
  });

  test('order with all required fields should pass validation', () => {
    const minimalValidOrder = {
      order: {
        orderId: 'TEST-001',
        orderDate: '2024-01-15',
        customer: {
          accountType: 'Professional',
          companyName: 'Test Corp',
          contactPerson: {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            jobTitle: 'Tester'
          },
          billingAddress: {
            street: '123 Test St',
            city: 'Test City',
            postalCode: '12345',
            country: 'Test Country'
          }
        },
        contractDetails: {
          contractId: 'CON-001',
          servicePlan: 'Basic',
          commitmentPeriod: '12',
          monthlyFee: 29.99
        },
        product: {
          type: 'Router',
          model: 'Basic',
          version: 'V1',
          features: ['Basic features'],
          quantity: 1,
          unitPrice: 99
        },
        delivery: {
          method: 'Standard',
          trackingNumber: 'TRK-001',
          estimatedDeliveryDate: '2024-01-20',
          deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            postalCode: '12345',
            country: 'Test Country'
          },
          deliveryInstructions: 'None'
        },
        payment: {
          method: 'Credit',
          poNumber: 'PO-001',
          totalPrice: 99,
          installationFee: 0,
          discount: {
            type: 'None',
            amount: 0,
            description: 'No discount'
          }
        }
      }
    };
    
    const isValid = validate(minimalValidOrder);
    expect(isValid).toBe(true);
  });
});
