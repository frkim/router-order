/**
 * Functional tests for XSLT transformation
 * Tests the transformation_router.xslt file
 */
const fs = require('fs');
const path = require('path');

// Simple XML to JSON conversion for testing purposes
function parseSimpleXml(xmlString) {
  const result = {};
  
  // Remove XML declaration
  const cleanXml = xmlString.replace(/<\?xml[^?]*\?>/g, '').trim();
  
  // Simple regex-based parsing for our test XML structure
  const tagRegex = /<(\w+)>([^<]*)<\/\1>/g;
  let match;
  
  while ((match = tagRegex.exec(cleanXml)) !== null) {
    result[match[1]] = match[2].trim();
  }
  
  return result;
}

describe('XSLT Transformation Tests', () => {
  const xsltPath = path.join(__dirname, '../../logicapp/Artifacts/Maps/transformation_router.xslt');
  
  test('transformation_router.xslt should exist', () => {
    expect(fs.existsSync(xsltPath)).toBe(true);
  });

  test('XSLT should be valid XML', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    // Basic XML validation - check for proper structure
    expect(xsltContent).toContain('<?xml');
    expect(xsltContent).toContain('xsl:stylesheet');
    expect(xsltContent).toContain('</xsl:stylesheet>');
  });

  test('XSLT should have proper namespace declaration', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    expect(xsltContent).toContain('xmlns:xsl="http://www.w3.org/1999/XSL/Transform"');
  });

  test('XSLT should contain main template', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    expect(xsltContent).toContain('xsl:template match="/"');
  });

  test('XSLT should transform order structure', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    // Verify the transformation extracts required fields
    expect(xsltContent).toContain('orderId');
    expect(xsltContent).toContain('orderDate');
    expect(xsltContent).toContain('contact');
    expect(xsltContent).toContain('email');
    expect(xsltContent).toContain('billingAddress');
    expect(xsltContent).toContain('product');
    expect(xsltContent).toContain('delivery');
  });

  test('XSLT should concatenate firstName and lastName into contact', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    // Verify contact concatenation
    expect(xsltContent).toContain("concat(order/customer/contactPerson/firstName");
    expect(xsltContent).toContain("order/customer/contactPerson/lastName");
  });

  test('XSLT should extract product model and version', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    expect(xsltContent).toContain('order/product/model');
    expect(xsltContent).toContain('order/product/version');
    expect(xsltContent).toContain('order/product/quantity');
  });

  test('XSLT should extract delivery information', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    expect(xsltContent).toContain('order/delivery/method');
    expect(xsltContent).toContain('order/delivery/trackingNumber');
    expect(xsltContent).toContain('order/delivery/estimatedDeliveryDate');
    expect(xsltContent).toContain('order/delivery/deliveryAddress');
    expect(xsltContent).toContain('order/delivery/deliveryInstructions');
  });

  test('XSLT output method should be XML', () => {
    const xsltContent = fs.readFileSync(xsltPath, 'utf-8');
    
    expect(xsltContent).toContain('xsl:output method="xml"');
  });
});

describe('Artifacts Structure Tests', () => {
  const artifactsDir = path.join(__dirname, '../../logicapp/Artifacts');
  
  test('Artifacts directory should exist', () => {
    expect(fs.existsSync(artifactsDir)).toBe(true);
  });

  test('Maps directory should exist', () => {
    const mapsDir = path.join(artifactsDir, 'Maps');
    expect(fs.existsSync(mapsDir)).toBe(true);
  });

  test('transformation_router.xslt should be in Maps directory', () => {
    const xsltPath = path.join(artifactsDir, 'Maps', 'transformation_router.xslt');
    expect(fs.existsSync(xsltPath)).toBe(true);
  });
});
