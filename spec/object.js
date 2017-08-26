describe("An object", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("may be empty", function() {
    expect(interpreter.program("return {};")).toEqual({});
  });
  
  it("may contain one property", function() {
    expect(interpreter.program("return {a:1};")).toEqual({a:1});
  });
  
  it("may contain many properties", function() {
    expect(interpreter.program("return {a:1,b:2};")).toEqual({a:1,b:2});
  });
  
  describe("property", function() {
    
    it("can be set", function() {
      expect(interpreter.program(
        "var o={};" + 
        "o.p=1;" + 
        "return o;")).toEqual({p: 1});
    });
    
    it("can be set recursively", function() {
      expect(interpreter.program(
        "var o={p:{}};" + 
        "o.p.q=1;" + 
        "return o;")).toEqual({p: {q: 1}});
    });
    
  });
  
});
