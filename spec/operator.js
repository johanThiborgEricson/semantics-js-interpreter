describe("The operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("typeof returns the type of the operand", function() {
    expect(interpreter.program("return typeof 1;")).toBe("number");
  });
  
  it("! returns the inverse of the expressions truthiness", function() {
    expect(interpreter.program(
      "var a;" +
      "return !a;")).toBe(true);
  });
  
  it("> can test what is truly great(er)", function() {
    expect(interpreter.program("return 42>42;")).toBe(false);
  });
  
  it("=== can tell if two values exactly the same thing", function() {
    expect(interpreter.program("return {}==={};")).toBe(false);
  });
  
  it("!== can tell if two values are not like at all", function() {
    expect(interpreter.program("return undefined!==null;")).toBe(true);
  });
  
});
