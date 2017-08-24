function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  
  j.program = f.group("statements", function(statements) {
    var returnValue = statements();
    return returnValue;
  });
  
  j.statements = f.star("statement", function(statements) {
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
  
  j.statement = f.or("returnStatement");
  
  j.returnStatement = f.group(/return /, "expression", /;/, function(statement) {
    return function() {
      return statement;
    };
  });
  
  j.expression = f.or("numericLiteral");
  
  j.numericLiteral = f.atom(/\d/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
})();