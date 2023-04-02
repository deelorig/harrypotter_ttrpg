///Инициилизация файла в системе
///classes - подключение файлов стилей, также как они указаны в system.json
export default class MSActorSheet extends ActorSheet{
    static get defaultOptions(){
        return mergeObject(super.defaultOptions,{template: `systems/harrypotter_ttrpg/templates/sheets/player-sheet.html`, classes: ["main"]});
    }
   
    //Первоначальная закрузка и обработка данных при открытии листа персонажа/изменении параметров и т.д.
    getData()
    {
        const data = super.getData();
        //Подключаем конфигурационные файлы
        data.config = CONFIG.MSConfig;

        //data.actor - доступ к данным листа персонажа
        //data.items - доступ к объектам типа предмет, добавленным в лист персонажа
        //data.actor.type - тип листа персонажа
        //data.actor.system.XXX - доступ к параметрам персонажа, заданнаые изначально в template.json

        //Сортировка предметов по типу, где XXX имя массива, в который отсортируются предметы(название может любым, по желаию)
        //YYY - тип предмета, так, как он указан в template.json
        data.actor.spells = data.items.filter(function (item) {return item.type == "spell";}); 
        data.actor.potions = data.items.filter(function (item) {return item.type == "potion";}); 
        data.actor.artifacts = data.items.filter(function (item) {return item.type == "artifact";}); 
        data.actor.wand_wood = data.items.filter(function (item) {return item.type == "wand_wood";});    
        return data;
    }   

    //Подключение событий(например нажатие на кнопку или другой объект)
    activateListeners(html)
    {
        //Подключение конкретного элемента(кнопки/другого элемент) к конкретному коду(функции), которая будет производить нужные изменения
        //XXX - имя класса, который привязан к объекту
        //YYY - имя функции, которую нужно выполнить по клику по объекту
        //click - событие нажатия на объект, есть еще куча других событий, но они пока не нужны. 
        //Это может например быть событие наведения на элемент, двойной длин и т.д. про них можно почитать погуглив jQuery events
        //html.find(".XXX").click(this.YYY.bind(this));
        html.find(".stadard_roll").click(this._standardTest.bind(this));
        html.find(".attribute_quick").click(this._quickTest.bind(this));
        html.find(".fa-bolt").click(this._quickTest.bind(this));
        html.find(".fa-trash").click(this._onItemDelete.bind(this));
        html.find(".generate_wand").click(this._WandGenerator.bind(this));
        super.activateListeners(html);
    }

    //Пример функции, которая будет активирована при нажатии
   async _Check(event) 
    {
        //Если надо будет вывести сообщение в чат, загружаем шаблон этого сообщения
        //XXX - имя шаблона 
        //const messageTemplate = "systems/template/templates/chat/XXX.html";
        event.preventDefault();
        //Получаем элемент, на который нажали
        var element = event.currentTarget;

        //Базовый бросок, указывается текстом, также как в чате 2d6/3d10 и т.д.
        //Необязательно, можно указать и сразу в формуле      
        var dices = "2d6";
        //Определяем формулу броска (@actionValue - это например значение навыка или хаарктеристики)
        let rollFormula = dices+" + @actionValue";
        
        //Определяем @actionValue, data.actor.system.XXX - доступ к параметрам персонажа, естественно можно использовать множество параметров
        //let rollData = 
        //{
        //    actionValue: this.actor.system.XXX
        //};
      
        //Инициилизируем бросок
        let myRoll  = new Roll(rollFormula,rollData);
        myRoll.roll({async : false});

        //формируем то, как будет выглядеть сообщение в чате
        //game.i18n.localize("XXX.YYY.ZZZ"); получение текста из файлов с текстом(локализацией), адрес прописывает как путь по вложенным тегам
              
        //тут желаем всякую математику с броском, если нужна

        //Получение результатов броска
        //myRoll.dice[0].results[i].result i - порядковый номер брошенного кубика. Счет начинается с 0. Т.е. если брошено 4 куба то первый это 0, четвертый это 3
        //Так как в яваскрипте динамическая типизация(грбо говоря переменная может быть и числом и текстом и числом с плавающей точкой), то лучше
        //каждое обращение к числовому параметру облачать его в конструкцию Number(XXX) - где XXX имя переменной. Чтобы она точно посчиталась как число

        //всякая математика с числами (округление и т.д.) делается через Math.XXX - где XXX имя функции, все гуглится через JS math
        
        //формируем надписи, которые мы передадим в шаблон сообщения. Внутри templateData через запятую по примеру имя_поля_указанное_в_шаблоне: значение_которое_мы_передаем
       

        //Отправляем сообщение
        let messageData = 
        {
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(messageTemplate, templateData)   
        };
        myRoll.toMessage(messageData);        
    }

