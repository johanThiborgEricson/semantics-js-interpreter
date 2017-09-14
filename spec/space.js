describe("An input insignificant space", function() {
  
  var interpreter = {};
  var f = new InterpreterMethodFactory();
  interpreter.space = f.atom(new JavaScriptInterpreter().space);
  
  it("can be a regular space", function() {
    expect(interpreter.space(" ")).toBe(" ");
  });
  
  it("can be any space", function() {
    expect(interpreter.space("\t")).toBe("\t");
  });
  
  it("can be a newline", function() {
    expect(interpreter.space("\n")).toBe("\n");
  });
  
  it("can be empty", function() {
    expect(interpreter.space("")).toBe("");
  });
  
  it("can have any number of parts", function() {
    expect(interpreter.space("\n  \n\n")).toBe("\n  \n\n");
  });
  
  it("can be an one line comment", function() {
    expect(interpreter.space("// comment 1. \n")).toBe("// comment 1. \n");
  });
  
  describe("can be a multiline comment that", function() {
    
    it("may be empty", function() {
      expect(interpreter.space("/**/")).toBe("/**/");
    });
    
    it("can contain newlines", function() {
      expect(interpreter.space("/*\ncomment\n*/")).toBe("/*\ncomment\n*/");
    });
    
    it("may begin with dashes", function() {
      expect(interpreter.space("/*//*/")).toBe("/*//*/");
    });
    
    it("may end with asterisks", function() {
      expect(interpreter.space("/****/")).toBe("/****/");
    });
    
    it("may contain many asterisks", function() {
      expect(interpreter.space("/* * ** */")).toBe("/* * ** */");
    });
    
    it("may contain many dashes", function() {
      expect(interpreter.space("/* / // */")).toBe("/* / // */");
    });
    
  });
  
});
