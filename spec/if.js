describe("An if statement", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("runs if its condition evaluates to true", function() {
    expect(interpreter.program(
      "var a=0;" + 
      "if(1)a=1;" +
      "return a;")).toBe(1);
  });
  
  it("doesn't run its statement if its condition evaluates to false", function() {
    expect(interpreter.program(
      "var a=0;" + 
      "if(0)a=1;" +
      "return a;")).toBe(0);
  });
  
  it("might have its statement in a block", function() {
    expect(interpreter.program(
      "var a=0;" + 
      "if(1){" +
        "a=1;" +
      "}" +
      "return a;")).toBe(1);
  });
  
  it("might cause an early return", function() {
    var o = interpreter.program(
      "var o={p:1};" + 
      "if(1)return o;" +
      "o.p=0;" +
      "return o;");
    
    expect(o.p).toBe(1);
  });
  
});
