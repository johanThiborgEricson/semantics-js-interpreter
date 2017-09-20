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
  
  it("doesn't evaluate its second operand if the first if falsy", function() {
    expect(interpreter.program(
      "var a=1," +
      "f=function(){" +
        "a=0;" +
      "};" +
      "false&&f();" +
      "return a;")).toBe(1);
  });
  
  it("can access variables in its right hand side", function() {
    expect(interpreter.program(
      "var a=0;" +
      "true&&(a=1);" +
      "return a;")).toBe(1);
  });
  
});
