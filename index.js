var _ = require('lodash');

module.exports = function (opts) {
  var defaults = {
    ns: 'select',
    optionId: 'id',
    viewLoading: 'loading',
    viewOption: 'option',
    viewSelection: 'selection'
  };

  opts = _.merge(defaults, opts || {});

  function Component () {}

  Component.prototype.view = __dirname;

  Component.prototype.init = function () {
    this.model.setNull('ns', opts.ns);
    this.model.setNull('viewOption', opts.viewOption);
    this.model.setNull('viewSelection', opts.viewSelection);

    this.model.start('selected', 'selectedIds', 'data',
      function (selectedIds, data) {
        var ids = _.keys(selectedIds || {});
        return _.filter(data, function (obj) {
          return obj ? _.contains(ids, obj.id) : false;
        });
      }
    );

    this.model.start('value', 'selectedIds', {
      get: function (selectedIds) {
        return _.keys(selectedIds);
      },
      set: function (value, selectedIds) {
        function fn(id) { return [id, true]; }
        return [_(selectedIds).map(fn).zipObject().value()];
      }
    });
  };

  Component.prototype.create = function () {
    var self = this;

    this.dom.on('keydown', function (e) {
      if (!self.model.get('focus')) return;
      var escape = e.keyCode === 27;
      if (escape) return self.close();
    });
  };

  Component.prototype.focus = function () {
    this.model.set('focus', true);
    this.emit('focus');
    this.open();
  };

  Component.prototype.blur = function () {
    this.model.del('focus');
    this.emit('blur');
    this.close();
  };

  Component.prototype.open = function () {
    if (this.model.get('open')) return;
    this.model.set('open', true);
    this.emit('open');
  };

  Component.prototype.close = function () {
    if (!this.model.get('open')) return;
    this.model.del('open');
    this.emit('close');
  };

  Component.prototype.clear = function () {
    this.model.del('text');
    this.emit('query', '');
  };

  Component.prototype.optionId = function (option) {
    return (typeof option === 'object') ?
      option[opts.optionId] :
      option;
  };

  Component.prototype.input = function (e) {
    this.open();
    this.deselect();
    this.emit('query', e.target.value);
  };

  Component.prototype.reset = function () {
    this.clear();
    this.deselect();
    this.emit('reset');
  };

  Component.prototype.select = function (id) {
    var multiple = this.model.get('multiple');
    if (!multiple) this.model.del('selectedIds');
    this.model.set('selectedIds.' + id, true);
    if (multiple) this.clear();
    this.emit('select', id);
  };

  Component.prototype.deselect = function (id) {
    this.model.at('selectedIds').del(id || '');
    this.emit('deselect', id);
  };

  Component.prototype.pressOption = function (e) {
    // necessary to prevent the default event
    // of "onblur" from preventing "onclick"
    e.preventDefault();
  };

  Component.prototype.clickOption = function (e, id) {
    e.stopPropagation();
    this.select(id);
    this.blur();
  };

  return Component;
};
