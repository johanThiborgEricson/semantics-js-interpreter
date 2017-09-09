describe("The exotic object arguments", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("is available in function expressions", function() {
    expect(interpreter.program(
      "var f=function(){" + 
        "return arguments[0];" +
      "};" +
      "return f(1);")).toBe(1);
  });
  
});
