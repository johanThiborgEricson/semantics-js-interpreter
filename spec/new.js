describe("The new operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("creates instances of their constructors prototype", function() {
    var result = interpreter.program(
      "var f=function(){}," +
      "o=new f();" +
      "return {f:f,o:o};");
    
    expect(result.o instanceof result.f).toBe(true);
  });
  
  it("can take arguments", function() {
    expect(interpreter.program(
      "var f=function(x){" +
        "this.x=x;" +
      "};" +
      "return new f(1).x;")).toBe(1);
  });
  
  it("may not have arguments", function() {
    expect(interpreter.program(
      "var Constructor=function(){" +
        "this.me=arguments.callee;" +
      "}," +
      "object=new Constructor;" +
      "return object.me;")).toEqual(jasmine.any(Function));
  });
  
  it("may be qualified", function() {
    expect(interpreter.program(
      "var o={" +
        "c:function(){" +
          "this.p=1;" +
        "}" +
      "};" +
      "return new o.c().p;")).toEqual(1);
  });
  
  it("will return the result of the constructor if it has type object", 
  function() {
    expect(interpreter.program(
      "var C=function(){" +
        "return {" +
          "p:1" +
        "};" +
      "};" +
      "C.prototype={" +
        "p:0" +
      "};" +
      "return new C();").p).toBe(1);
  });
  
  it("will return the object if the result of the constructor isn't an object", 
  function() {
    expect(typeof interpreter.program(
      "var C=function(){" +
        "return 1;" +
      "};" +
      "return new C();")).toBe("object");
  });
  
  it("will not return null if that is the result of the object", 
  function() {
    expect(interpreter.program(
      "var C=function(){" +
        "return null;" +
      "};" +
      "return new C();")).not.toBe(null);
  });
  
});
