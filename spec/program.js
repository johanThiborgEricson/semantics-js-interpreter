describe("A program", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("might get its global object from the outside", function() {
    var global = {};
    
    interpreter.program("var a=1;", global);
    
    expect(global.a).toBe(1);
  });
  
  it("doesn't add properties to the global object", function() {
    var global = {};
    
    interpreter.program("", global);
    
    expect(global).toEqual({});
  });
  
  it("may return early", function() {
    var o = interpreter.program(
      "var o={};" +
      "o.p=1;" +
      "return o;"+
      "o.p=0;");
    
    expect(o.p).toBe(1);
  });
  
});
