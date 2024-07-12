// requires global.js -- NEEDS Function.prototype.closure = function(obj){...} from global.js
function MLoader(map, statusElement, textElement, barElement, fillElement, cancelButton, tally) {
  this.map = map;
  this.statusElement = statusElement;
  this.bar = barElement;
  this.fill = fillElement;
  this.textElement = textElement;
  this.cancelButton = cancelButton;
  this.tally = tally
}
MLoader.prototype.map = null;
MLoader.prototype.statusElement = null;
MLoader.prototype.textElement = null;
MLoader.prototype.cancelButton = null;
MLoader.prototype.bar = null;
MLoader.prototype.fill = null;
MLoader.prototype.counter = 0;
MLoader.prototype.show = function (text, allowCancel) {
  // this.map.disableDragging();
  this.statusElement.style.display = "";
  this.statusElement.style.left = (document.body.clientWidth - 160)/2 + "px";
  this.textElement.innerHTML = text;
  if (allowCancel)
    this.cancelButton.style.display = "";
  else
    this.cancelButton.style.display = "none";
  this.counter++;
}
MLoader.prototype.hide = function (force) {
  if (force)
    this.counter = 0;
  else if (this.counter > 0)
    this.counter--;
        
  if (this.counter == 0) {
    this.fill.style.width = "1px";
    this.statusElement.style.display = "none";
    // this.map.enableDragging();
  }
}
MLoader.prototype.queue = null;
MLoader.prototype.add = function (o, f, a) {
 if (!this.queue)
   this.queue = new Array();        
  this.queue[this.queue.length] = _MOneTimeClosure(o,f,a);
}
MLoader.prototype.queueCounter = 0;
MLoader.prototype.execute = function () {
  if ((this.queueCounter > 0) && (this.queue)) {
    this.fill.style.width = (100 * this.queueCounter / this.queue.length) + "%";
    this.tally.innerHTML = this.queueCounter + ' records of ' + this.queue.length;
  } else {
    this.fill.style.width = "1px";
  }
    
  var stopAt = this.queueCounter + 10;
  while ((this.queue) && (this.queueCounter < this.queue.length) && (this.queueCounter < stopAt)) {
    this.queue[this.queueCounter]();
    this.queue[this.queueCounter++] = null;
  }
    
  if ((this.queue) && (this.queueCounter < this.queue.length)) {
    setTimeout(this.execute.closure(this), 50);
  } else {
    for (var i = 0; (this.queue) && (i < this.queue.length); i++)
       this.queue[i] = null;
    this.queue = null;
    this.queueCounter = 0;
    this.hide(true);
  }
}
MLoader.prototype.cancel = function () {
  for (var i = 0; (this.queue) && (i < this.queue.length); i++)
    this.queue[i] = null;
  this.queue = null;
  this.queueCounter = 0;
  this.hide(true);
}

// Executes once and removes all references
function _MOneTimeClosure (h, f, a) {
  return (function() {
    hf = f;
    hf(a);
    a = null;
    hf = null;
    h = null;
  });
}
