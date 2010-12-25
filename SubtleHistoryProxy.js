/*
---
name: SubtleLocationProxy
description: |
  SubtleLocationProxy will proxy the location of one frame to the hash of another and vice-versa.
  It's handy for sites that simply wrap a fancy UI around simple HTML pages.

authors: Thomas Aylott
copyright: © 2010 Thomas Aylott <thomas@mootools.net>
license: MIT

provides: SubtleLocationProxy
# requires: Nothing!

environments:
  - Safari 5
  - IE8
  - Firefox 3.6
...
*/

function SubtleLocationProxy(){/*! Copyright © 2010 Thomas Aylott <oblivious@subtlegradient.com> MIT License*/}

;(function(SubtleLocationProxy){

var has_iframe_onreadystatechange = typeof document.createElement('iframe').onreadystatechange != 'undefined'

  , location = window.location

  , ID = SubtleLocationProxy.ID = +new Date

SubtleLocationProxy.setLocation = function(newLocation){
	if (typeof newLocation == 'string') newLocation = convertStringToLocation(newLocation)
	newLocation = newLocation.pathname + newLocation.search + newLocation.hash
	if (SubtleLocationProxy.getLocation() == newLocation) return
	ignoreHashChange = true
	location.replace((''+location).split('#')[0] + '#' + newLocation)
}

SubtleLocationProxy.getLocation = function(){
	return decodeURIComponent(location.hash.substring(1))
}

SubtleLocationProxy.setProxy = function(element){
	if (!element) return
	SubtleLocationProxy.proxyElement = element
	listenForLocationChanges()
	setLocationOnProxy(element, SubtleLocationProxy.getLocation())
}

function setLocationOnProxy(proxy, location){
	if (!location) return
	if (''+convertStringToLocation(location) != ''+convertStringToLocation(proxy.contentWindow.location))
		proxy.contentWindow.location.replace(location)
}

var locationObject = document.createElement('a')
function convertStringToLocation(locationString){
	locationObject.href = locationString
	return locationObject
}

var listenForLocationChanges_interval
function listenForLocationChanges(){
	var proxyElement = SubtleLocationProxy.proxyElement
	if (proxyElement.addEventListener) proxyElement.addEventListener('load', handleProxyUrlChange, false)
	else if (proxyElement.attachEvent) proxyElement.attachEvent('onload', handleProxyUrlChange)
	if (has_iframe_onreadystatechange){
		if (proxyElement.addEventListener) proxyElement.addEventListener('readystatechange', handleProxyUrlChange, false)
		else if (proxyElement.attachEvent) proxyElement.attachEvent('onreadystatechange', handleProxyUrlChange)
	}
	else {
		proxyElement.contentWindow._SlPiD = SubtleLocationProxy.ID
		clearInterval(listenForLocationChanges_interval)
		listenForLocationChanges_interval = setInterval(function(){
			if (proxyElement.contentWindow._SlPiD != ID){
				handleProxyUrlChange({ target:proxyElement, type:'poll' })
			}
		}, 250)
	}
}

function listenForProxyHashchange(window, handler){
	if (window._SlPiDhc == ID) return
	window._SlPiDhc = ID
	if (window.addEventListener) window.addEventListener('hashchange', handler, false)
	else if (window.attachEvent) window.attachEvent('onhashchange', handler)
}

function handleProxyUrlChange(){
	var proxyElement = SubtleLocationProxy.proxyElement
	if (proxyElement.contentWindow._SlPiD == ID) return
	proxyElement.contentWindow._SlPiD = ID
	SubtleLocationProxy.setLocation(proxyElement.contentWindow.location)
	listenForProxyHashchange(proxyElement.contentWindow, handleProxyHashChange)
}

function handleProxyHashChange(){
	SubtleLocationProxy.setLocation(SubtleLocationProxy.proxyElement.contentWindow.location)
}

var ignoreHashChange
function handleMasterHashChange(){
	if (ignoreHashChange){ignoreHashChange = false;return}
	setLocationOnProxy(SubtleLocationProxy.proxyElement, SubtleLocationProxy.getLocation())
}

// Setup the master page and default state

listenForProxyHashchange(window, handleMasterHashChange)

setTimeout(function(){
	SubtleLocationProxy.setProxy(window.SubtleLocationProxy_element)
	var $$ = window.$$ || window.$
	if (document.querySelector) SubtleLocationProxy.setProxy(document.querySelector('[data-history=proxy]'))
	else if ($$) SubtleLocationProxy.setProxy($$('[data-history~=proxy]')[0])
}, 100)

}(SubtleLocationProxy));
