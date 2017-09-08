describe("A left hand side expression", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("may be a variable", function() {
    var a;
    a = 1;
    
    expect(interpreter.program(
      "var a;" + 
      "a=1;" + 
      "return a;")).toBe(a);
  });
  
  it("can be a part of an assignment chain", function() {
    var a;
    var b;
    b = a = 1;
    
    expect(interpreter.program(
      "var a;" + 
      "var b;" + 
      "b=a=1;" + 
      "return {a:a,b:b};")).toEqual({
        a: a, 
        b: b,
      });
      
  });
  
  it("can be an object property", function() {
    expect(interpreter.program(
      "var o={};" + 
      "o.p=1;" + 
      "return o;")).toEqual({p: 1});
  });
  
  it("can be a nested object property", function() {
    expect(interpreter.program(
      "var o={p:{}};" + 
      "o.p.q=1;" + 
      "return o;")).toEqual({p: {q: 1}});
  });
  
  it("may be inside a group expression", function() {
    var a;
    (a) = 1;
    expect(a).toBe(1);
  });
  
  it("may be made on a call expression", function() {
    expect(interpreter.program(
      "var o={};" +
      "var f=function(){" +
        "return o;" +
      "};" +
      "f().p=1;" +
      "return o;")
    ).toEqual({p: 1});
  });
  
});
