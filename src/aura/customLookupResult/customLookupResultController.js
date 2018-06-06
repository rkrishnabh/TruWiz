({
   selectRecord : function(component, event, helper){  
      // alert('I am at prod lookup result');
    // get the selected record from list  
      var getSelectRecord = component.get("v.oRecord");
        var questionId = component.get("v.questionId");
       console.log('GetSelectedREcord'+JSON.stringify(getSelectRecord));
    // call the event   
      var compEvent = component.getEvent("oSelectedRecordEvent");
    // set the Selected sObject Record to the event attribute.  
         compEvent.setParams({
             "recordByEvent" : getSelectRecord,
              "questionId" : questionId
         });  
    // fire the event  
         compEvent.fire();
    },
})