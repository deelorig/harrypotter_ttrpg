import {MSConfig} from "./module/config.js"
import MSItemSheet from "./module/sheets/item-sheet.js";
import MSActorSheet from "./module/sheets/actor-sheet.js";
Hooks.once("init", function(){
    console.log("test | Initializing mySystem");

    CONFIG.MSConfig = MSConfig;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("harrypotter_ttrpg", MSItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("harrypotter_ttrpg", MSActorSheet, {makeDefault: true});
});