    async _WandGenerator(event) 
    {
        const messageTemplate = "systems/harrypotter_ttrpg/templates/chat/wandGenerator.html";
        event.preventDefault();

        var element = event.currentTarget;
      
        var dices = "1d100+1d10+2d10+1d10";

        let rollFormula = dices;

        let rollData = 
        {
            actionValue: 0
        };

        let myRoll  = new Roll(rollFormula,rollData);
        myRoll.roll({async : false});

        var wood = game.i18n.localize("wand_generator.wood_table."+myRoll.dice[0].results[0].result);
        var wood_name = game.i18n.localize("wand_generator.wood_desctiption."+wood+".name");
        var wood_description = game.i18n.localize("wand_generator.wood_desctiption."+wood+".description");
        var flexibility = game.i18n.localize("wand_generator.flexibility."+ Number(Number(myRoll.dice[2].results[0].result+Number(myRoll.dice[2].results[1].result))));
        var core = game.i18n.localize("wand_generator.core_table."+myRoll.dice[3].results[0].result);
        var core_name = game.i18n.localize("wand_generator.core_description."+core);

        var wand_lenght = "";
        switch(myRoll.dice[1].results[0].result)
        {
            case 1:
            case 2:
                wand_lenght = Number(myRoll.dice[1].results[0].result+7) +'"';
                break;
            case 3:
            case 4:
            case 7:
            case 8:
                wand_lenght = Number(myRoll.dice[1].results[0].result+7)+' 1/4"';
                break;
            case 5:
            case 6:
                wand_lenght = Number(myRoll.dice[1].results[0].result+7)+ ' 1/2"';
                break;
            case 9:
            case 10:
                wand_lenght = Number(myRoll.dice[1].results[0].result+8) +'"';
                break;
        }
        //формируем надписи, которые мы передадим в шаблон сообщения. Внутри templateData через запятую по примеру имя_поля_указанное_в_шаблоне: значение_которое_мы_передаем
        let templateData = 
        {
            main_title:game.i18n.localize("system.create_wand"),
            wood_title:game.i18n.localize("system.wand.wood"),
            wood:wood_name,
            wood_description:wood_description,
            length_title:game.i18n.localize("system.wand.length"),
            length:wand_lenght,
            flex_title:game.i18n.localize("system.wand.flex"),
            flex:flexibility,
            core_title:game.i18n.localize("system.wand.core"),
            core:core_name
        };

        //Отправляем сообщение
        let messageData = 
        {
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(messageTemplate, templateData)   
        };
        myRoll.toMessage(messageData);        
    }

