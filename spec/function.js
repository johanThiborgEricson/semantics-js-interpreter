describe("A function", function() {
  var interpreter = new JavaScriptInterpreter();
  
  it("can be called", function() {
    var result = interpreter.program(
      "var o={};" + 
      "var f=function(){" +
        "o.p=1;" +
      "};" +
      "return {o:o,f:f};");
      
    expect(result.o.p).toBe(undefined);
    result.f();
    expect(result.o.p).toBe(1);
  });
  
  it("can return a value", function() {
    var f = interpreter.program(
      "return function(){" + 
        "return 1;" + 
      "};");
    
    expect(f()).toBe(1);
  });
  
  it("accepts one argument", function() {
    var f = interpreter.program(
      "return function(x){" + 
        "return x;" + 
      "};");
    
    expect(f("x")).toBe("x");
  });
  
  it("accepts many arguments", function() {
    var f = interpreter.program(
      "return function(x,y,z){" + 
        "return z;" + 
      "};");
    
    expect(f("x", "y", "z")).toBe("z");
  });
  
  it("can be called as a method", function() {
    var o = {};
    o.m = interpreter.program(
      "return function(){" + 
        "return this;" + 
      "};");
    
    expect(o.m()).toBe(o);
  });
  
  it("may begin with a use strict declaration", function() {
    var f = interpreter.program(
      "return function(){" + 
        "'use strict';" +
        "return 1;" + 
      "};");
    
    expect(f()).toBe(1);
    var g = interpreter.program(
      "return function(){" + 
        '"use strict";' +
        "return 1;" + 
      "};");
    
    expect(g()).toBe(1);
  });
  
});
