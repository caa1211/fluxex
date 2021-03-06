/*global XMLHttpRequest, window, document, CustomEvent, Window, HTMLDocument*/
// IE8 XMLHttpRequest consts polyfill for browser-request
if (XMLHttpRequest && !XMLHttpRequest.OPENED) {
    XMLHttpRequest.UNSENT = 4;
    XMLHttpRequest.OPENED = 1;
    XMLHttpRequest.HEADERS_RECEIVED = 2;
    XMLHttpRequest.LOADING = 3;
    XMLHttpRequest.DONE = 4;
}

// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(global) {
    'use strict';
    global.console = global.console || {};
    var con = global.console;
    var prop, method;
    var empty = {};
    var dummy = function() {};
    var properties = 'memory'.split(',');
    var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
     'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
    while (prop = properties.pop()) if (!con[prop]) con[prop] = empty;
    while (method = methods.pop()) if (!con[method]) con[method] = dummy;
})(typeof window === 'undefined' ? this : window);

// From https://github.com/jonathantneal/EventListener
// CC0-1.0 License
// EventListener | CC0 | github.com/jonathantneal/EventListener
window.Element && window.Element.prototype.attachEvent && !window.Element.prototype.addEventListener && (function () {
    function addToPrototype(name, method) {
        Window.prototype[name] = HTMLDocument.prototype[name] = window.Element.prototype[name] = method;
    }

    // add
    addToPrototype('addEventListener', function (type, listener) {
        var self = this,
            listeners = self .addEventListener.listeners = self.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // if no events exist, attach the listener
        if (!typeListeners.length) {
            self.attachEvent('on' + type, typeListeners.event = function (event) {
                var documentElement = self.document && self.document.documentElement || self.documentElement || { scrollLeft: 0, scrollTop: 0 };

                // polyfill w3c properties and methods
                event.currentTarget = self;
                event.pageX = event.clientX + documentElement.scrollLeft;
                event.pageY = event.clientY + documentElement.scrollTop;
                event.preventDefault = function () {
                    event.returnValue = false;
                };
                event.relatedTarget = event.fromElement || null;
                event.stopImmediatePropagation = function () {
                    immediatePropagation = false;
                    event.cancelBubble = true;
                };
                event.stopPropagation = function () {
                    event.cancelBubble = true;
                };
                event.target = event.srcElement || self;
                event.timeStamp = +new Date();

                // create an cached list of the master events list (to protect this loop from breaking when an event is removed)
                for (var i = 0, typeListenersCache = [].concat(typeListeners), typeListenerCache, immediatePropagation = true; immediatePropagation && (typeListenerCache = typeListenersCache[i]); ++i) {
                    // check to see if the cached event still exists in the master events list
                    for (var ii = 0, typeListener; typeListener = typeListeners[ii]; ++ii) {
                        if (typeListener == typeListenerCache) {
                            typeListener.call(self, event);

                            break;
                        }
                    }
                }
            });
        }

        // add the event to the master event list
        typeListeners.push(listener);
    });

    // remove
    addToPrototype('removeEventListener', function (type, listener) {
        var self = this,
            listeners = self.addEventListener.listeners = self.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        // remove the newest matching event from the master event list
        for (var i = typeListeners.length - 1, typeListener; typeListener = typeListeners[i]; --i) {
            if (typeListener == listener) {
                typeListeners.splice(i, 1);

                break;
            }
        }

        // if no events exist, detach the listener
        if (!typeListeners.length && typeListeners.event) {
            self.detachEvent('on' + type, typeListeners.event);
        }
    });

    // dispatch
    addToPrototype('dispatchEvent', function (eventObject) {
        var self = this,
            type = eventObject.type,
            listeners = self.addEventListener.listeners = self.addEventListener.listeners || {},
            typeListeners = listeners[type] = listeners[type] || [];

        try {
            return self.fireEvent('on' + type, eventObject);
        } catch (error) {
            if (typeListeners.event) {
                typeListeners.event(eventObject);
            }

            return;
        }
    });

    // CustomEvent
    Object.defineProperty(Window.prototype, 'CustomEvent', {
        get: function () {
            var self = this;

            return function CustomEvent(type, eventInitDict) {
                var event = self.document.createEventObject(), key;

                event.type = type;
                for (key in eventInitDict) {
                    if (key == 'cancelable') {
                        event.returnValue = !eventInitDict.cancelable;
                    } else if (key == 'bubbles') {
                        event.cancelBubble = !eventInitDict.bubbles;
                    } else if (key == 'detail') {
                        event.detail = eventInitDict.detail;
                    }
                }
                return event;
            };
        }
    });

    // ready
    function ready() {
        if (ready.interval && document.body) {
            ready.interval = clearInterval(ready.interval);

            document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
        }
    }

    ready.interval = setInterval(ready, 1);

    window.addEventListener('load', ready);
})();

!window.CustomEvent && (function() {
    // CustomEvent for browsers which don't natively support the Constructor method
    window.CustomEvent = function CustomEvent(type, eventInitDict) {
        var event;
        eventInitDict = eventInitDict || {bubbles: false, cancelable: false, detail: undefined};

        try {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(type, eventInitDict.bubbles, eventInitDict.cancelable, eventInitDict.detail);
        } catch (error) {
            // for browsers which don't support CustomEvent at all, we use a regular event instead
            event = document.createEvent('Event');
            event.initEvent(type, eventInitDict.bubbles, eventInitDict.cancelable);
            event.detail = eventInitDict.detail;
        }

        return event;
    };
})();
