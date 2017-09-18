function JavaScriptInterpreter() {
  
}

(function() {
  var f = new InterpreterMethodFactory();
  var j = JavaScriptInterpreter.prototype;
  var second = function(x, y) {
    return y;
  };
  
  var identifierName = /[a-zA-Z_\$][a-zA-Z0-9_\$]*/;
  
  j.space = /(\s|\n|(\/\/.*)|(\/\*\/*(\**[^\*\/]*\/*)*\*+\/))*/;

  // Lexical Grammar
  
  j.identifierName = f.atom(identifierName);
  
  j.literal = f.or("undefinedLiteral", "nullLiteral", "booleanLiteral", 
  "numericLiteral", "stringLiteral", "regularExpressionLiteral");
  
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
  
  j.stringLiteral = f.insignificant(null, "stringLiteralSignificantSpaces");
  
  j.stringLiteralSignificantSpaces = f.or("stringLiteralSignificantSpaces1", 
  "stringLiteralSignificantSpaces2");
  
  j.stringLiteralSignificantSpaces1 = f.select(2, /"/, "doubleStringCharacters", 
  /"/);
  
  j.stringLiteralSignificantSpaces2 = f.select(2, /'/, "singleStringCharacters", 
  /'/);
  
  var unescape = function(s) {
    s = s.replace(/\\['"\\bfnrtv]/g, function(match) {
      return characterEscapeSequence[match];
    });
    
    return s;
  };
  
  j.doubleStringCharacters = f.atom(/([^"\\]|(\\.))*/, unescape);
  
  j.singleStringCharacters = f.atom(/([^'\\]|(\\.))*/, unescape);
  
  var characterEscapeSequence = {
    "\\\'": "\'",
    "\\\"": "\"",
    "\\\\": "\\",
    "\\b": "\b", 
    "\\f": "\f", 
    "\\n": "\n", 
    "\\r": "\r", 
    "\\t": "\t",
    "\\v": "\v",
  };
  
  j.regularExpressionLiteral = 
      f.or("regularExpressionLiteralSignificantSpaces");
  
  j.regularExpressionLiteralSignificantSpaces = f.select(2, /\//, 
  "regularExpressionBody", /\//);
  
  j.regularExpressionBody = f.atom(/([^/\\\[]|(\\.)|(\[([^\]\\]|(\\.))*\]))+/, 
  function(regularExpressionBody) {
    return new RegExp(regularExpressionBody);
  });
  
  // Expressions
  
  j.identifierReference = f.wrap("bindingIdentifier", 
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
  
  j.identifierExpression = f.wrap("identifierReference", 
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
  
  j.objectExpression1 = f.select(2, /\(/, "expression", /\)/);
  
  j.thisExpression = f.atom(/this/, function() {
    return this.executionContext.thisBinding;
  });
  
  j.objectLiteral = f.group(/\{/, "propertyNameAndValueList", /\}/, 
  function(propertyAndValueList) {
    var result = {};
    propertyAndValueList.map(function(propertyAssignment) {
      result[propertyAssignment.propertyName] = 
          propertyAssignment.assignmentExpression;
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
  
  j.qualifier = f.or("qualifier1", "qualifier2");
  
  j.qualifier1 = f.select(2, /\[/, "expression", /\]/);
  
  j.qualifier2 = f.select(2, /\./, "identifierName");
  
  j.args = f.select(2, /\(/, "argumentList", /\)/);
  
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
  
  j.leftHandSideExpression3 = f.select(2, /\(/, "leftHandSideExpression", /\)/);
  
  j.leftHandSideExpression4 = f.group(/\(/, "sideEffectExpressionList", /,/, 
  "leftHandSideExpression", /\)/, second);
  
  j.leftHandSideExpressionBase = f.or("callExpression", "objectExpression");
  
  j.updateExpression = f.or("callExpression");
  
  j.valueExpression = f.longest("primaryExpression", "updateExpression",
  "rightHandSideExpression");
  
  j.rightHandSideExpression = f.wrap("leftHandSideExpression", 
  function(leftHandSideExpression) {
    return leftHandSideExpression.base[leftHandSideExpression.name];
  });
  
  j.typeChangeExpression = f.or("valueExpression", "typeChangeExpression1", 
  "typeChangeExpression2");
  
  j.typeChangeExpression1 = f.group(/!/, "typeChangeExpression", 
  function(typeChangeExpression) {return !typeChangeExpression;});
  j.typeChangeExpression2 = f.group(/typeof/, "typeChangeExpression", 
  function(typeChangeExpression) {return typeof typeChangeExpression;});
  
  j.relationalExpression = f.or("typeChangeExpression");
  
  j.equalityExpression = f.or("equalityExpression3", "equalityExpression4", 
  "relationalExpression");
  j.equalityExpression3 = f.group("equalityExpression", /===/, 
  "relationalExpression", function(ee, re) {return ee===re;});
  j.equalityExpression4 = f.group("equalityExpression", /!==/, 
  "relationalExpression", function(ee, re) {return ee!==re;});
  
  j.conditionalExpression = f.or("equalityExpression");
  
  j.properAssignmentExpression = f.group("leftHandSideExpression", /=/, 
  "assignmentExpression", 
  function(leftHandSideExpression, assignmentExpression) {
    var lhse = leftHandSideExpression;
    return (lhse.base[lhse.name] = assignmentExpression);
  });
  
  j.assignmentExpression = f.or("properAssignmentExpression", 
  "conditionalExpression");
  
  j.sideEffectExpression = f.or("properAssignmentExpression", 
  "updateExpression", "namedFunctionExpression", "sideEffectExpression1");
  
  j.sideEffectExpression1 = f.select(2, /\(/, "sideEffectExpressionList", /\)/);
  
  j.sideEffectExpressionList = f.plus("sideEffectExpression", /,/, 
  function(sideEffectExpressions) {
    return sideEffectExpressions[sideEffectExpressions.length-1];
  });
  
  j.expression = f.longest("assignmentExpression", "sideEffectExpressionList", 
  "expression1");
  
  j.expression1 = f.group("sideEffectExpressionList", /,/, 
  "assignmentExpression", second);
  
  // Statements
  
  j.statementOrBlock = f.longest("statement", "block");
  
  j.deferredStatementOrBlock = f.methodFactory("statementOrBlock");
  
  j.block = f.select(2, /\{/, "statementList", /\}/);
  
  j.statementList = f.star("deferredStatement", function(deferredStatements) {
    for(var i = 0; i < deferredStatements.length; i++) {
      var returnValue = deferredStatements[i].call(this);
      if(returnValue[0] === "return") {
        return returnValue;
      }
    }
    return ["normal", undefined];
  });
  
  j.deferredStatementList = f.methodFactory("statementList");

  j.statement = f.or("variableStatement", "expressionStatement", "ifStatement", 
  "returnStatement", "functionDeclaration");
  
  j.deferredStatement = f.methodFactory("statement");
  
  j.variableStatement = f.group(/var/, "bindingIdentifier", 
  "initialiserOpt", /;/, function(bindingIdentifier, initialiserOpt) {
    this.executionContext.variables[bindingIdentifier] = initialiserOpt;
    return ["normal", undefined];
  });
  
  j.initialiser = f.select(2, /=/, "assignmentExpression");
  
  j.initialiserOpt = f.opt("initialiser", function() {
    return undefined;
  });
  
  j.expressionStatement = f.group("sideEffectExpressionList", /;/, function() {
    return ["normal", undefined];
  });
  
  j.ifStatement = f.group(/if/, /\(/, "expression", /\)/, 
  "deferredStatementOrBlock", "deferredElseStatementOpt", 
  function(expression, deferredStatementOrBlock, deferredElseStatementOpt) {
    if(expression) {
      return deferredStatementOrBlock.call(this);
    } else {
      return deferredElseStatementOpt.call(this);
    }
  });
  
  j.deferredElseStatementOpt = f.methodFactory("elseStatementOpt");
  
  j.elseStatementOpt = f.opt("elseStatement", 
  function() {
    return ["normal", undefined];
  });
  
  j.elseStatement = f.select(2, /else/, "statementOrBlock");
  
  j.returnStatement = f.group(/return/, "expression", /;/, 
  function(expression) {
    return ["return", expression];
  });
  
  // Functions and programs
  
  j.functionDeclaration = f.wrap("namedFunctionExpression", function() {
    return ["normal", undefined];
  });
  
  j.functionExpression = f.or("anonymousFunctionExpression",
  "namedFunctionExpression");
  
  j.namedFunctionExpression = f.group(/function/, "bindingIdentifier",
  "functionExpressionContent", 
  function(bindingIdentifier, functionExpressionContent) {
    this.executionContext.variables[bindingIdentifier] = 
        functionExpressionContent;
    return functionExpressionContent;
  });
  
  j.anonymousFunctionExpression = f.select(2, /function/, 
  "functionExpressionContent");
  
  j.functionExpressionContent = f.group(/\(/, "formalParameterList", /\)/, 
  /\{/, "functionBody", /\}/, function(formalParameterList, functionBody) {
    var that = this;
    var outerExecutionContext = this.executionContext;
    return function() {
      var stack = that.executionContext;
      args = {};
      for(var i = 0; i < formalParameterList.length; i++) {
        args[formalParameterList[i]] = arguments[i];
      }
      args["arguments"] = arguments;
      that.executionContext = {
        outer: outerExecutionContext,
        variables: args,
        thisBinding: this,
      };
      
      var result = functionBody.call(that);
      that.executionContext = stack;
      return result[1];
    };
  });
  
  j.formalParameterList = f.star("bindingIdentifier", /,/);
  
  j.functionBody = f.select(2, "useStrictDeclarationOpt", 
  "deferredSourceElements");
  
  j.useStrictDeclarationOpt = f.opt("useStrictDeclaration");
  j.useStrictDeclaration = f.group(/('use strict')|("use strict")/, /;/);
  
  j.program = function(code, globalOrDebugging, debugging) {
    var global;
    if(globalOrDebugging === true) {
      debugging = true;
      global = {};
    } else {
      global = globalOrDebugging || {};
    }
    
    this.executionContext = {
      outer: null,
      variables: global,
    };
    
    this.executionContext.thisBinding = this.executionContext.variables;
    
    return this.program1(code, debugging)[1];
  };
  
  j.program1 = f.insignificant(j.space, "sourceElements");
  
  j.sourceElements = f.or("statementList");
  
  j.deferredSourceElements = f.methodFactory("sourceElements");
  
})();
