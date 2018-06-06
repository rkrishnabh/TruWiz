({
    loadSubTabs : function(component, event, helper, reload){
        console.log('Inside loadSubTabs');
        var tabName = component.get("v.tabName");
        
        var dependentSubtabsConditionsMap = component.get("v.dependentSubtabsConditionsMap");
        if(!reload)
            this.showOrHideDependentSubtabs(component, event, dependentSubtabsConditionsMap);
        
        this.setCurrentSubTab(component,event,helper);        
    },    
    setCurrentSubTab : function(component,event,helper) {
        console.log('setCurrentSubTab');
        var tabName = component.get("v.tabName");
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        
        //Check whether SubTabs exist for the Tab
        var subTabsLst;
        var firstSubTabId,firstSubTabName;
        if(tabsSubTabsMap != undefined && tabsSubTabsMap != null){
            subTabsLst = tabsSubTabsMap[tabName];
            if(subTabsLst == undefined){
                subTabsLst = [];
            }			
        }	
        
        //Set profile for SubTab	
        if(subTabsLst != undefined && subTabsLst.length > 0){
            //Set profiles for SubTabs		
            for(var i=0;i<subTabsLst.length;i++){
                subTabsLst[i].NewId = subTabsLst[i].Id + "#" + subTabsLst[i].SubTab__c;	
                this.matchProfile(component,subTabsLst[i]);			
            }
            component.set("v.subTabList",subTabsLst);     	
            
            //Check whether it is onLoad
            var onLoad = component.get("v.onLoad");
            var setFirstSubTab = false;
            if(onLoad){
                //Check for Draft
                var saveAsDraftMap = component.get("v.saveAsDraftMap");	
                var subTabIdName = saveAsDraftMap['subTab'];
                var subTabNme = subTabIdName;
                if(subTabIdName != null && subTabIdName != undefined){
                    if(subTabIdName.indexOf(":") != -1){
                        subTabNme = subTabIdName.split(":")[1];
                    }                    
                    //Check whether the draft SubTab's profileMatch is true
                    var draftSubTabProfileMatch = false;
                    for(var i=0;i<subTabsLst.length;i++){
                        if(subTabsLst[i].SubTab__c == subTabNme){
                            if(subTabsLst[i].profileMatch){
                                draftSubTabProfileMatch = true;
                                break;							
                            }
                        } 
                    }				
                    
                    if(draftSubTabProfileMatch){
                        /*component.set("v.subTabId",subTabIdNameArray[0]);
                        component.set("v.subTabName",subTabIdNameArray[1]);*/
                    	component.set("v.subTabId",subTabsLst[i].Id);
						component.set("v.subTabName",subTabsLst[i].SubTab__c);                        
                    }else{
                        //If DraftSubTab profile doesnt match to the logged user, show the very next SubTab which has HasCondition false and profileMatch true                        
                        setFirstSubTab = true;					
                    }
                }
                else{
                    //Check for first time Load	                    
                    setFirstSubTab = true;                    
                }		
            }else{
                //Tab Selection
                setFirstSubTab = true;
            }
            
            if(setFirstSubTab){
                for(var i=0;i<subTabsLst.length;i++){
                    if(subTabsLst[i].Has_Condition__c == false && subTabsLst[i].profileMatch == true){
                        firstSubTabId = subTabsLst[i].Id;
                        firstSubTabName = subTabsLst[i].SubTab__c;
                        break;
                    } 
                }
                component.set("v.subTabId",firstSubTabId);
                component.set("v.subTabName",firstSubTabName);                 
            }/*else{
                component.set("v.subTabId",undefined);
                component.set("v.subTabName",undefined);                
            }*/
            
        }else{
            component.set("v.subTabId",undefined);
            component.set("v.subTabName",undefined);
        }
        var draftSubTabIdName = component.get("v.subTabId") + "#" + component.get("v.subTabName");       
        component.set("v.draftSubTabIdName",draftSubTabIdName);        
    },
    
    showOrHideDependentSubtabs : function(component, event, depQuestionConditionMap){
        console.log('Inside showOrHideDependentSubtabs');
        var selectedQuestionId = '';
        var selectedAnswer = '';
        if(event.getParam("selectedQuestionId") != undefined){
            selectedQuestionId = event.getParam("selectedQuestionId"); 
            selectedAnswer = event.getParam("selectedAnswer");
        }
        var metaDataMap = component.get("v.metaDataMap");
        var conditionResultsSubTabsMap = {};
        var conditionalColumvalue;
        var conditionalCheckResp;
        var tabSubTabName;
        var subTabId;
        var tabName;
        var conditionalOperationsArray = component.get("v.conditionalOperationsArray");            
        
        if(conditionalOperationsArray == null || conditionalOperationsArray == undefined || conditionalOperationsArray == ''){
            //this.loadConditionalOperations(component);
            var comparatorCmp = component.find("comparatorCmp");
            comparatorCmp.loadConditionalOperations(function(conditionalOperations) {
                component.set("v.conditionalOperationsArray",conditionalOperations);
            });            
        }
        conditionalOperationsArray =  component.get("v.conditionalOperationsArray");
        
        for(var depQuestionConditionMapkey in depQuestionConditionMap){
            var depQuestionConditionList = depQuestionConditionMap[depQuestionConditionMapkey];
            if(depQuestionConditionList != null && depQuestionConditionList.length > 0){                
                for(var i = 0; i < depQuestionConditionList.length; i++){ 
                    var dependentQuesId = depQuestionConditionList[i].Dependent_Question__c;
                    var conditionOperator = depQuestionConditionList[i].Conditional_Operaor__c;
                    var sequence = depQuestionConditionList[i].Sequence__c;
                    var conditionVal = depQuestionConditionList[i].Condition_Value__c;
                    tabName = depQuestionConditionList[i].Dependent_Tabs__r.Tab_Name__c;
                    tabSubTabName = depQuestionConditionList[i].Dependent_Tabs__r.Tab_Name__c + ':' + depQuestionConditionList[i].Dependent_SubTab__r.SubTab__c;
                    subTabId = depQuestionConditionList[i].SubTab__c;
                    if(i == 0){
                        conditionalColumvalue = depQuestionConditionList[i].SubTab__r.Conditional_Logic__c;    
                    } 
                    console.log('tabName..'+tabName+'tabSubTabName..'+tabSubTabName+'subTabId..'+subTabId+'dependentQuesId..'+dependentQuesId+'conditionOperator..'+conditionOperator+'sequence..'+sequence+'conditionVal..'+conditionVal);
                    
                    var questionsAnsList = metaDataMap[tabSubTabName];
                    for(var j = 0; j < questionsAnsList.length; j++){
                        var questionsMap = questionsAnsList[j];
                        for (var questionsMapKey in questionsMap){
                            var questionObj = questionsMap[questionsMapKey];
                            var quesId = questionObj.Id;
                            var answer = questionObj.Answer__c;
                            if(quesId == selectedQuestionId){
                                answer = selectedAnswer;
                                questionObj.Answer__c = answer;      
                            }  
                            if(quesId == dependentQuesId){
                                answer = questionObj.Answer__c;
                                conditionalCheckResp = conditionalOperationsArray[0][conditionOperator](answer,conditionVal);   
                                break;
                            }  
                        }
                    }
                    
                    if(conditionalCheckResp == true){
                        conditionalColumvalue = conditionalColumvalue.replace(depQuestionConditionList[i].Sequence__c,'true');    
                    }else{
                        conditionalColumvalue = conditionalColumvalue.replace(depQuestionConditionList[i].Sequence__c,'false'); 
                    }                         
                    console.log('conditionalColumvalue..'+conditionalColumvalue);                  
                }
                
                //Calling helper method for condition evaluation which returns boolean based on the conditionalColumvalue
                //var conditionResult = this.evaluateFinalCondition(component, event, conditionalColumvalue); 
                var conditionResult = "";
                var evaluateFinalConditionCmp = component.find("evaluateFinalConditionCmp");
                evaluateFinalConditionCmp.evaluateFinalCondition(conditionalColumvalue, function(reslt) {
                    conditionResult = reslt;
                });                
                console.log('conditionResult..'+conditionResult);
                conditionResultsSubTabsMap[subTabId] = conditionResult;                
            }
        }
        console.log('conditionResultsSubTabsMap..'+JSON.stringify(conditionResultsSubTabsMap));
        
        var tabsSubTabsMap = component.get("v.tabsSubTabsMap");
        for(var tabsSubTabsMapKey in tabsSubTabsMap){
            var subTabList = tabsSubTabsMap[tabsSubTabsMapKey];
            for(var k = 0; k < subTabList.length; k++){
                var subTabObj = subTabList[k];
                var subTabId = subTabObj.Id
                if((conditionResultsSubTabsMap[subTabId] === 'true') || selectedAnswer === '--None--'){
                    subTabObj.Has_Condition__c = false;
                }else{
                    if(conditionResultsSubTabsMap[subTabId] != undefined){
                        subTabObj.Has_Condition__c = true;                
                    }
                }
            }  
            tabsSubTabsMap[tabsSubTabsMapKey] = subTabList;
        }                
        component.set("v.tabsSubTabsMap",tabsSubTabsMap);            
    },
    /*
     Method Name : matchProfile
     Comments    : This method is used to getting current users matched profiles.
    */     
    matchProfile : function(component, subTab) {
        var profileIds = subTab.ProfileId__c;
        var loggedInUserProfileId = component.get('v.userProfile');
        subTab.profileMatch = false;
        
        if(profileIds !== undefined){
            var profileIdsArray = profileIds.split(",");
            for(var i = 0; i< profileIdsArray.length; i++){
                var profileId = profileIdsArray[i]; 
                if(profileId === loggedInUserProfileId){
                    subTab.profileMatch = true;
                    break;
                }
            }
        }
    }    
})