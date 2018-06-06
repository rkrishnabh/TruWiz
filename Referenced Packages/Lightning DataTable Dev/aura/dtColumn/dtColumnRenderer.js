({
	// Your renderer method overrides go here
    afterRender : function(cmp, helper) {
        this.superAfterRender();
        var column = cmp.get("v.column");
        if(column.class) {
            $A.util.addClass(cmp.find('colCmp'),column.class)
        }
    }
})