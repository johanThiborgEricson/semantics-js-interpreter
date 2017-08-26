function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var id = function(x) {
    return x;
  };
  
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
  
  j.leftHandSideExpression = f.or("identifierReference");
  
  j.conditionalExpression = f.or("primaryExpression");
  
  j.assignmentExpression = f.or("assignmentExpression0", 
  "conditionalExpression");
  
  j.assignmentExpression0 = f.group("leftHandSideExpression", /=/, 
  "assignmentExpression", 
  function(leftHandSideExpression, assignmentExpression) {
    var lhse = leftHandSideExpression;
    return (lhse.container[lhse.name] = assignmentExpression);
  });
  
  j.expression = f.or("assignmentExpression");
  
  // Statements
  j.statement = f.or("variableStatement", "expressionStatement", 
  "returnStatement");
  
  j.deferredStatement = f.deferredExecution("statement");
  
  j.expressionStatement = f.group("expression", /;/, id);
  
  j.variableStatement = f.group(/var /, "identifierReference", 
  "initialiserOpt", /;/, function(identifierReference, expression) {
    identifierReference.container[identifierReference.name] = expression;
  });
  
  j.initialiser = f.group(/=/, "assignmentExpression", 
  function(assignmentExpression) {
    return assignmentExpression;
  });
  
  j.initialiserOpt = f.opt("initialiser", undefined);
  
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