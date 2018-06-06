({
    picklistValuesOnLoad : function(component, event, helper) 
    {        
        console.log('Inside picklistValuesOnLoad..');
        var pickListData=component.get("v.pickListData");
        console.log('pickListData..'+component.get("v.pickListData"));
        var pickListValues = [];
       	pickListValues=pickListData.split(",");
        component.set("v.pickListValues",pickListValues);   
        console.log('depedentQuestion..'+component.get("v.dependentQuestion"));
        console.log('questionId..'+component.get("v.questionId"));
        console.log('label..'+component.get("v.label"));
    },
    
    fireOnChangeEvent: function (component, event, helper) {
        console.log('Inside  fireOnChangeEvent..');        
        var dependentTab = component.get("v.dependentTab");
        var dependentSubtab = component.get("v.dependentSubtab");        
        var dependentQuestion = component.get("v.dependentQuestion");
        console.log('depedentQuestion..'+dependentQuestion);
        console.log('dependentTab..'+dependentTab);
        console.log('dependentSubtab..'+dependentSubtab);
        var selectedValue = component.find("select");
        var selectedPickValue = selectedValue.get("v.value");
        var conditionalDependencyEvent = component.getEvent("conditionalDependencyEvent");        
        conditionalDependencyEvent.setParams({"selectedQuestionId": component.get('v.questionId'),                                 		
                                       	"selectedAnswer":selectedPickValue,                                                                                       
                                            "dependentTab":dependentTab,
                                            "dependentSubtab":dependentSubtab,
                                           "dependentQuestion":dependentQuestion});
        									
        conditionalDependencyEvent.fire();
    }

})