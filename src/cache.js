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
var CacheProvider = (function(win){
	if (!win.support) {
		win.support = {};
	}
	
	try {
		win.support.localStorage = ('localStorage' in window) && window['localStorage'] !== null;
	} catch (ex) {
		win.support.localStorage = false;
	}
	
	/**
	 * Read or write to the object puts value into path string.
	 * @private
	 * @ignore
	 * @param {Object} obj Object to get or set data.
	 * @param {String} str Name of value (or path to go). Can be a dot separated object.
	 * @param {Object} value Value to be set for path.
	 * @return Returns value of path in read mode or object modified in write mode
	 */
	var path = function(obj, str, value) {
		var str = str || '',
		    props = str.split('.'),
		    obj = obj || {},
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
	var CacheProvider = function(name){
		this.name = name || 'cache';
		this.cache = {};
		
		if (win.support.localStorage) {
			this.cache = JSON.parse(localStorage.getItem(this.name)) || {};
		}
	}
	
	CacheProvider.constructor = CacheProvider;
	
	/**
	 * Methods of CacheProvider.
	 * CRUD and sync methods are implemented.
	 */
	CacheProvider.prototype = {
		/**
		 * Returns the value at key in the cache.
		 * @param {String} key Name of key to returns. Can be a dot separated object.
		 * @return Value of key. If key is undefined the entire cache will be returned.
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
		 * @param {String} key Name of key to remove. Clear the cache data if undefined.
		 * @return Sync cache object and returns this.
		 * @type CacheProvider
		 */
		'remove': function(key) {
			key ? path(this.cache, key, undefined) : this.cache = {};
			
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
		 */
		'check': function(key) {
			var array = key.split('.'),
			    key = array.shift();
		
			var obj = path(this.cache, key);
			
			return obj && key in obj && obj[key] !== undefined;
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
	
	return win.CacheProvider = CacheProvider;
})(window);