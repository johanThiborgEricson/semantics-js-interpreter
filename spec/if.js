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
  
  it("might have an else clause", function() {
    var o = interpreter.program(
      "var o={};" + 
      "if(0)o.if=1;" +
      "else o.else=0;" +
      "return o;");
    
    expect(o).toEqual({else: 0});
  });
  
  it("can have a else branch that can cause an early return", function() {
    expect(interpreter.program(
      "var a;" + 
      "if(0)a=1;" +
      "else return 1;" +
      "return 0;")).toBe(1);
  });
  
});
