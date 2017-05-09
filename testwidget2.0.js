/**
 * Customization for Summon 2.0 goes here.
 * @author Annette Bailey & Godmar Back
 *
 * This version is for testing only.
 * 
 * This is Godmar's playground with prototyped services which may or may not work.
 */

(function () {

/* How to add additional custom links in Summon 2.0 */
angular.module('summonApp')
.run(['configService', function (config) {
    //config.data.links.flow = true;
    config.data.links.custom1 = {
        href: "http://www.google.com/",
        label: "Google"
    }
    config.data.links.custom2 = {
        href: "http://www.yahoo.com/",
        label: "Yahoo"
    }
}]);

var mainMod = angular.module('summonApp');

if (false)
mainMod.run([ '$templateCache', function (templateCache) {

    var docSummary = "/assets/documentSummary.html";
    var v = templateCache.get(docSummary);
    v = v.replace(/(<span.*Z3988.*COinS --><\/span>)/, "<span style='display: none'>$1</span>");
    templateCache.put(docSummary, v);

    var availability = "/assets/availability.html";
    var v = templateCache.get(availability);
    v = v.replace(/(<\/div>\s+<\/div>)\n$/, " <span availability-additional-info></span>$1");
    //console.log("changing availability template to: " + v);
    //templateCache.put(availability, v);

    var vpnbanner = "/assets/vpnBanner.html";
    var v = templateCache.get(vpnbanner);
    //v = v.replace(/(<div custom-links class="list-inline"><\/div>)/, '$1<div flow-auth ng-if="links.flow"></div>')
    v = v.replace(/(<div class="col-xs-18[\S\s]*list-inline"><\/div>[\S\s]+?<\/div>)/m, 
        '<div class="col-xs-18 text-right" ng-if="vpnBanner.authenticated">' +
           '<div class="row">'+
             '<div custom-links class="list-inline col-xs-18"></div>' +
             '<div class="col-xs-18" flow-auth ng-if="links.flow"></div>' +
           '</div>' +
       '</div>');

    console.log(v);
    templateCache.put(vpnbanner, v);
}]);


if (false)
angular.module('summonApp.directives').directive("resultsFeed",
function() {
    // Turn the alert on or off (true = on, false = off)
    var showAlert = false;

    // Set the text of the alert
    var message = 'The Database of Broken Dreams is currently unavailable.';

    return {                                                                               
        link:  function (scope, iElement) {
            console.log(iElement.html());
            if (showAlert)
                iElement
                    .find('ul.list-unstyled')
                    .prepend('<div style="color: #a94442;background-color: #f2dede;border-color: #ebccd1;padding: 15px;margin-bottom: 20px;border: 1px solid transparent;border-radius: 4px;">' + message + '</div>');
        }
    }
});

var CLICK_GIF_URL = "http://libx.lib.vt.edu/services/summonlogging/click.gif";

function recordClick(id, bookmark) {
    //console.log("would record click on id: " + id + " bookmark " + bookmark);

    var cImg = new Image(1, 1);
    cImg.src = CLICK_GIF_URL 
        + "?id=" + encodeURIComponent(id) 
        + (bookmark ? "&bookmark=" + encodeURIComponent(bookmark) : "")
        + "&_ts=" + Math.floor(Math.random() * 10000000) 
        + "&summonv2=true";
}

// fix 5/9/2017
function recordClicksOnPrimaryLinks() {
    // See https://github.com/angular/angular.js/issues/8877 for why to scope.$watch
    return {                                                                               
        link:  function (scope, iElement, iAttrs, controller, transcludeFn) { 
            var unregister = scope.$watch(function () {
                var links = iElement.find("h3.customPrimaryLinkContainer, h4.customPrimaryLinkContainer");
                // they will show up the first time $watch is called, but just to be safe.
                if (links.length == 0)
                    return;

                links.on("click", function (event) {
                    // find document id
                    var doc = scope.document || (scope.preview && scope.preview.doc);
                    var id = doc && doc.id;
                    var bookmark = doc && doc.bookmark;
                    if (id !== undefined)
                        recordClick(id, bookmark);
                });
                unregister ();
            });
        }
    }
}

angular.module('summonApp.directives')
.directive("documentSummary", recordClicksOnPrimaryLinks)
/* This doesn't work, either, depends on 'isInternal' which isn't known.
.directive("dynamicLink", function () {
    return {
        link:  function (scope, iElement, iAttrs, controller, transcludeFn) { 
            console.log("encountered dynamicLink");
            console.dir(iElement.html());
        }
    }
})
*/

})();
