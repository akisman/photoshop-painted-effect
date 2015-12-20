/**
 * Photoshop Painted Effect
 *
 * Copyright (c) 2015 Akis Manolis https://github.com/akisman
 * and licenced under the MIT licence. All rights not explicitly
 * granted in the MIT license are reserved. See the included
 * LICENSE file for more details.
 *
 */

#target photoshop

// Helper variables
var showDialog = false;
var dialogMode = DialogModes.NO;
var allLayers = false;

// Filters default values
var levelsBlack = 10;
var levelsMid = 1.20;
var levelsWhite = 255;
var highPass_Radius = 0.5;
var smartSharpen_Amount = 100;
var smartSharpen_Radius = 1.0;
var surfaceBlur_Radius = 50;
var surfaceBlur_Threshold = 15;

function main() {

    // Check for active document
    if (app.documents.length === 0) {
        alert("Please open a file", "Painted Effect", true);
        return;
    }

    if (options() == false) {
        return;
    }
    
    // Get active document reference
    var docRef = app.activeDocument;

    // Get active layer reference
    var layerRef = docRef.activeLayer;

    // Store active layer name
    var layerName = layerRef.name;

    if (showDialog == true) {
        dialogMode = DialogModes.ALL;
    } else {
        dialogMode = DialogModes.NO;
    }

    try {
        var length = 1;
        // if "All Layers" is checked, get number of layers
        if (allLayers) {
            length = docRef.layers.length;
        }
        
        for (var layer = 0; layer < length; layer++)
        {
            var name = layerRef.name;
            if (allLayers) {
                layerRef = docRef.layers[layer];
                name = layerRef.name;
            } else {
                layerRef = layerRef.duplicate();
            }
            // Set referenced layer as active
            docRef.activeLayer = layerRef;
            // Adjust levels
            adjustLevels(levelsBlack, levelsMid, levelsWhite);    
            // Duplicate layer and set it as active
            layerRef = layerRef.duplicate();
            docRef.activeLayer = layerRef;
            // High Pass filter
            highPass(highPass_Radius);
            // Change layer blending mode and merge down
            layerRef.blendMode = BlendMode.LINEARLIGHT;
            layerRef = layerRef.merge();
            docRef.activeLayer = layerRef;
            // Diffuse
            diffuse();
            // Rotate 90 CW
            app.activeDocument.rotateCanvas(90);
            // Diffuse
            diffuse();
            // Rotate 90 CW
            app.activeDocument.rotateCanvas(90);
            // Diffuse
            diffuse();
            // Rotate 90 CW
            app.activeDocument.rotateCanvas(90);
            // Diffuse
            diffuse();
            // Rotate 90 CW
            app.activeDocument.rotateCanvas(90);
            // Smart sharpen filter
            smartSharpen(smartSharpen_Amount, smartSharpen_Radius) 
            // Surface blur filter
            surfaceBlur(surfaceBlur_Radius, surfaceBlur_Threshold);
            //rename layer
            docRef.activeLayer.name = name + ' Painted Effect';
        }
    } catch (e) {
        if (e.number == 9999) {
            $.writeln('exit code');
            return;
        } else {
            $.writeln('error');   
        }
    }
};

main();

