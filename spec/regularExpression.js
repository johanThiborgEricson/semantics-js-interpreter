describe("A regular expression literal", function() {
  
  var interpreter = new JavaScriptInterpreter();
  
  it("can contain one character", function() {
    var a = interpreter.program("return /a/;");
    expect(a.exec("a")[0]).toBe("a");
  });
  
  it("can contain many characters", function() {
    var abc = interpreter.program("return /abc/;");
    expect(abc.exec("abc")[0]).toBe("abc");
  });
  
});
