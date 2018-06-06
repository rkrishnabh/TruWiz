({
    
    doInit : function(cmp, event, helper) {
        if (cmp.get("v.column").width) {
        	cmp.set("v._width", cmp.get("v.column").width+'px');    
        }     
    },
	sort : function(cmp, event, helper) {
		var columnToSort = cmp.get("v.column"),
			evt = cmp.getEvent("sortColumnByEvt");

        evt.setParams({
            "columnToSort":columnToSort
        });

        evt.fire();
	},
    doneSorting : function(cmp, event, helper) {

        var colEle = cmp.find('colCmp').getElement(),
            orderBy = cmp.get("v.sortOrder"),
            column = cmp.get("v.column"),
            prevOrderBy = (orderBy === 'asc') ? 'desc' : 'asc';
		        
        if(cmp.get("v.sortColumn").name === column.name){
            $A.util.removeClass(colEle,'slds-is-sorted--'+prevOrderBy);
            $A.util.addClass(colEle,'slds-is-sorted--'+orderBy);
            $A.util.addClass(colEle,'active');
        }
        else{
            $A.util.removeClass(colEle,'slds-is-sorted--'+prevOrderBy);
            $A.util.removeClass(colEle,'slds-is-sorted--'+orderBy);
            $A.util.removeClass(colEle,'active');
        }
	}
})