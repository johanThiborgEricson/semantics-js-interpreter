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
    
    describe("with single quotes", function() {
      
      it("may be empty", function() {
        expect(interpreter.program("return '';")).toBe('');
      });
      
      it("may contain a single character", function() {
        expect(interpreter.program("return 'a';")).toBe('a');
      });
      
      it("may contain many characters", function() {
        expect(interpreter.program("return 'abc';")).toBe('abc');
      });
      
      it("may be padded with spaces", function() {
        expect(interpreter.program("return '  a  ';")).toBe('  a  ');
      });
      
      it("may contain many \\b, \\f, \\n, \\r, \\t and \\vs", function() {
        expect(interpreter.program(
          "return '\\b, \\f, \\n, \\r, \\t and \\vs';")
        ).toBe('\b, \f, \n, \r, \t and \vs');
      });
      
    });
    
  });
  
});
