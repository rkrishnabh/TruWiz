({  
    loadCreateEditChildRecord : function(component, event, helper){        
        console.log('Inside loadCreateEditChildRecord helper');
        debugger;
        component.set("v.showPopUp",true);  
        var tabName=component.get("v.tabName");
        var subTabName=component.get("v.subTabName");
        var metaDataMap = component.get("v.metaDataMap");  
        var questionObjList = component.get("v.questionsList");
        var popUpMode = component.get("v.popUpMode");
        var selectedQuesSeq = component.get("v.selectedQuesSeq");
        var subTabFilteringValue = component.get("v.subTabFilteringValue");
        var subTabFieldApiName = component.get("v.subTabFieldApiName");
        
        //reset the data in cache
        questionObjList = {};
        questionObjList = new Array();                
        var tabSubTabName = tabName+':'+subTabName;        
        var quesAnsMapList = metaDataMap[tabSubTabName];
        var quesAnsMapListLength = quesAnsMapList.length;
        var dataExist = false;
         if(selectedQuesSeq == null || selectedQuesSeq == undefined)
            selectedQuesSeq = 0;
        
        console.log('selectedQuesSeq..'+selectedQuesSeq+'..popUpMode..'+popUpMode);
        
        for(var i = 0; i < quesAnsMapList.length; i++){
            var quesAnsMap;
            if(popUpMode == 'Edit')
                quesAnsMap = quesAnsMapList[selectedQuesSeq];	  
            else
                quesAnsMap = quesAnsMapList[i];
                
            for (var quesAnsMapKey in quesAnsMap){            
                var questionObj = quesAnsMap[quesAnsMapKey];
                var newQuestionObj = {};
                newQuestionObj.Id = questionObj.Id;
                console.log('newQuestionObj.Id...'+newQuestionObj.Id+'questionObj.Id..'+questionObj.Id);
                newQuestionObj.Field_API_Name__c = questionObj.Field_API_Name__c;
                newQuestionObj.Question_Label__c = questionObj.Question_Label__c;
                newQuestionObj.Object_API_Name__c = questionObj.Object_API_Name__c;
                newQuestionObj.Parent_Object_API_Name__c = questionObj.Parent_Object_API_Name__c;
                newQuestionObj.Object_API_Used_for_Lookup__c = questionObj.Object_API_Used_for_Lookup__c;
                console.log('newQuestionObj.Object_API_Used_for_Lookup__c..'+newQuestionObj.Object_API_Used_for_Lookup__c);
                newQuestionObj.SubTab1__c = questionObj.SubTab1__c;
                newQuestionObj.Sequence__c = questionObj.Sequence__c;
                newQuestionObj.Values__c = questionObj.Values__c;
                newQuestionObj.Size__c = questionObj.Size__c;
                newQuestionObj.Decimal__c = questionObj.Decimal__c;
                newQuestionObj.Read_Only__c = questionObj.Read_Only__c;
                newQuestionObj.Field_Type__c = questionObj.Field_Type__c;
                newQuestionObj.IsMandatory__c = questionObj.IsMandatory__c;
                newQuestionObj.Has_Condition__c = questionObj.Has_Condition__c;
                newQuestionObj.Dependent_Question__c = questionObj.Dependent_Question__c;
                newQuestionObj.Dependent_Tab__c = questionObj.Dependent_Tab__c;
                newQuestionObj.Dependent_Subtab__c = questionObj.Dependent_Subtab__c;
                newQuestionObj.Has_Dependency__c = questionObj.Has_Dependency__c;
                newQuestionObj.Lower_Value_Limit__c = questionObj.Lower_Value_Limit__c;
                newQuestionObj.Higher_Value_Limit__c = questionObj.Higher_Value_Limit__c;
                newQuestionObj.InPut_Pattern__c = questionObj.InPut_Pattern__c;
                newQuestionObj.Number_Data_Val__c = questionObj.Number_Data_Val__c; 
                newQuestionObj.Input_Placeholder__c = questionObj.Input_Placeholder__c;
                if(subTabFieldApiName != undefined && questionObj.Field_API_Name__c == subTabFieldApiName)
                    newQuestionObj.Answer__c = subTabFilteringValue;
                
                if(questionObj.Answer__c != undefined && questionObj.Answer__c != '' && questionObj.Answer__c != '--None--')
                    dataExist = true;
                
                if(popUpMode == 'Edit'){
                    newQuestionObj.Answer__c = questionObj.Answer__c;
                    newQuestionObj.LookUpName__c = questionObj.LookUpName__c;
                }
                questionObjList.push(newQuestionObj);            
            }    
            break;
        }        
        console.log('dataExist...'+dataExist);            
        component.set("v.dataExist",dataExist);        
        this.loadPickList(component,event,questionObjList);        
        component.set("v.questionsList", questionObjList);
    },
    
    loadPickList:function(component,event,questionObjList){
        debugger;
        console.log('Inside loadPickList..');

        var pickListDataList = [];
        for(var i=0;i< questionObjList.length;i++){ 
            var questionObject = questionObjList[i];     
            if(questionObject.Field_Type__c == "PICKLIST"){
                var pickListData = questionObject.Values__c ;
                var pickListValues = [];
                if(pickListData != null && pickListData != ''){
                    pickListValues.push(pickListData.split(","));
                    for(var j=0;j< pickListValues.length;j++){
                        pickListDataList.push({value:pickListValues[j], key:questionObject.Question_Label__c});
                    }
                }                
            }            
        }
        component.set("v.pickListDataList", pickListDataList);
    },
    
    createEditChildSave : function(component, event, helper){
        debugger;
        console.log('Inside createEditChildSave helper');
        //New attributes added for validations start
        var displayErrorMessage = '';
        var validationsCmp = component.find("validationsCmp"); 
        //New attributes added for validations End
        var formValArray = new Array();
        var tabName = component.get("v.tabName");
        var subTabName = component.get("v.subTabName");
        var metaDataMap = component.get("v.metaDataMap");        
        var questionsList = component.get("v.questionsList");
        var textboxValues = component.find('newAnswer');
        var popUpMode = component.get("v.popUpMode");
        var dataExist = component.get("v.dataExist");        
        var selectedQuesSeq = component.get("v.selectedQuesSeq");
        
        var tabSubTabName = tabName+':'+subTabName;

        if(textboxValues != undefined && textboxValues.length > 0){            
            for (var i = 0; i < textboxValues.length; i++) {
                formValArray.push(textboxValues[i].get("v.value"));
            }
        }else{
            formValArray.push(textboxValues.get("v.value")); 
            
        }
        
        for(var j = 0; j < questionsList.length; j++){
            var questionObj = questionsList[j];
            var dontShowOnScreen = questionObj.Has_Condition__c;
            if(dontShowOnScreen == true){
                formValArray.splice(j, 0,'hidden');                
            }
        }
        
        var errorMessage='';
        var quesAnsMap = {};
        for(var k = 0; k < questionsList.length; k++){
            var questionObj = questionsList[k];
            if(questionObj.Field_Type__c === 'BOOLEAN' && formValArray[k] != undefined && formValArray[k] != 'hidden'){
                questionObj.Answer__c = (formValArray[k])?"true":"false"; 
                // added this line for MULTIPICKLIST questionObj.Field_Type__c != 'MULTIPICKLIST' &&
            }else if(questionObj.Field_Type__c != 'MULTIPICKLIST' && questionObj.Field_Type__c != 'REFERENCE' && formValArray[k] != undefined && formValArray[k] != 'hidden' && formValArray[k] != '--None--')
                questionObj.Answer__c = formValArray[k];
        	            
            //helper.validations(component,event,questionObj);
             validationsCmp.validation('',questionObj, function(result){
                 var result = result;
                 displayErrorMessage += result;
                 component.set("v.errorMessage",displayErrorMessage);
        });
            quesAnsMap[questionObj.Field_API_Name__c] = questionObj;
        }
        
        var errorMessage = component.get("v.errorMessage");
        if(errorMessage != null && errorMessage != '' && errorMessage != undefined){
            var showToast = $A.get('e.force:showToast');
            showToast.setParams({
                'title': 'Validations are missing',
                'type': 'error',
                'message': errorMessage, });            
            showToast.fire();          
            component.set("v.errorMessage",'');
            return;
        }     
        
        var quesAnsMapList = metaDataMap[tabSubTabName];        

        if(popUpMode === 'Edit'){
            quesAnsMapList[selectedQuesSeq] = quesAnsMap;
        }else{
            if(dataExist == true){
                quesAnsMapList.push(quesAnsMap);        
            }else
                quesAnsMapList[0] = quesAnsMap;        
        }
        
        metaDataMap[tabSubTabName] = quesAnsMapList;
        
        component.set("v.metaDataMap", metaDataMap);
        
        var childPopUpEvent = component.getEvent("childPopUpEvent");        
        childPopUpEvent.setParams({            
            metaDataMap:metaDataMap                                            
        });        
        
        childPopUpEvent.fire();     
        component.set("v.showPopUp", false);
    },
    
    validations : function(component,event,questionObj) {
         var errorMessage = component.get("v.errorMessage");
        //debugger;
       //alert('validations..');
        if(questionObj.Field_Type__c == 'STRING'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }
            if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
                //questionObj.Answer__c  = '';    
                if((questionObj.Lower_Value_Limit__c != null) && (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (questionObj.Answer__c.length < questionObj.Lower_Value_Limit__c)) //check for Min Limit
                    errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
                else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > questionObj.Higher_Value_Limit__c)) //check for Max Limit
                    errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '/n';
                if((questionObj.Size__c != null) && (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c)) //check for Max Size
                    errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';
                if((questionObj.Read_Only__c != null) && (questionObj.Read_Only__c != '') && (questionObj.Read_Only__c != undefined) && (questionObj.Answer__c == 'True')) //check for Read Only
                    errorMessage += questionObj.Question_Label__c + 'is Read Only '  +'\n';				
            }
           

        }
		else if(questionObj.Field_Type__c == 'TEXTAREA' || questionObj.Field_Type__c ==  'Text Area'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }
            if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
                //questionObj.Answer__c  = ''; 				
                if((questionObj.Lower_Value_Limit__c != null) && (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (questionObj.Answer__c.length < questionObj.Lower_Value_Limit__c)) //check for Min Limit
                    errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
                else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > questionObj.Higher_Value_Limit__c)) //check for Max Limit
                    errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '/n';
                if((questionObj.Size__c != null) && (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c)) //check for Max Size
                    errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';
        	}
           
        }
		else if(questionObj.Field_Type__c == 'PHONE'){
            //debugger;
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined))
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, ' +'\n';
            }				
			//alert('Phone else'+questionObj.Input_Placeholder__c);
            if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
				//questionObj.Answer__c  = '';
                if((questionObj.InPut_Pattern__c != null) && (questionObj.InPut_Pattern__c != '') && (questionObj.InPut_Pattern__c != undefined) && ((questionObj.Answer__c.match(questionObj.InPut_Pattern__c)) == null)) //check for Pattern
                    errorMessage +=  questionObj.Question_Label__c + 'Phone must be ' + questionObj.Input_Placeholder__c + ' following pattern' +'\n';
                if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > questionObj.Higher_Value_Limit__c)) //check for Max Limit
                    errorMessage +=  questionObj.Question_Label__c + 'Phone must be ' + questionObj.Higher_Value_Limit__c + '\n';
                if((questionObj.Size__c != null) && (questionObj.Size__c != '')&& (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c)) //check for Max Size
                    errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c  +'\n';
            }
        }
		else if(questionObj.Field_Type__c == 'EMAIL'){
            //alert('Email..');
            var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
                    //alert('Email..if..');
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, ' +'\n';
			}
            if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
				//questionObj.Answer__c  = '';            
                if((questionObj.Answer__c.match(regExpEmailformat)) == null)
                    errorMessage += questionObj.Question_Label__c + ':'+'Please Enter valid email address , ' +'\n';
        	}
        }else if(questionObj.Field_Type__c == 'BOOLEAN'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }
        }else if(questionObj.Field_Type__c == 'PICKLIST'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == '--None--')) //check for required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }
        }else if(questionObj.Field_Type__c == 'MULTIPICKLIST'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == '--None--')) //check for required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }            
        }else if(questionObj.Field_Type__c == 'DATE'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }           
        }else if(questionObj.Field_Type__c == 'DATETIME'){
            if(questionObj.IsMandatory__c){
                if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
                    errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
            }           
        }else if(questionObj.Field_Type__c == 'DOUBLE' || questionObj.Field_Type__c == 'CURRENCY' || questionObj.Field_Type__c == 'PERCENT'){
            //debugger;
			if(questionObj.IsMandatory__c){				
				if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
					errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
			}
            if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
				//questionObj.Answer__c  = '';
                if((questionObj.Input_Pattern__c != null) && (questionObj.Input_Pattern__c != '') && (questionObj.Input_Pattern__c != undefined) && (!(questionObj.Answer__c.match(questionObj.Input_Pattern__c)))) //check for Pattern
                    errorMessage +=  questionObj.Question_Label__c + 'Number must be ' + questionObj.Input_Pattern__c + '\n';
                else{				
                    if((questionObj.Lower_Value_Limit__c != null) &&  (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (questionObj.Answer__c.length < questionObj.Lower_Value_Limit__c)) //check for Min Limit
                        errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
                    else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > questionObj.Higher_Value_Limit__c)) //check for Max Limit
                        errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '\n';
                    if((questionObj.Size__c != null) &&  (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c))  //check for Max Size
                        errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';
                    
                    if((questionObj.Decimal__c != null) && (questionObj.Decimal__c != '') && (questionObj.Decimal__c != undefined) && (questionObj.Answer__c != ''))//decimal places
                        questionObj.Answer__c  =  parseFloat(questionObj.Answer__c).toFixed(questionObj.Decimal__c);
                    if((questionObj.Number_Data_Val__c != null) && (questionObj.Number_Data_Val__c != '') && (questionObj.Number_Data_Val__c != undefined)){ //decimal places
                        //alert('Positive..');
                        if(questionObj.Number_Data_Val__c == "Positive"){
                            //alert('Positive');
                            if(!isNaN(parseFloat(questionObj.Answer__c))){
                                if(parseFloat(questionObj.Answer__c) < 0)
                                    errorMessage +=  questionObj.Question_Label__c + 'Number must be positive \n';
                            }                        
                        }
                        else if(questionObj.Number_Data_Val__c == "Negative"){
                            if(!isNaN(parseFloat(questionObj.Answer__c))){                    
                                if(parseFloat(questionObj.Answer__c) > 0)
                                    errorMessage +=  questionObj.Question_Label__c + 'Number must be negative \n';								
                            }
                        }
                    }				
                }
            }
		}     
        component.set("v.errorMessage",errorMessage);        
	}
})