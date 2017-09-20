describe("A group expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("may only have side effect parts", function() {
    expect(interpreter.program(
      "var a,b," +
      "f=function(){" +
        "a=1;" +
      "}," +
      "g=function(){" +
        "b=2;" +
      "};" +
      "f(),g();" +
      "return {a:a,b:b};")).toEqual({a: 1, b: 2});
  });
  
  it("returns the result of the last side effect", function() {
    expect(interpreter.program(
      "var f=function(){}," +
      "g=function(){" +
        "return 1;" +
      "};" +
      "return f(),g();")).toEqual(1);
  });
  
  it("may have a non side effect expression last", function() {
    expect(interpreter.program(
      "var f=function(){};" +
      "return f(),1;")).toEqual(1);
  });
  
  it("may be enclosed in parantheses", function() {
    expect(interpreter.program(
      "var f=function(){}," +
      "g=function(){" +
        "return 1;" +
      "};" +
      "return (f(),g());")).toEqual(1);
  });
  
  it("may enclose an right hand side expression", function() {
    expect(interpreter.program(
      "return (1);")).toEqual(1);
  });
  
});