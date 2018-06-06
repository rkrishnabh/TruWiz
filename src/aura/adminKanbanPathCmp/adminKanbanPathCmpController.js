({
    /* Method Name: doInit
     * Comments : This method is used for fecthing data while onload of the page
   */
    doInit: function (component, event, helper) {
        console.log('doInit');
        $A.util.removeClass(component.find("spinner"), "slds-hide"); 
        
        //Identify which cmp to Call
        var cmpName;
        var cmpParams = {};
        var pathToSet;        
        var userChoice = component.get("v.userChoice",userChoice);        
        switch(userChoice){
            case "NewTemplate":	
            case "EditTemplate":	                
            case "CopyTemplate":	                
                			cmpName = "c:adminTemplateDetailsPageCmp";
                			cmpParams["templateId"] = component.get("v.templateId");
                			pathToSet = "Template";
                			break;                
            case "NewTab":	
                			cmpName = "c:adminTabDetailsPageCmp";
                			pathToSet = "Tabs";                
                			break; 
            case "NewSubTab":	
                			cmpName = "c:adminSubTabDetailsPageCmp";
                			pathToSet = "Sub Tabs";                
                			break; 
            case "NewQuestion":	
                			cmpName = "c:adminQuestionDetailsPageCmp";
                			pathToSet = "Questions";                
                			break;                 
            case "ExistingQuestion":	                
                			cmpName = "c:adminCloneQuestionsPageCmp";
                			pathToSet = "Questions";                
                			break;                
        }
        
        //Check for Header
        switch(userChoice){
            case "NewTemplate":
            case "EditTemplate":
            case "CopyTemplate":                
            case "NewTab":	 
            case "NewSubTab":	 
            case "NewQuestion":	         
            case "ExistingQuestion":	                
           					component.set("v.showHeader",true);
                			break;                
        }        
                    
        helper.navigateToTemplate(component, event, helper, cmpName, cmpParams, pathToSet);        
    },
    setCurrentPath : function (component, event, helper){
        console.log('setCurrentPath');        
        
        var pathToSet = event.getParam("Name");
		helper.pathSetter(component, event, helper, pathToSet);
    },
    navigateToHome : function (component, event, helper){
        /*Navigate to Component*/
        var evt=$A.get("e.force:navigateToComponent");
        var sfObjectsList = component.get("v.sfObjectsList");            
        evt.setParams({
            componentDef: "c:adminHomePageCmp",
            componentAttributes: {
                sfObjectsList:sfObjectsList
            }                                
        });
        evt.fire();        
    },
     /* Method Name: navigateToHomePage
     * Comments : This method is used for  navigating back to App Page. 
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