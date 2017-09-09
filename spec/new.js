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
        "this.zero=arguments.length;" +
      "};" +
      "var object=new Constructor;" +
      "return object.zero;")).toBe(0);
  });
  
});
