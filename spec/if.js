describe("An if statement", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("runs if its condition evaluates to true", function() {
    expect(interpreter.program(
      "var a=0;" + 
      "if(1)a=1;" +
      "return a;")).toBe(1);
  });
  
});
