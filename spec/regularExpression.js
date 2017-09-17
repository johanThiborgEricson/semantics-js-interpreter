describe("A regular expression literal", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("can contain one character", function() {
    var a = interpreter.program("return /a/;");
    expect(a.exec("a")[0]).toBe("a");
  });
  
});
