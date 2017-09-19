describe("An input insignificant space", function() {
  
  var interpreter = new JavaScriptInterpreter();

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
    expect(interpreter.spaces("")).toEqual([]);
  });
  
  it("can be an one line comment", function() {
    expect(interpreter.spaces("// comment 1. \n"))
        .toEqual(["// comment 1. ", "\n"]);
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
