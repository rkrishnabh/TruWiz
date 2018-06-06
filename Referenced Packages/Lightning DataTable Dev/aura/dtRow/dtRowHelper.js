({
	hasValue : function(value) {
        if(typeof value == 'boolean' || value == 0){
            return true
        }
        else if(value){
            return true;
        }
        
        return false;
	}
})