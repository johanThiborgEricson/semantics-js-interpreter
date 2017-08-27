describe("The new operator", function() {
  
  it("without parameters, is evaluated after a single function propertiy", 
  function() {
    function NoParameterConstructor() {
      this.type = "NoParameterConstructor";
    }
    
    function PropertyConstructor() {
      this.type = "PropertyConstructor";
    }
    
    NoParameterConstructor.prototype.property = 
    "no parameter constructor object property";
    NoParameterConstructor.property = PropertyConstructor;

    function ParameterConstructor() {
      var that = NoParameterConstructor;
      that.type = "ParameterConstructor";
      return that;
    }
    
    expect((new new ParameterConstructor()).property)
    .toBe(NoParameterConstructor.prototype.property);
    expect(new ((new ParameterConstructor()).property)())
    .toEqual(jasmine.any(PropertyConstructor));
    
    //expect(new new (ParameterConstructor().property)()).toEqual();
    
    expect(new new ParameterConstructor().property)
    .toEqual(new ((new ParameterConstructor()).property)());
  });
  
});
