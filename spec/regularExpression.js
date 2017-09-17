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
  
  it("may contain escaped dashes", function() {
    var dash = interpreter.program("return /\\//;");
    expect(dash.exec("/")[0]).toBe("/");
  });
  
  describe("class", function() {
    
    it("may contain a literal dash", function() {
      var dashClass = interpreter.program("return /[/]/;");
      expect(dashClass.exec("/")[0]).toBe("/");
    });
    
  });
  
});
