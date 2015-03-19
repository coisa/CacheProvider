/**
* Cache Provider Library v2.0
*
* Inspired in CacheProvider of Dustin Diaz (http://www.dustindiaz.com/javascript-cache-provider/).
*
* Create a provider to storage informations in cache.
* If support localStorage, use it to backup cache data.
* Object structures can be created in the CacheProvider by using dot notation.
*
* Licensed under The MIT License
* Redistributions of files must retain the above copyright notice.
*
* @author Felipe Sayão Lobato Abreu
* @version 2.0
* @license MIT License (http://www.opensource.org/licenses/mit-license.php)
*/
window.CacheProvider = (function(window, undefined){
    /**
     * Behavior storage helper
     * @private
     * @ignore
     */
    var _userData = {
        getContext : function() {
            var context = document.documentElement;

            context.addBehavior('#default#userData');
            context.load(document.domain);

            return context;
        },
        getNode : function(name, ctx) {
            var context = ctx || this.getContext();
            var childNodes = context.xmlDocument.documentElement.childNodes;
            var len = childNodes.length;

            var node;
            var i;

            for (i = 0; i < len; i++) {
                node = childNodes.item(i);

                if (node.getAttribute('key') == name) {
                    return node;
                }
            }
            return null;
        },
        get : function(name) {
            var node = this.getNode(name);

            return node && node.getAttribute('value') || undefined;
        },
        set : function(name, value) {
            var context = this.getContext();
            var node = this.getNode(name, context);

            if (!node) {
                node = xmlDoc.createNode(1, 'item', '');

                node.setAttribute('key', name);
                node.setAttribute('value', value);

                context.xmlDocument.appendChild(node);
            } else {
                node.setAttribute('value', value);
            }

            context.save(document.domain);

            return value;
        }
    };

    var _helper = {
        /**
         * Puts value into a path string.
         * @param {Object} data Object to set data.
         * @param {String} key Name of key. Can be a dot separated object.
         * @param {Object} value Value to be set for key.
         * @returns {Object} Returns object data modified
         * @private
         * @ignore
         */
        write : function(data, key, value) {
            var str = key || '';
            var props = str.split('.');
            var obj = data || {};
            var prop = props.shift();

            if (!prop) {
                obj = value;
            } else {
                if (typeof obj[prop] !== 'object' || Object.prototype.toString.call(obj[prop]) === '[object Array]') {
                    obj[prop] = {};
                }

                if (props.length) {
                    obj[prop] = this.write(obj[prop], props.join('.'), value);
                } else {
                    obj[prop] = value;
                }
            }

            return obj;
        },
        /**
         * Return value from a path string.
         * @param {Object} data Object to get data.
         * @param {String} key Name of key. Can be a dot separated object.
         * @returns {Object} Returns value of key
         * @private
         * @ignore
         */
        read : function(data, key) {
            var obj = data || {};

            var str = key || '';
            var props = str.split('.');
            var prop = props.shift();

            var value;

            if (!prop) {
                value = obj;
            } else {
                if (prop in obj) {
                    if (props.length) {
                        value = this.read(obj[prop], props.join('.'));
                    } else {
                        value = obj[prop];
                    }
                }
            }

            return value;
        },
        /**
         * Return persistent values from storage.
         * @param {String} ns Namespace of persistent storage
         * @returns {Object} Returns persistent json object
         * @private
         * @ignore
         */
        load : function(ns) {
            try {
                return JSON.parse(localStorage.getItem(ns) || globalStorage && globalStorage[document.domain].getItem(ns));
            } catch(e) {
                try {
                    return JSON.parse(_userData.get(ns) || {});
                } catch(err) {
                    return {};
                }
            }
        },
        /**
         * Set object to persistent storage
         * @param {String} ns Namespace of persistent storage
         * @returns {Boolean}
         * @private
         * @ignore
         */
        save : function(ns, objData) {
            var data = JSON.stringify(objData);

            try {
                localStorage.setItem(ns, data) || globalStorage && globalStorage[domain].setItem(ns, data);
            } catch(e) {
                try {
                    _userData.set(ns, data);
                } catch(e) {
                    return false;
                }
            }

            return true;
        }
    };

    /**
     * Create a named Cache Provider.
     * @param {String} name Namespace of cache.
     * @class Create a persistent cache manager.
     */
    function CacheProvider(name) {
        this.name = name || 'CacheProvider';
        this.cache = _helper.load(this.name);
        this.events = [];
    };

    /**
     * Methods of CacheProvider.
     * CRUD and sync methods are implemented.
     */
    CacheProvider.prototype = {
        /**
         * Constructor Class
         * @constructor
         */
        constructor : CacheProvider,
        /**
         * Returns the value at key in the cache.
         * @alias read
         * @param {String} key Name of key to returns. Can be a dot separated object.
         * @returns {Object} Value of key. If key is undefined the entire cache will be returned.
         * @method
         * @public
         */
        get : function(key) {
            return _helper.read(this.cache, key);
        },
        /**
         * @see CacheProvider.prototype.get
         */
        read : function(key) {
            return this.get(key);
        },
        /**
         * Write to the cache puts value into key.
         * @alias write
         * @param {String} key Name of key to set. Can be a dot separated object.
         * @param {Object} value Value to be set.
         * @returns {CacheProvider} Sync cache object and returns this.
         * @type CacheProvider
         * @method
         * @public
         */
        set : function(key, value) {
            _helper.write(this.cache, key, value);

            return this.sync();
        },
        /**
         * @see CacheProvider.prototype.set
         */
        write : function(key, value) {
            return this.set(key, value);
        },
        /**
         * Clear the cache data at key.
         * @alias delete
         * @param {String} key Name of key to remove. Clear the cache data if undefined.
         * @returns {CacheProvider} Sync cache object and returns this.
         * @type CacheProvider
         * @method
         * @public
         */
        remove : function(key) {
            if (key) {
                var map = key.split('.'),
                    last = map.pop();

                var obj = _helper.read(this.cache, map.join('.'));

                if (obj && last in obj && obj[last]) {
                    delete obj[last];
                }
            }

            return this.sync();
        },
        /**
         * @see CacheProvider.prototype.remove
         */
        del : function(key) {
            return this.remove(key);
        },
        /**
         * Clear the cache data at all.
         * @returns {CacheProvider} Sync cache object and returns this.
         * @type CacheProvider
         * @method
         * @public
         */
        clear : function() {
            this.cache = {};

            return this.sync();
        },
        /**
         * Used to check if a cache key has been set.
         * @param {String} key Name of key to check. Clear the cache data if undefined.
         * @returns {Boolean} Returns true on existence and false on non-existence.
         * @type Boolean
         * @method
         * @public
         */
        check : function(key) {
            var map = key.split('.'),
                last = map.pop();

            var obj = _helper.read(this.cache, map.join('.'));

            return obj && last in obj && obj[last] !== undefined;
        },
        /**
         * Backup data in localStorage if have support.
         * @returns {CacheProvider} This object instance.
         * @type CacheProvider
         * @method
         * @public
         */
        sync : function() {
            _helper.save(this.name, this.cache);

            for(var fn = 0; fn < this.events.length; fn++) {
                this.events[fn].call(this, this.cache);
            }

            return this;
        },
        /**
         * Bind events to trigger on each sync
         * @param {Function} fn Callback to be triggered on sync method
         * @returns {CacheProvider} This object instance
         * @type CacheProvider
         * @method
         * @public
         */
        bind : function(fn) {
            if (typeof fn !== 'function') {
                fn = function() {
                    return fn;
                };
            }

            this.events.push(fn);

            return this;
        }
    };

    return CacheProvider;
})(window);