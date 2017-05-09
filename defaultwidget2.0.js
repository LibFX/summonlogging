/**
 * Customization for Summon 2.0 goes here.
 *
 * This is the live version as of 8/19/2014.
 *
 * @author Annette Bailey & Godmar Back
 */

(function () {

// CHANGE THIS if you're using this script outside VT
var CLICK_GIF_URL = "http://libx.lib.vt.edu/services/summonlogging/click.gif";

function recordClick(id, bookmark) {
    // console.log("recording click on id: " + id + " bookmark " + bookmark);
    var cImg = new Image(1, 1);
    cImg.src = CLICK_GIF_URL 
        + "?id=" + encodeURIComponent(id) 
        + (bookmark ? "&bookmark=" + encodeURIComponent(bookmark) : "")
        + "&_ts=" + Math.floor(Math.random() * 10000000) 
        + "&summonv2=true";
}

var documentCurrentlyPreviewed;

// emergency fix 8/20/14
// it appears that injecting previewService in this run method 
// breaks Summon's deep link functionality in a subtle way.

if (false) 
angular.module('summonApp.directives').run(['previewService', function (previewService) {
    /* Summon's 'previewService' publishes an event 'document:preview' when a user
     * starts previewing a document. */
    previewService.events.subscribe("actions", "document:preview", function (channel, type, data) {
        // channel == "actions"
        // type == "document:preview"
        // console.log("user previews document " + data.document.id);
        documentCurrentlyPreviewed = data.document;
    });
}]);

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
.directive("preview", recordClicksOnPrimaryLinks)
.directive("availability", function () {
    return {
        link:  function (scope, iElement, iAttrs, controller, transcludeFn) { 
            iElement.on("click", function (event) {
                var doc = scope.doc;
                var id = doc && doc.id;
                var bookmark = doc && doc.bookmark;
                if (id !== undefined) {
                    recordClick(id, bookmark);
                }
            });
        }
    }
})
.directive("preview", function () {
    /* There are 'Read Online', 'Reserve', etc. buttons in the preview pane,
     * but also buttons for 'Cite' or 'Email'.  We identify the buttons that lead 
     * to the item when the user clicks on them by comparing the href attribute
     * to the currently previewed document's link.
     */
    return {                                                                               
        link:  function (scope, iElement, iAttrs, controller, transcludeFn) { 
            iElement.find("div.previewOptions").on("click", function (event) {
                var href = event.target.href;
                if (href != null && href == documentCurrentlyPreviewed.link)
                    recordClick(documentCurrentlyPreviewed.id, documentCurrentlyPreviewed.bookmark);
            });
        }
    }
})
/* remove Unicode Replacement character 0xfffd in snippets */
.directive("resultsFeed", function() {
    return {                                                                               
        link:  function (scope) {
            scope.$watchCollection("feed.items", function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].type != "documentSummary" || !('document' in items[i]))
                        continue;

                    var doc = items[i].document;
                    [ 'snippet' ].forEach(function (field) {
                        if (field in doc)
                            doc[field] = doc[field].replace(/\ufffd/g, "");
                    });
                }
            });
        }
    }
});

var mainMod = angular.module('summonApp');
mainMod.run([ '$templateCache', function (templateCache) {
    /* Hide COinS */
    var docSummary = "/assets/documentSummary.html";
    var v = templateCache.get(docSummary);
    v = v.replace(/(<span.*Z3988.*COinS --><\/span>)/, "<span style='display: none'>$1</span>");
    templateCache.put(docSummary, v);
}]);

/* Flow no longer exists. Link restored to default language about Refworks.

mainMod.run(['flowService', function (flow) {
    flow.configs.loginText = "Log In to Flow";
}]);

angular.module('summonApp.directives')
.directive("flowAuthForm", function () {
    return {
        link:  function (scope, iElement, iAttrs, controller, transcludeFn) { 
            iElement.attr('title', 'Log Into ProQuest Flow (tm). ' 
                + 'Flow is a reference and document manager from ProQuest. '
                + 'It is the successor of RefWorks (tm).');
        }
    }
})
*/
/* Do not display the language switcher if there's only 
 * one language to switch to. */
angular.module('summonApp.directives')
.directive('languageSwitcher', function () {
    return {                                                                               
        link:  function (scope, iElement) { 
            if (scope.localization.languages.length <= 1)
                iElement.hide();
        }
    }
});

/* Inject custom CSS to make Permalink not stand out, added 9/1/2015 */
$("<style>")
    .prop("type", "text/css")
    .html("\
    .permalinkContainer a {\
        color: #900;\
    }\
    .permalinkContainer a:hover {\
        color: #770000;\
    }")
    .appendTo("head");
/* End custom CSS for styling */

/* begin qualtrics survey, added 2/2/15 */

/* commented out 5/28/15
var q_viewrate=100; // this is the rate, in percent, of users who will see this
if (Math.random() < q_viewrate / 100){var q_popup_f = function(){var q_script = document.createElement("script");var q_popup_g = function(){new QualtricsEmbeddedPopup({
    id: "SV_5jTrXZJrjKWFbCd",
    imagePath: "https://qdistribution.qualtrics.com/WRQualtricsShared/Graphics/",
    surveyBase: "https://virginiatech.qualtrics.com/WRQualtricsSurveyEngine/",
    delay:2000,
    preventDisplay:30,
    animate:true,
    width:400,
    height:300,
    surveyPopupWidth:900,
    surveyPopupHeight:600,
    startPos:"BR",
    popupText:"Please share your feedback on the Summon discovery system.",
    linkText:"Click here to fill out survey. "
});};q_script.onreadystatechange= function () {if (this.readyState == "loaded") q_popup_g();};q_script.onload= q_popup_g;q_script.src="https://qdistribution.qualtrics.com/WRQualtricsShared/JavaScript/Distribution/popup.js";document.getElementsByTagName("head")[0].appendChild(q_script);};if (window.addEventListener){window.addEventListener("load",q_popup_f,false);}else if (window.attachEvent){r=window.attachEvent("onload",q_popup_f);}else {};};
*/

/* end qualtrics */

})();