    async _quickTest(event) 
    {
        const messageTemplate = "systems/harrypotter_ttrpg/templates/chat/quickTest.html";
        event.preventDefault();

        var element = event.currentTarget;
      
        var dices = "1d10";

        let rollFormula = dices;

        let rollData = 
        {
            actionValue: 0
        };

        let myRoll  = new Roll(rollFormula,rollData);
        myRoll.roll({async : false});

        var skill_value = 0;
        var skill_name = "";
        if (element.id.includes("quick_"))
        {
            var quick_index = element.id.substring(6,8);
            var current_skill = eval("this.actor.system.skills.skill_"+quick_index);
            if (current_skill.name != "")
            {
                skill_name = current_skill.name;
            } else 
            {
                if (quick_index.length == 2){
                    skill_name = game.i18n.localize("system.skills.skill_"+quick_index);
                } else 
                {
                    skill_name = game.i18n.localize("system.skills.skill_0"+quick_index);
                }
            }
            skill_value = current_skill.value;
        } else 
        {
            switch (element.id)
            {
                case "attr_0":
                    skill_name = game.i18n.localize("system.attributes.vitality");
                    skill_value = this.actor.system.attributes.vitality;
                    break;
                case "attr_1":
                    skill_name = game.i18n.localize("system.attributes.speed");
                    skill_value = this.actor.system.attributes.speed;
                    break;
                case "attr_2":
                    skill_name = game.i18n.localize("system.attributes.wits");
                    skill_value = this.actor.system.attributes.wits;
                    break;
                case "attr_3":
                    skill_name = game.i18n.localize("system.attributes.knowledge");
                    skill_value = this.actor.system.attributes.knowledge;
                    break;
                case "attr_4":
                    skill_name = game.i18n.localize("system.attributes.focus");
                    skill_value = this.actor.system.attributes.focus;
                    break;
            }
        }
        
        var _result_text =  "";
        var _result_dice =  "";
        if (myRoll.dice[0].results[0].result <= skill_value)
        {
            var _result_text = game.i18n.localize("system.results.success");
            var _result_dice = myRoll.dice[0].results[0].result +"<="+skill_value;
        }else 
        {
            var _result_text = game.i18n.localize("system.results.failure");
            var _result_dice = myRoll.dice[0].results[0].result +">"+skill_value;
        }
        //формируем надписи, которые мы передадим в шаблон сообщения. Внутри templateData через запятую по примеру имя_поля_указанное_в_шаблоне: значение_которое_мы_передаем
        let templateData = 
        {
            name:this.actor.name,
            skill:skill_name,
            result_text:_result_text,
            result_dice:_result_dice
        };

        //Отправляем сообщение
        let messageData = 
        {
            speaker: ChatMessage.getSpeaker(),
            content: await renderTemplate(messageTemplate, templateData)   
        };
        myRoll.toMessage(messageData);        
    }

