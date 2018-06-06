({
    /* Method Name: editTemplateData
     * Comments : This method fetch template details based on Id, while page loading. 
     */  
    editTemplateData : function(component, event, helper) {
        debugger;
        var sfObjectsList = component.get("v.sfObjectsList");        
        console.log('editTemplateData');
        var templateId = component.get("v.templateId");
        console.log('templateId'+templateId);
        var userChoice = component.get("v.userChoice");
        console.log('userChoice'+userChoice);
        var action = component.get('c.getTempleteDetails');
        action.setParams({
            templateId:templateId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if(state == "SUCCESS"){
                var templateObj = response.getReturnValue();
                console.log('templateObj'+templateObj);
                console.log('templateObj'+JSON.stringify(templateObj));
                
                if(userChoice == "EditTemplate" || userChoice == "NewTemplate")
                    component.set('v.templateObj',templateObj);
                else if(userChoice == "CopyTemplate"){
                    templateObj.Template_Name__c = templateObj.Template_Name__c + '-Copy';
                    component.set('v.templateObj',templateObj);
                }

                //Object picklist
                if(userChoice != "NewTemplate"){
                    var templateObjectName = templateObj.Object_Name__c;
                    var templateObjectAPIName = templateObj.Object_API_Name__c;
                    var sfObjectsList = [{Label : templateObjectName, Name : templateObjectAPIName, Selected : true}];
                    component.set("v.sfObjectsList",sfObjectsList);
                }
                
                this.setTabProperties(component,event,templateObj);                
            }
            
            //For default Tab orientation
            var templateObj = component.get("v.templateObj");
            if(templateObj != undefined && templateObj.tabOrientation__c == undefined || templateObj.tabOrientation__c == "" || templateObj.tabOrientation__c == null){
                templateObj.tabOrientation__c = 'Top';
                component.set("v.templateObj",templateObj);
            }            
            
            if(userChoice == "NewTemplate")
                this.getAllSfObjects(component, event, helper);
            else{
                component.find("dynamicObjectName").set("v.disabled",true);
                $A.util.addClass(component.find("spinner"), "slds-hide");
            }
                
            //Commented 29032018            
            //this.preselectTheSFObject(component,event);            
        });
        $A.enqueueAction(action);
    },
    
    /* Method Name: validations
     * Comments : This method is used for client side validation.
     * Validations : Mandatory Fields and Future Date
     */
    validations : function(component,event,helper){
        console.log('validations');
        var templateObj = component.get("v.templateObj");
        var errMsg = "";
        if(templateObj.Template_Name__c == "" || templateObj.Template_Name__c == undefined){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");
            errMsg += "Please enter Template name";
        }
        if(templateObj.Object_API_Name__c == "" || templateObj.Object_API_Name__c == "None" || templateObj.Object_API_Name__c == "--None--" || templateObj.Object_API_Name__c == undefined){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");            
			errMsg += "Please select Object name";
        }
        if(templateObj.Expiry_Date__c == "" || templateObj.Expiry_Date__c == undefined){
            errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                      
            errMsg += "Please select Expiry Date";
        }
        if(templateObj.Expiry_Date__c != "" && templateObj.Expiry_Date__c != undefined){
            var today = new Date();
            var selectdDate = new Date(templateObj.Expiry_Date__c);
            today.setHours(0,0,0,0);
            selectdDate.setHours(0,0,0,0);
            if(selectdDate.getTime() <= today.getTime()){
                errMsg = (errMsg == "" ? errMsg : errMsg + ", ");                      
                errMsg += "Please select future Date";                
            }            
        }        
        component.set("v.errorMessage",errMsg);
    },    
    /* Method Name: save
     * Comments : This method is used for saving and updating template. 
     */
    save : function(component,event,helper){
        console.log('save');
        $A.util.removeClass(component.find("spinner"), "slds-hide");
        
        var templateObj = component.get("v.templateObj");
        var userChoice = component.get("v.userChoice");
        console.log('userChoice'+userChoice); 

        this.validations(component,event,helper);        
        var errorMessage = component.get("v.errorMessage");
        
        if(errorMessage != "" && errorMessage != null && errorMessage != undefined){
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            this.showToastMsg(component,event,helper,"Error",errorMessage);                                    
        }else{
            //Calling the Apex Function for Template Name Validation
            var action = component.get('c.templateExist');
            action.setParams({
                templateObj : templateObj
            });
            action.setCallback(this,function(response){
                var state = response.getState();
                if(state == "SUCCESS"){
                    var templateExists = response.getReturnValue();                  
                    if(templateExists){
                        $A.util.addClass(component.find("spinner"), "slds-hide");                        
                        this.showToastMsg(component,event,helper,"Error","Please enter a different name. Template with same name already exists");
                    }else{                        
                        //Since validations passed insert/update record here
                        var actionInsertUpdate = component.get("c.insertUpdateTemplate");
                        actionInsertUpdate.setParams({
                            templateObj : templateObj,
                            userChoice:userChoice
                        });
                        
                        actionInsertUpdate.setCallback(this,function(response){
                            debugger;
                            var state = response.getState();
                            if(state == "SUCCESS"){
                                var result = response.getReturnValue();
                                var templateId = component.get("v.templateId");
                                if(templateId != "" && templateId != undefined){
                                    if(userChoice = 'CopyTemplate')
                                        component.set("v.templateId",result); 
                                    //No update message to be shown for Edit scenario
                                }else{
                                    $A.util.addClass(component.find("spinner"), "slds-hide");                                    
                                    this.showToastMsg(component,event,helper,"Success","Template has been created successfully");
                                    component.set("v.templateId",result); 
                                }                            
                                
                                //Refresh check and navigation
                                var btn = component.get("v.btnSaveOrNext");
                                switch(btn){
                                    case "SaveNext":
                                        $A.util.addClass(component.find("template"), "hideElement");
                                        this.navigateToCmp(component,event,helper);
                                        this.triggerPathEvent(component, event);
                                        break;
                                    case "Save":
                                        this.refreshAfterSave(component,event,helper);
                                        break;                        
                                }                            
                            }else if(state == "ERROR"){
                                $A.util.addClass(component.find("spinner"), "slds-hide");
                                this.showToastMsg(component,event,helper,"Error","Error while creating Template. Please try again.");
                            }                        
                        });
                        $A.enqueueAction(actionInsertUpdate);//insertUpdateTemplate Action invocation
                    }
                }
            });
            $A.enqueueAction(action);//templateExist Action invocation          
        }
    },
    /* Method Name: getAllSfObjects
     * Comments : This method is used for fetch all sobjects in the org. 
     */   
    getAllSfObjects : function(component,event,helper) {        
        console.log('getAllSfObjects');      
        var action = component.get("c.getAllSfObjectNames");//get data from controller
        action.setCallback(this, function(a) {
            $A.util.addClass(component.find("spinner"), "slds-hide");            
            var state = a.getState(); 
            if(state == "SUCCESS"){
                console.log('Value'+JSON.stringify(a.getReturnValue()));
                var sfObjectsList = a.getReturnValue();
                console.log('Value'+JSON.stringify(sfObjectsList)); 
                component.set("v.sfObjectsList",sfObjectsList);
                this.preselectTheSFObject(component,event,helper);                
            }else
                this.showToastMsg(component,event,helper,"Error","Error in loading all Salesforce Objects");
        });
        $A.enqueueAction(action);           
    },    
    /* Method Name: preselectTheSFObject
     * Comments : This method is used for prepopulating ParentObjectName PicklistValue. 
     */
    preselectTheSFObject : function(component,event,helper) {
        console.log('preselectTheSFObject');
        var templateObj = component.get("v.templateObj");                
        var sfObjectsList = component.get("v.sfObjectsList");
        var objData = [];
        var label,name,selctd;
        if(templateObj != "" && templateObj != undefined){
            if(templateObj.Object_API_Name__c != "" && templateObj.Object_API_Name__c != undefined){
                Object.keys(sfObjectsList).forEach(function(index){
                    name = sfObjectsList[index].Name;
                    label = sfObjectsList[index].Label;
                    if(name == templateObj.Object_API_Name__c)
                        selctd = true;
                    else
                        selctd = false;
                    objData.push({Label: label, Name: name, Selected: selctd});			
                });
            }
            else{
                Object.keys(sfObjectsList).forEach(function(index){
                    name = sfObjectsList[index].Name;
                    label = sfObjectsList[index].Label;
                    selctd = false;                        
                    objData.push({Label: label, Name: name, Selected: selctd});			
                });
                component.set("v.templateObj",templateObj);                        
            }                    
        }
        else{
            Object.keys(sfObjectsList).forEach(function(index){
                name = sfObjectsList[index].Name;
                label = sfObjectsList[index].Label;
                selctd = false;                        
                objData.push({Label: label, Name: name, Selected: selctd});			
            });
            objData[0].Selected = true;
            templateObj.Object_API_Name__c = objData[0].Name;
            templateObj.ObjectName__c = objData[0].Label;
            component.set("v.templateObj",templateObj); 
        }
        component.set("v.sfObjectsList",objData);                
        
    },
    /* Method Name: navigateToCmp
     * Comments : This method is used for navigating to tabDetailsPage. 
     */
    navigateToCmp : function(component,event,helper){
        console.log('navigateToCmp');
        var templateId = component.get("v.templateId");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        cmpNavigationList.unshift('c:adminTabHomePageCmp');
        component.set("v.cmpNavigationList",cmpNavigationList);
        var sfObjectsList = component.get("v.sfObjectsList");
        //Added 28032018
        var templateObj = component.get("v.templateObj"); 
        var templateObjectName = templateObj.Object_Name__c;
        var templateObjectAPIName = templateObj.Object_API_Name__c;
        sfObjectsList = [{Label : templateObjectName, Name : templateObjectAPIName}];
        component.set("v.sfObjectsList",sfObjectsList);
        
        var userChoice = component.get("v.userChoice");
        $A.createComponents([["c:adminTabHomePageCmp",{templateId:templateId,cmpNavigationList:cmpNavigationList,sfObjectsList:sfObjectsList,userChoice:userChoice}]],
                            function(adminTabHomePageCmp, status)
                            {
                                $A.util.addClass(component.find("spinner"), "slds-hide");                                
                                if (component.isValid() && status === 'SUCCESS')
                                    component.set("v.body",adminTabHomePageCmp);
                                else
                                    this.showToastMsg(component,event,helper,"Error","Error while calling admin_globalTabsCmp. Please try again.");
                            });       
        
    },
    /* Method Name: triggerPathEvent
     * Comments : This method is used for higlighting lightning Path during navigation
     */     
    triggerPathEvent : function(component,event,helper){
        console.log('triggerPathEvent');
        var pathDataEvnt = component.getEvent("pathDataEvnt");        
        pathDataEvnt.setParams({"Name":component.get("v.pathToSet")});
        pathDataEvnt.fire();        
    },
    /* Method Name: refreshAfterSave
     * Comments : This method is used for refreshing View only when Save button is NOT
     *  			clicked through Modify an Existing Template flow
     */    
    refreshAfterSave : function(component,event,helper){
        console.log('refreshAfterSave');
        $A.util.addClass(component.find("spinner"), "slds-hide");
        var cmpNavigationList = component.get("v.cmpNavigationList");
        var cmpBack = cmpNavigationList[1];       
        if(cmpBack != "c:adminTemplateHomePage")
            $A.get('e.force:refreshView').fire();        
    },
    /* Method Name: setTabProperties
     * Comments : This method is used for setting Tab properties for the Template-Currently static
     */      
    setTabProperties : function(component,event,templateObj){
        console.log('setTabProperties');
        
        /*var templateObj = component.get("v.templateObj");
        templateObj.tabOrientation__c = 'Top';
        component.set("v.templateObj",templateObj);*/
        
        component.set("v.TabColor","rgb(236, 235, 234)");
        component.set("v.SubTabColor","rgb(236, 235, 234)");
        component.set("v.QuestionColor","rgb(236, 235, 234)");        
    },    
    /* Method Name: showToastMsg
     * Comments : This method is used show Toast Message.
     * Parameters : title and msg 
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