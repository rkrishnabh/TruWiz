({
    loadConditionalOperations : function(component, event, helper) {
        console.log('loadConditionalOperations');        
        var conditionalOperations = {
            "=" : function (userInputVal, AdminConfigVal) {
                if(userInputVal == AdminConfigVal)
                    return true;
                else 
                    return false;
            },
            "!=" : function (userInputVal, AdminConfigVal) {
                if(userInputVal !== AdminConfigVal)
                    return true;
                else 
                    return false;
            },
            "<" : function (userInputVal, AdminConfigVal) {
                if(userInputVal < AdminConfigVal)
                    return true;
                else 
                    return false;
            },
            ">" : function (userInputVal, AdminConfigVal) {
                if(userInputVal > AdminConfigVal)
                    return true;
                else 
                    return false;
            },
            "contains" : function (userInputVal, AdminConfigVal) {
                if(userInputVal.includes(AdminConfigVal))
                    return true;
                else 
                    return false;
            },
            "not contains" : function (userInputVal, AdminConfigVal) {
                if(!userInputVal.includes(AdminConfigVal))
                    return true;
                else 
                    return false;
            }
        };
        var params = event.getParam('arguments');        
        var callBack = params.callBack;
        callBack(conditionalOperations);
    }
})