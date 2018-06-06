({
    doinit : function(component, event, helper) 
    {
        //alert('hi');
        var pickListData=component.get("v.pickListData");
        console.log('pickListData'+pickListData);
       // var pickListSelectedValue= event.getSource().get("v.aura:id="selectdItem"");
      // console.log(pickListSelectedValue);
       
         var pickListValues = [];
	     console.log('pickListValues');
       pickListValues=pickListData.split(",");
        console.log('pickListValues'+pickListValues);
        
        component.set("v.pickListValues",pickListValues);
       
     
          
    },
    onMultiSelectChange: function(component, event) {
        
        var selectCmp = component.find("InputSelectMultiple");
        alert('Multi select values'+selectCmp.get("v.value"));
        //var resultCmp = component.find("multiResult");
        
        selectCmp.set("v.value", selectCmp.get("v.value"));
        
    },
    onMultiSelectChangeTest: function(component, event) {
        
        var selectCmp = component.find("InputSelectMultipleTest");
        alert('Multi select values'+selectCmp.get("v.value"));
        //var resultCmp = component.find("multiResult");
        
        selectCmp.set("v.value", selectCmp.get("v.value"));
        
    }    

    
})