function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  
  // Lexical Grammar
  
  j.identifierReference = f.atom(/[a-z]/, function(identifierReference) {
    return {
      container: this.executionContext.variables,
      name: identifierReference,
    };
    
  });
  
  j.identifierExpression = f.group("identifierReference", 
  function(identifierReference) {
    var ir = identifierReference;
    return ir.container[ir.name];
  });
  
  j.numericLiteral = f.atom(/\d/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  // Expressions
  
  j.primaryExpression = f.or("identifierExpression", "numericLiteral");
  
  j.expression = f.or("primaryExpression");
  
  // Statements
  j.statement = f.or("variableStatement", "returnStatement");
  j.deferredStatement = f.deferredExecution("statement");
  
  j.variableStatement = f.group(/var /, "identifierReference", /=/, 
  "expression", /;/, function(identifierReference, expression) {
    identifierReference.container[identifierReference.name] = expression;
  });
  
  j.returnStatement = f.group(/return /, "expression", /;/, 
  function(expression) {
    return expression;
  });
  
  // Functions and programs
  
  j.programInit = f.empty(function() {
    this.executionContext = {
      outer: null,
      variables: {},
    };
    
  });
  
  j.program = f.group("programInit", "sourceElements", 
  function(programInit, sourceElements) {
    return sourceElements;
  });
  
  j.sourceElements = f.star("deferredStatement", function(deferredStatements) {
    var returnValue;
    var i = 0;
    while(i < deferredStatements.length) {
      returnValue = deferredStatements[i](this);
      i++;
    }
    
    return returnValue;
  });
  
  
})();