function InterpreterMethodFactory () {
  "use strict";
  this.CodePointer = CodePointer;
}

InterpreterMethodFactory.prototype.makeParsing = function(regex) {
  var regexCode = regex.toString().slice(1).replace(/\/[a-z]*$/, "");
  var parsingRegexCode = regexCode.replace(/^\^?/, "^");
  var flags = regex.ignoreCase?"i":"";
  var parsingRegex = new RegExp(parsingRegexCode, flags);
  return parsingRegex;
};

InterpreterMethodFactory
.callInterpreterMethod = function(interpreter, methodName, codePointer) {
  if(typeof interpreter[methodName] !== "function") {
    throw new Error(methodName + " is not a method of the interpreter");
  }
  return interpreter[methodName](codePointer, methodName);
};

InterpreterMethodFactory.preInstructionMaker = 
function(interpreter, methodFactory, method, code, debuggingOrMethodName) {
  var v = {};

  if(code instanceof CodePointer) {
    v.isInternalCall = true;
    v.codePointer = code;
    v.methodName = debuggingOrMethodName;
  } else {
    v.isInternalCall = false;
    v.codePointer = new methodFactory.CodePointer(code, debuggingOrMethodName);
    v.methodName = methodFactory.nameOf(interpreter, method);
  }
  
  v.codePointer.logParseStart(v.methodName);
  v.backup = v.codePointer.backup();
  
  return v;
};

InterpreterMethodFactory.postInstructionMaker = 
function(v, interpreter, maybeInstruction) {
  
  if(!maybeInstruction){
    v.codePointer.restore(v.backup);
  }
  
  v.codePointer.logParseEnd(v.methodName, !!maybeInstruction);
  if(!v.isInternalCall) {
    if(!maybeInstruction) {
      throw new Error(v.codePointer.getParseErrorDescription());
    } else if(v.codePointer.getUnparsed() !== "") {
      throw new Error("Trailing code: '" + v.codePointer.getUnparsed() + "'.");
    }
    
  }
  
};

InterpreterMethodFactory.prototype
.makeMethod = function(instructionMaker) {
  "use strict";
  var methodFactory = this;
  var method = function(code, debuggingOrMethodName) {
    var v = InterpreterMethodFactory.preInstructionMaker(this, methodFactory, 
    method, code, debuggingOrMethodName);
    
    var maybeInstruction;
    var heads = v.codePointer.heads[v.backup] = 
        v.codePointer.heads[v.backup] || Object.create(null);
    if(heads[v.methodName]) {
      maybeInstruction = heads[v.methodName].cache;
      v.codePointer.restore(heads[v.methodName].end);
      heads[v.methodName].recursionDetected = true;
    } else {
      var head = heads[v.methodName] = {};
      v.codePointer.heads[v.backup] = Object.create(heads);
      maybeInstruction = instructionMaker(v.codePointer, this);
      if(head.recursionDetected) {
        var progress = true;
        while(progress && maybeInstruction) {
          head.cache = maybeInstruction;
          head.end = v.codePointer.backup();
          v.codePointer.heads[v.backup] = Object.create(heads);
          v.codePointer.restore(v.backup);
          maybeInstruction = instructionMaker(v.codePointer, this);
          progress = v.codePointer.backup() > head.end;
        }
        
        maybeInstruction = head.cache;
        v.codePointer.restore(head.end);
      }
      
      head.cache = maybeInstruction;
      head.end = v.codePointer.backup();
    }
    
    InterpreterMethodFactory.
        postInstructionMaker(v, this, maybeInstruction);
    
    return v.isInternalCall?maybeInstruction:maybeInstruction.call(this);
  };
  
  return method;
};

InterpreterMethodFactory.prototype
.nameOf = function(o, propertyValue) {
  for(var propertyName in o) {
    if(o[propertyName] === propertyValue) {
      return propertyName;
    }
  }
};

InterpreterMethodFactory.prototype
.atom = function(regex, interpretationOrButNot) {
  "use strict";
  var that = this;
  var parsingRegex = this.makeParsing(regex);
  var interpretation;
  var butNot;
  if(typeof interpretationOrButNot === "function") {
    interpretation = interpretationOrButNot;
  } else {
    butNot = interpretationOrButNot;
    interpretation = arguments[2];
  }
  
  return this.makeMethod(function(codePointer, interpreter) {
    var match = that
    .parseInsignificantAndToken(codePointer, parsingRegex, interpreter);
    if(match === null) {
      return null;
    }
    
    var result = match[0];
    if(butNot && butNot.indexOf(result) > -1) {
      return null;
    }
    
    return function instruction() {
      return interpretation?interpretation.call(this, result):result;
    };
    
  });
  
};

InterpreterMethodFactory.prototype
.empty = function(interpretation) {
  "use strict";
  if(!interpretation) {
    throw new Error("The empty string atom should be called with a function");
  }
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    return interpretation;
  });
  
};

