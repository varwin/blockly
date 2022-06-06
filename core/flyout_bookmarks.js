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
  bookmarkDiv.style.backgroundColor = categoryColor;
  bookmarkDiv.style.boxShadow = `inset -2px 0px 2px ${categoryColor}`;

  const firstCharSpan = document.createElement('span');
  const fullTextSpan = document.createElement('span');
  fullTextSpan.classList.add('blocklyFlyoutBookmarkFullText');

  bookmarkDiv.appendChild(firstCharSpan);
  bookmarkDiv.appendChild(fullTextSpan);

  firstCharSpan.textContent = button.info.text.charAt(0);
  fullTextSpan.textContent = button.info.text.slice(1);

  this.rootDiv_.appendChild(bookmarkDiv);

  const callback = () => {
    if (this.flyout_.isScrollable()) {
      const buttonPosition = button.position_.y;
      const flyoutScale = this.flyout_.workspace_.scale;
      const buttonHeight = button.svgGroup_.getBBox().height;
      const targetY = (buttonPosition * flyoutScale) - (buttonHeight * flyoutScale * 2);

      this.workspace_.scrollbar.setY(targetY);
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
 
