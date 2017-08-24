function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  
  // Lexical Grammar
  
  j.numericLiteral = f.atom(/\d/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  // Expressions
  
  j.expression = f.or("numericLiteral");
  
  // Statements
  j.statement = f.or("returnStatement");
  
  j.statementList = f.star("statement", function(statements) {
    var f = function() {
      var returnValue;
      var i = 0;
      while(i < statements.length) {
        returnValue = statements[i]();
        i++;
      }
      
      return returnValue;
    };
    
    return f;
  });
  
  j.returnStatement = f.group(/return /, "expression", /;/, function(statement) {
    return function() {
      return statement;
    };
  });
  
  // Functions and programs
  
  j.program = f.group("statementList", function(statementList) {
    var returnValue = statementList();
    return returnValue;
  });
  
  
})();