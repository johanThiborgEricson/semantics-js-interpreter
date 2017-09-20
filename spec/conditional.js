describe("The ternary operator", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("returns the first alternative if the condition is truthy", function() {
    expect(interpreter.program(
      "return true?1:2;")).toBe(1);
  });
  
  it("returns the second alternative if the condition is falsy", function() {
    expect(interpreter.program(
      "return false?1:2;")).toBe(2);
  });
  
  it("evaluates only the first alternative if the condition is truthy", 
  function() {
    expect(interpreter.program(
      "var a=0,"+
      "b=0,"+
      "f=function(){"+
        "a=1;"+
      "},"+
      "g=function(){"+
        "b=1;"+
      "};"+
      "true?f():g();" +
      "return {a:a,b:b};")).toEqual({a: 1, b: 0});
  });
  
  it("the second alternative can read local variables", 
  function() {
    expect(interpreter.program(
      "var a=0;"+
      "false?0:(a=1);" +
      "return a;")).toBe(1);
  });
  
  it("evaluates only the second alternative if the condition is falsy", 
  function() {
    expect(interpreter.program(
      "var a=0,"+
      "b=0,"+
      "f=function(){"+
        "a=1;"+
      "},"+
      "g=function(){"+
        "b=1;"+
      "};"+
      "false?f():g();" +
      "return {a:a,b:b};")).toEqual({a: 0, b: 1});
  });
  
  it("the first alternative can read local variables", 
  function() {
    expect(interpreter.program(
      "var a=0;"+
      "true?(a=1):0;" +
      "return a;")).toBe(1);
  });
  
});
