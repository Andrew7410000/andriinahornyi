var eventCache = new Array();

function EventCache(obj, type, fn) {
  this.obj = obj;
  this.type = type;
  this.fn = fn;
}

function addEvent(obj, type, fn) {
  if(obj.addEventListener) {
    obj.addEventListener(type, fn, false);
  } else {
    obj["e"+type+fn] = fn;
    obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
    obj.attachEvent( "on"+type, fn);
  }
  eventCache[eventCache.length] = new EventCache(obj, type, fn);
}

function bindEvent(obj, type, targetObj, fn) {
  var closure = fn.closure(targetObj);
    
  if(obj.addEventListener) {
    obj.addEventListener(type, closure, false);
  } else {
    obj["e"+type+fn] = fn;
    obj[type+fn] = function() { obj["e"+type+fn]( window.event ); }
    obj.attachEvent( "on"+type, closure);
  }	
  eventCache[eventCache.length] = new EventCache(obj, type, fn);
}

function clearEvents() {
  for (var i = 0; i < eventCache.length; i++) {
    var evt = eventCache[i];
    try {
      if (evt.obj && evt.fn) {
        if (evt.obj.removeEventListener)
          evt.obj.removeEventListener(evt.type, evt.fn, true);
        else
          evt.obj.detachEvent("on"+evt.type, evt.fn);
      }
    } catch (e) {
      alert("Error on " + i + " : " + e.message);
    }
  }
}
addEvent(window, "unload", clearEvents);

// From http://laurens.vd.oever.nl/weblog/items2005/closures/
Function.prototype.closure = function(obj) {
  // Init object storage.
  if (!window.__objs) {
    window.__objs = [];
    window.__funs = [];
  }

  // For symmetry and clarity.
  var fun = this;

  // Make sure the object has an id and is stored in the object store.
  var objId = obj.__objId;
  if (!objId)
    __objs[objId = obj.__objId = __objs.length] = obj;

  // Make sure the function has an id and is stored in the function store.
  var funId = fun.__funId;
  if (!funId)
    __funs[funId = fun.__funId = __funs.length] = fun;

  // Init closure storage.
  if (!obj.__closures)
    obj.__closures = [];

  // See if we previously created a closure for this object/function pair.
  var closure = obj.__closures[funId];
  if (closure)
    return closure;

  // Clear references to keep them out of the closure scope.
  obj = null;
  fun = null;

  // Create the closure, store in cache and return result.
  return __objs[objId].__closures[funId] = function ()
  {
    return __funs[funId].apply(__objs[objId], arguments);
  };
};
