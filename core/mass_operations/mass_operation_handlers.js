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

/**
 * Mass operations handler for workspace
 * @param {!WorkspaceSvg} workspace The block's workspace.
 * @constructor
 * @alias Blockly.MassOperations.Handler
 */
const MassOperationsHandler = function (workspace) {
  console.log('MassOperationsHandler -> created')
  this.workspace_ = workspace;
  this.selectedBlocks_ = [];
}

MassOperationsHandler.prototype.addEvent = function (e, block) {
  e.stopPropagation();
  e.preventDefault();

  if (this.selectedBlocks_.find(b => b.id === block.id)) return

  this.selectedBlocks_.push(block)
  block.addSelectAsMassSelection()
  console.log('MassOperationsHandler -> Add new block to this.selectedBlocks_', block)

  if (!this.keyDownHandlerSet) {
    document.addEventListener('keydown', this.keyDownHadler_.bind(this))
  }
}

MassOperationsHandler.prototype.keyDownHadler_ = function (e) {
  if (e.key === 'd' && e.ctrlKey) {
    this.deleteAll();
  }
}

MassOperationsHandler.prototype.cleanUp = function () {
  console.log('MassOperationsHandler -> Clean up')
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => typeof block.removeSelect === 'function' && block.removeSelectAsMassSelection());
    this.selectedBlocks_ = [];
  }
}

MassOperationsHandler.prototype.deleteAll = function () {
  console.log('MassOperationsHandler.prototype.deleteAll')
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => !block.disposed && typeof block.dispose === 'function' && block.dispose());
    this.selectedBlocks_ = [];
    document.removeEventListener('keydown', this.keyDownHadler_)
  }
}

exports.MassOperationsHandler = MassOperationsHandler;
