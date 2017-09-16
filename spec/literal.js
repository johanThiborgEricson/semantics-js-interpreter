describe("A literal", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("undefined is undefined", function() {
    expect(interpreter.program("return undefined;")).toBe(undefined);
  });
  
  it("null is null", function() {
    expect(interpreter.program("return null;")).toBe(null);
  });
  
  it("true is true", function() {
    expect(interpreter.program("return true;")).toBe(true);
  });
  
  it("false is false", function() {
    expect(interpreter.program("return false;")).toBe(false);
  });
  
  describe("string", function() {
    
    it("may be single quoted", function() {
      expect(interpreter.program("return '';")).toBe('');
    });
    
  });
  
});
