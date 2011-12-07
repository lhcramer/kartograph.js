(function() {

  /*
      svgmap - a simple toolset that helps creating interactive thematic maps
      Copyright (C) 2011  Gregor Aisch
  
      This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.
  
      This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.
  
      You should have received a copy of the GNU General Public License
      along with this program.  If not, see <http://www.gnu.org/licenses/>.
  */

  var Categories, Color, ColorBrewerCategories, ColorBrewerDiverging, ColorBrewerRamp, ColorScale, Diverging, Ramp, cb, root, svgmap, _base, _base2, _ref, _ref2, _ref3, _ref4;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  svgmap = (_ref = root.svgmap) != null ? _ref : root.svgmap = {};

  if ((_ref2 = svgmap.color) == null) svgmap.color = {};

  Color = (function() {

    /*
    	data type for colors
    	
    	eg.
    	new Color() // white
    	new Color(120,.8,.5) // defaults to hsl color
    	new Color([120,.8,.5]) // this also works
    	new Color(255,100,50,'rgb') //  color using RGB
    	new Color('#ff0000') // or hex value
    */

    function Color(x, y, z, m) {
      var me, _ref3;
      me = this;
      if (!(x != null) && !(y != null) && !(z != null) && !(m != null)) {
        x = [0, 1, 1];
      }
      if (typeof x === "object" && x.length === 3) {
        m = y;
        _ref3 = x, x = _ref3[0], y = _ref3[1], z = _ref3[2];
      }
      if (typeof x === "string" && x.length === 7) {
        m = 'hex';
      } else {
        if (m == null) m = 'hsl';
      }
      if (m === 'rgb') {
        me.rgb = [x, y, z];
      } else if (m === 'hsl') {
        me.rgb = Color.hsl2rgb(x, y, z);
      } else if (m === 'hsv') {
        me.rgb = Color.hsv2rgb(x, y, z);
      } else if (m === 'hex') {
        me.rgb = Color.hex2rgb(x);
      }
    }

    Color.prototype.hex = function() {
      return Color.rgb2hex(this.rgb);
    };

    Color.prototype.toString = function() {
      return this.hex();
    };

    Color.prototype.hsl = function() {
      return Color.rgb2hsl(this.rgb);
    };

    Color.prototype.hsv = function() {
      return Color.rgb2hsv(this.rgb);
    };

    Color.prototype.interpolate = function(f, col, m) {
      /*
      		interpolates between two colors
      		eg
      		new Color('#ff0000').interpolate(0.5, new Color('#0000ff')) == '0xffff00'
      */
      var dh, hue, hue0, hue1, lbv, lbv0, lbv1, me, sat, sat0, sat1, xyz0, xyz1;
      me = this;
      if (m == null) m = 'hsl';
      if (m === 'hsl' || m === 'hsv') {
        if (m === 'hsl') {
          xyz0 = me.hsl();
          xyz1 = col.hsl();
        } else if (m === 'hsv') {
          xyz0 = me.hsv();
          xyz1 = col.hsv();
        }
        hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
        hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
        if (!isNaN(hue0) && !isNaN(hue1)) {
          if (hue1 > hue0 && hue1 - hue0 > 180) {
            dh = hue1 - (hue0 + 360);
          } else if (hue1 < hue0 && hue0 - hue1 > 180) {
            dh = hue1 + 360 - hue0;
          } else {
            dh = hue1 - hue0;
          }
          hue = hue0 + f * dh;
        } else if (!isNaN(hue0)) {
          hue = hue0;
          if (lbv1 === 1 || lbv1 === 0) sat = sat0;
        } else if (!isNaN(hue1)) {
          hue = hue1;
          if (lbv0 === 1 || lbv0 === 0) sat = sat1;
        } else {
          hue = void 0;
        }
        if (sat == null) sat = sat0 + f * (sat1 - sat0);
        lbv = lbv0 + f * (lbv1 - lbv0);
        return new Color(hue, sat, lbv, m);
      } else if (m === 'rgb') {
        xyz0 = me.rgb;
        xyz1 = col.rgb;
        return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
      } else {
        throw "color mode " + m + " is not supported";
      }
    };

    return Color;

  })();

  Color.hex2rgb = function(hex) {
    var b, g, r, u;
    u = parseInt(hex.substr(1), 16);
    r = u >> 16;
    g = u >> 8 & 0xFF;
    b = u & 0xFF;
    return [r, g, b];
  };

  Color.rgb2hex = function(r, g, b) {
    var str, u, _ref3;
    if (r !== void 0 && r.length === 3) {
      _ref3 = r, r = _ref3[0], g = _ref3[1], b = _ref3[2];
    }
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16).toUpperCase();
    return "#" + str.substr(str.length - 6);
  };

  Color.hsv2rgb = function(h, s, v) {
    var b, f, g, i, l, p, q, r, t, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
    if (h !== void 0 && h.length === 3) {
      _ref3 = h, h = _ref3[0], s = _ref3[1], l = _ref3[2];
    }
    v *= 255;
    if (s === 0 && isNaN(h)) {
      r = g = b = v;
    } else {
      if (h === 360) h = 0;
      h /= 60;
      i = Math.floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          _ref4 = [v, t, p], r = _ref4[0], g = _ref4[1], b = _ref4[2];
          break;
        case 1:
          _ref5 = [q, v, p], r = _ref5[0], g = _ref5[1], b = _ref5[2];
          break;
        case 2:
          _ref6 = [p, v, t], r = _ref6[0], g = _ref6[1], b = _ref6[2];
          break;
        case 3:
          _ref7 = [p, q, v], r = _ref7[0], g = _ref7[1], b = _ref7[2];
          break;
        case 4:
          _ref8 = [t, p, v], r = _ref8[0], g = _ref8[1], b = _ref8[2];
          break;
        case 5:
          _ref9 = [v, p, q], r = _ref9[0], g = _ref9[1], b = _ref9[2];
      }
    }
    return [r, g, b];
  };

  /*
  	this.hsv2rgb = function() {
  		var h = this.h, s = this.s, _rgb = this._rgb, v = this.v*255, i, f, p, q, t;
  		
  		if (this.s === 0 && isNaN(h)) {
  			this.r = this.g = this.b = v;
  		} else {
  			if (h == 360) h = 0;
  			h /= 60;
  			i = Math.floor(h);
  			f = h - i;
  			p = v * (1 - s);
  			q = v * (1 - s * f);
  			t = v * (1 - s * (1 - f));
  			
  			switch (i) {
  				case 0: _rgb(v, t, p); break;
  				case 1: _rgb(q, v, p); break;
  				case 2: _rgb(p, v, t); break;
  				case 3: _rgb(p, q, v); break;
  				case 4: _rgb(t, p, v); break;
  				case 5: _rgb(v, p, q); 
  			}
  		}			
  	};
  	
  this.rgb2hsv = function() {
  		var min = Math.min(Math.min(this.r, this.g), this.b),
  			max = Math.max(Math.max(this.r, this.g), this.b),
  			delta = max - min;
  		
  		this.v = max/255;
  		this.s = delta / max;
  		if (this.s === 0) {
  			this.h = undefined;
  		} else {
  			if (this.r == max) this.h = (this.g - this.b) / delta;
  			if (this.g == max) this.h = 2+(this.b - this.r) / delta;
  			if (this.b == max) this.h = 4+(this.r - this.g) / delta;
  			this.h *= 60;
  			if (this.h < 0) this.h += 360;
  		}
  	};
  */

  Color.rgb2hsv = function(r, g, b) {
    var delta, h, max, min, s, v, _ref3;
    if (r !== void 0 && r.length === 3) {
      _ref3 = r, r = _ref3[0], g = _ref3[1], b = _ref3[2];
    }
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    console.log(r, g, b, min, max, delta);
    v = max / 255.0;
    s = delta / max;
    if (s === 0) {
      h = void 0;
      s = 0;
    } else {
      if (r === max) h = (g - b) / delta;
      if (g === max) h = 2 + (b - r) / delta;
      if (b === max) h = 4 + (r - g) / delta;
      h *= 60;
      if (h < 0) h += 360;
    }
    return [h, s, v];
  };

  Color.hsl2rgb = function(h, s, l) {
    var b, c, g, i, r, t1, t2, t3, _ref3, _ref4;
    if (h !== void 0 && h.length === 3) {
      _ref3 = h, h = _ref3[0], s = _ref3[1], l = _ref3[2];
    }
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = 0; i <= 2; i++) {
        if (t3[i] < 0) t3[i] += 1;
        if (t3[i] > 1) t3[i] -= 1;
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      _ref4 = [Math.round(c[0] * 255), Math.round(c[1] * 255), Math.round(c[2] * 255)], r = _ref4[0], g = _ref4[1], b = _ref4[2];
    }
    return [r, g, b];
  };

  Color.rgb2hsl = function(r, g, b) {
    var h, l, max, min, s, _ref3;
    if (r !== void 0 && r.length === 3) {
      _ref3 = r, r = _ref3[0], g = _ref3[1], b = _ref3[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = void 0;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) h += 360;
    return [h, s, l];
  };

  Color.hsl = function(h, s, l) {
    return new Color(h, s, l, 'hsl');
  };

  Color.rgb = function(r, g, b) {
    return new Color(r, g, b, 'rgb');
  };

  Color.hex = function(x) {
    return new Color(x);
  };

  svgmap.color.Color = Color;

  ColorScale = (function() {

    /*
    	base class for color scales
    */

    function ColorScale(colors, positions, mode, nacol) {
      var c, me, _ref3;
      if (nacol == null) nacol = '#cccccc';
      me = this;
      for (c = 0, _ref3 = colors.length - 1; 0 <= _ref3 ? c <= _ref3 : c >= _ref3; 0 <= _ref3 ? c++ : c--) {
        if (typeof colors[c] === "string") colors[c] = new Color(colors[c]);
      }
      me.colors = colors;
      me.pos = positions;
      me.mode = mode;
      me.nacol = nacol;
    }

    ColorScale.prototype.getColor = function(value) {
      var col, f, f0, i, me, p, _ref3;
      me = this;
      if (isNaN(value)) return me.nacol;
      value = me.classifyValue(value);
      f = f0 = (value - me.min) / (me.max - me.min);
      f = Math.min(1, Math.max(0, f));
      for (i = 0, _ref3 = me.pos.length - 1; 0 <= _ref3 ? i <= _ref3 : i >= _ref3; 0 <= _ref3 ? i++ : i--) {
        p = me.pos[i];
        if (f <= p) {
          col = me.colors[i];
          break;
        }
        if (f >= p && i === me.pos.length - 1) {
          col = me.colors[i];
          break;
        }
        if (f > p && f < me.pos[i + 1]) {
          f = (f - p) / (me.pos[i + 1] - p);
          col = me.colors[i].interpolate(f, me.colors[i + 1], me.mode);
          break;
        }
      }
      return col;
    };

    ColorScale.prototype.setClasses = function(numClasses, method, limits) {
      var self;
      if (numClasses == null) numClasses = 5;
      if (method == null) method = 'equalinterval';
      if (limits == null) limits = [];
      /*
      		# use this if you want to display a limited number of data classes
      		# possible methods are "equalinterval", "quantiles", "custom"
      */
      self = this;
      self.classMethod = method;
      self.numClasses = numClasses;
      self.classLimits = limits;
    };

    ColorScale.prototype.parseData = function(data, data_col) {
      var h, i, id, limits, max, method, min, num, p, pb, pr, row, self, sum, val, values, _ref3, _ref4;
      self = this;
      min = Number.MAX_VALUE;
      max = Number.MAX_VALUE * -1;
      sum = 0;
      values = [];
      for (id in data) {
        row = data[id];
        val = data_col != null ? row[data_col] : row;
        if (!self.validValue(val)) continue;
        min = Math.min(min, val);
        max = Math.max(max, val);
        values.push(val);
        sum += val;
      }
      values = values.sort();
      if (values.length % 2 === 1) {
        self.median = values[Math.floor(values.length * 0.5)];
      } else {
        h = values.length * 0.5;
        self.median = values[h - 1] * 0.5 + values[h] * 0.5;
      }
      self.values = values;
      self.mean = sum / values.length;
      self.min = min;
      self.max = max;
      method = self.classMethod;
      num = self.numClasses;
      limits = self.classLimits;
      if (method != null) {
        if (method === "equalinterval") {
          for (i = 1, _ref3 = num - 1; 1 <= _ref3 ? i <= _ref3 : i >= _ref3; 1 <= _ref3 ? i++ : i--) {
            limits.push(min + (i / num) * (max - min));
          }
        } else if (method === "quantiles") {
          for (i = 1, _ref4 = num - 1; 1 <= _ref4 ? i <= _ref4 : i >= _ref4; 1 <= _ref4 ? i++ : i--) {
            p = values.length * i / num;
            pb = Math.floor(p);
            if (pb === p) {
              limits.push(values[pb]);
            } else {
              pr = p - pb;
              limits.push(values[pb] * pr + values[pb + 1] * (1 - pr));
            }
          }
        }
        limits.unshift(min);
        limits.push(max);
      }
    };

    ColorScale.prototype.classifyValue = function(value) {
      var i, limits, maxc, minc, n, self;
      self = this;
      limits = self.classLimits;
      if (limits != null) {
        n = limits.length(-1);
        i = self.getClass(value);
        value = limits[i] + (limits[i + 1] - limits[i]) * 0.5;
        minc = limits[0] + (limits[1] - limits[0]) * 0.3;
        maxc = limits[n - 1] + (limits[n] - limits[n - 1]) * 0.7;
        value = self.min + ((value - minc) / (maxc - minc)) * (self.max - self.min);
      }
      return value;
    };

    ColorScale.prototype.getClass = function(value) {
      var i, limits, n, self;
      self = this;
      limits = self.classLimits;
      if (limits != null) {
        n = limits.length - 1;
        i = 0;
        while (i < n && value >= limits[i]) {
          i++;
        }
        return i - 1;
      }
    };

    ColorScale.prototype.validValue = function(value) {
      return !isNaN(value);
    };

    return ColorScale;

  })();

  if ((_ref3 = (_base = svgmap.color).scale) == null) _base.scale = {};

  Ramp = (function() {

    __extends(Ramp, ColorScale);

    function Ramp(col0, col1, mode) {
      if (col0 == null) col0 = '#fe0000';
      if (col1 == null) col1 = '#feeeee';
      if (mode == null) mode = 'hsl';
      Ramp.__super__.constructor.call(this, [col0, col1], [0, 1], mode);
    }

    return Ramp;

  })();

  svgmap.color.scale.Ramp = Ramp;

  Diverging = (function() {

    __extends(Diverging, ColorScale);

    function Diverging(col0, col1, col2, center, mode) {
      var me;
      if (col0 == null) col0 = '#d73027';
      if (col1 == null) col1 = '#ffffbf';
      if (col2 == null) col2 = '#1E6189';
      if (center == null) center = 'mean';
      if (mode == null) mode = 'hsl';
      me = this;
      me.mode = mode;
      me.center = center;
      Diverging.__super__.constructor.call(this, [col0, col1, col2], [0, .5, 1], mode);
    }

    Diverging.prototype.parseData = function(data, data_col) {
      var c, me;
      Diverging.__super__.parseData.call(this, data, data_col);
      me = this;
      c = me.center;
      if (c === 'median') {
        c = me.median;
      } else if (c === 'mean') {
        c = me.mean;
      }
      return me.pos[1] = (c - me.min) / (me.max - me.min);
    };

    return Diverging;

  })();

  svgmap.color.scale.Diverging = Diverging;

  Categories = (function() {

    __extends(Categories, ColorScale);

    function Categories(colors) {
      var me;
      me = this;
      me.colors = colors;
    }

    Categories.prototype.parseData = function(data, data_col) {};

    Categories.prototype.getColor = function(value) {
      var me;
      me = this;
      if (me.colors.hasOwnProperty(value)) {
        return me.colors[value];
      } else {
        return '#cccccc';
      }
    };

    Categories.prototype.validValue = function(value) {
      return this.colors.hasOwnProperty(value);
    };

    return Categories;

  })();

  svgmap.color.scale.Categories = Categories;

  svgmap.color.scale.COOL = new Ramp(Color.hsl(180, 1, .9), Color.hsl(250, .7, .4));

  svgmap.color.scale.HOT = new ColorScale(['#000000', '#ff0000', '#ffff00', '#ffffff'], [0, .25, .75, 1], 'rgb');

  svgmap.color.scale.BWO = new Diverging(Color.hsl(30, 1, .55), '#ffffff', new Color(220, 1, .55));

  svgmap.color.scale.GWP = new Diverging(Color.hsl(120, .8, .4), '#ffffff', new Color(280, .8, .4));

  ColorBrewerRamp = (function() {

    __extends(ColorBrewerRamp, ColorScale);

    function ColorBrewerRamp(name, colors) {
      var cols, me, _i, _len;
      me = this;
      me.name = name;
      me.cbcc = {};
      for (_i = 0, _len = colors.length; _i < _len; _i++) {
        cols = colors[_i];
        me.cbcc[cols.length] = cols;
      }
      me.setClasses(7);
    }

    ColorBrewerRamp.prototype.setClasses = function(numClasses, method, limits) {
      var me;
      if (numClasses == null) numClasses = 5;
      if (method == null) method = 'equalinterval';
      if (limits == null) limits = [];
      me = this;
      if (me.cbcc.hasOwnProperty(numClasses)) {
        return ColorBrewerRamp.__super__.setClasses.call(this, numClasses, method, limits);
      } else {
        throw 'number of colors is not supported by color scale ' + me.name;
      }
    };

    ColorBrewerRamp.prototype.getColor = function(value) {
      var c, me;
      me = this;
      c = me.getClass(value);
      return me.cbcc[me.numClasses][c];
    };

    return ColorBrewerRamp;

  })();

  ColorBrewerDiverging = (function() {

    function ColorBrewerDiverging() {}

    return ColorBrewerDiverging;

  })();

  ColorBrewerCategories = (function() {

    function ColorBrewerCategories() {}

    return ColorBrewerCategories;

  })();

  cb = (_ref4 = (_base2 = svgmap.color.scale).colorbrewer) != null ? _ref4 : _base2.colorbrewer = {};

  cb.PuRd = new ColorBrewerRamp("PuRd", [['#e7e1ef', '#c994c7', '#dd1c77'], ['#f1eef6', '#d7b5d8', '#df65b0', '#ce1256'], ['#f1eef6', '#d7b5d8', '#df65b0', '#dd1c77', '#980043'], ['#f1eef6', '#d4b9da', '#c994c7', '#df65b0', '#dd1c77', '#980043'], ['#f1eef6', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'], ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'], ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f']]);

  cb.Blues = new ColorBrewerRamp("Blues", [['#deebf7', '#9ecae1', '#3182bd'], ['#eff3ff', '#bdd7e7', '#6baed6', '#2171b5'], ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'], ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#3182bd', '#08519c'], ['#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'], ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#084594'], ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b']]);

  cb.PuBuGn = new ColorBrewerRamp("PuBuGn", [['#ece2f0', '#a6bddb', '#1c9099'], ['#f6eff7', '#bdc9e1', '#67a9cf', '#02818a'], ['#f6eff7', '#bdc9e1', '#67a9cf', '#1c9099', '#016c59'], ['#f6eff7', '#d0d1e6', '#a6bddb', '#67a9cf', '#1c9099', '#016c59'], ['#f6eff7', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016450'], ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016450'], ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636']]);

}).call(this);
