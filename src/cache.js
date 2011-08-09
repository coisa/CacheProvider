/**
 * Cache Provider Library v1.0
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
 * @version 1.0
 * @license MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
var CacheProvider = (function(win, undefined){
	if (!win.support) {
		win.support = {};
	}
	
	try {
		win.support.localStorage = ('localStorage' in win) && win.localStorage !== null;
	} catch (err) {
		win.support.localStorage = false;
	}
	
	/**
	 * Read or write to the object puts value into path string.
	 * @param {Object} data Object to get or set data.
	 * @param {String} key Name of key. Can be a dot separated object.
	 * @param {Object} value Value to be set for key.
	 * @return Returns value of key in read mode or object data modified in write mode
	 * @private
	 * @ignore
	 */
	var path = function(data, key, value) {
		var str = key || '',
		    props = str.split('.'),
		    obj = data || {},
		    prop = props.shift();
		
		if (value) {
			/* WRITE */
			if (!prop) {
				obj = value;
			} else {
				if (!prop in obj) {
					obj[prop] = {};
				}
				
				if (props.length) {
					obj[prop] = path(obj[prop], props.join('.'), value);
				} else {
					obj[prop] = value;
				}
			}
			return obj;
		} else {
			/* READ */
			if (!prop) {
				value = obj;
			} else {
				if (prop in obj) {
					if (props.length) {
						value = path(obj[prop], props.join('.'));
					} else {
						value = obj[prop];
					}
				}
			}
			return value;
		}
	};

	/**
	 * Create a named Cache Provider.
	 * @param {String} name Namespace of cache.
	 * @constructor
	 */
	var CacheProvider = win.CacheProvider = function(name){
		this.name = name || 'CacheProvider';
		this.cache = win.support.localStorage && JSON.parse(localStorage.getItem(this.name)) || {};
	};
	
	CacheProvider.constructor = CacheProvider;
	
	/**
	 * Methods of CacheProvider.
	 * CRUD and sync methods are implemented.
	 */
	CacheProvider.prototype = {
		/**
		 * Returns the value at key in the cache.
		 * @alias read
		 * @param {String} key Name of key to returns. Can be a dot separated object.
		 * @return Value of key. If key is undefined the entire cache will be returned.
		 * @method
		 * @public
		 */
		'get': function(key) {
			return path(this.cache, key);
		},
		/**
		 * @see CacheProvider.prototype.get
		 */
		'read': function(key) {
			return this.get(key);
		},
		/**
		 * Write to the cache puts value into key.
		 * @alias write
		 * @param {String} key Name of key to set. Can be a dot separated object.
		 * @param {Object} value Value to be set.
		 * @return Sync cache object and returns this.
		 * @type CacheProvider
		 */
		'set': function(key, value) {
			path(this.cache, key, value);
									
			return this.sync();
		},
		/**
		 * @see CacheProvider.prototype.set
		 */
		'write': function(key, value) {
			return this.set(key, value);
		},
		/**
		 * Clear the cache data at key.
		 * @alias delete
		 * @param {String} key Name of key to remove. Clear the cache data if undefined.
		 * @return Sync cache object and returns this.
		 * @type CacheProvider
		 * @method
		 * @public
		 */
		'remove': function(key) {
            if (key) {
                var map = key.split('.'),
                    last = map.pop();
                
                var obj = path(this.cache, map.join('.'));
                
                if (obj && last in obj && obj[last]) {
                    delete obj[last];
                }
            } else {
                this.cache = {};
            }
            
			return this.sync();
		},
		/**
		 * @see CacheProvider.prototype.remove
		 */
		'delete': function(key){
			this.remove(key);
		},
		/**
		 * Clear the cache data at all.
		 * @see CacheProvider.prototype.remove
		 */
		'clear': function() {
			return this.remove();
		},
		/**
		 * Used to check if a cache key has been set.
		 * @param {String} key Name of key to check. Clear the cache data if undefined.
		 * @return Returns true on existence and false on non-existence.
		 * @type Boolean
		 * @method
		 * @public
		 */
		'check': function(key) {
			var map = key.split('.'),
			    last = map.pop();
		    
			var obj = path(this.cache, map.join('.'));
			
			return obj && last in obj && obj[last] !== undefined;
		},
		/**
		 * Backup data in localStorage if have support.
		 * @return This object instance.
		 * @type CacheProvider
		 */
		'sync': function() {
			if (win.support.localStorage) {
				localStorage.setItem(this.name, JSON.stringify(this.cache));
			}
			return this;
		}
	};
	
	return CacheProvider;
})(window);