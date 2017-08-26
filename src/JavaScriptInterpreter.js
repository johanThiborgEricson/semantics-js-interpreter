function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var id = function(x) {
    return x;
  };
  
  // Lexical Grammar
  
  j.identifierDeclaration = f.atom(/[a-z]/, function(identifierDeclaration) {
    return identifierDeclaration;
  });
  
  j.identifierReference = f.group("identifierDeclaration", 
  function(identifierDeclaration) {
    var container = this.executionContext;
    while(!container.variables.hasOwnProperty(identifierDeclaration)) {
      container = container.outer;
    }
    
    return {
      container: container.variables,
      name: identifierDeclaration,
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
  
  j.primaryExpression = f.or("numericLiteral", 
  "functionExpression", "identifierExpression");
  
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
  
  j.variableStatement = f.group(/var /, "identifierDeclaration", 
  "initialiserOpt", /;/, function(identifierDeclaration, initialiserOpt) {
    this.executionContext.variables[identifierDeclaration] = initialiserOpt;
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
  
  j.functionExpression = f.group(/function/, /\(/, /\)/, /\{/, 
  "functionBody", /\}/, function(functionBody) {
    var that = this;
    var outerExecutionContext = this.executionContext;
    return function() {
      var stack = that.executionContext;
      that.executionContext = {
        outer: outerExecutionContext,
        variables: {},
      };
      
      var result = functionBody(that);
      that.executionContext = stack;
      return result;
    };
  });
  
  j.functionBody = f.deferredExecution("sourceElements");
  
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