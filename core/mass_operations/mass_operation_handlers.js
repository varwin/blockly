/**
 * @license
 * Copyright 2022 OMV LLC (Varwin)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Mass operations handler for workspace
 */
'use strict';

/**
 * Mass operations handler for workspace
 * @class
 */
goog.module('Blockly.MassOperations.Handler');

const { WorkspaceSvg } = goog.requireType('Blockly.WorkspaceSvg');
const { Gesture } = goog.require('Blockly.Gesture');
const { ShortcutRegistry } = goog.require('Blockly.ShortcutRegistry');
const { KeyCodes } = goog.require('Blockly.utils.KeyCodes');
const common = goog.require('Blockly.common');

/**
 * Mass operations handler for workspace
 * @param {!WorkspaceSvg} workspace The block's workspace.
 * @constructor
 * @alias Blockly.MassOperations.Handler
 */
const MassOperationsHandler = function (workspace) {
  this.workspace_ = workspace;
  this.selectedBlocks_ = [];
  this.lastMouseDownBlock_ = null;

  // Add "deleteAll" method to shortcut registry with ctrl+D key
  const deleteAllShortcut = {
    name: 'massOperationDelete',
    preconditionFn: (workspace) => {
      return !workspace.options.readOnly && !workspace.isFlyout && this.selectedBlocks_.length;
    },
    callback: (workspace) => {
      this.deleteAll()
      return true;
    },
  };
  ShortcutRegistry.registry.register(deleteAllShortcut, true);

  const ctrlD = ShortcutRegistry.registry.createSerializedKey(KeyCodes.D, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlD, deleteAllShortcut.name, true);

  // Add "selectAll" method to shortcut registry with ctrl+A key
  const selectAllShortcut = {
    name: 'massOperationSelect',
    preconditionFn: (workspace) => {
      return !workspace.options.readOnly && !workspace.isFlyout;
    },
    callback: (workspace, e) => {
      this.selectAll()
      e.preventDefault()
      e.stopPropagation()
      return true;
    },
  };
  ShortcutRegistry.registry.register(selectAllShortcut, true);

  const ctrlA = ShortcutRegistry.registry.createSerializedKey(KeyCodes.A, [KeyCodes.CTRL]);
  ShortcutRegistry.registry.addKeyMapping(ctrlA, selectAllShortcut.name, true);
}

MassOperationsHandler.prototype.blockMouseDown = function (block) {
  this.lastMouseDownBlock_ = block
}

MassOperationsHandler.prototype.blockMouseUp = function (block) {
  if (this.lastMouseDownBlock_ && this.lastMouseDownBlock_.id === block.id) {
    this.addBlockToSelected(block)
  }
}

MassOperationsHandler.prototype.isBlockInSelectedGroup = function (block) {
  return !!this.selectedBlocks_.find(b => b.id === block.id)
}

MassOperationsHandler.prototype.addBlockToSelected = function (block) {
  if (this.selectedBlocks_.find(b => b.id === block.id)) return

  this.selectedBlocks_.push(block)
  block.addSelectAsMassSelection()
}

MassOperationsHandler.prototype.cleanUp = function () {
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => typeof block.removeSelect === 'function' && block.removeSelectAsMassSelection());
    this.selectedBlocks_ = [];
  }
}

MassOperationsHandler.prototype.deleteAll = function () {
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => !block.disposed && typeof block.dispose === 'function' && block.dispose());
    this.selectedBlocks_ = [];
  }
}

MassOperationsHandler.prototype.selectAll = function () {
  const gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) gesture.dispose();

  const selected = common.getSelected();
  if (selected) selected.unselect();

  this.workspace_.getAllBlocks().forEach(block => {
    this.selectedBlocks_.push(block)
    block.addSelectAsMassSelection()
  })
}

exports.MassOperationsHandler = MassOperationsHandler;
