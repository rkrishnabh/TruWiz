({
    /* Method Name: editSubTabData
     * Comments : This method used for display subtabDetails based on subtabId. 
     */  
    editSubTabData : function(component, event){
        console.log('editSubTabData');  
        var subTabId = component.get("v.subTabId");
        var action = component.get('c.getSubTabDetails');
        action.setParams({
            subTabId:subTabId
        });
        action.setCallback(this, function(response){
            //debugger;
            var state = response.getState();
            if(state == "SUCCESS"){
                var subTabObj = response.getReturnValue();                
                if(subTabObj != null && subTabObj != undefined && subTabObj != ""){                
                    if(Object.keys(subTabObj).length == 0)
                        subTabObj.Form_Layout__c = true;
                }
                else{
                    subTabObj = {};
                    subTabObj.Form_Layout__c = true;                    
                }
               component.set('v.subTabObj',subTabObj);              
            }else
                this.showToastMsg(component,event,helper,"Error","Error while calling subTabDeatils component. Please try again.");
            //For Tab Popup
            var tabId = component.get("v.tabId");
            if(tabId != "" && tabId != undefined && tabId != null){
                var subTabObj = component.get('v.subTabObj');
                subTabObj.Tabs__c = tabId;
                component.set('v.subTabObj',subTabObj);    
            }
            
            //Disbaling Org Parent Object API and Object API picklist
            var subTabObj = component.get('v.subTabObj');
            var disablePicklists = false;
            if(subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != "None" && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != ""){
               disablePicklists = true;                 
            }
            if(subTabObj.Object_API_Name__c != undefined && subTabObj.Object_API_Name__c != "None" && subTabObj.Object_API_Name__c != null && subTabObj.Object_API_Name__c != ""){
               disablePicklists = true;                 
            }
            //disablePicklists = false;             
            if(disablePicklists){
                component.find("dynamicParentSobject").set("v.disabled",true);
                component.find("dynamicObjectName").set("v.disabled",true);
            }                
            component.find("relationship").set("v.disabled",true);             
           
            this.preselectTheParentSFobject(component, event);            
            this.preselectTheSFobjectOnLoad(component, event);              
        });
      
        $A.enqueueAction(action);
    },    
    /* Method Name: validations
     * Comments : This method is used for client side validation.
     * Validations : Mandatory Fields
     */
    validations : function(component,event,helper){
        console.log('validations');
        var subTabObj = component.get("v.subTabObj");
        var tabId = component.get("v.tabId");
        var templateId = component.get("v.templateId");
        var userChoice = component.get("v.userChoice");
        var errMsg = "";        
        if(tabId == null || tabId == "" || tabId == undefined){
            if(subTabObj.Tabs__c == null || subTabObj.Tabs__c == "" || subTabObj.Tabs__c == undefined){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please enter Tab Name";
            }
        }
        if(subTabObj.Field_API_Name__c != null && subTabObj.Field_API_Name__c != "" && subTabObj.Field_API_Name__c != undefined && subTabObj.Field_API_Name__c != "None"){
            if(subTabObj.Filtering_Value__c == null || subTabObj.Filtering_Value__c == "" || subTabObj.Filtering_Value__c == undefined){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please enter Filtering Value";
            }
        }
        if(subTabObj.SubTab__c == "" || subTabObj.SubTab__c == undefined){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");            
            errMsg += "Please enter Sub Tab name";
        }
        /*if(subTabObj.Relationship__c != null && subTabObj.Relationship__c != "" && subTabObj.Relationship__c != undefined && subTabObj.Relationship__c != "None"){
            if(subTabObj.Org_Parent_Object_API_Name__c == "" || subTabObj.Org_Parent_Object_API_Name__c == undefined || subTabObj.Org_Parent_Object_API_Name__c == "--None--" || subTabObj.Org_Parent_Object_API_Name__c == "None"){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please enter Parent Object";
            }
        }*/
        if(subTabObj.Org_Parent_Object_API_Name__c != "" && subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != "None"){
            if(subTabObj.Object_API_Name__c == "" || subTabObj.Object_API_Name__c == undefined || subTabObj.Object_API_Name__c == null || subTabObj.Object_API_Name__c == "None"){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please select Object Name";                
            }            
        }     
        if(userChoice == 'NewSubTab'){
            if(templateId == null || templateId == "" || templateId == undefined){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                
                errMsg += "Please enter Template Name";
            }
        }
        component.set("v.errorMessage",errMsg);
    },     
    /* Method Name: save
     * Comments : This method used for saving and updatpng subtabs. 
     */ 
    save : function(component,event,helper){
       // debugger;
        console.log('save');
        var tabId = component.get("v.tabId");
        var subTabObj = component.get("v.subTabObj");
        var formType = component.find("formType").get("v.value");
        if(formType == null || formType == ''|| formType == undefined){
            formType = "Two"; 
        }
        var dataView = component.find("dataView").get("v.value");
        
        if((dataView == null || dataView == ''|| dataView == undefined) || (subTabObj.Layout_Type__c == 'Tabular Layout')){
            dataView = 'Multiple Record View';
        }else if((dataView == null || dataView == ''|| dataView == undefined) || (subTabObj.Layout_Type__c == 'Form Layout')){
            dataView = "Single Record View"; 
        }
        var layoutType = component.find("layoutType").get("v.value");
        if(layoutType == null || layoutType == ''|| layoutType == undefined){
            layoutType = "Form Layout"; 
        }
        subTabObj.Form_Type__c = formType;
        subTabObj.Data_View__c = dataView;
        subTabObj.Layout_Type__c = layoutType;
        this.validations(component,event,helper);		               
        
        var errorMessage = component.get("v.errorMessage");
        if(errorMessage != "" && errorMessage != null && errorMessage != undefined){
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            this.showToastMsg(component,event,helper,"Error",errorMessage);                                    
        }else{
            //Calling the Apex Function
            var action = component.get("c.subtabExist");
            //Setting the Apex Parameter
            action.setParams({
              subTabObj : subTabObj
            });
            //Setting the Callback
            action.setCallback(this,function(response){
                var state = response.getState();
                if(state == "SUCCESS"){
                    var subtabExists = response.getReturnValue();
                    if(subtabExists){
                        $A.util.addClass(component.find("spinner"), "slds-hide");
                        this.showToastMsg(component,event,helper,"Error","Please enter a different name. SubTab with same name already exists");                        
                    }else{
                        //Since validations passed insert/update record here
                        
                        /*Start Reset None Parent and child Objects Names to blank*/
                        var subTabObj = component.get("v.subTabObj");                        
                        if(subTabObj.Org_Parent_Object_API_Name__c == "None"){
                            subTabObj.Org_Parent_Object_API_Name__c = "";
                            subTabObj.Parent_Object_API_Name__c = "";
                            subTabObj.Parent_Object_Name__c = "";            
                        }        
                        
                        if(subTabObj.Object_API_Name__c == "None"){
                            subTabObj.Object_API_Name__c = "";
                            subTabObj.Object_Name__c = "";            
                        }
                        //component.set("v.subTabObj",subTabObj);

                        /*End Reset None Parent and child Objects Names to blank*/                        
                        var actionInsertUpdate = component.get('c.insertUpdateSubTab');
                        actionInsertUpdate.setParams({
                          subTabObj :subTabObj,
                            });
                        actionInsertUpdate.setCallback(this,function(response){
                            var state = response.getState();
                            if(state == "SUCCESS"){
                                var result = response.getReturnValue();
                                var subTabId = component.get("v.subTabId");
                                if(subTabId != "" && subTabId != undefined)
                                    this.showToastMsg(component,event,helper,"Success","SubTab has been updated successfully");
                                else
                                    this.showToastMsg(component,event,helper,"Success","SubTab has been created successfully");
                                
                                $A.util.removeClass(component.find("createSubTab"), "unhideElement");
                                $A.util.addClass(component.find("createSubTab"), "hideElement");
                                $A.util.removeClass(component.find("subTabLists"), "hideElement");
                                $A.util.addClass(component.find("subTabLists"), "unhideElement");                             
                                this.navigateToCmp(component,event,helper);                            
                            }else if(state == "ERROR"){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                this.showToastMsg(component,event,helper,"Error","Error in calling server side insertUpdateSubTab action");
                            }                        
                        });
                        $A.enqueueAction(actionInsertUpdate);//insertUpdateTab Action invocation                    
                    }
                } 
                else{
                    //subtabExist Action will never be in Fail State
                }
            });
            
            //adds the server-side action to the queue        
            $A.enqueueAction(action);	//subtabExist Action invocation               
            
        }
        
    },
   
     /* Method Name: preselectTheParentSFobject
     * Comments : This method used for prepopulating parentobject picklistvalues. 
     */ 
    preselectTheParentSFobject : function(component,event,helper) {
        console.log('preselectTheParentSFobject');
        //debugger;        
        var subTabObj = component.get("v.subTabObj");                
        var sfParentObjectsList = component.get("v.sfObjectsList");
        var objData = [];
        var label,name,selctd;
        component.find("relationship").set("v.disabled",true);                    
        if(sfParentObjectsList != null && sfParentObjectsList != undefined && sfParentObjectsList != ""){
            
            if(subTabObj != "" && subTabObj != undefined && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != "" && subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != "None"){
                Object.keys(sfParentObjectsList).forEach(function(index){
                    name = sfParentObjectsList[index].Name;
                    label = sfParentObjectsList[index].Label;
                    if(name == subTabObj.Org_Parent_Object_API_Name__c)
                        selctd = true;
                    else
                        selctd = false;
                    objData.push({Label: label, Name: name, Selected: selctd});			
                });
                //component.find("relationship").set("v.disabled",false);                            
              }
            else{
                Object.keys(sfParentObjectsList).forEach(function(index){
                    name = sfParentObjectsList[index].Name;
                    label = sfParentObjectsList[index].Label;
                    selctd = false;                        
                   
                    objData.push({Label: label, Name: name, Selected: selctd});			
                });
                component.set("v.subTabObj",subTabObj);                        
            }                    
        component.set("v.sfParentObjectsList",objData);                
        }
    },
   /* Method Name: preselectTheSFobjectOnLoad
     * Comments : This method used for prepopulating object picklistvalues on editmode. 
     */ 
    preselectTheSFobjectOnLoad : function(component,event,helper) {        
        console.log('preselectTheSFobjectOnLoad');
        //debugger;        
        var subTabObj = component.get("v.subTabObj");

        if(subTabObj != null && subTabObj != undefined && subTabObj != "" && subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != "" && subTabObj.Org_Parent_Object_API_Name__c != "None" && subTabObj.Relationship__c != null && subTabObj.Relationship__c != undefined && subTabObj.Relationship__c != "" && subTabObj.Relationship__c != "None"){
            //Scenario when ParentObjectName exists
            
            //Added 28032018
            //Retrieve all child ObjectNames
            /*var selctedObjectValue = component.get("v.selctedObjectValue");
            var action = component.get("c.getsObjectRelatedChildObjects");
            action.setParams({
                selctedObjectValue:subTabObj["Org_Parent_Object_API_Name__c"]
            });*/
            var action;
            if(subTabObj.Relationship__c == "1:M")
                action = component.get("c.getsObjectRelatedChildObjects");
            else if(subTabObj.Relationship__c == "1:1")
                action = component.get("c.getSobjectRelatedParentLookUp");
            action.setParams({
                selctedObjectValue:subTabObj.Org_Parent_Object_API_Name__c
            });            
            action.setCallback(this, function(a) {
                var state = a.getState();
                var sfObjectsList = null;
                if(state == "SUCCESS"){
                    sfObjectsList = a.getReturnValue();
                    component.set("v.sfObjectsNameList",sfObjectsList);                
                }else{
                    component.set("v.sfObjectsNameList",[]);               
                }
                
                if(sfObjectsList != null && sfObjectsList != undefined && sfObjectsList != ""){
                    var objData = [];
                    var label,name,selctd;
                    if(subTabObj != "" && subTabObj != undefined && subTabObj.Object_API_Name__c != "" && subTabObj.Object_API_Name__c != undefined){
                        Object.keys(sfObjectsList).forEach(function(index){
                            name = sfObjectsList[index].Name;
                            label = sfObjectsList[index].Label;
                            if(name == subTabObj.Object_API_Name__c)
                                selctd = true;
                            else
                                selctd = false;
                            objData.push({Label: label, Name: name, Selected: selctd});			
                        });
                        if(subTabObj.Object_API_Name__c != "None" && subTabObj.Object_API_Name__c != "--None--"){
                            component.set("v.selctedObjectValue",subTabObj.Object_API_Name__c);
                            this.getSobjeFields(component, event, subTabObj.Object_API_Name__c);
                        }   
                    }
                    else{
                        Object.keys(sfObjectsList).forEach(function(index){
                            name = sfObjectsList[index].Name;
                            label = sfObjectsList[index].Label;
                            selctd = false;                        
                            objData.push({Label: label, Name: name, Selected: selctd});			
                        });
                        //component.set("v.subTabObj",subTabObj);                        
                    }                    
                    component.set("v.sfObjectsNameList",objData);                
                }else{
                    if(subTabObj != "" && subTabObj != undefined){
                        if(subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != "" && subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != "None")
                            component.set("v.sfObjectsNameList",[{Label: subTabObj["Parent_Object_Name__c"], Name: subTabObj["Org_Parent_Object_API_Name__c"], Selected : false}]);
                        else
                            component.set("v.sfObjectsNameList",[]);                        
                    }                    
                    else
                        component.set("v.sfObjectsNameList",[]);
                }
                
            });
            $A.enqueueAction(action);            
            
        }else{
            //Scenario when ParentObjectName does not exist
            var sfObjectsList = component.get("v.sfObjectsList");
            
            var objData = [];
            var label,name,selctd;
            if(sfObjectsList != null && sfObjectsList != undefined && sfObjectsList != ""){
                var objData = [];
                var label,name,selctd;
                if(subTabObj != "" && subTabObj != undefined && subTabObj.Object_API_Name__c != "" && subTabObj.Object_API_Name__c != undefined){
                    Object.keys(sfObjectsList).forEach(function(index){
                        name = sfObjectsList[index].Name;
                        label = sfObjectsList[index].Label;
                        if(name == subTabObj.Object_API_Name__c)
                            selctd = true;
                        else
                            selctd = false;
                        objData.push({Label: label, Name: name, Selected: selctd});			
                    });
                    if(subTabObj.Object_API_Name__c != "None" && subTabObj.Object_API_Name__c != "--None--"){
                        component.set("v.selctedObjectValue",subTabObj.Object_API_Name__c);
                        this.getSobjeFields(component, event, subTabObj.Object_API_Name__c);
                    }   
                }
                else{
                    Object.keys(sfObjectsList).forEach(function(index){
                        name = sfObjectsList[index].Name;
                        label = sfObjectsList[index].Label;
                        selctd = false;                        
                        objData.push({Label: label, Name: name, Selected: selctd});			
                    });
                    //component.set("v.subTabObj",subTabObj);                        
                }                    
                component.set("v.sfObjectsNameList",objData);                
            }else{
                if(subTabObj != "" && subTabObj != null && subTabObj != undefined){
                    if(subTabObj.Org_Parent_Object_API_Name__c != null && subTabObj.Org_Parent_Object_API_Name__c != "" && subTabObj.Org_Parent_Object_API_Name__c != undefined && subTabObj.Org_Parent_Object_API_Name__c != "None")
                        component.set("v.sfObjectsNameList",[{Label: subTabObj["Parent_Object_Name__c"], Name: subTabObj["Org_Parent_Object_API_Name__c"], Selected : false}]);
                    else
                        component.set("v.sfObjectsNameList",[]);                        
                }                    
                else
                    component.set("v.sfObjectsNameList",[]);
            }
                        
        }        
        
    },
    /* Method Name:getSobjeFields 
     * Comments : This method used for getting all field values. 
     */ 
    getSobjeFields : function(component,event,helper) {
        console.log('getSobjeFields');
        //debugger;        
        var selctedObjectValue = component.get("v.selctedObjectValue");
        console.log('selctedObjectValue'+selctedObjectValue);
        var action = component.get("c.getsObjectRelatedFields");
        action.setParams({
            selctedObjectValue:selctedObjectValue
        });
        action.setCallback(this, function(a){
            var state = a.getState();
            console.log('state'+state);
            if(state == "SUCCESS"){  
                var subTabObj = component.get("v.subTabObj");                
                var sfFieldsList = a.getReturnValue();
                console.log('sfFieldsList'+sfFieldsList);
                var objData = [];
                var label,name,selctd;
                if(subTabObj != "" && subTabObj != undefined){
                    if(subTabObj.Field_API_Name__c != "" && subTabObj.Field_API_Name__c != undefined){
                        Object.keys(sfFieldsList).forEach(function(index){
                            name = sfFieldsList[index].Name;
                            label = sfFieldsList[index].Label;
                            if(name == subTabObj.Field_API_Name__c)
                                selctd = true;
                            else
                                selctd = false;
                            objData.push({Label: label, Name: name, Selected: selctd});			
                        });
                    }
                    else{
                        Object.keys(sfFieldsList).forEach(function(index){
                            name = sfFieldsList[index].Name;
                            label = sfFieldsList[index].Label;
                            selctd = false;                        
                            objData.push({Label: label, Name: name, Selected: selctd});			
                        });
                        component.set("v.subTabObj",subTabObj);                        
                    }                    
                }
                else{
                    Object.keys(sfFieldsList).forEach(function(index){
                        name = sfFieldsList[index].Name;
                        label = sfFieldsList[index].Label;
                        selctd = false;                        
                        objData.push({Label: label, Name: name, Selected: selctd});			
                    });
                    objData[0].Selected = true;
                    subTabObj.Field_API_Name__c = objData[0].Name;
                    subTabObj.Field_Name__c = objData[0].Label;
                    component.set("v.subTabObj",subTabObj); 
                }
                component.set("v.sfFieldsList",objData);                
            }
        });
        $A.enqueueAction(action);  
    },
    
    /* Method Name: navigateToCmp
     * Comments : This method used for navigating to adminSubTabHomePageCmp. 
     */
    navigateToCmp: function(component,event,helper){
        console.log('navigateToCmp');        
        //Check for navigation through Home
        if(component.get("v.userChoice") == "NewSubTab"){
            var evt=$A.get("e.force:navigateToComponent");
            evt.setParams({
                componentDef:"c:adminHomePageCmp",
                componentAttributes: {
                    sfObjectsList:component.get("v.sfObjectsList")
                }                
            });
            evt.fire();            
        }
        else{
            //Set cmp and cmpParams
            var cmpBack;
            var cmpParams = {};
            cmpParams["templateId"] = component.get("v.templateId");
            var cmpNavigationList = component.get("v.cmpNavigationList");
            cmpNavigationList.shift();
            cmpBack = cmpNavigationList[0];        
            component.set("v.cmpNavigationList",cmpNavigationList);        
            cmpParams["cmpNavigationList"] = cmpNavigationList;
            cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
            cmpParams["userChoice"] = component.get("v.userChoice");
            cmpParams["tabName"] = component.get("v.tabName");
            switch(cmpBack){
                case "c:adminTabDetailsPageCmp":
                    var tabId = component.get("v.tabId");
                    var subTabList = component.get("v.subTabList");                
                    cmpParams["tabId"] = tabId;
                    cmpParams["subTabList"] = subTabList;                
                    break;
                case "c:adminSubTabHomePageCmp":
                    var tabList = component.get("v.tabList");
                    cmpParams["tabList"] = tabList;
                    break;                
            }
            helper.createComponent(component,event,helper,cmpBack,cmpParams);            
        }              
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
     * Comments : Unique method used for dispalying errormessages. 
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