function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var id = function(x) {
    return x;
  };
  
  var second = function(x, y) {
    return y;
  };
  
  var identifierName = /[a-zA-Z_\$][a-zA-Z0-9_\$]*/;
  
  j.space = /(\s|\n|(\/\/.*)|(\/\*\/*(\**[^\*\/]*\/*)*\*+\/))*/;

  // Lexical Grammar
  
  j.identifierName = f.atom(identifierName);
  
  j.literal = f.or("undefinedLiteral", "nullLiteral", "booleanLiteral", 
  "numericLiteral");
  
  j.undefinedLiteral = f.atom(/undefined/, function() {
    return undefined;
  });
  
  j.nullLiteral = f.atom(/null/, function() {
    return null;
  });
  
  j.booleanLiteral = f.or("trueLiteral", "falseLiteral");
  
  j.trueLiteral = f.atom(/true/, function() {
    return true;
  });
  
  j.falseLiteral = f.atom(/false/, function() {
    return false;
  });
  
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
  
  var reservedWord = ["break", "case", "catch", "class", "continue", 
  "debugger", "default", "delete", "do", "else", "enum", "export", "extends", 
  "false", "finally", "for", "function", "if", "implements", "import", "in", 
  "instanceof", "let", "new", "null", "package", "private", "protected", 
  "public", "return", "static", "super", "switch", "this", "throw", "true", 
  "try", "typeof", "undefined", "var", "void", "while", "with", "yield"];
  
  j.bindingIdentifier = f.atom(identifierName, reservedWord);
  
  j.primaryExpression = f.longest("literal", "objectExpression");
  
  j.objectExpression = f.longest("identifierExpression", 
  "objectLiteral", "functionExpression", "objectExpression1", "thisExpression");
  
  j.objectExpression1 = f.group(/\(/, "expression", /\)/, id);
  
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
  
  j.newExpression = f.group(/new/, "newExpressionQualifier", "argumentsOpt", 
  function(newExpressionQualifier, argumentsOpt) {
    var object = Object.create(newExpressionQualifier.prototype);
    newExpressionQualifier.apply(object, argumentsOpt);
    return object;
  });
  
  j.newExpressionQualifier = f.longest("objectExpression", "newExpression",
  "newExpressionQualifier1");
  
  j.newExpressionQualifier1 = f.group("newExpressionQualifier", "qualifier",
  function(newExpressionQualifier, qualifier) {
    return newExpressionQualifier[qualifier];
  });
  
  j.argumentsOpt = f.opt("args", function(){
    return [];
  });
  
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
  
  j.qualifier = f.or("dotQualifier", "squareBracketsQualifier");
  
  j.dotQualifier = f.group(/\./, "identifierName", id);
  
  j.squareBracketsQualifier = f.group(/\[/, "expression", /\]/, id);
  
  j.args = f.group(/\(/, "argumentList", /\)/, id);
  
  j.argumentList = f.star("assignmentExpression", /,/);
  
  j.leftHandSideExpression = f.or("leftHandSideExpression1", 
  "leftHandSideExpression2", "leftHandSideExpression3", 
  "leftHandSideExpression4", "identifierReference");
  
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
  
  j.leftHandSideExpression3 = f.group(/\(/, "leftHandSideExpression", /\)/, id);
  
  j.leftHandSideExpression4 = f.group(/\(/, "sideEffectExpressionList", /,/, 
  "leftHandSideExpression", /\)/, function(seel, leftHandSideExpression) {
    return leftHandSideExpression;
  });
  
  j.leftHandSideExpressionBase = f.or("callExpression", "objectExpression");
  
  j.updateExpression = f.or("callExpression");
  
  j.valueExpression = f.longest("primaryExpression", "updateExpression",
  "rightHandSideExpression");
  
  j.rightHandSideExpression = f.group("leftHandSideExpression", 
  function(lhse) {
    return lhse.base[lhse.name];
  });
  
  j.typeChangeExpression = f.or("valueExpression", "typeChangeExpression1");
  
  j.typeChangeExpression1 = f.group(/!/, "typeChangeExpression", 
  function(typeChangeExpression) {
    return !typeChangeExpression;
  });
  
  j.conditionalExpression = f.or("typeChangeExpression");
  
  j.properAssignmentExpression = f.group("leftHandSideExpression", /=/, 
  "assignmentExpression", 
  function(leftHandSideExpression, assignmentExpression) {
    var lhse = leftHandSideExpression;
    return (lhse.base[lhse.name] = assignmentExpression);
  });
  
  j.assignmentExpression = f.or("properAssignmentExpression", 
  "conditionalExpression");
  
  j.sideEffectExpression = f.or("properAssignmentExpression", 
  "updateExpression", "sideEffectExpression1");
  
  j.sideEffectExpression1 = f.group(/\(/, "sideEffectExpressionList", /\)/, id);
  
  j.sideEffectExpressionList = f.plus("sideEffectExpression", /,/, 
  function(sideEffectExpressions) {
    return sideEffectExpressions[sideEffectExpressions.length-1];
  });
  
  j.expression = f.longest("assignmentExpression", "sideEffectExpressionList", 
  "expression1");
  
  j.expression1 = f.group("sideEffectExpressionList", /,/, 
  "assignmentExpression", function(seel, assignmentExpression) {
    return assignmentExpression;
  });
  
  // Statements
  
  j.statement = f.or("variableStatement", "expressionStatement", "ifStatement", 
  "returnStatement");
  
  j.deferredStatement = f.methodFactory("statement");
  
  j.variableStatement = f.group(/var/, "bindingIdentifier", 
  "initialiserOpt", /;/, function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
    return ["normal", undefined];
  });
  
  j.initialiser = f.group(/=/, "assignmentExpression", 
  function(assignmentExpression) {
    return assignmentExpression;
  });
  
  j.initialiserOpt = f.opt("initialiser", function() {
    return undefined;
  });
  
  j.expressionStatement = f.group("sideEffectExpressionList", /;/, function() {
    return ["normal", undefined];
  });
  
  j.ifStatement = f.group(/if/, /\(/, "expression", /\)/, "deferredStatement", 
  function(expression, deferredStatement) {
    if(expression) {
      this.tmp = deferredStatement;
      this.tmp();
    }
    
    return ["normal", undefined];
  });
  
  j.returnStatement = f.group(/return/, "expression", /;/, 
  function(expression) {
    return ["return", expression];
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
      
      args["arguments"] = arguments;
      
      that.executionContext = {
        outer: outerExecutionContext,
        variables: args,
        thisBinding: this,
      };
      
      that.tmp = functionBody;
      var result = that.tmp();
      that.executionContext = stack;
      return result[1];
    };
  });
  
  j.formalParameterList = f.star("bindingIdentifier", /,/);
  
  j.functionBody = f.group("useStrictDeclarationOpt", "functionBody1", second);
  
  j.functionBody1 = f.methodFactory("sourceElements");
  j.useStrictDeclarationOpt = f.opt("useStrictDeclaration");
  j.useStrictDeclaration = f.group(/('use strict')|("use strict")/, /;/);
  
  j.program = function(code, global) {
    global = global || {};
    this.executionContext = {
      outer: null,
      variables: global,
    };
    
    this.executionContext.thisBinding = this.executionContext.variables;
    
    return this.program1(code)[1];
  };
  
  j.program1 = f.insignificant(j.space, "sourceElements");
  
  j.sourceElements = f.star("deferredStatement", function(deferredStatements) {
    var i = 0;
    while(i < deferredStatements.length) {
      this.tmp = deferredStatements[i];
      var returnValue = this.tmp();
      if(returnValue[0] === "return") {
        return returnValue;
      }
      
      i++;
    }
    
    return ["normal", undefined];
  });
  
})();
