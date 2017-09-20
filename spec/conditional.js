describe("The ternary operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("returns the first alternative if the condition is truthy", function() {
    expect(interpreter.program(
      "return true?1:2;")).toBe(1);
  });
  
  it("returns the second alternative if the condition is falsy", function() {
    expect(interpreter.program(
      "return false?1:2;")).toBe(2);
  });
  
});
