({
    selectObject : function(component, event, helper){      
        // get the selected Object from list  
        var getSelectObject = component.get("v.object");
        console.log('getSelectObject'+getSelectObject);
        
                 // call the event 
        var compEvent = component.getEvent("oSelectedObjectEvent");
        // set the Selected Account to the event attribute.  
        compEvent.setParams({"objectByEvent" : getSelectObject
                            });  
        // fire the event  
        compEvent.fire();
    },
})