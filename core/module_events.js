/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Classes for all types of module events.
 * @author dev@varwin.com (Varwin Developers)
 */
'use strict';

goog.provide('Blockly.Events.ModuleBase');
goog.provide('Blockly.Events.ModuleCreate');
goog.provide('Blockly.Events.ModuleDelete');
goog.provide('Blockly.Events.ModuleRename');

goog.require('Blockly.Events');
goog.require('Blockly.Events.Abstract');
goog.require('Blockly.utils.object');


/**
 * Abstract class for a module event.
 * @param {Blockly.ModuleModel} module The module this event corresponds
 *     to.
 * @extends {Blockly.Events.Abstract}
 * @constructor
 */
Blockly.Events.ModuleBase = function(module) {
  Blockly.Events.ModuleBase.superClass_.constructor.call(this);

  /**
   * The module id for the module this event pertains to.
   * @type {string}
   */
  this.moduleId = module.getId();
  this.workspaceId = module.workspace.id;
};
Blockly.utils.object.inherits(Blockly.Events.ModuleBase, Blockly.Events.Abstract);

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ModuleBase.prototype.toJson = function() {
  var json = Blockly.Events.ModuleBase.superClass_.toJson.call(this);
  json['moduleId'] = this.moduleId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ModuleBase.prototype.fromJson = function(json) {
  Blockly.Events.ModuleBase.superClass_.toJson.call(this);
  this.moduleId = json['moduleId'];
};

/**
 * Class for a module creation event.
 * @param {Blockly.ModuleModel} module The created module.
 *     Null for a blank event.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
Blockly.Events.ModuleCreate = function(module) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.ModuleCreate.superClass_.constructor.call(this, module);
  this.moduleName = module.name;
};
Blockly.utils.object.inherits(Blockly.Events.ModuleCreate, Blockly.Events.ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ModuleCreate.prototype.type = Blockly.Events.MODULE_CREATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ModuleCreate.prototype.toJson = function() {
  var json = Blockly.Events.ModuleCreate.superClass_.toJson.call(this);
  json['moduleName'] = this.moduleName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ModuleCreate.prototype.fromJson = function(json) {
  Blockly.Events.ModuleCreate.superClass_.fromJson.call(this, json);
  this.moduleName = json['moduleName'];
};

/**
 * Run a module creation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.ModuleCreate.prototype.run = function(forward) {
  var moduleManager = this.getEventWorkspace_().getModuleManager();
  if (forward) {
    moduleManager.createModule(this.moduleName, this.moduleId);
  } else {
    moduleManager.deleteModule(workspace.getModuleManager().getModuleById(this.moduleId));
  }
};

/**
 * Class for a module deletion event.
 * @param {Blockly.ModuleModel} module The deleted module.
 *     Null for a blank event.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
Blockly.Events.ModuleDelete = function(module) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.ModuleDelete.superClass_.constructor.call(this, module);
  this.moduleName = module.name;
};
Blockly.utils.object.inherits(Blockly.Events.ModuleDelete, Blockly.Events.ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ModuleDelete.prototype.type = Blockly.Events.MODULE_DELETE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ModuleDelete.prototype.toJson = function() {
  var json = Blockly.Events.ModuleDelete.superClass_.toJson.call(this);
  json['moduleName'] = this.moduleName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ModuleDelete.prototype.fromJson = function(json) {
  Blockly.Events.ModuleDelete.superClass_.fromJson.call(this, json);
  this.moduleName = json['moduleName'];
};

/**
 * Run a module deletion event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.ModuleDelete.prototype.run = function(forward) {
  var moduleManager = this.getEventWorkspace_().getModuleManager();
  if (forward) {
    moduleManager.deleteModule(this.getModuleManager().getModuleById(this.moduleId));
  } else {
    moduleManager.createModule(this.moduleName, this.moduleId);
  }
};


/**
 * Class for a module activation event.
 * @param {Blockly.ModuleModel} module The activated module.
 * @param {Blockly.ModuleModel} previousActiveModule The previous activated module.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
Blockly.Events.ModuleActivate = function(module, previousActiveModule) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.ModuleActivate.superClass_.constructor.call(this, module);
  this.previousActiveId = previousActiveModule ? previousActiveModule.getId() : null;
};
Blockly.utils.object.inherits(Blockly.Events.ModuleActivate, Blockly.Events.ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ModuleActivate.prototype.type = Blockly.Events.MODULE_ACTIVATE;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ModuleActivate.prototype.toJson = function() {
  var json = Blockly.Events.ModuleActivate.superClass_.toJson.call(this);
  json['previousActiveId'] = this.previousActiveId;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ModuleActivate.prototype.fromJson = function(json) {
  Blockly.Events.ModuleDelete.superClass_.fromJson.call(this, json);
  this.previousActiveId = json['previousActiveId'];
};

/**
 * Run a module activation event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.ModuleActivate.prototype.run = function(forward) {
  var moduleManager = this.getEventWorkspace_().getModuleManager();
  if (forward) {
    moduleManager.activateModule(workspace.getModuleManager().getModuleById(this.moduleId));
  } else if(this.previousActiveId) {
    moduleManager.activateModule(workspace.getModuleManager().getModuleById(this.previousActiveId));
  }
};


/**
 * Class for a module rename event.
 * @param {Blockly.ModuleModel} module The renamed module.
 *     Null for a blank event.
 * @param {string} previousName The previous name the module.
 * @extends {Blockly.Events.ModuleBase}
 * @constructor
 */
Blockly.Events.ModuleRename = function(module, previousName) {
  if (!module) {
    return;  // Blank event to be populated by fromJson.
  }
  Blockly.Events.ModuleRename.superClass_.constructor.call(this, module);
  this.oldName = previousName;
  this.newName = module.name;
};
Blockly.utils.object.inherits(Blockly.Events.ModuleRename, Blockly.Events.ModuleBase);

/**
 * Type of this event.
 * @type {string}
 */
Blockly.Events.ModuleRename.prototype.type = Blockly.Events.MODULE_RENAME;

/**
 * Encode the event as JSON.
 * @return {!Object} JSON representation.
 */
Blockly.Events.ModuleRename.prototype.toJson = function() {
  var json = Blockly.Events.ModuleRename.superClass_.toJson.call(this);
  json['oldName'] = this.oldName;
  json['newName'] = this.newName;
  return json;
};

/**
 * Decode the JSON event.
 * @param {!Object} json JSON representation.
 */
Blockly.Events.ModuleRename.prototype.fromJson = function(json) {
  Blockly.Events.ModuleRename.superClass_.fromJson.call(this, json);
  this.oldName = json['oldName'];
  this.newName = json['newName'];
};

/**
 * Run a module rename event.
 * @param {boolean} forward True if run forward, false if run backward (undo).
 */
Blockly.Events.ModuleRename.prototype.run = function(forward) {
  var moduleManager = this.getEventWorkspace_().getModuleManager();
  var module = moduleManager.getModuleById(this.moduleId);
  if (forward) {
    moduleManager.renameModule(module, this.newName);
  } else {
    moduleManager.renameModule(module, this.oldName);
  }
};
