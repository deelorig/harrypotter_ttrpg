export default class MSItemSheet extends ItemSheet{
    get template(){
        let sheet = this.item.type;      
		sheet = sheet.toLowerCase().replace(" ", "");
        return `systems/harrypotter_ttrpg/templates/sheets/${sheet}-sheet.html`;

    }

    getData()
    {
        const data = super.getData();
        data.config = CONFIG.MSConfig;
        return data;
    }
}