InterpreterMethodFactory.prototype
.group = function() {
  "use strict";
  var factory = this;
  var parts = [];
  var interpretation;
  var p = {
    i: 0,
  };
  var argument;
  var leadingRegexes = this.readRegexesFromArguments(arguments, p);
  while(p.i < arguments.length) {
    argument = arguments[p.i++];
    if(typeof argument === "string") {
      parts.push({
        name: argument,
        trailingRegexes: this.readRegexesFromArguments(arguments, p),
      });
    } else {
      interpretation = argument;
    }
  }
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    if(!factory.skipRegexes(codePointer, leadingRegexes, interpreter)){
      return null;
    }
    var partInstructions = [];
    for(var i = 0; i < parts.length; i++){
      var maybeInstruction = InterpreterMethodFactory
            .callInterpreterMethod(interpreter, parts[i].name, codePointer);
      if(!maybeInstruction
        ||!factory.skipRegexes(codePointer, parts[i].trailingRegexes, 
        interpreter)) {
        return null;
      }
      maybeInstruction.partName = parts[i].name;
      
      partInstructions.push(maybeInstruction);
    }
    
    if(interpretation) {
      return function instruction() {
        return interpretation.apply(this, InterpreterMethodFactory
            .mapRunAsMethod(this, partInstructions));
      };
    } else {
      return function instruction() {
        var that = this;
        var mpo = new InterpreterMethodFactory.MultiPropertyObject();
        var result = {};
        partInstructions.map(function(pi) {
          mpo.appendProperty.call(result, pi.partName, pi.call(that));
        });
        
        return result;
      };
    }
  });
  
};

InterpreterMethodFactory.prototype
.skipRegexes = function(codePointer, regexes, interpreter) {
  for(var i = 0; i < regexes.length; i++) {
    if(!this.parseInsignificantAndToken(codePointer, regexes[i], interpreter)){
      return null;
    }
  }
  return true;
};

InterpreterMethodFactory.mapRunAsMethod = function(that, partInstructions) {
  return partInstructions.map(function(partInstruction) {
    return partInstruction.call(that);
  });
  
};

InterpreterMethodFactory.prototype
.readRegexesFromArguments = function(args, p) {
  var regexes = [];
  var regex;
  while((regex = args[p.i++]) instanceof RegExp) {
    regexes.push(this.makeParsing(regex));
  }
  p.i--;
  return regexes;
};

InterpreterMethodFactory.MultiPropertyObject = function() {
  var nameCount = Object.create(null);
  this.appendProperty = function(name, partResult) {
    var result = this;
    if(nameCount[name] === undefined) {
      nameCount[name] = 0;
    }
    
    if(nameCount[name] === 0) {
      this[name] = partResult;
    } else if(nameCount[name] === 1) {
      this[name] = [this[name], partResult];
    } else {
      this[name].push(partResult);
    }
    
    nameCount[name]++;
  };
  
};

InterpreterMethodFactory.prototype.select = function(index) {
  var factory = this;
  var partNames = Array.prototype.slice.call(arguments, 1);
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    for(var i = 0; i < partNames.length; i++) {
      var partName = partNames[i];
      var maybeInstruction;
      if(typeof partName === "string") {
        maybeInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, partName, codePointer);
      } else if(partName instanceof RegExp) {
        var regex = factory.parseInsignificantAndToken(
          codePointer, partName, interpreter);
        maybeInstruction = regex?factory.functionReturning(regex):null;
      }
      if(!maybeInstruction){
        return null;
      }
      partInstructions.push(maybeInstruction);
    }
    
    return index>0? partInstructions[index-1]:function instruction() {
        var that = this;
        var partResults = partInstructions.map(function(partInstruction) {
          return partInstruction.call(that);
        });
        
        return partResults;
      };
    
  });
  
};

InterpreterMethodFactory.prototype.wrap = function() {
  "use strict";
  var factory = this;
  var p = {
    i: 0,
  };
  var leadingRegexes = this.readRegexesFromArguments(arguments, p);
  var partName = arguments[p.i++];
  var trailingRegexes = this.readRegexesFromArguments(arguments, p);
  var interpretation = arguments[p.i++];
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction;
    var parseSucess = factory.skipRegexes(codePointer, leadingRegexes, 
    interpreter) && 
    (maybeInstruction = InterpreterMethodFactory
        .callInterpreterMethod(interpreter, partName, codePointer)) &&
    factory.skipRegexes(codePointer, trailingRegexes, interpreter);
    if(!parseSucess) {
      return null;
    }
    return !interpretation?maybeInstruction:function instruction() {
      return interpretation.call(this, maybeInstruction.call(this));
    };
    
  });
  
};

InterpreterMethodFactory.prototype.functionReturning = function(value) {
  return function() {
    return value;
  };

};

InterpreterMethodFactory.prototype.or = function() {
  var alternativesNames = arguments;
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction = null;
    var i = 0;
    while(!maybeInstruction && i < alternativesNames.length) {
      maybeInstruction = InterpreterMethodFactory
      .callInterpreterMethod(interpreter, alternativesNames[i++], codePointer);
    }
    
    return maybeInstruction;
  });
};

