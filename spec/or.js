describe("A logical and expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("returns the first value if it is truthy", function() {
    expect(interpreter.program(
      "return 'true'||{};")).toBe("true");
  });
  
  it("returns the second value if the first one is falsy", function() {
    expect(interpreter.program(
      "return 0||null;")).toBe(null);
  });
  
  it("doesn't evaluate its second operand if the first is truthy", function() {
    expect(interpreter.program(
      "var a=1," +
      "f=function(){" +
        "a=0;" +
      "};" +
      "true||f();" +
      "return a;")).toBe(1);
  });
  
  it("can access variables in its right hand side", function() {
    expect(interpreter.program(
      "var a=0;" +
      "false||(a=1);" +
      "return a;")).toBe(1);
  });
  
});
