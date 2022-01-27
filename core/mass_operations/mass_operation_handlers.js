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
  this.workspace_ = workspace;
  this.selectedBlocks_ = [];

  this.workspace_.getParentSvg().addEventListener('keydown', this.keyDownHadler_.bind(this))
}

MassOperationsHandler.prototype.addEvent = function (e, block) {
  e.stopPropagation();
  e.preventDefault();

  if (this.selectedBlocks_.find(b => b.id === block.id)) return

  this.selectedBlocks_.push(block)
  block.addSelectAsMassSelection()
}

MassOperationsHandler.prototype.keyDownHadler_ = function (e) {
  if (e.key === 'KeyD' && e.ctrlKey) {
    e.stopPropagation()
    e.preventDefault()
    this.deleteAll();
  }

  if (e.code === 'KeyA' && e.ctrlKey) {
    e.stopPropagation()
    e.preventDefault()
    this.selectAll();
  }
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
  this.workspace_.getAllBlocks().forEach(block => {
    this.selectedBlocks_.push(block)
    block.addSelectAsMassSelection()
  })
}

exports.MassOperationsHandler = MassOperationsHandler;
