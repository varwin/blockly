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
const { ShortcutRegistry } = goog.require('Blockly.ShortcutRegistry');
const { KeyCodes } = goog.require('Blockly.utils.KeyCodes');
const { Msg } = goog.require('Blockly.Msg');
const { Coordinate } = goog.require('Blockly.utils.Coordinate');
const { ContextMenuRegistry } = goog.require('Blockly.ContextMenuRegistry');
const ContextMenu = goog.require('Blockly.ContextMenu');
const internalConstants = goog.require('Blockly.internalConstants');
const registry = goog.require('Blockly.registry');
const browserEvents = goog.require('Blockly.browserEvents');
const common = goog.require('Blockly.common');

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
  this.onMoveBlockWrapper_ = null;
  this.onMouseUpBlockWrapper_ = null;

  // Add "deleteAll" method to shortcut registry with ctrl+D key
  const deleteAllShortcut = {
    name: 'massOperationDelete',
    preconditionFn: (workspace) => {
      return !workspace.options.readOnly && !workspace.isFlyout && this.selectedBlocks_.length;
    },
    callback: (e) => {
      this.deleteAll()
      e.preventDefault()
      e.stopPropagation()
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
  this.onMouseUpBlockWrapper_ = browserEvents.conditionalBind(document, 'mouseup', null, this.handleUp_.bind(this));
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

  const initBlockCoordinates = this.lastMouseDownBlock_.getRelativeToSurfaceXY()
  const BlockDraggerClass = registry.getClassFromOptions(registry.Type.BLOCK_DRAGGER, this.workspace_.options, true);

  this.blockDraggers_ = this.selectedBlocks_.map(block => new BlockDraggerClass(block, this.workspace_, true));

  this.blockDraggers_.forEach((dragger, index) => {
    const cordinates = this.selectedBlocks_[index].getRelativeToSurfaceXY()
    let diff = Coordinate.difference(cordinates, initBlockCoordinates)

    if (diff.x === 0 && diff.y === 0) diff = null

    dragger.startDrag(this.currentDragDeltaXY_, false, diff)
  });
  this.blockDraggers_.forEach(dragger => dragger.drag(e, this.currentDragDeltaXY_));
}

MassOperationsHandler.prototype.blockMouseUp = function (block, e) {
  if (this.lastMouseDownBlock_ && this.lastMouseDownBlock_.id === block.id) {
    this.addBlockToSelected(block)
  }

  this.lastMouseDownBlock_ = null
  browserEvents.unbind(this.onMoveBlockWrapper_)
  this.onMoveBlockWrapper_ = null

  if (this.blockDraggers_) {
    this.blockDraggers_.forEach(dragger => dragger.endDrag(e, this.currentDragDeltaXY_));
    this.blockDraggers_ = null
    this.currentDragDeltaXY_ = null
  }

  if (this.onMouseUpBlockWrapper_) {
    browserEvents.unbind(this.onMouseUpBlockWrapper_)
    this.onMouseUpBlockWrapper_ = null
  }
}

MassOperationsHandler.prototype.handleUp_ = function (e) {
  if (!browserEvents.isLeftButton(e)) return

  browserEvents.unbind(this.onMouseUpBlockWrapper_)
  this.onMouseUpBlockWrapper_ = null

  if (!this.blockDraggers_) return

  this.blockDraggers_.forEach(dragger => dragger.endDrag(e, this.currentDragDeltaXY_));
  this.blockDraggers_ = null
  this.currentDragDeltaXY_ = null

  if (this.onMoveBlockWrapper_) {
    browserEvents.unbind(this.onMoveBlockWrapper_)
    this.onMoveBlockWrapper_ = null
  }

  this.lastMouseDownBlock_ = null
  this.cleanUp()
}

MassOperationsHandler.prototype.isBlockInSelectedGroup = function (block) {
  return !!this.selectedBlocks_.find(b => b.id === block.id)
}

MassOperationsHandler.prototype.addBlockToSelected = function (block) {
  const gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) gesture.dispose();

  const selected = common.getSelected();
  if (selected) selected.unselect();

  if (this.selectedBlocks_.find(b => b.id === block.id)) return

  if (block.isShadow() && block.getParent()) {
    this.addBlockToSelected(block.getParent())
    return
  }

  if (!block.getParent()) {
    this.selectedBlocks_.forEach((b, i) => {
      const root = this.getRootBlock_(b)

      if (root.id === block.id) {
        this.selectedBlocks_.splice(i, 1)
        b.removeSelectAsMassSelection()
      }
    })

    this.selectedBlocks_.push(block)
    block.addSelectAsMassSelection()
    return
  }

  const rootBlock = this.getRootBlock_(block)
  const blockWithSameRootParentIndex = this.selectedBlocks_.findIndex(b => this.getRootBlock_(b).id === rootBlock.id)
  const blockWithSameRootParent = this.selectedBlocks_[blockWithSameRootParentIndex]

  if (blockWithSameRootParent) {
    if (blockWithSameRootParent.id === rootBlock.id) return

    const parentOfSameBlock = blockWithSameRootParent.getParent()

    if (parentOfSameBlock.id === block.id) {
      this.selectedBlocks_.push(block)
      block.addSelectAsMassSelection()

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1)
      blockWithSameRootParent.removeSelectAsMassSelection()
      return
    }

    const isBlockOnTop = this.findParentBlock_(blockWithSameRootParent, block.id)

    if (isBlockOnTop) {
      this.selectedBlocks_.push(block)
      block.addSelectAsMassSelection()

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1)
      blockWithSameRootParent.removeSelectAsMassSelection()
      return
    }

    const sameBlockOnTop = this.findParentBlock_(block, blockWithSameRootParent.id)

    if (sameBlockOnTop) return

    const commonParent = this.findCommonParentBlock_(block, blockWithSameRootParent)

    if (commonParent) {
      this.selectedBlocks_.push(commonParent)
      commonParent.addSelectAsMassSelection()

      this.selectedBlocks_.splice(blockWithSameRootParentIndex, 1)
      blockWithSameRootParent.removeSelectAsMassSelection()
      return
    }
  } else {
    this.selectedBlocks_.push(block)
    block.addSelectAsMassSelection()
  }
}

