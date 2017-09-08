describe("A call expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("calls the function", function() {
    expect(interpreter.program(
      "var a;" + 
      "var f=function(){" + 
        "a=1;" + 
      "};" + 
      "f();" + 
      "return a;")).toBe(1);
    
  });
  
  it("returns a result", function() {
    expect(interpreter.program(
      "var f=function(){" + 
        "return 1;" + 
      "};" + 
      "return f();")).toBe(1);
    
  });
  
});
