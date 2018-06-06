({
    /* Method Name: doInit
     * Comments : This method fetch templateList  while page loading. 
     */  
    doInit: function (component,event, helper){
        console.log('doInit');
        $A.util.removeClass(component.find("templateLists"), "unhideElement");
        $A.util.addClass(component.find("templateLists"), "hideElement");
        helper.loadTemplates(component, event);
    },
    /* Method Name: templateActionClicked
     * Comments : This method is used for  clicking based on ActiondId it navigate to different Pages. 
     */
    templateActionClicked : function(component,event,helper){
        console.log('templateActionClicked');
        var actionId = event.getParam('actionId');
        
        if(actionId !="" && actionId != null && actionId != undefined){            
            var cmpParams = {};
            var createComponentFlag = true;
            $A.util.removeClass(component.find("spinner"), "slds-hide");
            if(actionId == 'editTemplate'){  
                var clickedRow = event.getParam('row');
                cmpParams["templateId"] = clickedRow.Id;
            } else if(actionId == 'deleteTemplate'){
                createComponentFlag = false;
                var rowIdx = event.getParam("index");
                var clickedRow = event.getParam('row');
                var selectedDeletedTemplateId = clickedRow.Id;
                var allTemplateList = component.get("v.templateList");
                helper.deleteTemplates(component, event, helper, selectedDeletedTemplateId, rowIdx);
            }else if(actionId == 'New'){
                component.set("v.userChoice","NewTemplate");
            }
            if(createComponentFlag){
                 $A.util.addClass(component.find("templateLists"), "hideElement");   
                cmpParams["cmpNavigationList"] = component.get("v.cmpNavigationList");
                cmpParams["userChoice"] = component.get("v.userChoice");
                event.setParam("actionId","");		            
                helper.createComponent(component,event,helper,"c:adminKanbanPathCmp",cmpParams);            
            }
        }
    },
    /* Method Name: goToPrevious
     * Comments : This method is used for  navigating back to HomePage. 
     */
  /*  goToPrevious: function(component,event,helper){
        console.log('goToPrevious');
        //Conditional Back
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        component.set("v.cmpNavigationList",cmpNavigationList);
        var sfObjectsList=component.get("v.sfObjectsList");         
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef : "c:adminHomePageCmp",
            componentAttributes: {
                cmpNavigationList:cmpNavigationList,
                sfObjectsList:sfObjectsList
                
            }             
        });
        evt.fire();   
    },*/
     goToPrevious : function(component, event, helper) {
        console.log('URL Method..');
         var urlPath = window.location.href;
         var appIndex = urlPath.indexOf(".app#");         
         var url = urlPath.substring(0,appIndex + 5) + "/n/Wizard_Admin_Services";         
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            //"url": "https://truwiz.lightning.force.com/one/one.app#/n/Wizard_Admin_Services"
            "url": url
        });
        urlEvent.fire();
    },
   
    
    
/* Method Name: navigateToHomePage
Comments : This method is used for  navigating back to App Page. 
*/
    navigateToHomePage : function(component) {
        console.log('URL Method..');
         var urlPath = window.location.href;
         var appIndex = urlPath.indexOf(".app#");         
         var url = urlPath.substring(0,appIndex + 5) + "/n/Wizard_Admin_Services";        
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
            //"url": "https://truwiz.lightning.force.com/one/one.app#/n/Wizard_Admin_Services"
            "url" : url
        });
        urlEvent.fire();
    } 
})