describe("A group expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("may only have side effect parts", function() {
    expect(interpreter.program(
      "var a;" +
      "var b;" +
      "var f=function(){" +
        "a=1;" +
      "};" +
      "var g=function(){" +
        "b=2;" +
      "};" +
      "f(),g();" +
      "return {a:a,b:b};")).toEqual({a: 1, b: 2});
  });
  
  it("returns the result of the last side effect", function() {
    expect(interpreter.program(
      "var f=function(){};" +
      "var g=function(){" +
        "return 1;" +
      "};" +
      "return f(),g();")).toEqual(1);
  });
  
});