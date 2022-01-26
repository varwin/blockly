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
  block.addSelect()
  console.log('MassOperationsHandler -> Add new block to this.selectedBlocks_', block)
}

MassOperationsHandler.prototype.cleanUp = function () {
  console.log('MassOperationsHandler -> Clean up')
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => typeof block.removeSelect === 'function' && block.removeSelect());
    this.selectedBlocks_ = [];
  }
}

exports.MassOperationsHandler = MassOperationsHandler;
