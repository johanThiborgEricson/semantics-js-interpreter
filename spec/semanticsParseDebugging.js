describe("Debugging messages from the Semantics! parser", function() {
  
  it("can be turned on", function() {
    spyOn(console, "log");
    var interpreter = new JavaScriptInterpreter();
    interpreter.program("", true);
    
    expect(console.log).toHaveBeenCalled();
  });
  
  it("can be turned on with a global object", function() {
    spyOn(console, "log");
    var interpreter = new JavaScriptInterpreter();
    var global = {};
    interpreter.program("var a=1;", global, true);
    
    expect(console.log).toHaveBeenCalled();
    expect(global.a).toBe(1);
  });
  
});