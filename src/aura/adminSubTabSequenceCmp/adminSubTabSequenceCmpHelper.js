({
     loadTabsData: function(component,event,helper) 
    { 
        var action = component.get("c.getTemplate");
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === 'SUCCESS')
            {
                var templateList = response.getReturnValue();
                var objData = [];
                var oId,oVal;
                templateList.forEach(function(d){
                    console.log(d)
                    oId = d.Id;
                    oVal = d.Name;
                    objData.push({value: oId, label: oVal});
                });
                //objData.push({value: "xxxx", label: "Test"});
                component.set("v.templateList", objData);
                if(objData.length>0){
                	component.set("v.templateId", objData[0].value);
                    this.loadDataForTabs(component, event);
                }
                else if(objData.length==0){
                	component.set("v.templateId", "");
                    this.loadDataForTabs(component, event);
                }
            }
          
        });        
        
        $A.enqueueAction(action);                
    },
	upDatesubTabSequence: function(component,event,helper) 
    {         var subTabSequenceList = component.get("v.subTabSequenceList");
        console.log('dropped');
        var sts= [];
        var $ = jQuery.noConflict();
        $('tr').each(function(i){
            
            
            var Idis = $(this).find('#subTab_id')[0].outerText;
            //alert('Idis..'+Idis);
            var cue = component.get("v.subTabSequenceList").length;
            //alert('length--'+cue);
            for(var j=0;j<component.get("v.subTabSequenceList").length;j++){
                //  alert('Inside For..');
                var eachstd = component.get("v.subTabSequenceList");
                console.log(JSON.stringify(eachstd[j]));
                if(eachstd[j].Id == Idis){
                    // alert('Inside If..');
                    component.set("v.subTabSequenceList["+j+"].Sequence__c",i+1);
                    console.log('sequneceee--'+component.get("v.subTabSequenceList[j].Sequence__c"));
                }
            }
            
        });
        
        var actionnew = component.get("c.subTabSequenceSort");
        console.log('component.get("v.tabList") ',component.get("v.tabList"));
        actionnew.setParams({
            "tabList" :component.get("v.tabList"),
            "subTabList" : subTabSequenceList
        });
        actionnew.setCallback(this,function(response){
            var state = response.getState();
            if(state == "SUCCESS"){ 
                component.set('v.subTabList',response.getReturnValue());
                var showToast = $A.get('e.force:showToast');
                        showToast.setParams({
                            'title': 'Sequence',
                            'type': 'success',
                            'message': 'Tab Sequence updated successfully'
                        });            
                        showToast.fire();
            }
           
            
        });
        $A.enqueueAction(actionnew);

    },
	navigateToCmp: function(component,event,helper){//For Navigation
        //Conditional Back
        debugger;
        //var cmpBack = component.get("v.cmpBack");
        //cmpBack = "c:admin_NewQuestionsCmp";        
        //var cmpBackParent = component.get("v.cmpBackParent");        
        var paramsBack = {};
        var cmpInvocationStack = component.get("v.cmpInvocationStack");
        cmpInvocationStack.shift();
        var cmpBack = cmpInvocationStack[0];        
        component.set("v.cmpInvocationStack",cmpInvocationStack);        
        paramsBack["cmpInvocationStack"] = cmpInvocationStack;        
        switch(cmpBack){
            case "c:admin_globalSubTabsCmp":
                var tabList = component.get("v.tabList");
                var templateId = component.get("v.templateId");                                
                paramsBack["templateId"] = templateId;
                paramsBack["tabList"] = tabList;                                
                break;                
        }       
        $A.createComponents([[cmpBack,paramsBack]],        
                            function(questions, status)
                            {
                                if (component.isValid() && status === 'SUCCESS') 
                                {
                                    component.set("v.body", questions);
                                }
                                else
                                {
                                    var showToast = $A.get('e.force:showToast');
                                    showToast.setParams({
                                        'title': 'questionsList',
                                        'message': 'Error while calling questionsList component. Please try again.', });            
                                    showToast.fire();
                                }
                            });        
    }    
   
})