    async _standardTest(event) 
    {
        const messageTemplate = "systems/harrypotter_ttrpg/templates/chat/standardTest.html";
        event.preventDefault();

        var row_1 = 0;
        var row_2 = 0;

        var can_do1 = false;
        var can_do2 = false;

        jQuery("input[name='std_test1']").each(function() {
            if (this.checked == true) 
            {
                row_1 = this.value;
                can_do1 = true;
            }
        });
        jQuery("input[name='std_test2']").each(function() {
            if (this.checked == true) 
            {
                row_2 = this.value;
                can_do2 = true;
            }
        });

        var body_value = 0;
        var mind_value = 0;

        jQuery("input[name='system.body.value']").each(function() {
            if (this.checked == true) 
            {
                body_value = this.value;
            }
        });

        jQuery("input[name='system.mind.value']").each(function() {
            if (this.checked == true) 
            {
                mind_value = this.value;
            }
        });

        var difficulty = jQuery("select[id='difficulty_var']")[0].value;

        

        var penalty = 0;
        switch (Number(body_value))
        {
            case 0:
            case 1:
            case 2:
            case 3:
                penalty = body_value;
                break;
            case 4:
                penalty = 5;
                break;
            case 5:
                penalty = 7;
                break;
            case 6:
                penalty = "—";
                break;
        }
        switch (Number(mind_value))
        {
            case 0:
            case 1:
            case 2:
            case 3:
                if (penalty!="—")penalty = Number(penalty) + Number(mind_value);
                break;
            case 4:
                if (penalty!="—")penalty = Number(penalty) + Number(5);
                break;
            case 5:
                if (penalty!="—")penalty = Number(penalty) + Number(7);
                break;
            case 6:
                penalty = "—";
                break;
        }

        var skill_1 = "";
        var skill_1_value = 0;
        var skill_2 = "";
        var skill_2_value = 0;

        if ((can_do1 == true) && (can_do2 == true) && (penalty != "—"))
        {
            if (row_1 == 0)
            {
                var index = jQuery("select[id='first_var']")[0].value;
                if (index.length == 1) index = "0" + index;

                var current_skill = eval("this.actor.system.skills.skill_"+index);
                if (current_skill.name != "")
                {
                    skill_1 = current_skill.name;
                } else 
                {
                    if (quick_index.length == 2){
                        skill_1 = game.i18n.localize("system.skills.skill_"+index);
                    } else 
                    {
                        skill_1 = game.i18n.localize("system.skills.skill_0"+index);
                    }
                }
                skill_1_value = current_skill.value;
            } else 
            {
                var index = jQuery("select[id='first_var']")[0].value;
                switch (index)
                {
                    case "0":
                        skill_1 = game.i18n.localize("system.attributes.vitality");
                        skill_1_value = this.actor.system.attributes.vitality;
                        break;
                    case "1":
                        skill_1 = game.i18n.localize("system.attributes.speed");
                        skill_1_value = this.actor.system.attributes.speed;
                        break;
                    case "2":
                        skill_1 = game.i18n.localize("system.attributes.wits");
                        skill_1_value = this.actor.system.attributes.wits;
                        break;
                    case "3":
                        skill_1 = game.i18n.localize("system.attributes.knowledge");
                        skill_1_value = this.actor.system.attributes.knowledge;
                        break;
                    case "4":
                        skill_1 = game.i18n.localize("system.attributes.focus");
                        skill_1_value = this.actor.system.attributes.focus;
                        break;
                }
            }

            if (row_2 == 0)
            {
                var index = jQuery("select[id='second_var']")[0].value;
                if (index.length == 1) index = "0" + index;

                var current_skill = eval("this.actor.system.skills.skill_"+index);
                if (current_skill.name != "")
                {
                    skill_2 = current_skill.name;
                } else 
                {
                    if (quick_index.length == 2){
                        skill_2 = game.i18n.localize("system.skills.skill_"+index);
                    } else 
                    {
                        skill_2 = game.i18n.localize("system.skills.skill_0"+index);
                    }
                }
                skill_2_value = current_skill.value;
            } else 
            {
                var index = jQuery("select[id='second_var']")[0].value;
                switch (index)
                {
                    case "0":
                        skill_2 = game.i18n.localize("system.attributes.vitality");
                        skill_2_value = this.actor.system.attributes.vitality;
                        break;
                    case "1":
                        skill_2 = game.i18n.localize("system.attributes.speed");
                        skill_2_value = this.actor.system.attributes.speed;
                        break;
                    case "2":
                        skill_2 = game.i18n.localize("system.attributes.wits");
                        skill_2_value = this.actor.system.attributes.wits;
                        break;
                    case "3":
                        skill_2 = game.i18n.localize("system.attributes.knowledge");
                        skill_2_value = this.actor.system.attributes.knowledge;
                        break;
                    case "4":
                        skill_2 = game.i18n.localize("system.attributes.focus");
                        skill_2_value = this.actor.system.attributes.focus;
                        break;
                }
            }

            var element = event.currentTarget;
      
            var dices = "1d10 + @actionValue";
    
            let rollFormula = dices;
    
            let rollData = 
            {
                actionValue: Number(skill_1_value)+Number(skill_2_value)
            };
    
            let myRoll  = new Roll(rollFormula,rollData);
            myRoll.roll({async : false});

            var result_summ = Number(myRoll.dice[0].results[0].result) + Number(skill_1_value)+Number(skill_2_value);
    
            var success_level = 0;

            difficulty = Number(difficulty) + Number(penalty);

            if (result_summ < difficulty)
            {
                if (result_summ < Number(difficulty)/Number(2)) success_level = 0;
                else if (result_summ < difficulty) success_level = 1;
            } else 
            {
                if (result_summ >= difficulty) success_level = 2;
                if (result_summ >= difficulty*2) success_level = 3;
                if (result_summ >= difficulty*3) success_level = 4;
            }
           
            //формируем надписи, которые мы передадим в шаблон сообщения. Внутри templateData через запятую по примеру имя_поля_указанное_в_шаблоне: значение_которое_мы_передаем
            let templateData = 
            {
                name:this.actor.name,
                skill1: skill_1 + " ("+skill_1_value+")",
                skill2: skill_2 + " ("+skill_2_value+")",
                difficulty: game.i18n.localize("system.difficulty")+ ": " + difficulty,
                penalty: game.i18n.localize("system.penalty") + ": " + penalty,
                result_text:game.i18n.localize("system.success_levels." + success_level),
                result_dice: result_summ
            };
    
            //Отправляем сообщение
            let messageData = 
            {
                speaker: ChatMessage.getSpeaker(),
                content: await renderTemplate(messageTemplate, templateData)   
            };
            myRoll.toMessage(messageData);       
        }
       
    }

    //пример удаления предмета из листа персонажа
    _onItemDelete(event)
    {
        event.preventDefault();
        var element = event.currentTarget;
        var itemId = element.getAttribute("id");
        this.actor.deleteEmbeddedDocuments("Item", [itemId]);   
    }
}

