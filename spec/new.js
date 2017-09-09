describe("The new operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("creates instances of their constructors prototype", function() {
    var result = interpreter.program(
      "var f=function(){};" +
      "var o=new f();" +
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
      "};" +
      "var object=new Constructor;" +
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
  
});
