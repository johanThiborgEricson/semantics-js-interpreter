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
  
  it("may end with a comma", function() {
    expect(interpreter.program("return {a:1,b:2,};")).toEqual({a:1,b:2});
  });
  
});
