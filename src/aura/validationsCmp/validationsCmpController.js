({
    /*
Method Name : validations
Parameter   : questionObject
Comments    : This method is used to evaluate the field validations,and returns error message 
 */   
    validations : function(component, event, helper) {
        console.log('Inside Validations')
        var params = event.getParam('arguments');
        if (params) {
            var questionObj = params.questionObject;
            var errorMessage = params.errorMessage;
            if(questionObj.Field_Type__c == 'STRING'){
                if(questionObj.IsMandatory__c){
                    if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
                        errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
                }
                if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
                    
                    if((questionObj.Lower_Value_Limit__c != null) && (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (questionObj.Answer__c.length < parseInt(questionObj.Lower_Value_Limit__c))) //check for Min Limit
                        errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
                    else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > parseInt(questionObj.Higher_Value_Limit__c))) //check for Max Limit
                        errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '/n';
                    if((questionObj.Size__c != null) && (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > parseInt(questionObj.Size__c))) //check for Max Size
                        errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';
                    /*if((questionObj.Read_Only__c != null) && (questionObj.Read_Only__c != '') && (questionObj.Read_Only__c != undefined) && (questionObj.Answer__c == 'True')) //check for Read Only
                        errorMessage += questionObj.Question_Label__c + 'is Read Only '  +'\n';*/				
                }                
            }
            else if(questionObj.Field_Type__c == 'TEXTAREA' || questionObj.Field_Type__c ==  'Text Area'){
                if(questionObj.IsMandatory__c){
                    if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
                        errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
                }
                if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
                    
                    if((questionObj.Lower_Value_Limit__c != null) && (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (questionObj.Answer__c.length < parseInt(questionObj.Lower_Value_Limit__c))) //check for Min Limit
                        errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
                    else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > parseInt(questionObj.Higher_Value_Limit__c))) //check for Max Limit
                        errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '/n';
                    /*if((questionObj.Size__c != null) && (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c)) //check for Max Size
                        errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';*/
                }
                
            }
			else if(questionObj.Field_Type__c == 'PHONE'){
				
				if(questionObj.IsMandatory__c){
					if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined))
						errorMessage += questionObj.Question_Label__c + ':'+'Required, ' +'\n';
				}				
				
				if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
					
					if((questionObj.InPut_Pattern__c != null) && (questionObj.InPut_Pattern__c != '') && (questionObj.InPut_Pattern__c != undefined) && ((questionObj.Answer__c.match(questionObj.InPut_Pattern__c)) == null)) //check for Pattern
						errorMessage +=  questionObj.Question_Label__c + 'Phone must be ' + questionObj.Input_Placeholder__c + ' following pattern' +'\n';
					/*if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (questionObj.Answer__c.length > questionObj.Higher_Value_Limit__c)) //check for Max Limit
						errorMessage +=  questionObj.Question_Label__c + 'Phone must be ' + questionObj.Higher_Value_Limit__c + '\n';
					if((questionObj.Size__c != null) && (questionObj.Size__c != '')&& (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > questionObj.Size__c)) //check for Max Size
						errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c  +'\n';*/
				}
			}
			else if(questionObj.Field_Type__c == 'EMAIL'){
				
				var regExpEmailformat = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				if(questionObj.IsMandatory__c){
					if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
						
						errorMessage += questionObj.Question_Label__c + ':'+'Required, ' +'\n';
				}
				if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
					
					if((questionObj.Answer__c.match(regExpEmailformat)) == null)
						errorMessage += questionObj.Question_Label__c + ':'+'Please Enter valid email address , ' +'\n';
				}
			}else if(questionObj.Field_Type__c == 'BOOLEAN'){
                        /*if(questionObj.IsMandatory__c){
                            if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for required
                                errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
                        }*/
			}else if(questionObj.Field_Type__c == 'PICKLIST'){
				if(questionObj.IsMandatory__c){
					if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == '--None--')) //check for required
						errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
				}
			}else if(questionObj.Field_Type__c == 'MULTIPICKLIST' || questionObj.Field_Type__c == 'REFERENCE'){
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
                        
				if(questionObj.IsMandatory__c){				
					if((questionObj.Answer__c == null) || (questionObj.Answer__c == '') || (questionObj.Answer__c == undefined)) //check for Required
						errorMessage += questionObj.Question_Label__c + ':'+'Required, '  +'\n';
				}
				if((questionObj.Answer__c != null) && (questionObj.Answer__c != '') && (questionObj.Answer__c != undefined)){
					
					if((questionObj.Input_Pattern__c != null) && (questionObj.Input_Pattern__c != '') && (questionObj.Input_Pattern__c != undefined) && (!(questionObj.Answer__c.match(questionObj.Input_Pattern__c)))) //check for Pattern
						errorMessage +=  questionObj.Question_Label__c + 'Number must be ' + questionObj.Input_Pattern__c + '\n';
					else{				
						if((questionObj.Lower_Value_Limit__c != null) &&  (questionObj.Lower_Value_Limit__c != '') && (questionObj.Lower_Value_Limit__c != undefined) && (parseFloat(questionObj.Answer__c) < parseFloat(questionObj.Lower_Value_Limit__c))) //check for Min Limit
							errorMessage += questionObj.Question_Label__c + 'Min size must be ' + questionObj.Lower_Value_Limit__c + '\n';
						else if((questionObj.Higher_Value_Limit__c != null) && (questionObj.Higher_Value_Limit__c != '') && (questionObj.Higher_Value_Limit__c != undefined) && (parseFloat(questionObj.Answer__c) > parseFloat(questionObj.Higher_Value_Limit__c))) //check for Max Limit
							errorMessage += questionObj.Question_Label__c + 'Max size must be '+ questionObj.Higher_Value_Limit__c + '\n';
						if((questionObj.Size__c != null) &&  (questionObj.Size__c !='') && (questionObj.Size__c != undefined) && (questionObj.Answer__c.length > parseFloat(questionObj.Size__c)))  //check for Max Size
							errorMessage += questionObj.Question_Label__c + 'Max size must be ' + questionObj.Size__c +'\n';
						
						if((questionObj.Decimal__c != null) && (questionObj.Decimal__c != '') && (questionObj.Decimal__c != undefined) && (questionObj.Answer__c != ''))//decimal places
							questionObj.Answer__c  =  parseFloat(questionObj.Answer__c).toFixed(questionObj.Decimal__c);
						if((questionObj.Number_Data_Val__c != null) && (questionObj.Number_Data_Val__c != '') && (questionObj.Number_Data_Val__c != undefined)){ //decimal places
							
							if(questionObj.Number_Data_Val__c == "Positive"){
								
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
            if(errorMessage != null && errorMessage != '' && errorMessage != undefined){
                var callBack = params.callBack;
                console.log('Error message in validation cmp..'+errorMessage);
                callBack(errorMessage);
            }
        }
    }
})