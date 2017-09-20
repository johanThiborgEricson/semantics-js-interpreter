describe("A call expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("calls the function", function() {
    expect(interpreter.program(
      "var a," + 
      "f=function(){" + 
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
  
  it("takes arguments", function() {
    expect(interpreter.program(
      "var f=function(x,y){" + 
        "return {x:1,y:2};" + 
      "};" + 
      "return f(1,2);")).toEqual({x: 1, y: 2});
  });
  
  it("can be called as a method", function() {
    expect(interpreter.program(
      "var o={" + 
        "m:function(x){" + 
          "this.p=x;" + 
        "}" + 
      "};" +
      "o.m(1);" + 
      "return o.p;")).toBe(1);
  });
  
  it("may have many Qualifiers", function() {
    expect(interpreter.program(
      "var o={" + 
        "i:{" + 
          "m:function(){" + 
            "return 1;" + 
          "}" + 
        "}" + 
      "};" +
      "return o.i.m();")).toBe(1);
  });
  
  it("evaluates its function before its parameters", function() {
    var o = {
      m: function() {
        return 1;
      },
    };
    
    var r = o.m(o.m = function() {
      return 0;
    });
    
    expect(interpreter.program(
      "var o={" +
        "m:function(){" +
          "return 1;" +
        "}" +
      "};" +
      "return o.m(o.m=function(){" +
        "return 0;" +
      "});"
      )).toBe(r);
  });
  
});
