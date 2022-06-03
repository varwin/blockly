/**
  * @license
  * Copyright 2011 Google LLC
  * SPDX-License-Identifier: Apache-2.0
  */

/**
  * @fileoverview Flyout bookmarks for faster picking blocks category
  */
'use strict';

/**
  * Flyout bookmarks for faster picking blocks category
  * @class
  */
goog.module('Blockly.FlyoutBookmarks');

/**
  * Class for a flyout bookmarks.
  * @constructor
  * @alias Blockly.FlyoutBookmarks
  */
const FlyoutBookmarks = function(flyout) {
   this.flyout_ = flyout;
   this.inserted = false;
   this.bookamrks_ = [];
};

FlyoutBookmarks.prototype.show = function() {
  if (!this.flyout_.buttons_.length) return;
  
  if (!this.inserted) {
    this.rootDiv_ = document.createElement('div');
    this.rootDiv_.classList.add('blocklyFlyoutBookmarks');

    // insert close button after the flyout svg
    const flyoutSVG = this.flyout_.workspace_.getParentSvg();
    flyoutSVG.parentElement.insertBefore(this.rootDiv_, flyoutSVG.nextSibling);
    this.inserted = true;
  }

  this.hide();

  const flyoutSVG = this.flyout_.workspace_.getParentSvg();
  const flyoutParentEl = flyoutSVG.parentElement;

  const flyoutClientRect = flyoutSVG.getBoundingClientRect();
  const flyoutParentClientRect = flyoutParentEl.getBoundingClientRect();

  const top = flyoutClientRect.top - flyoutParentClientRect.top + 40; // gap in top
  const left = flyoutClientRect.right - flyoutParentClientRect.left;

  this.rootDiv_.style.top = `${top}px`;
  this.rootDiv_.style.left = `${left}px`;
  this.rootDiv_.style.display = 'block';

  this.createBookmarks_();
};

FlyoutBookmarks.prototype.createBookmarks_ = function() {
  this.flyout_.buttons_
    .filter((button) => button.isLabel)
    .forEach((button) => {
      this.createBookmark_(button);
    });
};

FlyoutBookmarks.prototype.createBookmark_ = function(button) {
  const bookmarkDiv = document.createElement('div');
  bookmarkDiv.classList.add('blocklyFlyoutBookmark');
  bookmarkDiv.textContent = button.info.text;

  this.rootDiv_.appendChild(bookmarkDiv);
  this.bookamrks_.push(bookmarkDiv);
};

FlyoutBookmarks.prototype.hide = function() {
  if (this.rootDiv_) this.rootDiv_.style.display = 'none';

  this.bookamrks_.forEach((b) => b.remove());
  this.bookamrks_ = [];
};

FlyoutBookmarks.prototype.removeDom_ = function() {
  this.bookamrks_.forEach((b) => b.remove());
  this.bookamrks_ = [];

  if (this.rootDiv_) this.rootDiv_.remove();
};

exports.FlyoutBookmarks = FlyoutBookmarks;
 
