describe("A variable", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("can be returned", function() {
    expect(interpreter.program(
      "return 1;")).toBe(1);
  });
  
  it("can be declared", function() {
    var a = 1;
    
    expect(interpreter.program(
      "var a=1;" + 
      "return a;")).toBe(a);
  });
  
  it("may not be initialized", function() {
    var a;
    
    expect(interpreter.program(
      "var a;" + 
      "return a;")).toBe(a);
  });
  
  it("may be set after its declaration", function() {
    var a;
    a = 1;
    
    expect(interpreter.program(
      "var a;" + 
      "a=1;" + 
      "return a;")).toBe(a);
  });
  
  it("can be assigned as part of an assignment chain", function() {
    var a;
    var b;
    b = a = 1;
    
    expect(interpreter.program(
      "var a;" + 
      "var b;" + 
      "b=a=1;" + 
      "return a;")).toBe(a);
      
    expect(interpreter.program(
      "var a;" + 
      "var b;" + 
      "b=a=1;" + 
      "return b;")).toBe(b);
  });
  
  it("can be declared in many contexts", function() {
    var a = 0;
    var f2 = function() {
      var a = 1;
    };
    
    var f = interpreter.program(
      "var a=0;" + 
      "return function(){" + 
        "var a=1;" + 
      "};");
      
    f();
    f2();
    
    expect(interpreter.executionContext.variables.a).toBe(a);
  });
  
  it("may have a long name with many different characters", function() {
    expect(interpreter.program(
      "var $longName123=1;" + 
      "return $longName123;")).toBe(1);
  });
  
  it("may be assigned inside a group expression", function() {
    var a;
    (a) = 1;
    expect(a).toBe(1);
  });
  
});