function options() {
    // Create window
    var win = new Window('dialog', 'Painted Effect', [100,100,485,565], {closeButton: true});  // bounds = [left, top, right, bottom] 
    this.windowRef = win;
    
    // Window frames
    win.descriptionPanel = win.add('panel', [25,15,360,150], 'Description');
    win.settingsPanel = win.add('panel', [25, 155, 360, 350], 'Filter Values');
    win.buttonsPanel = win.add('panel', [25, 355, 360, 440], undefined);
    
    // Description
    win.descriptionPanel.titleSt = win.descriptionPanel.add('statictext', [15, 15, 320, 135],'Use Auto to run the script with the values entered in the \"Filter Values\" fields, or Manual to go through each filter\'s details during execution.\n\nSelect \"All Layers\" for the effect to be applied on every layer of the document.',{multiline:true});
    
    // Filters options - For every field, check if content is numeric on change, and enable or disable the Auto button
    win.settingsPanel.levelsBlack_Label = win.settingsPanel.add('statictext', [15, 15, 175, 30], 'Black Level:');
    win.settingsPanel.levelsBlack = win.settingsPanel.add('edittext', [175, 13, 190, 30], levelsBlack);
    win.settingsPanel.levelsBlack.onChanging = function () {
        if (isNumeric (win.settingsPanel.levelsBlack.text)) {
            levelsBlack = win.settingsPanel.levelsBlack.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.levelsMid_Label = win.settingsPanel.add('statictext', [15, 35, 175, 50], 'Midtones:');
    win.settingsPanel.levelsMid = win.settingsPanel.add('edittext', [175, 33, 190, 40], levelsMid);
    win.settingsPanel.levelsMid.onChanging = function () {
        if (isNumeric (win.settingsPanel.levelsMid.text)) {
            levelsMid = win.settingsPanel.levelsMid.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.levelsWhite_Label = win.settingsPanel.add('statictext', [15, 55, 175, 70], 'White Level:');
    win.settingsPanel.levelsWhite = win.settingsPanel.add('edittext', [175, 53, 190, 60], levelsWhite);
    win.settingsPanel.levelsWhite.onChanging = function () {
        if (isNumeric (win.settingsPanel.levelsWhite.text)) {
            levelsWhite = win.settingsPanel.levelsWhite.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.highPass_Radius_Label = win.settingsPanel.add('statictext', [15, 75, 175, 90], 'High Pass Radius (px):');
    win.settingsPanel.highPass_Radius = win.settingsPanel.add('edittext', [175, 73, 190, 80], highPass_Radius);
    win.settingsPanel.highPass_Radius.onChanging = function() {
        if (isNumeric (win.settingsPanel.highPass_Radius.text)) {
            highPass_Radius = win.settingsPanel.highPass_Radius.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.smartSharpen_Amount_Label = win.settingsPanel.add('statictext', [15, 95, 175, 110], 'Smart Sharpen Amount (%):');
    win.settingsPanel.smartSharpen_Amount = win.settingsPanel.add('edittext', [175, 93, 190, 100], smartSharpen_Amount);    
    win.settingsPanel.smartSharpen_Amount.onChanging = function () {
        if (isNumeric (win.settingsPanel.smartSharpen_Amount.text)) {
            smartSharpen_Amount = win.settingsPanel.smartSharpen_Amount.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.smartSharpen_Radius_Label = win.settingsPanel.add('statictext', [15, 115, 175, 130], 'Smart Sharpen Radius (px):');
    win.settingsPanel.smartSharpen_Radius = win.settingsPanel.add('edittext', [175, 113, 190, 120], smartSharpen_Radius);
    win.settingsPanel.smartSharpen_Radius.onChanging = function () {
        if (isNumeric (win.settingsPanel.smartSharpen_Radius.text)) {
            smartSharpen_Radius = win.settingsPanel.smartSharpen_Radius.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.surfaceBlur_Radius_Label = win.settingsPanel.add('statictext', [15, 135, 175, 150], 'Surface Blur Radius (px):');
    win.settingsPanel.surfaceBlur_Radius = win.settingsPanel.add('edittext', [175, 133, 190, 140], surfaceBlur_Radius);
    win.settingsPanel.surfaceBlur_Radius.onChanging = function () {
        if (isNumeric (win.settingsPanel.surfaceBlur_Radius.text)) {
            surfaceBlur_Radius = win.settingsPanel.surfaceBlur_Radius.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };
    win.settingsPanel.surfaceBlur_Threshold_Label = win.settingsPanel.add('statictext', [15, 155, 175, 170], 'Surface Blur Threshold (levels):');
    win.settingsPanel.surfaceBlur_Threshold = win.settingsPanel.add('edittext', [175, 153, 190, 160], surfaceBlur_Threshold);
    win.settingsPanel.surfaceBlur_Threshold.onChanging = function () {
        if (isNumeric (win.settingsPanel.surfaceBlur_Threshold.text)) {
            surfaceBlur_Threshold = win.settingsPanel.surfaceBlur_Threshold.text;
            win.buttonsPanel.autoButton.enabled = true;
        } else {
            win.buttonsPanel.autoButton.enabled = false;
        }
    };  
    
    // Buttons
    win.buttonsPanel.allLayersCheckbox = win.buttonsPanel.add('checkbox', [15, 15, 15, 15], 'All layers');
    win.buttonsPanel.autoButton = win.buttonsPanel.add('button', [15,40,105,55], 'Auto');
    win.buttonsPanel.manualButton = win.buttonsPanel.add('button', [120, 40, 210, 55], 'Manual');
    win.buttonsPanel.exitButton = win.buttonsPanel.add('button', [225, 40, 315, 55], 'Exit');
    var status = false; // Default status set to false to catch escape and window close button
    // Register event listeners that define the button behavior
    win.buttonsPanel.autoButton.onClick = function() {
        if (win.buttonsPanel.allLayersCheckbox.value == true) {
                allLayers = true;
        }
        status = true;
        win.close();
    };
    win.buttonsPanel.manualButton.onClick = function() {
        if (win.buttonsPanel.allLayersCheckbox.value == true) {
                allLayers = true;
        }
        showDialog = true;
        status = true;
        win.close();
    };
    win.buttonsPanel.exitButton.onClick = function() {
        status = false;
        win.close();
    };
    // Display the window
    win.show();
    return status;
}

function adjustLevels(black, mid, white) {
    var actionDescriptor = new ActionDescriptor();
    var idLvls = charIDToTypeID('Lvls');
    var idpresetKind = stringIDToTypeID('presetKind');
    var idpresetKindType = stringIDToTypeID('presetKindType');
    var idpresetKindCustom = stringIDToTypeID('presetKindCustom');
    actionDescriptor.putEnumerated(idpresetKind, idpresetKindType, idpresetKindCustom);
    var idAdjs = charIDToTypeID('Adjs');
    var list19 = new ActionList();
    var desc37 = new ActionDescriptor();
    var idChnl = charIDToTypeID('Chnl');
    var ref21 = new ActionReference();
    var idChnl = charIDToTypeID('Chnl');
    var idChnl = charIDToTypeID('Chnl');
    var idCmps = charIDToTypeID('Cmps');
    ref21.putEnumerated(idChnl, idChnl, idCmps);
    desc37.putReference(idChnl, ref21);
    var idInpt = charIDToTypeID('Inpt');
    var list20 = new ActionList();
    list20.putInteger(black);
    list20.putInteger(white);
    desc37.putList(idInpt, list20);
    var idGmm = charIDToTypeID('Gmm ');
    desc37.putDouble(idGmm, mid);
    var idLvlA = charIDToTypeID('LvlA');
    list19.putObject(idLvlA, desc37);
    actionDescriptor.putList(idAdjs, list19);
    try {
        executeAction(idLvls, actionDescriptor, dialogMode);
    } catch (e) {
        Error.runtimeError(9999, 'Exit Script');
    }
}

function surfaceBlur(radius, threshold) {
    var actionDescriptor = new ActionDescriptor();
    var surfaceBlurID = stringIDToTypeID('surfaceBlur');
    actionDescriptor.putUnitDouble(charIDToTypeID('Rds '), charIDToTypeID('#Pxl'), radius);
    actionDescriptor.putInteger(charIDToTypeID('Thsh'), threshold);
    try {
        executeAction(surfaceBlurID, actionDescriptor, dialogMode);    
    } catch (e) {
        Error.runtimeError(9999, 'Exit Script');
    }
}

function highPass(radius) {
    var actionDescriptor = new ActionDescriptor();
    var highPassID = charIDToTypeID('HghP');
    var idRds = charIDToTypeID('Rds ');
    var idPxl = charIDToTypeID('#Pxl');
    actionDescriptor.putUnitDouble(idRds, idPxl, radius);
    try {    
        executeAction(highPassID, actionDescriptor, dialogMode);
    } catch (e) {    
        Error.runtimeError(9999, 'Exit Script');
    }
}

function diffuse() {
    var actionDescriptor = new ActionDescriptor();
    var diffuseID = charIDToTypeID('Dfs ');
    var idMd = charIDToTypeID('Md  ');
    var idDfsM = charIDToTypeID('DfsM');
    var idanisotropic = stringIDToTypeID('anisotropic');
    actionDescriptor.putEnumerated(idMd, idDfsM, idanisotropic);
    var idFlRs = charIDToTypeID('FlRs');
    actionDescriptor.putInteger(idFlRs, 9785347);
    try {
        executeAction(diffuseID, actionDescriptor, DialogModes.NO);
    } catch (e) {
        Error.runtimeError(9999, 'Exit Script');
    }
} 

function smartSharpen(amount, radius) {
    var actionDescriptor = new ActionDescriptor();
    var smartSharpenID = stringIDToTypeID('smartSharpen');
    var idpresetKind = stringIDToTypeID('presetKind');
    var idpresetKindType = stringIDToTypeID('presetKindType');
    var idpresetKindCustom = stringIDToTypeID('presetKindCustom');
    actionDescriptor.putEnumerated(idpresetKind, idpresetKindType, idpresetKindCustom);
    var iduseLegacy = stringIDToTypeID('useLegacy');
    actionDescriptor.putBoolean(iduseLegacy, false);
    var idAmnt = charIDToTypeID('Amnt');
    var idPrc = charIDToTypeID('#Prc');
    actionDescriptor.putUnitDouble(idAmnt, idPrc, amount);
    var idRds = charIDToTypeID('Rds ');
    var idPxl = charIDToTypeID('#Pxl');
    actionDescriptor.putUnitDouble(idRds, idPxl, radius);
    var idnoiseReduction = stringIDToTypeID('noiseReduction');
    var idPrc = charIDToTypeID('#Prc');
    actionDescriptor.putUnitDouble(idnoiseReduction, idPrc, 10.000000);
    var idblur = charIDToTypeID('blur');
    var idblurType = stringIDToTypeID('blurType');
    var idGsnB = charIDToTypeID('GsnB');
    actionDescriptor.putEnumerated(idblur, idblurType, idGsnB);
    try {
        executeAction(smartSharpenID, actionDescriptor, dialogMode);
    } catch (e) {
        Error.runtimeError(9999, 'Exit Script');    
    }
}

function isNumeric(text) {
    var reg = new RegExp('^[0-9]+?(\.[0-9]+)?$');
    if (reg.test(text)) {
        return true;
    } else {
        return false;
    }
}