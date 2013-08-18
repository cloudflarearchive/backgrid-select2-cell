/*
  backgrid-select2-cell
  http://github.com/wyuenho/backgrid

  Copyright (c) 2013 Jimmy Yuen Ho Wong and contributors
  Licensed under the MIT @license.
*/
(function (factory) {

  // CommonJS
  if (typeof exports == "object") {
    module.exports = factory(require("underscore"),
                             require("backgrid"));
  }
  // Browser
  else if (typeof _ !== "undefined" &&
           typeof Backgrid !== "undefined") {
    factory(_, Backgrid);
  }

}(function (_, Backgrid)  {

  /**
     Select2CellEditor is a cell editor that renders a `select2` select box
     instead of the default `<select>` HTML element.

     See:

       - [Select2](http://ivaynberg.github.com/select2/)

     @class Backgrid.Extension.Select2CellEditor
     @extends Backgrid.SelectCellEditor
   */
  var Select2CellEditor = Backgrid.Extension.Select2CellEditor = Backgrid.SelectCellEditor.extend({

    /** @property */
    events: {
      "change": "save",
      "select2-opening": "toggleOpening",
      "select2-open": "toggleOpen"
    },

    /** @property */
    select2Options: null,

    /** @property */
    opening: false,

    initialize: function () {
      Backgrid.SelectCellEditor.prototype.initialize.apply(this, arguments);
      this.close = _.bind(this.close, this);
    },

    /**
       Sets the options for `select2`. Called by the parent Select2Cell during
       edit mode.
     */
    setSelect2Options: function (options) {
      this.select2Options = _.extend({containerCssClass: "select2-container"},
                                     options || {});
    },

    /**
       Issues with the relatedTarget property on focusout / blur events in
       Firefox require that we track the opening state of the select2 combo.
     */
    toggleOpening: function (e) {
      this.opening = true;
    },

    /**
       Issues with the relatedTarget property on focusout / blur events in
       Firefox require that we track the opening state of the select2 combo.
     */
    toggleOpen: function (e) {
      this.opening = false;
    },

    /**
       Renders a `select2` select box instead of the default `<select>` HTML
       element using the supplied options from #select2Options.

       @chainable
     */
    render: function () {
      Backgrid.SelectCellEditor.prototype.render.apply(this, arguments);
      this.$el.select2(this.select2Options);
      this.delegateEvents();
      return this;
    },

    /**
       Returns the select2 container element
    */
    select2ContainerEl: function() {
      return this.$el.parent().find("." + this.select2Options.containerCssClass);
    },

    /**
       Attach event handlers to the select2 box and focus it.
    */
    postRender: function () {
      var self = this;

      this.select2ContainerEl()
        .on("focusout", function (e) {
          // Firefox behaves differently with regards to focusout
          // @see https://github.com/wyuenho/backgrid/issues/247

          var outside = e.currentTarget !== self.select2ContainerEl()[0];
          if (!e.relatedTarget && self.opening === false && outside) {
            self.close(e);
          }
        })
        .on("keydown", this.close)
        .attr("tabindex", -1).focus();
    },

    /**
       Triggers a `backgrid:edited` event from the model so the body can close
       this editor.
    */
    close: function (e) {
      var model = this.model;
      var column = this.column;
      var Command = Backgrid.Command;
      var command = new Command(e);
      if (command.cancel()) {
        e.stopPropagation();
        model.trigger("backgrid:edited", model, column, new Command(e));
      }
      else if (command.save() || command.moveLeft() || command.moveRight() ||
               command.moveUp() || command.moveDown() || e.type == "focusout") {
        e.preventDefault();
        e.stopPropagation();

        if (e.type == "focusout" && this.$el.find("option").length === 1) {
          model.set(column.get("name"), this.formatter.toRaw(this.$el.val(), model));
        }
        model.trigger("backgrid:edited", model, column, new Command(e));
      }
    },

    remove: function () {
      this.$el.select2("destroy");
      return Backgrid.SelectCellEditor.prototype.remove.apply(this, arguments);
    }
  });


  /**
     Select2Cell is a cell class that renders a `select2` select box during edit
     mode.

     @class Backgrid.Extension.Select2Cell
     @extends Backgrid.SelectCell
   */
  Backgrid.Extension.Select2Cell = Backgrid.SelectCell.extend({

    /** @property */
    className: "select2-cell",

    /** @property */
    editor: Select2CellEditor,

    /** @property */
    select2Options: null,

    /**
       Initializer.

       @param {Object} options
       @param {Backbone.Model} options.model
       @param {Backgrid.Column} options.column
       @param {Object} [options.select2Options]

       @throws {TypeError} If `optionsValues` is undefined.
     */
    initialize: function (options) {
      Backgrid.SelectCell.prototype.initialize.apply(this, arguments);
      this.select2Options = options.select2Options || this.select2Options;
      this.listenTo(this.model, "backgrid:edit", function (model, column, cell, editor) {
        if (column.get("name") == this.column.get("name")) {
          editor.setSelect2Options(this.select2Options);
        }
      });
    }

  });

}));
