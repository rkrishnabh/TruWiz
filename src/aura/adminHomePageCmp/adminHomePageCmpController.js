({
    doInit : function(component, event, helper){
        console.log('doInit');
        //helper.getAllSfObjects(component, event, helper);        
    },
    
    navigateAction:function(component,event,helper){
        console.log('navigateAction HomePage');        
        var cmpName= "";
        var flagNavigate = true;
        var userChoice = event.currentTarget.getAttribute("data-val");
        component.set("v.userChoice",userChoice);         
        switch(userChoice){
            case "EditTemplate":	
            case "CopyTemplate":	
                			cmpName = "c:adminTemplateHomePageCmp";
                			break;
            case "NewTemplate":	            
            case "NewTab":	 
            case "NewSubTab":
            case "NewQuestion":	
            case "ExistingQuestion":
                			cmpName = "c:adminKanbanPathCmp";                			
                			break;                 
            case "AddGifts":
            case "AddHelpText":
                			flagNavigate = false;
                			cmpName = "c:adminTemplateHomePageCmp";
                			helper.showToastMsg(component,event,helper,"","Work In Progress");                
                			break;                 
        }
        
        if(flagNavigate){
            /*Navigate to Component*/
            var evt=$A.get("e.force:navigateToComponent");
            var cmpNavigationList = component.get("v.cmpNavigationList");            
            if(cmpName != "c:adminKanbanPathCmp"){
                cmpNavigationList.unshift(cmpName);
                component.set("v.cmpNavigationList",cmpNavigationList);
            }
            //var sfObjectsList = component.get("v.sfObjectsList");            
            evt.setParams({
                componentDef:cmpName,
                componentAttributes: {
                    cmpNavigationList:cmpNavigationList,
                    userChoice:userChoice,
                    //sfObjectsList:sfObjectsList
                }                                
            });
            evt.fire();
        }
    
    }    
})