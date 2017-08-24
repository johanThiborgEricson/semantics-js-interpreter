describe("A variable", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("can be returned", function() {
    expect(interpreter.program("return 1;")).toBe(1);
  });
  
});
