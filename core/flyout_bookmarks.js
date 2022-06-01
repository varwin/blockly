/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Flyout bookmarks for faster picking blocks category
 */
 'use strict';

 /* eslint-disable-next-line no-unused-vars */
const {Flyout} = goog.require('Blockly.Flyout');

 /**
  * Flyout bookmarks for faster picking blocks category
  * @class
  */
 goog.module('Blockly.Flyout');
 
 /**
  * Class for a flyout bookmarks.
  * @param {!Flyout} flyout Parent flyout
  * @constructor
  * @alias Blockly.FlyoutBookmarks
  */
 const FlyoutBookmarks = function(flyout) {
  FlyoutBookmarks.superClass_.constructor.call(this);
 
   /**
    * @type {!Flyout}
    * @protected
    */
   this.flyout_ = flyout;
 };

 FlyoutBookmarks.prototype.createDom = function() {
   
 };

 
 exports.FlyoutBookmarks = FlyoutBookmarks;
 
