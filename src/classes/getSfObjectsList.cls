global class getSfObjectsList implements Comparable {
    @auraenabled
    public string Label{get;set;}
    @auraenabled
    public string Name{get;set;}
    public getSfObjectsList(string a, string b){
        Label = a;
        Name = b;
    }
    global Integer compareTo(Object ObjToCompare) {
        return Label.CompareTo(((getSfObjectsList)ObjToCompare).Label);
    }
}