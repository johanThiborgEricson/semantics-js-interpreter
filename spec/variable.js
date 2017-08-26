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
      "return a;")).toBe(1);
  });
  
  it("can be assign as part of an assignment chain", function() {
    var a;
    var b;
    b = a = 1;
    
    expect(interpreter.program(
      "var a;" + 
      "var b;" + 
      "b=a=1;" + 
      "return a;")).toBe(1);
      
    expect(interpreter.program(
      "var a;" + 
      "var b;" + 
      "b=a=1;" + 
      "return b;")).toBe(1);
  });
  
});
