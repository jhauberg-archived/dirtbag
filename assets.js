function onAssetLoaded() {
    console.log("loaded '" + this.src + "'");
}

function onAssetNotLoaded() {
    console.log("failed loading '" + this.src + "'");
}

function getAssetAsImage(name) {
    var asset = new Image();

    asset.onload = onAssetLoaded;
    asset.onerror = asset.onabort = onAssetNotLoaded;

    asset.src = name;
    
    return asset;
}

var assets = {
    images: {
        dirt: getAssetAsImage("res/dirt_1.png"),
        cards_defensive_1: getAssetAsImage("res/cards_defensive_1.png"),
        cards_offensive_1: getAssetAsImage("res/cards_offensive_1.png"),
        ui: getAssetAsImage("res/ui.png")
    },
}

var cardsDefensive1Data = {"frames": {
"card_defensive_a.png":
{
    "frame": {"x":0,"y":0,"w":104,"h":105},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":104,"h":105},
    "sourceSize": {"w":104,"h":105}
}
}, 
"meta": {
    "app": "http://www.texturepacker.com",
    "version": "1.0",
    "image": "cards_defensive_1.png",
    "format": "RGBA8888",
    "size": {"w":128,"h":128}
}
}

var cardsOffensive1Data = {"frames": {

"card_offensive_a.png":
{
    "frame": {"x":0,"y":0,"w":104,"h":105},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":104,"h":105},
    "sourceSize": {"w":104,"h":105}
}
}, 
"meta": {
    "app": "http://www.texturepacker.com",
    "version": "1.0",
    "image": "cards_offensive_1.png",
    "format": "RGBA8888",
    "size": {"w":128,"h":128}
}
}

var dirtData = {"frames": {
"dirt_heavy_1.png":
{
    "frame": {"x":0,"y":0,"w":117,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":117,"h":117},
    "sourceSize": {"w":117,"h":117}
},
"dirt_heavy_2.png":
{
    "frame": {"x":117,"y":0,"w":117,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":117,"h":117},
    "sourceSize": {"w":117,"h":117}
},
"dirt_heavy_3.png":
{
    "frame": {"x":234,"y":0,"w":117,"h":111},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":117,"h":111},
    "sourceSize": {"w":117,"h":111}
},
"dirt_light_1.png":
{
    "frame": {"x":351,"y":0,"w":110,"h":104},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":110,"h":104},
    "sourceSize": {"w":110,"h":104}
},
"dirt_light_2.png":
{
    "frame": {"x":0,"y":117,"w":111,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":111,"h":117},
    "sourceSize": {"w":111,"h":117}
},
"dirt_light_2_broken_1.png":
{
    "frame": {"x":111,"y":117,"w":97,"h":104},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":97,"h":104},
    "sourceSize": {"w":97,"h":104}
},
"dirt_light_2_broken_2.png":
{
    "frame": {"x":208,"y":117,"w":89,"h":72},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":89,"h":72},
    "sourceSize": {"w":89,"h":72}
},
"dirt_light_2_broken_3.png":
{
    "frame": {"x":297,"y":117,"w":38,"h":31},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":38,"h":31},
    "sourceSize": {"w":38,"h":31}
},
"dirt_light_3.png":
{
    "frame": {"x":335,"y":117,"w":110,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":110,"h":117},
    "sourceSize": {"w":110,"h":117}
},
"dirt_medium_1.png":
{
    "frame": {"x":0,"y":234,"w":111,"h":111},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":111,"h":111},
    "sourceSize": {"w":111,"h":111}
},
"dirt_medium_2.png":
{
    "frame": {"x":111,"y":234,"w":111,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":111,"h":117},
    "sourceSize": {"w":111,"h":117}
},
"dirt_medium_3.png":
{
    "frame": {"x":222,"y":234,"w":110,"h":117},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":110,"h":117},
    "sourceSize": {"w":110,"h":117}
}
}, 
"meta": {
    "app": "http://www.texturepacker.com",
    "version": "1.0",
    "image": "dirt_1.png",
    "format": "RGBA8888",
    "size": {"w":512,"h":512}
}
}

var uiData = {"frames": {

"ui_meter_background.png":
{
    "frame": {"x":0,"y":0,"w":42,"h":16},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":42,"h":16},
    "sourceSize": {"w":42,"h":16}
},
"ui_meter_frame.png":
{
    "frame": {"x":42,"y":0,"w":42,"h":105},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":42,"h":105},
    "sourceSize": {"w":42,"h":105}
},
"ui_meter_life.png":
{
    "frame": {"x":84,"y":0,"w":42,"h":105},
    "rotated": false,
    "trimmed": false,
    "spriteSourceSize": {"x":0,"y":0,"w":42,"h":105},
    "sourceSize": {"w":42,"h":105}
}
}, 
"meta": {
    "app": "http://www.texturepacker.com",
    "version": "1.0",
    "image": "ui.png",
    "format": "RGBA8888",
    "size": {"w":128,"h":128}
}
}

var sheets = {
    dirt: {
        data: dirtData,
        image: assets.images.dirt
    },

    cards_defensive_1: {
        data: cardsDefensive1Data,
        image: assets.images.cards_defensive_1
    },

    cards_offensive_1: {
        data: cardsOffensive1Data,
        image: assets.images.cards_offensive_1
    },

    ui: {
        data: uiData,
        image: assets.images.ui
    }
}