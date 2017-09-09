function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var id = function(x) {
    return x;
  };
  
  var identifierName = /[a-zA-Z_\$][a-zA-Z0-9_\$]*/;

  // Lexical Grammar
  
  j.identifierName = f.atom(identifierName);
  
  j.literal = f.or("numericLiteral");
  
  j.numericLiteral = f.atom(/\d/, function(numericLiteral){
    return Number(numericLiteral);
  });
  
  // Expressions
  
  j.identifierReference = f.group("bindingIdentifier", 
  function(bindingIdentifier) {
    var base = this.executionContext;
    while(!base.variables.hasOwnProperty(bindingIdentifier)) {
      base = base.outer;
    }
    
    return {
      base: base.variables,
      name: bindingIdentifier,
    };
    
  });
  
  j.identifierExpression = f.group("identifierReference", 
  function(identifierReference) {
    var ir = identifierReference;
    return ir.base[ir.name];
  });
  
  j.bindingIdentifier = f.atom(identifierName);
  
  j.primaryExpression = f.longest("literal", "objectExpression");
  
  j.objectExpression = f.longest("identifierExpression", 
  "objectLiteral", "functionExpression");
  
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
  
  j.newExpression = f.group(/new /, "newExpressionQualifier", "argumentsOpt", 
  function(newExpressionQualifier, argumentsOpt) {
    var object = Object.create(newExpressionQualifier.prototype);
    newExpressionQualifier.apply(object, argumentsOpt);
    return object;
  });
  
  j.newExpressionQualifier = f.or("objectExpression");
  
  j.argumentsOpt = f.or("args");
  
  j.callExpression = f.or("newExpression", "callExpression1", 
  "callExpression2");
  
  j.callExpression1 = f.group("functionCallExpressionQualifier", "args", 
  function(fceQualifier, args) {
    return fceQualifier.apply(undefined, args);
  });
  
  j.callExpression2 = f.group("methodCallExpressionQualifier", "args", 
  function(mceQualifier, args) {
    return mceQualifier.value.apply(mceQualifier.base, args);
  });
  
  j.functionCallExpressionQualifier = f.longest("callExpression", 
  "objectExpression");
  
  j.methodCallExpressionQualifier = f.longest("methodCallExpressionQualifier1", 
  "methodCallExpressionQualifier2");
  
  j.methodCallExpressionQualifier1 = f.group("functionCallExpressionQualifier", 
  "qualifier", function(fceQualifier, qualifier) {
    return {
      base: fceQualifier,
      value: fceQualifier[qualifier],
    };
  });
  
  j.methodCallExpressionQualifier2 = f.group("methodCallExpressionQualifier", 
  "qualifier", function(mceQualifier, qualifier) {
    return {
      base: mceQualifier.value,
      value: mceQualifier.value[qualifier],
    };
  });
  
  j.qualifier = f.or("dotQualifier");
  
  j.dotQualifier = f.group(/\./, "identifierName", id);
  
  j.args = f.group(/\(/, "argumentList", /\)/, id);
  
  j.argumentList = f.star("assignmentExpression", /,/);
  
  j.leftHandSideExpression = f.or("leftHandSideExpression1", 
  "leftHandSideExpression2", "identifierReference");
  
  j.leftHandSideExpression1 = f.group("leftHandSideExpression", 
  "qualifier", 
  function(leftHandSideExpression, qualifier) {
    var result = leftHandSideExpression;
    
    result.base = result.base[result.name];
    result.name = qualifier;

    return result;
  });
  
  j.leftHandSideExpression2 = f.group("leftHandSideExpressionBase", 
  "qualifier", 
  function(leftHandSideExpressionBase, qualifier) {
    return {
      base: leftHandSideExpressionBase,
      name: qualifier,
    };
  });
  
  j.leftHandSideExpressionBase = f.or("callExpression", "objectExpression");
  
  j.updateExpression = f.or("callExpression");
  
  j.valueExpression = f.longest("primaryExpression", "updateExpression",
  "rightHandSideExpression");
  
  j.rightHandSideExpression = f.group("leftHandSideExpression", 
  function(lhse) {
    return lhse.base[lhse.name];
  });
  
  j.conditionalExpression = f.or("valueExpression");
  
  j.assignmentExpression = f.or("assignmentExpression0", 
  "conditionalExpression");
  
  j.assignmentExpression0 = f.group("leftHandSideExpression", /=/, 
  "assignmentExpression", 
  function(leftHandSideExpression, assignmentExpression) {
    var lhse = leftHandSideExpression;
    return (lhse.base[lhse.name] = assignmentExpression);
  });
  
  j.expression = f.or("assignmentExpression");
  
  // Statements
  
  j.statement = f.or("variableStatement", "expressionStatement", 
  "returnStatement");
  
  j.deferredStatement = f.deferredExecution("statement");
  
  j.expressionStatement = f.group("expression", /;/);
  
  j.variableStatement = f.group(/var /, "bindingIdentifier", 
  "initialiserOpt", /;/, function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
  });
  
  j.initialiser = f.group(/=/, "assignmentExpression", 
  function(assignmentExpression) {
    return assignmentExpression;
  });
  
  j.initialiserOpt = f.opt("initialiser");
  
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
      
      args["this"] = this;
      
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
  
  j.formalParameterList = f.star("bindingIdentifier", /,/);
  
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
