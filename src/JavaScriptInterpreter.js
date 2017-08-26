function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var id = function(x) {
    return x;
  };
  
  // Lexical Grammar
  
  var identifier = /[a-z]/;
  
  j.identifierDeclaration = f.atom(identifier);
  
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
  
  j.identifierName = f.atom(identifier);
  
  j.numericLiteral = f.atom(/\d/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  // Expressions
  
  j.primaryExpression = f.or("thisExpression", "numericLiteral", 
  "objectLiteral", "functionExpression", "identifierExpression");
  
  j.thisExpression = f.atom(/this/, function() {
    return this.executionContext.thisBinding;
  });
  
  j.objectLiteral = f.group(/\{/, "propertyNameAndValueList", /\}/, 
  function(propertyAndValueList) {
    var result = {};
    propertyAndValueList.map(function(propertyAssignment) {
      var pa = propertyAssignment;
      result[pa.propertyName] = pa.assignmentExpression;
    });
    
    return result;
  });
  
  j.propertyNameAndValueList = f.star("propertyAssignment", /,/);
  
  j.propertyAssignment = f.group("propertyName", /:/, "assignmentExpression");
  
  j.propertyName = f.or("identifierName");
  
  j.leftHandSideExpression = f.group("identifierReference", 
  "propertyQualifierList", 
  function(identifierReference, propertyQualifierList) {
    var result = identifierReference;
    
    propertyQualifierList.map(function(propertyQualifier) {
      result.container = result.container[result.name];
      result.name = propertyQualifier;
    });
    
    return result;
  });
  
  j.propertyQualifierList = f.star("propertyQualifier");
  
  j.propertyQualifier = f.or("propertyDotQualifier");
  
  j.propertyDotQualifier = f.group(/\./, "identifierName", id);
  
  j.assignmentExpression = f.or("assignmentExpression0", 
  "primaryExpression");
  
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
  
  j.expressionStatement = f.group("expression", /;/);
  
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
  
  j.functionExpression = f.group(/function/, /\(/, "formalParameterList", /\)/, 
  /\{/, "functionBody", /\}/, function(formalParameterList, functionBody) {
    var that = this;
    var outerExecutionContext = this.executionContext;
    return function() {
      var stack = that.executionContext;
      
      args = {};
      var i = 0;
      while(i < formalParameterList.length) {
        args[formalParameterList[i]] = arguments[i];
        i++;
      }
      
      that.executionContext = {
        outer: outerExecutionContext,
        variables: args,
        thisBinding: this,
      };
      
      var result = functionBody(that);
      that.executionContext = stack;
      return result;
    };
  });
  
  j.formalParameterList = f.star("identifierDeclaration", /,/);
  
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