MassOperationsHandler.prototype.getRootBlock_ = function (block) {
  const parent = block.getParent()

  return parent ? this.getRootBlock_(parent) : block
}

MassOperationsHandler.prototype.findParentBlock_ = function (block, targetBlockId) {
  const parent = block.getParent()

  if (!parent) return false

  if (parent.id === targetBlockId) return true

  return this.findParentBlock_(parent, targetBlockId)
}

MassOperationsHandler.prototype.findCommonParentBlock_ = function (blockA, blockB) {
  const parentsA = this.getBlockParentsIds_(blockA, [])

  return this.getFirstParentByIds_(blockB, [], parentsA)
}

MassOperationsHandler.prototype.getBlockParentsIds_ = function (block, ids) {
  const parent = block.getParent()

  if (!parent) return ids

  ids.push(parent.id)

  return this.getBlockParentsIds_(parent, ids)
}

MassOperationsHandler.prototype.getFirstParentByIds_ = function (block, ids, targetIds = []) {
  const parent = block.getParent()

  if (!parent) return false

  if (targetIds.includes(parent.id)) return parent

  ids.push(parent.id)

  return this.getFirstParentByIds_(parent, ids, targetIds)
}

MassOperationsHandler.prototype.checkBlockSelectedInGroup = function (block) {
  if (!this.selectedBlocks_.length) return false;
  if (this.selectedBlocks_.find(b => b.id === block.id)) return true

  const blockParent = block.getParent()
  if (blockParent) return this.checkBlockSelectedInGroup(blockParent)

  return false
}

MassOperationsHandler.prototype.cleanUp = function () {
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => block.removeSelectAsMassSelection());
    this.selectedBlocks_ = [];
  }
}

MassOperationsHandler.prototype.deleteAll = function () {
  if (this.selectedBlocks_.length) {
    this.selectedBlocks_.forEach(block => !block.disposed && block.dispose());
    this.selectedBlocks_ = [];
  }
}

MassOperationsHandler.prototype.selectAll = function () {
  const gesture = this.workspace && this.workspace.getGesture(e);
  if (gesture) gesture.dispose();

  const selected = common.getSelected();
  if (selected) selected.unselect();

  this.workspace_.getAllBlocks().forEach(block => {
    this.addBlockToSelected(block)
  })
}

/**
 * Show the context menu for selected group.
 * @param {!Event} e Mouse event.
 * @package
 */
MassOperationsHandler.prototype.showContextMenu = function(e) {
  e.preventDefault()
  e.stopPropagation()

  if (!this.selectedBlocks_.length) return

  const menuOptions = this.generateContextMenu();

  if (menuOptions && menuOptions.length) {
    ContextMenu.show(e, menuOptions, this.RTL);
    ContextMenu.setCurrentBlock(this);
  }
};

/**
 * Generate the context menu for the selected blocks.
 * @return {?Array<!Object>} Context menu options or null if no menu.
 * @protected
 */
MassOperationsHandler.prototype.generateContextMenu = function() {
  if (this.workspace_.options.readOnly) return null;

  const menuOptions = ContextMenuRegistry.registry.getContextMenuOptions(
    ContextMenuRegistry.ScopeType.GROUP, { blocks: this.selectedBlocks_ }
  );

  menuOptions.push({
    text: Msg['DELETE_ALL_SELECTED'],
    callback: () => {
      this.deleteAll()
    },
    enabled: true
  });

  if (this.workspace_.options.showModuleBar && this.workspace_.getModuleManager().getAllModules().length > 1) {
    const aBlock = this.selectedBlocks_[0]

    const moduleManager = this.workspace_.getModuleManager()

    moduleManager.getAllModules().forEach((module) => {
      if (aBlock.getModuleId() !== module.getId()) {
        menuOptions.push({
          text: Msg['MOVE_SELECTED_BLOCKS_TO_MODULE'].replace('%1', module.name),
          enabled: true,
          callback: () => {
            moduleManager.moveBlocksToModule(this.selectedBlocks_, module)
            this.cleanUp()
          }
        });
      }
    });
  }

  return menuOptions;
};

exports.MassOperationsHandler = MassOperationsHandler;
