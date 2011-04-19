/**
 * @fileoverview This file implementes the SlideController object, which
 * wraps a DOM element with logic that makes an otherwise flat page appear
 * to be a cleverly designed presentation.
 */

/**
 * Given an element on the page, handles user input to scroll through a set
 * of slides, adjusting the browser history correctly, and doing clever
 * things with simple transitions along the way.
 *
 * @param {string} id The ID of the DOM element at the root of the slides.
 * @constructor
 */
function SlideController(id) {
  this.id_ = id;
  this.title_ = document.title,
  this.root_ = document.getElementById(id);
  this.slides_ = document.querySelectorAll('#' + id + ' > *');
  this.HASH_REGEX = RegExp(this.HASH_PREFIX + '([0-9]+)' );
  this.init_();
}

/**
 * The keyCodes that we're interested in, mapped to meaningful names.
 *
 * @enum {number}
 */
SlideController.KeyCodes = {
  SPACE: 32,        // Next slide.
  PAGE_UP: 33,      // Previous slide.
  PAGE_DOWN: 34,    // Next slide.
  LEFT_ARROW: 37,   // Previous slide.
  RIGHT_ARROW: 39,  // Next slide.
  UPPERCASE_B: 66   // This is the only other button on my remote: It ought
                    // to blank the screen.
};

SlideController.prototype = {
  /**
   * The prefix added to the hash value at the end of the URL as the 
   * user navigates through the presentation.
   *
   * @type {!string}
   */
  HASH_PREFIX: '#slide-',

  /**
   * Are all the slides hidden (perhaps in response to a user pressing
   * "hide all" on his remote?)
   *
   * @type {!boolean}
   * @private
   */
  allHidden_: false,

  /**
   * The index of the currently visible slide.
   *
   * @type {number}
   * @private
   */
  current_: 0,

  /**
   * @return {!number} The number of slides that can be scrolled through.
   */
  get length() {
    return this.slides_.length;
  },

  /**
   * @return {!string} The page title appropriate for the current slide.
   */
  get title() {
    return this.title_ +  " -- Slide #" + this.current;
  },

  /**
   * @return {!number} The current slide's index.
   */
  get current() {
    return this.current_;
  },

  /**
   * This setter has side effects, and in fact drives most of the page's
   * logic. When an index is set, that slide's `aria-hidden` attribute is
   * set to `false`, and the previously current slide's attribute to `true`.
   * Additionally, the URL is updated, as well as the page's title, and   *
   * `focus` is placed upon the newly visible slide.
   *
   * @param {!number} num The index of the current slide.
   */
  set current(num) {
    if (this.current !== null && this.current !== num)
      this.slides_[this.current].setAttribute('aria-hidden', 'true');

    if (num >= 0 && num < this.length) {
      this.current_ = num;
      document.title = this.title;
      history.pushState(
          this.current,
          'Slide ' + this.current, '#slide-' + this.current);
    }

    this.slides_[this.current].setAttribute('aria-hidden', 'false');
    this.slides_[this.current].focus();
  },

  /**
   * @return {!boolean} Are all the slides hidden?
   */
  get allHidden() {
    return this.allHidden_;
  },

  /**
   * @param {!boolean} val Should all slides be hidden?
   */
  set allHidden(val) {
    this.allHidden_ = val;
    this.slides_[this.current].
        setAttribute('aria-hidden', val ? 'true' : 'false');
  },

  /**
   * Advances to the next slide, if there is a next slide.
   *
   * @return {!boolean} True if there was a next slide, false if we're
   *     already at the end.
   */
  next: function() {
    if (this.current < this.length) {
      this.current++;
      return true;
    }
    return false;
  },

  /**
   * Retreats to the previous slide, if there is a previous slide.
   *
   * @return {!boolean} True if there was a previous slide, false if we're
   *     already at the beginning.
   */
  prev: function() {
    if (this.current > 0) {
      this.current--;
      return true;
    }
    return false;
  },

  /**
   * Kicks things off by hiding all slides, then determines which slide
   * should be shown by either reading it from the hash value, or 
   * defaulting to the first element. After displaying the correct item,
   * event handlers are bound for keyboard/back-button navigation.
   *
   * @private
   */
  init_: function () {
    for (i=0; i < this.slides_.length; i++)
      this.slides_[i].setAttribute('aria-hidden', 'true'); 

    var match = this.HASH_REGEX.exec(window.location.hash);
    if (match && !isNaN(parseInt(match[1], 10)))
      this.current = parseInt(match[1], 10);
    else
      this.current = 0;

    this.bindHandlers_();
  },

  /**
   * Binds event handlers for keyboard/back-button navigation: left-arrow
   * and page-up both take me to the previous slide. Right-arrow, page-down,
   * and space all take me to the next slide. Uppercase B hides all slides,
   * focusing everyone's attention on whatever it is that you'd like to say.
   *
   * @private
   */
  bindHandlers_: function() {
    document.addEventListener(
        'keydown',
        (function (e) {

          switch (e.keyCode) {
            case SlideController.KeyCodes.PAGE_UP:
            case SlideController.KeyCodes.LEFT_ARROW:
              this.prev();
              break;

            case SlideController.KeyCodes.PAGE_DOWN:
            case SlideController.KeyCodes.RIGHT_ARROW:
            case SlideController.KeyCodes.SPACE:
              this.next();
              break;

            case SlideController.KeyCodes.UPPERCASE_B:
              this.allHidden = !this.allHidden;
              break;
          }
        }).bind(this),
        false);
    window.addEventListener(
        'popstate',
        (function (e) {
          if (e.state !== null)
            this.current = e.state;
        }).bind(this),
        false);
  }
};

