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
  
  it("may contain spaces", function() {
    var space = interpreter.program("return / . /;");
    expect(space.exec(" a ")[0]).toBe(" a ");
  });
  
  it("may be surrounded by multi line comments", function() {
    var space = interpreter.program("return/**//.//**/;");
    expect(space.exec("a")[0]).toBe("a");
  });
  
  describe("class", function() {
    
    it("may contain a literal dash", function() {
      var dashClass = interpreter.program("return /[/]/;");
      expect(dashClass.exec("/")[0]).toBe("/");
    });
    
    it("may contain many alternatives", function() {
      var abc = interpreter.program("return /[abc]/;");
      expect(abc.exec("b")[0]).toBe("b");
    });
    
    it("may contain an escaped ending square bracket", function() {
      var bracketClass = interpreter.program("return /[\\]]/;");
      expect(bracketClass.exec("]")[0]).toBe("]");
    });
    
  });
  
});
