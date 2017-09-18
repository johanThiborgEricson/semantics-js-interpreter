describe("A throw statement", function() {
  
  var interpreter = new JavaScriptInterpreter();
  var global;
  
  beforeEach(function() {
    global = {
      Error: Error,
    };
    
  });
  
  it("can throw a Error", function() {
    expect(function() {
      interpreter.program("throw new Error('ball');", global);
    }).toThrowError("ball");
  });
  
});
