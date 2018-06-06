({
    /* Method Name: editTabData
     * Comments : This method used for display tabDetails based on tabId. 
     */ 
    editTabData : function(component, event){
        console.log('editTabData');  
        var tabId = component.get("v.tabId");
        console.log('tabId'+tabId);
        var templateId = component.get("v.templateId");        
        var action = component.get('c.getTabDetails');
        action.setParams({
            tabId:tabId
        });
      
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var tabObj = response.getReturnValue();
                component.set('v.tabObj',tabObj);
               
            }else
                this.showToastMsg(component,event,helper,"Error","Error in calling server side editTabDetails action");
         //this.preselectProfilesOnLoad(component, event);   
        });
        $A.enqueueAction(action);
    },
    /* Method Name: validations
     * Comments : This method is used for client side validation.
     * Validations : Mandatory Fields
     */
    validations : function(component,event,helper){
        console.log('validations');
        var tabObj = component.get("v.tabObj");
        var errMsg = ""; 
        var templateId = component.get("v.templateId");
        var userChoice = component.get("v.userChoice");
        if(tabObj.Tab_Name__c == "" || tabObj.Tab_Name__c == undefined)
            errMsg = "Please enter Tab name";
        
        if(userChoice == 'NewTab'){
            if(templateId == null || templateId == "" || templateId == undefined){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please enter Template";
            }
        }
        component.set("v.errorMessage",errMsg);
    },     
    /* Method Name: save
     * Comments : This method used for saving and updating tabs. 
     */ 
    save : function(component,event,helper){
        console.log('save');
        var templateId = component.get("v.templateId");
        var tabObj = component.get("v.tabObj");
        this.validations(component,event,helper);        
        var errorMessage = component.get("v.errorMessage");
        
        if(errorMessage != "" && errorMessage != null && errorMessage != undefined){
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            this.showToastMsg(component,event,helper,"Error",errorMessage);                                    
        }else{            
            //Calling the Apex Function
            var action = component.get("c.tabExist");
            //Setting the Apex Parameter
            action.setParams({
                templateId : templateId,
                tabObj : tabObj
            });
            //Setting the Callback
            action.setCallback(this,function(response){
                var state = response.getState();
                if(state == "SUCCESS"){
                    var tabExists = response.getReturnValue();
                    if(tabExists){
                        $A.util.addClass(component.find("spinner"), "slds-hide");
                        this.showToastMsg(component,event,helper,"Error","Please enter a different name. Tab with same name already exists");                        
                    }else{
                        //Since validations passed insert/update record here
                        var actionInsertUpdate = component.get('c.insertUpdateTab');
                        actionInsertUpdate.setParams({
                            templateId : templateId,
                            tabObj : tabObj,
                        });
                        actionInsertUpdate.setCallback(this,function(response){
                            //debugger;
                            var state = response.getState();
                            if(state == "SUCCESS"){
                                var result = response.getReturnValue();
                                var tabId = component.get("v.tabId");
                                if(tabId != "" && tabId != undefined)
                                    this.showToastMsg(component,event,helper,"Success","Tab has been updated successfully");
                                else
                                    this.showToastMsg(component,event,helper,"Success","Tab has been created successfully");
                                                             
                                $A.util.removeClass(component.find("createTab"), "unhideElement");
                                $A.util.addClass(component.find("createTab"), "hideElement");
                                $A.util.removeClass(component.find("tabLists"), "hideElement");
                                $A.util.addClass(component.find("tabLists"), "unhideElement");                            
                                this.navigateToCmp(component,event,helper);                            
                            }else if(state == "ERROR"){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                this.showToastMsg(component,event,helper,"Error","Error in calling server side insertUpdateTab action");
                            }                        
                        });
                        $A.enqueueAction(actionInsertUpdate);//insertUpdateTab Action invocation                    
                    }
                }
            });
            //adds the server-side action to the queue        
            $A.enqueueAction(action);	//tabExist Action invocation                           
        }        
    },
    /* Method Name: navigateToCmp
     * Comments : This method used for navigating to adminTabHomePageCmp. 
     */
    navigateToCmp : function(component,event,helper){
        console.log('navigateToCmp');        
        //Check for navigation through Home
        if(component.get("v.userChoice") == "NewTab"){
            var evt=$A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef:"c:adminHomePageCmp",
                componentAttributes: {
                    sfObjectsList:component.get("v.sfObjectsList")
                }                
            });
            evt.fire();            
        }else{
            //Set cmp and cmpParams
            var cmp;
            var cmpParams = {};    
            cmpParams["templateId"] = component.get("v.templateId");
            var cmpNavigationList = component.get("v.cmpNavigationList");
            cmpNavigationList.shift();
            component.set("v.cmpNavigationList",cmpNavigationList);
            cmpParams["cmpNavigationList"] = cmpNavigationList;        
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice");
            cmpParams["tabName"] = component.get("v.tabName");
            cmp = "c:adminTabHomePageCmp";            
            helper.createComponent(component,event,helper,cmp,cmpParams);
        }
    },
 
 
      /* Method Name: preselectProfilesOnLoad
     * Comments : This method used for prepopulating object picklistvalues on editmode. 
     */ 
    preselectProfilesOnLoad : function(component,event,helper) {
        console.log('preselectProfilesOnLoad');
        var action = component.get('c.getAllProfileValues');
        console.log('action' + action);
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var allProfileNames = response.getReturnValue();
                console.log('allProfileNames' + allProfileNames);
                component.set('v.allProfileNames',allProfileNames);
            }
        });
        $A.enqueueAction(action);
        var tabObj = component.get("v.tabObj");                
        var allProfileNames = component.get("v.allProfileNames");
        var objData = [];
        var label,name,selctd;
        if(tabObj != "" && tabObj != undefined){
            if(tabObj.Profile__c != "" && tabObj.Profile__c != undefined){
                Object.keys(allProfileNames).forEach(function(index){
                    name = allProfileNames[index].Name;
                    label = allProfileNames[index].Id;
                    if(name == subTabObj.Profile__c)
                        selctd = true;
                    else
                        selctd = false;
                  objData.push({Label: label, Name: name, Selected: selctd});			
                });
               
            }
            else{
                Object.keys(allProfileNames).forEach(function(index){
                    name = allProfileNames[index].Name;
                    label = allProfileNames[index].Id;
                    selctd = false;                        
                    objData.push({Label: label, Name: name, Selected: selctd});			
                });
                component.set("v.tabObj",tabObj);                        
            }                    
        }
        else{
            Object.keys(allProfileNames).forEach(function(index){
                name = allProfileNames[index].Name;
                label = allProfileNames[index].Id;
                selctd = false;                        
               objData.push({Label: label, Name: name, Selected: selctd});			
            });
            objData[0].Selected = true;
            tabObj.Profile__c = objData[0].Name;
            tabObj.ProfileId__c = objData[0].Label;
            component.set("v.tabObj",tabObj); 
        }
        component.set("v.allProfileNames",objData);                
        
    },
    /* Method Name: createComponent
     * Comments : Refactored code to seperate Method for calling $A.createComponents.
     * Parameters : cmpName and cmpParams 
     */
    createComponent : function(component,event,helper,cmpName,cmpParams){
        $A.createComponents([[cmpName,cmpParams]],
                            function(cmp, status){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                if (component.isValid() && status === 'SUCCESS')
                                    component.set("v.body", cmp);
                                else
                                    this.showToastMsg(component,event,helper,"Error","Error while calling component. Please try again.");
                            });        
    },    
    /* Method Name: showToastMsg
     * Comments : This is unique method for displaying errormessages
     */    
    showToastMsg : function(component,event,helper,title,msg) {
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'message': msg});
        showToast.fire();        
    }
})