({
    evaluateFinalCondition : function (component ,event, helper){
        var params = event.getParam('arguments');        
        var str = params.conditionalColumvalue;
        var resultBooleanString;
        if(str != undefined && str != ""){
            while (str.indexOf("(") != -1) {
                var openingParanthesesIndex = str.lastIndexOf("(");
                var closingParanthesesIndex;
                var extractStr = str.substring(openingParanthesesIndex + 1);
                if (extractStr.indexOf(")") != -1) {
                    closingParanthesesIndex = extractStr.indexOf(")");		
                    var conditnStr = extractStr.substring(0, closingParanthesesIndex);
                    var conditnStrLength = conditnStr.length;
                    var resultBoolString = this.evaluateConditionString(conditnStr);//Evaluate the condition
                    var replacedString = '';
                    closingParanthesesIndex = openingParanthesesIndex + conditnStrLength + 1;
                    if (openingParanthesesIndex <= str.length - 1 && closingParanthesesIndex <= str.length - 1)
                        replacedString = str.substring(0, openingParanthesesIndex) + resultBoolString + str.substring(closingParanthesesIndex + 1, str.length);
                    str = replacedString;
                }
            }
            resultBooleanString = component.evaluateConditionString(str);            
        }else
            resultBooleanString = "";
         
        var callBack = params.callBack;
        callBack(resultBooleanString);        
    },
    evaluateConditionString : function (component, event, helper){
        var params = event.getParam('arguments');
        var conditionStr = params.conditionStr;        
        var tokens = conditionStr.split(' ');
        var evaluate = tokens.reduce(function(accumulator, currentValue, currentIndex, array) {
            if (currentIndex % 2 == 1)
                accumulator = component.calculateSingleCondition(accumulator, currentIndex);
            return accumulator + " " + currentValue;
        });
        
        var finalBooleanValue = component.calculateSingleCondition(evaluate, 1);
        return finalBooleanValue;
    },
    calculateSingleCondition : function (component, event, helper){
        var params = event.getParam('arguments');
        var str = params.str;
        var currentIndex = params.currentIndex;         
        var boolReturnValue = false;
        var separators = ['AND', 'OR'];
        var tokens = str.split(new RegExp(separators.join('|'), 'g'));
        var andExists = str.indexOf("AND");
        var orExists = str.indexOf("OR");
        var operation = "";
        if (andExists != -1)
            operation = "AND";
        else if (orExists != -1)
            operation = "OR";
        
        if (currentIndex == 1)
            boolReturnValue = str;
        else
            boolReturnValue = "false";
        
        switch (operation) {
            case "AND":
                if (tokens[0].trim() == "true" && tokens[1].trim() == "true")
                    boolReturnValue = "true";
                else
                    boolReturnValue = "false";
                break;
            case "OR":
                if (tokens[0].trim() == "true" || tokens[1].trim() == "true")
                    boolReturnValue = "true";
                else
                    boolReturnValue = "false";
                break;
        }
        return boolReturnValue;
    }    
})