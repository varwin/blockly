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
const { Coordinate } = goog.require('Blockly.utils.Coordinate');
const internalConstants = goog.require('Blockly.internalConstants');
const registry = goog.require('Blockly.registry');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');

/* eslint-disable-next-line no-unused-vars */
const { BlockSvg } = goog.requireType('Blockly.BlockSvg');
/** @suppress {extraRequire} */
goog.require('Blockly.BlockDragger');

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

/**
 * How far the mouse has moved during this drag, in pixel units.
 * (0, 0) is at this.mouseDownXY_.
 * @type {!Coordinate}
 * @private
 */
MassOperationsHandler.prototype.currentDragDeltaXY_ = new Coordinate(0, 0);

MassOperationsHandler.prototype.blockMouseDown = function (block, e) {
  this.lastMouseDownBlock_ = block
  this.mouseDownXY_ = new Coordinate(e.clientX, e.clientY);
  this.onMoveBlockWrapper_ = browserEvents.conditionalBind(document, 'mousemove', null, this.handleMove_.bind(this));
}

MassOperationsHandler.prototype.handleMove_ = function (e) {
   if (!e.ctrlKey || !this.selectedBlocks_.length) {
    this.lastMouseDownBlock_ = null
    browserEvents.unbind(this.onMoveBlockWrapper_)

    return
  }

  const currentXY = new Coordinate(e.clientX, e.clientY);

  this.currentDragDeltaXY_ = Coordinate.difference(currentXY, this.mouseDownXY_);

  if (this.blockDraggers_) {
    this.blockDraggers_.forEach(dragger => dragger.drag(e, this.currentDragDeltaXY_));
    return
  }

  if (!this.hasExceededDragRadius_) {
    const currentDragDelta = Coordinate.magnitude(this.currentDragDeltaXY_);
    const limitRadius = internalConstants.DRAG_RADIUS;

    this.hasExceededDragRadius_ = currentDragDelta > limitRadius;
  }

  if (!this.hasExceededDragRadius_) return

  const BlockDraggerClass = registry.getClassFromOptions(registry.Type.BLOCK_DRAGGER, this.workspace_.options, true);

  this.blockDraggers_ = this.selectedBlocks_.map(block => new BlockDraggerClass(block, this.workspace_));
  this.blockDraggers_.forEach(dragger => dragger.startDrag(this.currentDragDeltaXY_, this.healStack_));
  this.blockDraggers_.forEach(dragger => dragger.drag(e, this.currentDragDeltaXY_));
}

MassOperationsHandler.prototype.blockMouseUp = function (block, e) {
  if (this.lastMouseDownBlock_ && this.lastMouseDownBlock_.id === block.id) {
    this.addBlockToSelected(block)
  }

  this.lastMouseDownBlock_ = null

  if (this.blockDraggers_) {
    this.blockDraggers_.forEach(dragger => dragger.endDrag(e, this.currentDragDeltaXY_));
    this.blockDraggers_ = null
    this.currentDragDeltaXY_ = null
  }

  if (this.onMoveBlockWrapper_) {
    browserEvents.unbind(this.onMoveBlockWrapper_)
    this.onMoveBlockWrapper_ = null
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
