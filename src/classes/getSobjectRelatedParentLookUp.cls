public class getSobjectRelatedParentLookUp {
@auraenabled
    public string Label{get;set;}
    @auraenabled
    public string Name{get;set;}
    public getSobjectRelatedParentLookUp(string a, string b){
        Label = a;
        Name = b;
    }
}