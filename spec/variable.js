describe("A variable", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("can be returned", function() {
    expect(interpreter.program("return 1;")).toBe(1);
  });
  
  it("can be declared", function() {
    expect(interpreter.program("var a=1;return a;")).toBe(1);
  });
  
});
