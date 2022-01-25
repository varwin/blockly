/**
 * @license
 * Copyright 2022 OMV LLC (Varwin)
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class for mass operations
 */
'use strict';

/**
 * Base class for mass operations
 * @class
 */
goog.module('Blockly.MassOperations.Base');

const { WorkspaceSvg } = goog.requireType('Blockly.WorkspaceSvg');
//  /** @suppress {extraRequire} */
//  goog.require('Blockly.Events.BlockMove');

/**
 * Class for a block's SVG representation.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!WorkspaceSvg} workspace The block's workspace.
 * @constructor
 * @alias Blockly.MassOperations.Base
 */
const MassOperationsBase = function (workspace) {
  this.workspace_ = workspace
}


exports.MassOperationsBase = MassOperationsBase;
