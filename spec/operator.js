describe("The operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("! returns the inverse of the expressions truthiness", function() {
    expect(interpreter.program(
      "var a;" +
      "return !a;")).toBe(true);
  });
  
  it("typeof returns the type of the operand", function() {
    expect(interpreter.program("return typeof 1;")).toBe("number");
  });
  
  it("!== can tell if two values are not like at all", function() {
    expect(interpreter.program("return undefined!==null;")).toBe(true);
  });
  
});
