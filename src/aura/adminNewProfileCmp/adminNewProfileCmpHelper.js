({
    /*
Method Name : loadProfiles
Usage       : This method is used for loading profiles
*/   
    loadProfiles : function(component, event, helper) {
         console.log('loadProfiles');
        var action = component.get("c.getAllProfileValues");
        action.setParams({
        });
        action.setCallback(this, function(result){
            var state = result.getState();
            if (component.isValid() && state === "SUCCESS"){
                var selectedProfileMap = {};
                var questionProfilesList = component.get("v.questionProfilesList");
                console.log('questionProfilesList'+JSON.stringify(questionProfilesList));
                if(questionProfilesList != undefined){
                    for(var i=0 ; i < questionProfilesList.length;i++){
                        selectedProfileMap[questionProfilesList[i].Profile_ID__c] = questionProfilesList[i].Profile_ID__c;
                    }  
                }
                var profilesList = result.getReturnValue();
                if(profilesList != undefined){
                    for(var i=0 ; i < profilesList.length;i++){
                        var profileId = profilesList[i].Id;
                        if(selectedProfileMap[profileId]){
                            profilesList.splice(i, 1);
                        }
                    }  
                }
                component.set("v.profilesList",profilesList);   
            }
        });
        $A.enqueueAction(action);
    },
    /*
Method Name : save
Usage       : This method is used for save profiles
*/   
    save: function(component, event, helper) {
        console.log('save');
         var questionId = component.get("v.questionId");
        console.log('questionId'+questionId);
        
        var questionsList = [];        
        var selectedProfiles = [], profileIdName;
        
        var checkvalue = component.find("checkProfile");
        var readonly = component.find("readonly");

        if(Array.isArray(checkvalue)){
            for (var i = 0; i < checkvalue.length; i++) {
                if (checkvalue[i].get("v.value") == true) {
                    profileIdName = checkvalue[i].get("v.text").split(":");
                  selectedProfiles.push({Id:profileIdName[0],Name:profileIdName[1],readOnly:readonly[i].get("v.value")});
                }
            }
        }
        console.log('selectedProfiles-' + selectedProfiles);
        for(var i=0;i<selectedProfiles.length;i++){
            var questionObj = {};
            questionObj.sobjectType = 'Question__c';
            questionObj.Profile_ID__c= selectedProfiles[i].Id;
            questionObj.Profile_Name__c = selectedProfiles[i].Name;
            questionObj.Read_Only__c = selectedProfiles[i].readOnly;
            questionObj.Parent_Question_ID__c = questionId;
            questionsList.push(questionObj);
           
        }  
       var action = component.get("c.insertProfilesIntoQuestion");
            action.setParam("questionsList", questionsList);
            
            action.setCallback(this,function(a){
                var state = a.getState();
                console.log('state:',state);
                if (state == "SUCCESS") {
                    this.showToastMsg(component,event,helper,"Success","success","Profiles added successfully");
                }
                else if(state == "ERROR"){
               
                this.showToastMsg(component,event,helper,"Error","Error","Error in calling server side action");                
            }
            this.navigateToCmp(component, event, helper);     
            });
        $A.enqueueAction(action);         
    },
    /* Method Name: navigateToCmp
* Comments : This method used for navigating to adminTabHomePageCmp. 
*/
    navigateToCmp : function(component,event,helper){
        console.log('navigateToCmp');
        debugger;        
        //Set cmp and cmpParams
        var cmp;
        var cmpParams = {};    
        
        
        var cmpNavigationList = component.get("v.cmpNavigationList");
        cmpNavigationList.shift();
        cmp = cmpNavigationList[0];
        component.set("v.cmpNavigationList",cmpNavigationList);
        cmpParams["cmpNavigationList"] = cmpNavigationList;
        cmpParams["templateId"] = component.get("v.templateId");
        cmpParams["questionId"] = component.get("v.questionId");      
        cmpParams["tabId"] = component.get("v.tabId");
        cmpParams["tabList"] = component.get("v.tabList");
        cmpParams["subTabId"] = component.get("v.subTabId");
        cmpParams["subTabList"] = component.get("v.subTabList");   
        cmpParams["sfObjectsList"] = component.get("v.sfObjectsList"); 
        cmpParams["userChoice"] = component.get("v.userChoice");
        //Hide current component
        $A.util.removeClass(component.find("createProfile"), "unhideElement");
        $A.util.addClass(component.find("createProfile"), "hideElement");        
        this.createComponent(component,event,helper,cmp,cmpParams);
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
                                    this.showToastMsg(component,event,helper,"Error","Error","Error while calling component. Please try again.");
                            });        
    },
    /* Method Name: showToastMsg
* Comments : This is unique method for displaying errormessages
*/    
    showToastMsg : function(component,event,helper,title,type,msg) {
        debugger;
        console.log('showToastMsg');
        var showToast = $A.get('e.force:showToast');            
        showToast.setParams({
            'title': title,
            'type': type,
            'message': msg});
        showToast.fire();        
    }
    })