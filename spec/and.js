describe("A logical and expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("returns its first operand if it is falsy", function() {
    expect(interpreter.program(
      "return 0&&false;")).toBe(0);
  });
  
  it("returns its second operand if it is truthy", function() {
    expect(interpreter.program(
      "return 'true'&&{};")).toEqual({});
  });
  
});
