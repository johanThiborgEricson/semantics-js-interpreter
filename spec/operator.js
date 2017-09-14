describe("The operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("! returns the inverse of the expressions truthiness", function() {
    expect(interpreter.program(
      "var a;" +
      "return !a;")).toBe(true);
  });
  
});
