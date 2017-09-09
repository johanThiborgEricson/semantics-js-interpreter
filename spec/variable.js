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
  
  it("can be declared in many contexts", function() {
    var a = 0;
    var f = function() {
      var a = 1;
    };
    
    f();
    
    expect(interpreter.program(
      "var a=0;" + 
      "var f=function(){" + 
        "var a=1;" + 
      "};" +
      "f();" +
      "return a;")
    ).toBe(a);
  });
  
  it("may have a long name with many different characters", function() {
    expect(interpreter.program(
      "var $longName123=1;" + 
      "return $longName123;")).toBe(1);
  });
  
  it("is function scooped", function() {
    var a=0;
    var f=function(){
      var a=1;
      return function(){
        return a;
      };
    };
    var b=f()();
    
    expect(interpreter.program(
      "var a=0;" + 
      "var f=function(){" + 
        "var a=1;" + 
        "return function(){" + 
          "return a;" + 
        "};" + 
      "};" + 
      "var b=f()();" + 
      "return b;"
    )).toBe(b);
  });
  
});
