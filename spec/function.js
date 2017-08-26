describe("A function", function() {
  var interpreter = new JavaScriptInterpreter();
  
  it("can be called", function() {
    var f = interpreter.program(
      "var a;" + 
      "return function(){" +
        "a=1;" +
      "};");
      
    expect(interpreter.executionContext.variables.a).toBe(undefined);
    f();
    expect(interpreter.executionContext.variables.a).toBe(1);
  });
  
  it("can return a value", function() {
    var f = interpreter.program(
      "return function(){" + 
        "return 1;" + 
      "};");
    
    expect(f()).toBe(1);
  });
  
});