/*
---
name: SubtleLocationProxy
description: |
  SubtleLocationProxy will proxy the location of one frame to the hash of another and vice-versa.
  It's handy for sites that simply wrap a fancy UI around simple HTML pages.

authors: Thomas Aylott <oblivious@subtlegradient.com>
copyright: © 2010 Thomas Aylott
license: MIT

provides: SubtleLocationProxy
# requires: document.querySelector || $$ || $
...
*/

function SubtleLocationProxy(){/*! Copyright © 2010 Thomas Aylott <oblivious@subtlegradient.com> MIT License*/}

;(function(SubtleLocationProxy){

var has_iframe_onreadystatechange = typeof document.createElement('iframe').onreadystatechange != 'undefined'

  , location = window.location

  , ID = SubtleLocationProxy.ID = +new Date

SubtleLocationProxy.setLocation = setLocation
function setLocation(newLocation){
	if (typeof newLocation == 'string') newLocation = convertStringToLocation(newLocation)
	newLocation = newLocation.pathname + newLocation.search + newLocation.hash
	if (SubtleLocationProxy.getLocation() == newLocation) return
	ignoreHashChange = true
	location.replace((''+location).split('#')[0] + '#' + newLocation)
}

SubtleLocationProxy.getLocation = getLocation
function getLocation(){
	// When location is "foo.com/#/bar?baz"
	// In IE6 location.hash == '#/bar' && location.search == '?baz' in IE6
	var loc = (''+location).split('#')
	loc.splice(0,1)
	return decodeURIComponent(loc.join('#'))
}

SubtleLocationProxy.setProxy = setProxy
function setProxy(element){
	if (!element) return
	ignoreLocationChanges()
	SubtleLocationProxy.proxyElement = element
	listenForLocationChanges()
	setProxyLocation(SubtleLocationProxy.getLocation())
}

SubtleLocationProxy.setProxyLocation
function setProxyLocation(location){
	if (!location) return
	var proxyElement = SubtleLocationProxy.proxyElement
	if (''+convertStringToLocation(location) != ''+convertStringToLocation(proxyElement.contentWindow.location))
		proxyElement.contentWindow.location.replace(location)
}

SubtleLocationProxy.toLocation = convertStringToLocation
var locationObject = document.createElement('a')
function convertStringToLocation(locationString){
	locationObject.href = ''+locationString
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
			var id
			try { id = proxyElement.contentWindow._SlPiD }
			catch (e){ clearInterval(listenForLocationChanges_interval) }
			if (id != ID) handleProxyUrlChange({ target:proxyElement/*, type:'poll'*/ })
		}, 250)
	}
}
function ignoreLocationChanges(){
	var proxyElement = SubtleLocationProxy.proxyElement
	if (!proxyElement) return
	if (proxyElement.removeEventListener) proxyElement.removeEventListener('load', handleProxyUrlChange, false)
	else if (proxyElement.detachEvent) proxyElement.detachEvent('onload', handleProxyUrlChange)
	if (has_iframe_onreadystatechange){
		if (proxyElement.removeEventListener) proxyElement.removeEventListener('readystatechange', handleProxyUrlChange, false)
		else if (proxyElement.detachEvent) proxyElement.detachEvent('onreadystatechange', handleProxyUrlChange)
	}
	clearInterval(listenForLocationChanges_interval)
	var window = proxyElement.contentWindow
	if (window.addEventListener) window.removeEventListener('hashchange', handleProxyHashChange, false)
	else if (window.attachEvent) window.detachEvent('onhashchange', handleProxyHashChange)
}


function listenForHashchange(window, handler){
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
	listenForHashchange(proxyElement.contentWindow, handleProxyHashChange)
}

function handleProxyHashChange(){
	SubtleLocationProxy.setLocation(SubtleLocationProxy.proxyElement.contentWindow.location)
}

var ignoreHashChange
function handleMasterHashChange(){
	if (ignoreHashChange){ignoreHashChange = false;return}
	setProxyLocation(SubtleLocationProxy.getLocation())
}

// Setup the master page and default state

listenForHashchange(window, handleMasterHashChange)

setTimeout(function(){
	SubtleLocationProxy.setProxy(window.SubtleLocationProxy_element)
	var iframes = document.getElementsByTagName('iframe')
	for (var i=-1, iframe; iframe = iframes[++i];) {
		if (!iframe || iframe.getAttribute('data-history') != 'proxy') continue
		SubtleLocationProxy.setProxy(iframe)
	}
}, 100)

}(SubtleLocationProxy));
