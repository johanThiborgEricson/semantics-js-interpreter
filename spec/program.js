describe("A program", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("might get its global object from the outside", function() {
    var global = {};
    
    interpreter.program("var a=1;", global);
    
    expect(global.a).toBe(1);
  });
  
  it("doesn't add a this property to the global object", function() {
    var global = {};
    
    interpreter.program("", global);
    
    expect(global.this).toBeUndefined();
  });
  
});
