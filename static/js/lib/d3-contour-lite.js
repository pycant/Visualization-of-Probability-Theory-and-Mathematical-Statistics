(function () {
  function contours() {
    var _size = [1, 1];
    var _thresholds = [];
    
    function connectSegmentsToPolylines(segments) {
      if (segments.length === 0) return [];
      
      var tolerance = 1e-3;
      var keyOf = function(p) {
        return Math.round(p[0] / tolerance) * tolerance + "," + Math.round(p[1] / tolerance) * tolerance;
      };
      
      var adjacency = new Map();
      var used = new Array(segments.length).fill(false);
      
      segments.forEach(function(seg, idx) {
        var a = seg[0], b = seg[1];
        var ka = keyOf(a), kb = keyOf(b);
        
        if (!adjacency.has(ka)) adjacency.set(ka, []);
        if (!adjacency.has(kb)) adjacency.set(kb, []);
        
        adjacency.get(ka).push({ idx: idx, point: a, otherPoint: b, otherKey: kb });
        adjacency.get(kb).push({ idx: idx, point: b, otherPoint: a, otherKey: ka });
      });
      
      var polylines = [];
      
      for (var i = 0; i < segments.length; i++) {
        if (used[i]) continue;
        
        used[i] = true;
        var start = segments[i][0], end = segments[i][1];
        var line = [start, end];
        
        // Extend forward
        var currentKey = keyOf(end);
        while (true) {
          var neighbors = adjacency.get(currentKey) || [];
          var nextConnection = null;
          
          for (var j = 0; j < neighbors.length; j++) {
            if (used[neighbors[j].idx]) continue;
            nextConnection = neighbors[j];
            break;
          }
          
          if (!nextConnection) break;
          
          used[nextConnection.idx] = true;
          line.push(nextConnection.otherPoint);
          currentKey = nextConnection.otherKey;
        }
        
        // Extend backward
        currentKey = keyOf(start);
        while (true) {
          var neighbors = adjacency.get(currentKey) || [];
          var prevConnection = null;
          
          for (var j = 0; j < neighbors.length; j++) {
            if (used[neighbors[j].idx]) continue;
            prevConnection = neighbors[j];
            break;
          }
          
          if (!prevConnection) break;
          
          used[prevConnection.idx] = true;
          line.unshift(prevConnection.otherPoint);
          currentKey = prevConnection.otherKey;
        }
        
        if (line.length >= 3) {
          polylines.push(line);
        }
      }
      
      return polylines;
    }
    
    function smoothPolyline(points) {
      if (points.length < 3) return points;
      
      var smoothed = [points[0]];
      
      for (var i = 1; i < points.length - 1; i++) {
        var prev = points[i - 1];
        var curr = points[i];
        var next = points[i + 1];
        
        var smoothX = 0.25 * prev[0] + 0.5 * curr[0] + 0.25 * next[0];
        var smoothY = 0.25 * prev[1] + 0.5 * curr[1] + 0.25 * next[1];
        
        smoothed.push([smoothX, smoothY]);
      }
      
      smoothed.push(points[points.length - 1]);
      return smoothed;
    }
    
    function gen(values) {
      var baseW = _size[0],
        baseH = _size[1];
      var sets = [];
      
      for (var ti = 0; ti < _thresholds.length; ti++) {
        var t = _thresholds[ti];
        var segments = [];
        
        for (var y = 0; y < baseH - 1; y++) {
          for (var x = 0; x < baseW - 1; x++) {
            var i00 = y * baseW + x;
            var i10 = y * baseW + (x + 1);
            var i01 = (y + 1) * baseW + x;
            var i11 = (y + 1) * baseW + (x + 1);
            var v00 = values[i00];
            var v10 = values[i10];
            var v01 = values[i01];
            var v11 = values[i11];
            
            var edges = [];
            if (v00 < t !== v10 < t) {
              var r1 = (t - v00) / Math.max(1e-6, v10 - v00);
              edges.push([x + r1, y]);
            }
            if (v10 < t !== v11 < t) {
              var r2 = (t - v10) / Math.max(1e-6, v11 - v10);
              edges.push([x + 1, y + r2]);
            }
            if (v01 < t !== v11 < t) {
              var r3 = (t - v01) / Math.max(1e-6, v11 - v01);
              edges.push([x + r3, y + 1]);
            }
            if (v00 < t !== v01 < t) {
              var r4 = (t - v00) / Math.max(1e-6, v01 - v00);
              edges.push([x, y + r4]);
            }
            
            if (edges.length === 2) {
              segments.push([edges[0], edges[1]]);
            } else if (edges.length === 4) {
              segments.push([edges[0], edges[1]]);
              segments.push([edges[2], edges[3]]);
            }
          }
        }
        
        var polylines = connectSegmentsToPolylines(segments);
        var smoothedPolylines = polylines.map(smoothPolyline);
        var coords = smoothedPolylines.map(function(line) { return [line]; });
        
        sets.push({ value: t, coordinates: coords });
      }
      return sets;
    }
    
    gen.size = function (arr) {
      _size = arr;
      return gen;
    };
    gen.thresholds = function (ts) {
      _thresholds = ts;
      return gen;
    };
    return gen;
  }
  var root = typeof window !== "undefined" ? window : globalThis;
  root.d3 = root.d3 || {};
  root.d3.contours = contours;
})();