InterpreterMethodFactory.prototype.longest = function() {
  "use strict";
  var alternativesNames = Array.prototype.slice.call(arguments);
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var backup = codePointer.backup();
    var nullObject = {end:backup};
    var maybeInstruction = nullObject;
    alternativesNames.map(function(name) {
      codePointer.restore(backup);
      var partInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, name, codePointer);
      if(codePointer.backup() > maybeInstruction.end) {
        maybeInstruction = partInstruction;
        maybeInstruction.end = codePointer.backup();
      }
    });
    
    codePointer.restore(maybeInstruction.end);
    
    return maybeInstruction===nullObject?null:maybeInstruction;
  });
};

InterpreterMethodFactory.prototype
.star = function(partName) {
  "use strict";
  var interpretation;
  var delimiter;
  var delimiterAndPart;
  if(arguments[1] instanceof Function) {
    interpretation = arguments[1];
  } else {
    delimiter = arguments[1];
    delimiterAndPart = this.group(delimiter, partName, function(partName) {
      return partName;
    });
    
    interpretation = arguments[2];
  }
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    var maybeInstruction = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, partName, codePointer);
    if(delimiter){
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = delimiterAndPart.call(interpreter, codePointer, 
          delimiter + " and " + partName);
      }
    } else {
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, partName, codePointer);
      }
    }
      
    return function instruction() {
      var results = InterpreterMethodFactory
          .mapRunAsMethod(this, partInstructions);
      return interpretation?interpretation.apply(this, results):results;
    };
    
  });
  
};

InterpreterMethodFactory.prototype
.plus = function(partName) {
  "use strict";
  var interpretation;
  var delimiter;
  var delimiterAndPart;
  if(arguments[1] instanceof Function) {
    interpretation = arguments[1];
  } else {
    delimiter = arguments[1];
    delimiterAndPart = this.group(delimiter, partName, function(partName) {
      return partName;
    });
    
    interpretation = arguments[2];
  }
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var partInstructions = [];
    var maybeInstruction = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, partName, codePointer);
    if(!maybeInstruction){
      return null;
    }
    if(delimiter){
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = delimiterAndPart.call(interpreter, codePointer, 
          delimiter + " and " + partName);
      }
    } else {
      while(maybeInstruction){
        partInstructions.push(maybeInstruction);
        maybeInstruction = InterpreterMethodFactory
          .callInterpreterMethod(interpreter, partName, codePointer);
      }
    }
    
    return function instruction() {
      var results = InterpreterMethodFactory
          .mapRunAsMethod(this, partInstructions);
      return interpretation?interpretation.apply(this, results):results;
    };
    
  });
  
};

InterpreterMethodFactory.prototype
.opt = function(name, interpretation) {
  var defaultInterpretation = function() {
    return undefined;
  };
  
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var maybeInstruction = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, name, codePointer);
    return maybeInstruction || interpretation || defaultInterpretation;
  });
};

InterpreterMethodFactory.prototype
.methodFactory = function(name) {
  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var instructionToDeferre = InterpreterMethodFactory
    .callInterpreterMethod(interpreter, name, codePointer);
    if(!instructionToDeferre) {
      return null;
    }
    
    return function instruction() {
      return instructionToDeferre;
    };
    
  });
  
};

InterpreterMethodFactory.prototype
.parseInsignificantAndToken = function(codePointer, token, interpreter) {
  if(!this.parseInsignificant(codePointer, interpreter)) {
    return null;
  }
  
  return codePointer.parse(token);
};

InterpreterMethodFactory.prototype
.parseInsignificant = function(codePointer, interpreter) {
  if(codePointer.insignificant instanceof RegExp) {
    return codePointer.parse(codePointer.insignificant);
  } else if(typeof codePointer.insignificant === "string"){
    var justInsignificantMethod = this.justInsignificant(undefined, 
    codePointer.insignificant);
    return justInsignificantMethod
    .call(interpreter, codePointer, "(insignificant) " +
    codePointer.insignificant);
  } else {
    return true;
  }
};

InterpreterMethodFactory.prototype
.shiftInsignificant = function(insignificant, partName, codePointer, 
interpreter) {
  var outerInsignificant = codePointer.insignificant;
  codePointer.insignificant = insignificant;
  var instruction = InterpreterMethodFactory
  .callInterpreterMethod(interpreter, partName, codePointer);
  if(instruction&&!this.parseInsignificant(codePointer, interpreter)){
    instruction = null;
  }
  
  codePointer.insignificant = outerInsignificant;
  return instruction;
};

InterpreterMethodFactory.prototype
.justInsignificant = function(insignificant, partName) {
  "use strict";
  var that = this;

  return this.makeMethod(function(codePointer, interpreter) {
    var instruction = that.shiftInsignificant(insignificant, partName, 
    codePointer, interpreter);
    return instruction;
  });
};

InterpreterMethodFactory.prototype
.insignificant = function(insignificant, partName) {
  "use strict";
  var that = this;

  return this.makeMethod(function instructionMaker(codePointer, interpreter) {
    var instruction;
    if(that.parseInsignificant(codePointer, interpreter)) {
      instruction = that.shiftInsignificant(insignificant, partName, 
      codePointer, interpreter);
    }
    return instruction;
  });
};
