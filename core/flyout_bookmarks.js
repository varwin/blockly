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

const FlyoutBookmarks = function(flyout) {
   this.flyout_ = flyout;
   this.workspace_ = flyout.workspace_;
   this.inserted = false;
   this.bookmarks_ = [];
   window.bkmrks = this; // TODO
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
  this.rootDiv_.style.display = 'flex';

  this.createBookmarks_();
};

FlyoutBookmarks.prototype.createBookmarks_ = function() {
  this.flyout_.buttons_
    .filter((button) => button.isLabel())
    .forEach((button) => {
      this.createBookmark_(button);
    });
};

FlyoutBookmarks.prototype.createBookmark_ = function(button) {
  const bookmarkDiv = document.createElement('div');
  bookmarkDiv.classList.add('blocklyFlyoutBookmark');

  const categoryColor = getComputedStyle(button.svgText_).fill;
  bookmarkDiv.style.color = categoryColor;
  bookmarkDiv.style.boxShadow = `inset -2px 0px 2px ${categoryColor}`;

  const textWrapper = document.createElement('div');
  textWrapper.classList.add('blocklyFlyoutBookmarkText');

  bookmarkDiv.appendChild(textWrapper);

  textWrapper.textContent = button.info.text.slice(0, 5);

  this.rootDiv_.appendChild(bookmarkDiv);

  const callback = () => {
    if (this.flyout_.isScrollable()) {
      this.workspace_.scrollbar.setY(button.position_.y);
    }
  };

  bookmarkDiv.addEventListener('click', callback.bind(this));
  
  this.bookmarks_.push({
    div: bookmarkDiv,
    callback,
  });
};

FlyoutBookmarks.prototype.hide = function() {
  if (this.rootDiv_) this.rootDiv_.style.display = 'none';

  this.bookmarks_.forEach((bookmark) => {
    bookmark.div.removeEventListener('click', bookmark.callback);
    bookmark.div.remove();
  });
  this.bookmarks_ = [];
};

FlyoutBookmarks.prototype.removeDom_ = function() {
  this.bookmarks_.forEach((b) => b.remove());
  this.bookmarks_ = [];

  if (this.rootDiv_) this.rootDiv_.remove();
};

exports.FlyoutBookmarks = FlyoutBookmarks;
 
